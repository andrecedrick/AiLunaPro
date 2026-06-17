/**
 * Deterministic FX snapshot — B6.7 (currency unification).
 *
 * The SINGLE source of display FX rates. Rates are APPROXIMATE and DISPLAY-ONLY:
 * Stripe remains the billing source of truth, and converted figures are shown
 * with a "≈" marker. There is NO runtime FX API — refresh by editing this file
 * (and bumping `version`) under review.
 *
 * `version` is recorded alongside generated results/PDFs so a report can be
 * re-rendered reproducibly with the exact rates it was produced with.
 *
 * These rates mirror the prior static fallback table; the live-FX path
 * (loadLiveRates → ECB) was removed in P3, so this snapshot is now the single,
 * value-stable source of display FX.
 */

import type { Currency } from '../billing/currencyConstants';

export interface FxSnapshot {
  /** Bump on every manual rate update (used for result/PDF reproducibility). */
  version: string;
  base:    'usd';
  source:  string;
  /** USD → currency multiplier, one entry per supported currency. */
  rates:   Record<Currency, number>;
}

export const FX_SNAPSHOT: FxSnapshot = {
  version: '2026-06-17',
  base:    'usd',
  source:  'ECB reference (manual capture)',
  rates: {
    usd: 1,
    eur: 0.92,
    gbp: 0.79,
    cad: 1.37,
    aud: 1.52,
  },
};

/** Convert a USD-base amount to the target display currency (deterministic). */
export function convertFromUsd(amountUsd: number, to: Currency): number {
  return amountUsd * (FX_SNAPSHOT.rates[to] ?? 1);
}
