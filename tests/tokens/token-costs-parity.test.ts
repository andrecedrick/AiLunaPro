import { describe, it, expect } from 'vitest';

/*
 * Parity guard: the frontend DISPLAY mirror of token costs must equal the
 * worker's billing source of truth. If they ever drift, the UI could advertise
 * a price the server won't honor (the quote 50-vs-150 bug). This test imports
 * BOTH and fails the build on any difference, in either direction.
 */
import { TOKEN_COSTS_DISPLAY } from '../../src/lib/tokens/costs';
import { TOKEN_COSTS } from '../../worker/src/lib/token-costs';

describe('token-costs parity (frontend display mirror ⇄ worker source of truth)', () => {
  it('mirrors every worker cost 1:1 (same keys, same amounts)', () => {
    expect(TOKEN_COSTS_DISPLAY).toEqual(TOKEN_COSTS);
  });

  it('keeps the quote generation cost aligned (regression: UI 50 vs server 150)', () => {
    expect(TOKEN_COSTS_DISPLAY['quote.generation']).toBe(TOKEN_COSTS['quote.generation']);
  });
});
