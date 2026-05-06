/**
 * Currency helpers — Phase J1.3.
 * Live FX is for admin DISPLAY only. Billing uses real Stripe Prices.
 */

export type Currency = 'usd' | 'eur' | 'gbp' | 'cad' | 'aud';
export type Interval = 'month' | 'year';

export const SUPPORTED_CURRENCIES: readonly Currency[] = ['usd', 'eur', 'gbp', 'cad', 'aud'];

export function isSupportedCurrency(c: string): c is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(c);
}

export function isSupportedInterval(i: string): i is Interval {
  return i === 'month' || i === 'year';
}

/**
 * Free, no-key public FX endpoint.
 * https://www.exchangerate-api.com/docs/free
 *
 * Display-only fallback. NEVER used to compute billed amounts.
 */
const FX_ENDPOINT = 'https://open.er-api.com/v6/latest/USD';

interface FxApiResponse {
  result?:     string;
  base_code?:  string;
  time_last_update_utc?: string;
  rates?:      Record<string, number>;
}

export async function fetchExchangeRates(): Promise<{
  rates: Partial<Record<Currency, number>>;
  syncedAt: string;
} | null> {
  try {
    const res = await fetch(FX_ENDPOINT);
    if (!res.ok) return null;
    const data = await res.json() as FxApiResponse;
    if (data.result !== 'success' || !data.rates) return null;

    const rates: Partial<Record<Currency, number>> = { usd: 1 };
    for (const c of SUPPORTED_CURRENCIES) {
      const r = data.rates[c.toUpperCase()];
      if (typeof r === 'number') rates[c] = r;
    }
    return {
      rates,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[currency] FX fetch failed:', err);
    return null;
  }
}
