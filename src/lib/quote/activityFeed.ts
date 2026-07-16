/**
 * Activity-feed derivation — PURE + TESTED (systemic fix).
 *
 * Why this module exists: the admin and platform feeds were derived inline inside
 * AdminCenterPage, in two near-duplicate loops with no tests. Every "activity is
 * incomplete" regression lived there — a missing event type, a wrong date field, a
 * silent filter — invisible to the test suite because the logic was welded to JSX.
 * The rules now live here, once, as pure functions the suite can pin down.
 *
 * Rules (the whole lifecycle, nothing hidden):
 *   sent (sentAt) → accepted (decidedAt) → invoiced (invoice createdAt) → paid (paidAt)
 * A payment event is dated when it was PAID, never when the invoice was created.
 * Only legacy 'draft' invoices are excluded (they were never issued to a client).
 */

import type { QuoteListItem, InvoiceItem, PlatformInvoiceItem } from './invoicesClient';

export interface ActivityEvent {
  icon:  string;
  label: string;
  title: string;
  date:  string;
  sub?:  string;
}

/** Labels + formatters injected so this module stays i18n- and currency-agnostic. */
export interface FeedDeps {
  evtSent:        string;
  evtAccepted:    string;
  evtInvoiceSent: string;
  evtPaid:        string;
  /** Quote/invoice display title (falls back to a short id). */
  title: (t: string | undefined, id: string) => string;
  /** Money formatter (USD). */
  usd:   (n: number | null) => string;
}

const byNewest = (a: ActivityEvent, b: ActivityEvent) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/** This org's feed: quote lifecycle + its invoices' billing/payment events. */
export function buildOrgActivity(
  quotes: QuoteListItem[] | null,
  invoices: InvoiceItem[] | null,
  d: FeedDeps,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const q of quotes ?? []) {
    const title = d.title(q.quoteTitle, q.quoteId);
    const sub = q.price != null ? d.usd(q.price) : undefined;
    if (q.sentAt)    events.push({ icon: '📤', label: d.evtSent,     title, date: q.sentAt,    sub });
    if (q.decidedAt) events.push({ icon: '✅', label: d.evtAccepted, title, date: q.decidedAt, sub });
  }
  for (const inv of invoices ?? []) {
    if (inv.status === 'draft') continue;
    const title = d.title(inv.quoteTitle, inv.quoteId);
    events.push(inv.status === 'paid'
      ? { icon: '💰', label: d.evtPaid,        title, date: inv.paidAt || inv.createdAt, sub: d.usd(inv.amount) }
      : { icon: '📧', label: d.evtInvoiceSent, title, date: inv.createdAt,               sub: d.usd(inv.amount) });
  }
  return events.sort(byNewest);
}

/** Cross-org operator feed: every org's accepted quotes + EVERY root invoice (an
 *  invoice whose quote fell outside the quote page still appears). org shown per row. */
export function buildPlatformActivity(
  quotes: QuoteListItem[] | null,
  invoices: PlatformInvoiceItem[],
  d: FeedDeps,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const q of quotes ?? []) {
    if (!q.decidedAt) continue;
    events.push({
      icon: '✅', label: d.evtAccepted,
      title: `${d.title(q.quoteTitle, q.quoteId)} · ${q.orgId}`,
      date: q.decidedAt,
      sub: q.price != null ? d.usd(q.price) : undefined,
    });
  }
  for (const inv of invoices) {
    if (inv.status === 'draft') continue;
    const title = `${d.title(inv.quoteTitle, inv.quoteId || inv.id)} · ${inv.orgId}`;
    events.push(inv.status === 'paid'
      ? { icon: '💰', label: d.evtPaid,        title, date: inv.paidAt || inv.createdAt, sub: d.usd(inv.amount) }
      : { icon: '📧', label: d.evtInvoiceSent, title, date: inv.createdAt,               sub: d.usd(inv.amount) });
  }
  return events.sort(byNewest);
}
