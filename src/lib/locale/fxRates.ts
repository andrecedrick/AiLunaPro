/**
 * Static, approximate FX table — J12 (display-only).
 *
 * USD → display currency. These rates are APPROXIMATE and for DISPLAY ONLY.
 * Stripe remains the source of truth and bills in USD. Never use these for
 * actual charges. Refresh via code update (no external FX API in v1).
 *
 * Last reviewed: 2026-05-28.
 */

import type { Currency } from '../billing/currencyConstants';
import { CURRENCY_SYMBOLS } from '../billing/currencyConstants';

/** USD → currency multipliers (approximate). */
const USD_TO: Record<Currency, number> = {
  usd: 1,
  eur: 0.92,
  gbp: 0.79,
  cad: 1.37,
  aud: 1.52,
};

/** Convert a USD amount to the target currency (approximate, display-only). */
export function convertFromUsd(amountUsd: number, to: Currency): number {
  return amountUsd * (USD_TO[to] ?? 1);
}

/**
 * Format an approximate converted amount, e.g. "≈ €11/mo".
 * Returns null when target is USD (no hint needed — USD is the real price).
 */
export function formatApproxFromUsd(amountUsd: number, to: Currency): string | null {
  if (to === 'usd') return null;
  const v = convertFromUsd(amountUsd, to);
  const sym = CURRENCY_SYMBOLS[to] ?? to.toUpperCase();
  return `≈ ${sym}${Math.round(v)}`;
}
