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
import { resolveLayer } from '../featureFlags';
import { WORKER_BASE } from '../billing/stripeClient';

/** USD → currency multipliers — STATIC fallback (approximate, display-only).
 *  Live rates from /api/public/fx (ECB) override this once fetched. */
const STATIC_USD_TO: Record<Currency, number> = {
  usd: 1,
  eur: 0.92,
  gbp: 0.79,
  cad: 1.37,
  aud: 1.52,
};

// In-memory live rates (filled by loadLiveRates). Falls back to static.
let liveRates: Partial<Record<Currency, number>> | null = null;

/**
 * J12 Batch B: fetch live reference rates from /api/public/fx (ECB, 6h cached
 * server-side). Display-only. Fail-safe: any error keeps the static fallback.
 * Call from Billing (on-demand) — never on global boot.
 */
export async function loadLiveRates(): Promise<void> {
  if (resolveLayer('auth') === 'mock') return;
  try {
    const res = await fetch(`${WORKER_BASE}/api/public/fx`);
    if (!res.ok) return;
    const data = (await res.json()) as { rates?: Partial<Record<Currency, number>> };
    if (data.rates) liveRates = { usd: 1, ...data.rates };
  } catch {
    /* keep static fallback */
  }
}

function rate(to: Currency): number {
  return liveRates?.[to] ?? STATIC_USD_TO[to] ?? 1;
}

/** Convert a USD amount to the target currency (approximate, display-only). */
export function convertFromUsd(amountUsd: number, to: Currency): number {
  return amountUsd * rate(to);
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
