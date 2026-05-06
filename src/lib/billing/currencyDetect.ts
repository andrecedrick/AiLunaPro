/**
 * Currency detection + persistence — Phase J1.3 (auto-detect).
 *
 * Resolution order (highest priority first):
 *   1. localStorage `ailunapro:billingCurrency` (user manual choice)
 *   2. Browser locale → region → mapped currency, IF enabled
 *   3. currencySettings.defaultCurrency
 *   4. 'usd' fallback
 */

import type { Currency } from './currencyConstants';
import { SUPPORTED_CURRENCIES } from './currencyConstants';

const STORAGE_KEY = 'ailunapro:billingCurrency';

/* ── Region → currency map ─────────────────────────────
 * ISO 3166-1 alpha-2 region codes. Eurozone members map to EUR.
 * Non-listed regions → null → caller falls back to default.
 */
const REGION_TO_CURRENCY: Record<string, Currency> = {
  US: 'usd',
  GB: 'gbp', UK: 'gbp',
  CA: 'cad',
  AU: 'aud',
  // Eurozone
  FR: 'eur', DE: 'eur', ES: 'eur', IT: 'eur', NL: 'eur',
  BE: 'eur', IE: 'eur', PT: 'eur', AT: 'eur', FI: 'eur',
  GR: 'eur', LU: 'eur', SK: 'eur', SI: 'eur', EE: 'eur',
  LV: 'eur', LT: 'eur', CY: 'eur', MT: 'eur', HR: 'eur',
};

/**
 * Extract region (ISO 3166-1 alpha-2) from a BCP-47 locale string.
 * Examples:
 *   "fr-FR"  → "FR"
 *   "en-GB"  → "GB"
 *   "en"     → null
 *   "en-US"  → "US"
 *   "de_DE"  → "DE"
 */
function extractRegion(locale: string): string | null {
  if (!locale) return null;
  const parts = locale.replace(/_/g, '-').split('-');
  for (const p of parts.slice(1)) {
    // Region codes are 2 uppercase letters
    if (/^[A-Za-z]{2}$/.test(p)) return p.toUpperCase();
  }
  return null;
}

/**
 * Detect currency from a BCP-47 locale string. Returns null if unmapped.
 */
export function detectCurrencyFromLocale(locale: string): Currency | null {
  const region = extractRegion(locale);
  if (!region) return null;
  return REGION_TO_CURRENCY[region] ?? null;
}

/**
 * Probe browser for current locale (best-effort across UA quirks).
 */
export function getBrowserLocale(): string {
  if (typeof navigator === 'undefined') return 'en-US';
  return navigator.language
    ?? (navigator.languages && navigator.languages[0])
    ?? Intl.DateTimeFormat().resolvedOptions().locale
    ?? 'en-US';
}

/**
 * Read user's previously chosen currency from localStorage. Validates against
 * the supported list — never trusts arbitrary string input.
 */
export function readStoredCurrency(): Currency | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && (SUPPORTED_CURRENCIES as readonly string[]).includes(v)) return v as Currency;
  } catch { /* ignore */ }
  return null;
}

/**
 * Persist user's chosen currency. Validates against supported list.
 */
export function storeCurrency(c: Currency): void {
  if (typeof window === 'undefined') return;
  if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(c)) return;
  try { window.localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
}

export interface ResolveOptions {
  enabledCurrencies: Currency[];
  defaultCurrency:   Currency;
  locale?:           string;
}

export interface ResolveResult {
  currency:         Currency;
  source:           'stored' | 'detected' | 'default' | 'fallback';
  /** Region-detected currency, regardless of whether it was actually used. */
  detected:         Currency | null;
  /** True when detected currency exists but is NOT in enabledCurrencies. */
  detectedDisabled: boolean;
}

/**
 * Apply full priority order to pick a currency.
 * Caller should display a hint when `detectedDisabled === true`.
 */
export function resolveBillingCurrency(opts: ResolveOptions): ResolveResult {
  const { enabledCurrencies, defaultCurrency } = opts;
  const locale   = opts.locale ?? getBrowserLocale();
  const detected = detectCurrencyFromLocale(locale);
  const detectedDisabled = !!detected && !enabledCurrencies.includes(detected);

  // 1. localStorage
  const stored = readStoredCurrency();
  if (stored && enabledCurrencies.includes(stored)) {
    return { currency: stored, source: 'stored', detected, detectedDisabled };
  }

  // 2. Detected from locale, IF enabled
  if (detected && enabledCurrencies.includes(detected)) {
    return { currency: detected, source: 'detected', detected, detectedDisabled };
  }

  // 3. Default
  if (enabledCurrencies.includes(defaultCurrency)) {
    return { currency: defaultCurrency, source: 'default', detected, detectedDisabled };
  }

  // 4. Hard fallback
  return { currency: 'usd', source: 'fallback', detected, detectedDisabled };
}
