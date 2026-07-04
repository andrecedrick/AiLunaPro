import { describe, it, expect } from 'vitest';
import { compareBudget, computeQuotePreview } from '../../src/lib/quote/score';
import { QUOTE_CATEGORIES, QUOTE_TIERS, type QuoteCategory } from '../../src/data/quote-config';
import { convertFromUsd, FX_SNAPSHOT } from '../../src/lib/currency/fxSnapshot';
import type { Currency } from '../../src/lib/billing/currencyConstants';

/**
 * Fixed-price budget boundary — the user MUST be able to enter exactly the
 * minimum shown in the input hint and have it accepted.
 *
 * The UI shows the minimum as money.format(priceMinUsd) = round(priceMinUsd × rate)
 * in the display currency. Validation now compares the ENTERED display amount
 * against that SAME rounded minimum (not a USD round-trip with an exact `<`), so
 * "budget = displayed min" is never a false "below". This mirrors the logic in
 * QuoteRequestPage (belowMin / budgetVerdict) and the worker's `>= priceMinUsd`.
 */

// What QuoteRequestPage computes for the input hint + the comparison bounds.
const displayMin = (priceMinUsd: number, cur: Currency) => Math.round(convertFromUsd(priceMinUsd, cur));
const displayMax = (priceMaxUsd: number, cur: Currency) => Math.round(convertFromUsd(priceMaxUsd, cur));

describe('Quote fixed-price budget boundary — exact displayed minimum is accepted', () => {
  const currencies = Object.keys(FX_SNAPSHOT.rates) as Currency[];

  it('sanity: the user-reported case shows €55,200 – €138,000 (autonomous agent)', () => {
    const p = computeQuotePreview({ category: 'ai_agent', tier: 'autonomous' });
    expect(displayMin(p.priceMinUsd, 'eur')).toBe(55200);
    expect(displayMax(p.priceMaxUsd, 'eur')).toBe(138000);
  });

  it('accepts the exact displayed minimum for every category/tier in every currency', () => {
    let n = 0;
    for (const category of QUOTE_CATEGORIES as readonly QuoteCategory[]) {
      for (const tier of QUOTE_TIERS[category]) {
        const p = computeQuotePreview({ category, tier });
        for (const cur of currencies) {
          const min = displayMin(p.priceMinUsd, cur);
          const max = displayMax(p.priceMaxUsd, cur);
          const tag = `${category}:${tier}:${cur}`;
          // budget = displayed min → within (NOT below). The core fix.
          expect(compareBudget(min, min, max, p.openEnded), `${tag} at-min`).not.toBe('below');
          // budget > min → never below.
          expect(compareBudget(min + 1, min, max, p.openEnded), `${tag} above-min`).not.toBe('below');
          // budget < min → still a genuine "below" reject.
          expect(compareBudget(min - 1, min, max, p.openEnded), `${tag} below-min`).toBe('below');
          n++;
        }
      }
    }
    expect(n).toBeGreaterThan(0);
  });

  it('treats the exact displayed maximum as within (not "above") for a closed range', () => {
    const p = computeQuotePreview({ category: 'ai_agent', tier: 'autonomous' }); // closed range
    const min = displayMin(p.priceMinUsd, 'eur');
    const max = displayMax(p.priceMaxUsd, 'eur');
    expect(p.openEnded).toBe(false);
    expect(compareBudget(max, min, max, p.openEnded)).toBe('within');
    expect(compareBudget(max + 1, min, max, p.openEnded)).toBe('above');
  });

  it('open-ended range: anything at/above min is within (no upper reject)', () => {
    const p = computeQuotePreview({ category: 'ai_agent', tier: 'multi_agent' }); // openEnded
    const min = displayMin(p.priceMinUsd, 'usd');
    const max = displayMax(p.priceMaxUsd, 'usd');
    expect(p.openEnded).toBe(true);
    expect(compareBudget(min, min, max, p.openEnded)).toBe('within');
    expect(compareBudget(max * 10, min, max, p.openEnded)).toBe('within');
  });
});
