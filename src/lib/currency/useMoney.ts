/**
 * useMoney — B6.7 (currency unification).
 *
 * Returns a money formatter bound to the user's current display currency
 * (PreferencesContext). Monetary UIs pass a USD-base amount; the formatter
 * converts + formats via the deterministic snapshot. This is the single
 * consumer-facing entry point that replaces hardcoded `$` formatting across the
 * app (ROI, results, agents, …) in later phases.
 *
 * P0: provided but not yet wired into any surface — additive, no behavior change.
 */

import { formatMoney, type FormatMoneyOptions } from './format';
import type { Currency } from '../billing/currencyConstants';

export interface MoneyFormatter {
  /** Format a USD-base amount in the user's current display currency. */
  format: (amountUsd: number, opts?: FormatMoneyOptions) => string;
  /** The active display currency — e.g. to pass into pure range formatters. */
  currency: Currency;
}

export function useMoney(): MoneyFormatter {
  // Batch A — USD is forced app-wide: no locale conversion, no "≈" marker. priceUsd /
  // finalPriceUsd are the single source of truth; every surface shows the same USD value.
  const displayCurrency: Currency = 'usd';
  return {
    format: (amountUsd, opts) => formatMoney(amountUsd, displayCurrency, opts),
    currency: displayCurrency,
  };
}
