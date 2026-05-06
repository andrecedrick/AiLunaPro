/**
 * Currency formatting helpers — Phase J1.3.
 */

import type { Currency } from './currencyConstants';
import { CURRENCY_SYMBOLS } from './currencyConstants';

const LOCALE: Record<Currency, string> = {
  usd: 'en-US',
  eur: 'en-IE',
  gbp: 'en-GB',
  cad: 'en-CA',
  aud: 'en-AU',
};

export function currencySymbol(c: Currency | string): string {
  return CURRENCY_SYMBOLS[c as Currency] ?? c.toUpperCase();
}

/** Format an amount given in MINOR units (cents) → "$49.99". */
export function formatMoney(amountCents: number, currency: Currency | string): string {
  const cur = (currency || 'usd').toLowerCase() as Currency;
  try {
    return new Intl.NumberFormat(LOCALE[cur] ?? 'en-US', {
      style: 'currency',
      currency: cur.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amountCents / 100);
  } catch {
    return `${currencySymbol(cur)}${(amountCents / 100).toFixed(2)}`;
  }
}

/** Format a major-unit amount (e.g. 49.99) → "$49.99". */
export function formatMoneyMajor(amount: number, currency: Currency | string): string {
  return formatMoney(Math.round(amount * 100), currency);
}
