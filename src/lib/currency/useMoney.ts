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

import { usePreferences } from '../../context/PreferencesContext';
import { formatMoney, type FormatMoneyOptions } from './format';

export function useMoney(): (amountUsd: number, opts?: FormatMoneyOptions) => string {
  const { displayCurrency } = usePreferences();
  return (amountUsd, opts) => formatMoney(amountUsd, displayCurrency, opts);
}
