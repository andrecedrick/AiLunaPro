import { describe, it, expect } from 'vitest';
import { buildOrgActivity, buildPlatformActivity } from '../../src/lib/quote/activityFeed';
import type { QuoteListItem, InvoiceItem, PlatformInvoiceItem } from '../../src/lib/quote/invoicesClient';

/*
 * BUG 0 — the LAST unguarded path: paid → activity feed.
 *
 * The feeds were derived inline in AdminCenterPage (two near-duplicate loops, no
 * tests): a dropped event type, a wrong date field or a silent filter was invisible
 * to CI, which is exactly why "activities are incomplete" kept coming back. The rules
 * now live in a pure module and are pinned here.
 */

const D = {
  evtSent: 'sent', evtAccepted: 'accepted', evtInvoiceSent: 'invoiced', evtPaid: 'paid',
  title: (t: string | undefined, id: string) => (t && t.trim() ? t : `Quote · ${id.slice(0, 8)}`),
  usd: (n: number | null) => (n != null ? `$${Math.round(n).toLocaleString('en-US')}` : '—'),
};

const quote = (o: Partial<QuoteListItem>): QuoteListItem => ({
  quoteId: 'q1', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', createdBy: 'u1', orgId: 'orgA',
  source: '', price: 6500, currency: 'usd', rangeMinUsd: null, rangeMaxUsd: null, stage: 'sent',
  status: '', adminState: '', decision: '', createdAt: '2026-07-10T00:00:00.000Z', sentAt: '',
  decidedAt: '', updatedAt: '', paymentStatus: '', paidAt: '', stripePaymentId: '', paymentUrl: '',
  invoiceAmount: null, ...o,
});
const invoice = (o: Partial<InvoiceItem>): InvoiceItem => ({
  id: 'quote_q1', quoteId: 'q1', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', amount: 6500,
  currency: 'usd', rangeMinUsd: null, rangeMaxUsd: null, status: 'pending',
  createdAt: '2026-07-12T00:00:00.000Z', ...o,
});

describe('org activity feed — the full lifecycle is visible', () => {
  it('emits sent → accepted → invoiced → paid, newest first', () => {
    const ev = buildOrgActivity(
      [quote({ sentAt: '2026-07-11T00:00:00.000Z', decidedAt: '2026-07-13T00:00:00.000Z' })],
      [invoice({ status: 'paid', paidAt: '2026-07-15T00:00:00.000Z' })],
      D,
    );
    expect(ev.map(e => e.label)).toEqual(['paid', 'accepted', 'sent']);   // newest → oldest
    expect(ev[0].sub).toBe('$6,500');
  });

  it('a PAID event is dated when it was PAID, not when the invoice was created', () => {
    const ev = buildOrgActivity(null, [invoice({ status: 'paid', paidAt: '2026-07-15T00:00:00.000Z', createdAt: '2026-07-12T00:00:00.000Z' })], D);
    expect(ev[0].label).toBe('paid');
    expect(ev[0].date).toBe('2026-07-15T00:00:00.000Z');   // regression: was createdAt
    expect(ev[0].icon).toBe('💰');
  });

  it('a sent-but-undecided quote still shows its "sent" event (no silent drop)', () => {
    const ev = buildOrgActivity([quote({ sentAt: '2026-07-11T00:00:00.000Z' })], null, D);
    expect(ev.map(e => e.label)).toEqual(['sent']);
  });

  it('an unpaid invoice shows as invoiced; legacy drafts are the ONLY exclusion', () => {
    const ev = buildOrgActivity(null, [invoice({ status: 'pending' }), invoice({ id: 'quote_d', status: 'draft' })], D);
    expect(ev.map(e => e.label)).toEqual(['invoiced']);
  });

  it('falls back to a paidAt-less paid invoice (createdAt) instead of an empty date', () => {
    const ev = buildOrgActivity(null, [invoice({ status: 'paid', paidAt: null })], D);
    expect(ev[0].date).toBe('2026-07-12T00:00:00.000Z');
  });
});

describe('platform (cross-org) activity feed', () => {
  const pInv = (o: Partial<PlatformInvoiceItem>): PlatformInvoiceItem => ({
    id: 'quote_q9', orgId: 'orgC', quoteId: 'q9', quoteTitle: 'Zeta flow', customerEmail: 'z@z.com',
    amount: 60000, currency: 'usd', status: 'pending', paymentMethod: 'bank_transfer', paidAt: '',
    createdAt: '2026-07-14T00:00:00.000Z', ...o,
  });

  it('tags every row with its org and shows paid events cross-org', () => {
    const ev = buildPlatformActivity(
      [quote({ orgId: 'orgA', decidedAt: '2026-07-13T00:00:00.000Z' })],
      [pInv({ status: 'paid', paidAt: '2026-07-16T00:00:00.000Z' })],
      D,
    );
    expect(ev[0].label).toBe('paid');
    expect(ev[0].title).toContain('orgC');          // org visible per row
    expect(ev[1].title).toContain('orgA');
  });

  it('an invoice whose quote is NOT in the quote list still appears (no orphan hidden)', () => {
    const ev = buildPlatformActivity([], [pInv({ orgId: 'orgZ' })], D);
    expect(ev).toHaveLength(1);
    expect(ev[0].title).toContain('orgZ');
  });
});
