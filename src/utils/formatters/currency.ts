/**
 * Currency formatter — Phase D4.
 * Reserved for the upcoming Billing UI (Phase I). Kept here so that no
 * component re-implements `Intl.NumberFormat` inline.
 */

/**
 * Format a numeric amount as a localized currency string.
 *
 * @param amount   numeric amount (e.g. 49)
 * @param currency ISO 4217 code (default: 'USD')
 * @param locale   BCP-47 locale (default: undefined — user's locale)
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale?: string,
): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
