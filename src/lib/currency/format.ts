/**
 * Canonical money formatter — B6.7 (currency unification).
 *
 * All monetary values in the app are authored/stored in USD (the base). This is
 * the single entry point that converts a USD amount to the user's display
 * currency (via the deterministic FX_SNAPSHOT) and formats it.
 *
 * Design guarantees:
 *  - USD output is BYTE-IDENTICAL to the app's prior hardcoded
 *    `'$' + Math.round(n).toLocaleString('en-US')`, so migrating a surface with
 *    currency = USD changes nothing visually (the P2 safety net).
 *  - Converted (non-USD) values are prefixed with "≈" — they are display
 *    estimates; Stripe bills the real amount.
 */

import type { Currency } from '../billing/currencyConstants';
import { CURRENCY_SYMBOLS } from '../billing/currencyConstants';
import { convertFromUsd } from './fxSnapshot';

export interface FormatMoneyOptions {
  /** Decimal places (default 0 — whole units, matches the app's prior $ output). */
  decimals?: number;
  /** Force/suppress the "≈" prefix. Default: auto (true for any non-USD value). */
  approx?: boolean;
  /** Grouping locale for digit separators. Default 'en-US' (preserves prior output). */
  grouping?: string;
}

export function formatMoney(amountUsd: number, currency: Currency, opts: FormatMoneyOptions = {}): string {
  const decimals  = opts.decimals ?? 0;
  const grouping  = opts.grouping ?? 'en-US';
  const converted = convertFromUsd(amountUsd, currency);
  const rounded   = decimals === 0 ? Math.round(converted) : Number(converted.toFixed(decimals));
  const grouped   = rounded.toLocaleString(grouping, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const approx = opts.approx ?? (currency !== 'usd');
  return `${approx ? '≈ ' : ''}${symbol}${grouped}`;
}
