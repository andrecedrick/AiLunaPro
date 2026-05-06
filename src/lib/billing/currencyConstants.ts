/**
 * Currency runtime constants — shared between client (BillingPage) and admin
 * (BillingSettingsPage). Kept in `lib/billing/` so it lives in the
 * `billing-core` chunk and does NOT pull the heavier `billing-admin` bundle
 * into the public Billing page.
 */

export type Currency = 'usd' | 'eur' | 'gbp' | 'cad' | 'aud';
export type Interval = 'month' | 'year';
export type Plan     = 'starter' | 'professional' | 'enterprise';

export const SUPPORTED_CURRENCIES: readonly Currency[] = ['usd', 'eur', 'gbp', 'cad', 'aud'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  cad: 'C$',
  aud: 'A$',
};

export interface CurrencySettings {
  defaultCurrency:        Currency;
  enabledCurrencies:      Currency[];
  exchangeRateProvider:   'manual' | 'live';
  exchangeRates?:         Partial<Record<Currency, number>>;
  lastExchangeRateSyncAt?: string;
}

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  defaultCurrency:      'usd',
  enabledCurrencies:    ['usd'],
  exchangeRateProvider: 'live',
};
