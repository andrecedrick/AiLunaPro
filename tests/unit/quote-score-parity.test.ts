import { describe, it, expect } from 'vitest';
import { computeQuotePreview, compareBudget } from '../../src/lib/quote/score';
import { QUOTE_CATEGORIES, QUOTE_TIERS, type QuoteCategory } from '../../src/data/quote-config';
import { computeQuote } from '../../worker/src/lib/quote-shared';

/**
 * Q1 — value-first parity lock.
 *
 * The client Quote preview (shown free, before any token) MUST produce the
 * identical estimate as the worker's authoritative `computeQuote` so the range
 * a visitor sees is exactly the one the server will issue. We sweep EVERY
 * category/tier combination. Drift in either table, the scope sets, or the
 * ops-cost uplift fails this test.
 */
describe('Quote client/server estimate parity', () => {
  it('matches the worker computeQuote across every category/tier', () => {
    let n = 0;
    for (const category of QUOTE_CATEGORIES as readonly QuoteCategory[]) {
      for (const tier of QUOTE_TIERS[category]) {
        const client = computeQuotePreview({ category, tier });
        const server = computeQuote({ category, tier });
        expect(client.priceMinUsd, `${category}:${tier} min`).toBe(server.priceMinUsd);
        expect(client.priceMaxUsd, `${category}:${tier} max`).toBe(server.priceMaxUsd);
        expect(client.openEnded, `${category}:${tier} openEnded`).toBe(server.openEnded);
        expect(client.solutionKey).toBe(server.solutionKey);
        expect(client.scopeKeys).toEqual(server.scopeKeys);
        expect(client.nextStepKeys).toEqual(server.nextStepKeys);
        expect(client.opsCostUpliftPct).toEqual(server.opsCostUpliftPct);
        n++;
      }
    }
    // 4 + 4 + 4 + 1 = 13 combinations.
    const expected = (QUOTE_CATEGORIES as readonly QuoteCategory[])
      .reduce((sum, c) => sum + QUOTE_TIERS[c].length, 0);
    expect(n).toBe(expected);
    expect(n).toBe(13);
  });
});

describe('Quote budget comparison (U2)', () => {
  it('classifies below / within / above a fixed range', () => {
    expect(compareBudget(1_000, 3_000, 10_000, false)).toBe('below');
    expect(compareBudget(5_000, 3_000, 10_000, false)).toBe('within');
    expect(compareBudget(20_000, 3_000, 10_000, false)).toBe('above');
  });

  it('treats the boundaries (min / max) as within', () => {
    expect(compareBudget(3_000, 3_000, 10_000, false)).toBe('within');
    expect(compareBudget(10_000, 3_000, 10_000, false)).toBe('within');
  });

  it('open-ended range has no upper bound (above-max is within)', () => {
    expect(compareBudget(500_000, 120_000, 400_000, true)).toBe('within');
    expect(compareBudget(50_000, 120_000, 400_000, true)).toBe('below');
  });
});
