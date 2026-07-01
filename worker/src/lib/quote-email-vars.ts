/**
 * quote-email-vars — ROI + decision merge variables for the quote email.
 *
 * The ROI/decision figures live CLIENT-SIDE (pendingLead.roi + computeDecision), so
 * the client formats them EXACTLY as the in-app quote blocks (useMoney / i18n) and
 * sends the display strings; this module just validates + normalizes them before they
 * go into the Sequenzy template. No pricing/billing logic — display only.
 *
 * Guarantees for the email:
 *  - EVERY key is always present (so no raw {{VARIABLE}} can leak into the message),
 *  - a missing/invalid value falls back to an em dash (safe, never a null or a fake),
 *  - values are length-capped and stripped of template/HTML metacharacters so a
 *    (authenticated) sender can't inject markup into the mail to their own client.
 */

export const QUOTE_ROI_KEYS = [
  'MONTHLY_SAVED',
  'YEARLY_SAVED',
  'TIME_SAVED',
  'PAYBACK',
  'ROI_MULTIPLE',
  'BREAKEVEN',
  'THREE_YEAR',
] as const;

export type QuoteRoiVarKey = typeof QUOTE_ROI_KEYS[number];

const FALLBACK = '—'; // em dash
const MAX_LEN = 40;

/** Strip template/HTML metacharacters, trim, cap length. */
function sanitizeValue(v: unknown): string {
  if (typeof v !== 'string') return '';
  const cleaned = v.replace(/[<>{}]/g, '').trim().slice(0, MAX_LEN).trim();
  return cleaned;
}

/**
 * Build the 7 ROI/decision merge variables from the client-supplied payload. Always
 * returns all keys; absent/invalid → FALLBACK. Pure.
 */
export function sanitizeQuoteRoiVars(raw: unknown): Record<QuoteRoiVarKey, string> {
  const src = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  const out = {} as Record<QuoteRoiVarKey, string>;
  for (const k of QUOTE_ROI_KEYS) {
    const s = sanitizeValue(src[k]);
    out[k] = s || FALLBACK;
  }
  return out;
}
