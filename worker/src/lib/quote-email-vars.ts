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
const MAX_LEN = 40;       // ROI values are short (money / × / months)
const MAX_LEN_TEXT = 80;  // display strings (title / solution / range) can be longer

/** Strip template/HTML metacharacters (`<>{}` — HTML tags + Sequenzy `{{merge}}`
 *  delimiters), trim, cap length. Shared by the ROI vars and every other
 *  client-derived string bound for the email template. */
function sanitizeValue(v: unknown, maxLen = MAX_LEN): string {
  if (typeof v !== 'string') return '';
  const cleaned = v.replace(/[<>{}]/g, '').trim().slice(0, maxLen).trim();
  return cleaned;
}

/**
 * Sanitize ONE display variable bound for the Sequenzy quote email
 * (QUOTE_TITLE / SOLUTION / RANGE / BUDGET / NEG_*). Same rule as the ROI vars —
 * strips `<>{}` so an (authenticated) sender can't inject markup or a nested
 * `{{VAR}}` into the client's mail — with the em-dash fallback for empties.
 * URLs (ACCEPT_URL / DISCUSS_URL / PDF_URL) are server-generated and must NOT be
 * passed through here: the length cap would break them.
 */
export function sanitizeEmailVar(v: unknown): string {
  return sanitizeValue(v, MAX_LEN_TEXT) || FALLBACK;
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
