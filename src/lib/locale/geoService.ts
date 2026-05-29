/**
 * Geo currency suggestion — J12 (display-only detection).
 *
 * Fetches GET /api/public/geo (no-store) for a best-effort suggested DISPLAY
 * currency from Cloudflare geo. Fail-safe: mock/no API/error → null (caller
 * keeps its current default). No PII; the endpoint returns country code +
 * suggested currency only.
 */

import { resolveLayer } from '../featureFlags';
import { WORKER_BASE } from '../billing/stripeClient';
import { SUPPORTED_CURRENCIES, type Currency } from '../billing/currencyConstants';

export async function fetchSuggestedCurrency(): Promise<Currency | null> {
  if (resolveLayer('auth') === 'mock') return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/public/geo`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { suggestedCurrency?: string };
    const c = data.suggestedCurrency;
    return c && (SUPPORTED_CURRENCIES as readonly string[]).includes(c) ? (c as Currency) : null;
  } catch {
    return null;
  }
}
