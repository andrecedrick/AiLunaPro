import { describe, it, expect } from 'vitest';
import { computeQuotePreview } from '../../src/lib/quote/score';
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
