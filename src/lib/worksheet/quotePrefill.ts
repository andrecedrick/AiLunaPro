/**
 * One-shot Worksheet → Quote handoff (Sprint 2).
 *
 * The Worksheet writes a small, transient payload before navigating to the Quote
 * page; the Quote page reads it ONCE on mount to pre-select the service category
 * and prefill the project description, then clears it.
 *
 * sessionStorage (current tab, never persisted to disk long-term). The seed text
 * is built + localized by the Worksheet from the user's OWN task labels — it stays
 * client-side and is NEVER sent to an analytics event (no-PII funnel rule).
 */

const KEY = 'ailunapro-worksheet-quote-prefill';

export interface WorksheetQuotePrefill {
  /** Quote service category to pre-select (validated against QUOTE_CATEGORIES on read). */
  category: string;
  /** Pre-formatted, already-localized project description (currency + labels resolved). */
  descriptionSeed: string;
}

export function saveWorksheetQuotePrefill(p: WorksheetQuotePrefill): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota / unavailable */ }
}

/** Read AND clear (one-shot). Returns null when absent or malformed. */
export function takeWorksheetQuotePrefill(): WorksheetQuotePrefill | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const p = JSON.parse(raw) as WorksheetQuotePrefill;
    if (typeof p?.category !== 'string' || typeof p?.descriptionSeed !== 'string') return null;
    return p;
  } catch { return null; }
}
