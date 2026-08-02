import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * P1.1 — invoice numbering atomicity and the rendered document.
 *
 * Two properties here would each be a real financial incident:
 *   - two invoices sharing a number, or a gap in the sequence;
 *   - the amount charged disagreeing with the amount reconciled, which would
 *     leave every VAT invoice permanently unpaid.
 */

const state = vi.hoisted(() => ({
  docs:  new Map<string, { data: Record<string, unknown>; updateTime: string }>(),
  clock: 0,
  /** Set to force a CAS conflict on the next write, simulating a concurrent admin. */
  collideOnce: false,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGetWithMeta: vi.fn(async (_sa: string, p: string) => {
    const d = state.docs.get(p);
    return d ? { data: { ...d.data }, updateTime: d.updateTime } : null;
  }),
  firestoreSetIfMatch: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, expected: string) => {
    const cur = state.docs.get(p);
    if (state.collideOnce) {
      // Another writer got there first: bump the doc so the precondition fails.
      state.collideOnce = false;
      state.docs.set(p, { data: { ...(cur?.data ?? {}), sequence: Number(cur?.data.sequence ?? 0) + 1 }, updateTime: `t${++state.clock}` });
      throw new Error('PRECONDITION_FAILED');
    }
    if (!cur || cur.updateTime !== expected) throw new Error('PRECONDITION_FAILED');
    state.docs.set(p, { data: { ...cur.data, ...data }, updateTime: `t${++state.clock}` });
  }),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>) => {
    if (state.docs.has(p)) throw new Error('ALREADY_EXISTS');
    state.docs.set(p, { data: { ...data }, updateTime: `t${++state.clock}` });
  }),
  firestoreGet: vi.fn(async (_sa: string, p: string) => state.docs.get(p)?.data ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, d: Record<string, unknown>) => {
    const cur = state.docs.get(p);
    state.docs.set(p, { data: { ...(cur?.data ?? {}), ...d }, updateTime: `t${++state.clock}` });
  }),
  firestoreRunQuery: vi.fn(async () => []),
}));

import { allocateInvoiceNumber, InvoiceNumberError } from '../../worker/src/lib/invoice-number';
import { buildInvoicePdf } from '../../worker/src/lib/quote-pdf';
import { toParty, partyLines, decideTax, computeTotals } from '../../worker/src/lib/invoice-model';

const AT = '2026-08-02T09:00:00.000Z';
const decode = (b: Uint8Array) => new TextDecoder('latin1').decode(b);

beforeEach(() => { state.docs.clear(); state.clock = 0; state.collideOnce = false; vi.clearAllMocks(); });

describe('sequential numbering', () => {
  it('starts at one and increments', async () => {
    const a = await allocateInvoiceNumber('{}', 'orgA', 2026);
    const b = await allocateInvoiceNumber('{}', 'orgA', 2026);
    const c = await allocateInvoiceNumber('{}', 'orgA', 2026);
    expect([a, b, c].map(x => x.invoiceNumber))
      .toEqual(['INV-2026-000001', 'INV-2026-000002', 'INV-2026-000003']);
  });

  it('never issues the same number twice under concurrency', async () => {
    // A dozen simultaneous finalisations against one counter.
    const results = await Promise.all(
      Array.from({ length: 12 }, () => allocateInvoiceNumber('{}', 'orgA', 2026)));
    const numbers = results.map(r => r.invoiceNumber);
    expect(new Set(numbers).size).toBe(12);
  });

  it('leaves NO GAP in the sequence', async () => {
    // A gap is not cosmetic: most tax authorities require a continuous series,
    // and a missing number reads as a deleted invoice.
    const results = await Promise.all(
      Array.from({ length: 12 }, () => allocateInvoiceNumber('{}', 'orgA', 2026)));
    expect(results.map(r => r.sequence).sort((x, y) => x - y))
      .toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  });

  it('retries and takes the next number when another writer wins the race', async () => {
    await allocateInvoiceNumber('{}', 'orgA', 2026);   // sequence 1
    state.collideOnce = true;
    const after = await allocateInvoiceNumber('{}', 'orgA', 2026);
    // The colliding writer took 2, so this one must take 3 — never re-use 2.
    expect(after.sequence).toBe(3);
  });

  it('keeps a separate series per organisation', async () => {
    const a = await allocateInvoiceNumber('{}', 'orgA', 2026);
    const b = await allocateInvoiceNumber('{}', 'orgB', 2026);
    expect(a.invoiceNumber).toBe('INV-2026-000001');
    expect(b.invoiceNumber).toBe('INV-2026-000001');
  });

  it('restarts the series each year', async () => {
    await allocateInvoiceNumber('{}', 'orgA', 2026);
    const next = await allocateInvoiceNumber('{}', 'orgA', 2027);
    expect(next.invoiceNumber).toBe('INV-2027-000001');
  });

  it('fails loudly rather than returning a duplicate', async () => {
    await allocateInvoiceNumber('{}', 'orgA', 2026);
    // Every attempt collides: the caller must get an error, never a guess.
    Object.defineProperty(state, 'collideOnce', {
      get: () => true, set: () => { /* always contended */ }, configurable: true,
    });
    await expect(allocateInvoiceNumber('{}', 'orgA', 2026)).rejects.toBeInstanceOf(InvoiceNumberError);
    Object.defineProperty(state, 'collideOnce', { value: false, writable: true, configurable: true });
  });
});

describe('the rendered invoice', () => {
  const supplier = toParty({
    legalName: 'AiLunaPro SAS', addressLines: ['12 rue Lafayette'], postalCode: '75009',
    city: 'Paris', country: 'FR', vatNumber: 'FR12345678901', registrationNumber: 'RCS Paris 900 000 000',
  });
  const customer = toParty({
    legalName: 'Kunde GmbH', addressLines: ['Hauptstr. 4'], postalCode: '10115',
    city: 'Berlin', country: 'DE', vatNumber: 'DE123456789', email: 'ap@kunde.example',
  });

  const render = (over: Record<string, unknown> = {}) => {
    const tax = decideTax(supplier, customer, 2000);
    const totals = computeTotals(100_00, 'eur', tax);
    return decode(buildInvoicePdf({
      invoiceId: 'quote_abc', invoiceNumber: 'INV-2026-000042',
      reference: 'abc', quoteTitle: 'AI compliance audit',
      customerEmail: 'ap@kunde.example', amountUsd: 100,
      status: 'pending', paymentMethod: 'stripe', createdAt: AT, paidAt: null,
      supplierLines: partyLines(supplier), billToLines: partyLines(customer),
      currency: 'eur', subtotalMinor: totals.subtotalMinor, taxRateBp: totals.taxRateBp,
      taxMinor: totals.taxMinor, totalMinor: totals.totalMinor,
      taxLabel: 'VAT', taxNote: totals.taxNote, dueAt: '2026-08-16T09:00:00.000Z',
      bankDetails: 'IBAN: FR7630006000011234567890189', invoiceFooter: 'SAS au capital de 10 000 EUR',
      ...over,
    }));
  };

  it('prints every field an accountant needs', () => {
    const t = render();
    expect(t).toContain('INV-2026-000042');          // sequential number
    expect(t).toContain('AiLunaPro SAS');            // issuer
    expect(t).toContain('FR12345678901');            // issuer VAT
    expect(t).toContain('RCS Paris 900 000 000');    // registration
    expect(t).toContain('Kunde GmbH');               // bill-to
    expect(t).toContain('DE123456789');              // customer VAT
    expect(t).toContain('2026-08-16');               // due date
    expect(t).toContain('Subtotal');   // rendered as 'Subtotal (net)' — PDF escapes parens
    expect(t).toContain('100.00 EUR');               // net, in the invoice currency
    expect(t).toContain('IBAN');                     // payment information
    expect(t).toContain('SAS au capital');           // legal footer
  });

  it('states the reverse-charge treatment instead of silently zeroing the tax', () => {
    const t = render();
    expect(t).toContain('Article 196');
    expect(t).toContain('0.00 EUR');
  });

  it('shows a real VAT line on a domestic supply', () => {
    const tax = decideTax(supplier, toParty({ ...supplier, legalName: 'Client FR' }), 2000);
    const totals = computeTotals(100_00, 'eur', tax);
    const t = render({
      billToLines: ['Client FR'], subtotalMinor: totals.subtotalMinor, taxRateBp: totals.taxRateBp,
      taxMinor: totals.taxMinor, totalMinor: totals.totalMinor, taxNote: totals.taxNote,
    });
    expect(t).toContain('20.00%');
    expect(t).toContain('20.00 EUR');    // the VAT itself
    expect(t).toContain('120.00 EUR');   // gross
  });

  it('prints the payment references on a paid invoice', () => {
    const t = render({ status: 'paid', paidAt: AT, stripePaymentIntentId: 'pi_3ABC', stripeSessionId: 'cs_test_9' });
    expect(t).toContain('pi_3ABC');
    expect(t).toContain('cs_test_9');
  });

  it('omits payment references while the invoice is unpaid', () => {
    expect(render({ stripePaymentIntentId: 'pi_3ABC' })).not.toContain('pi_3ABC');
  });

  it('still renders a legacy invoice that has no accounting fields', () => {
    // Older invoices must keep opening, showing what they actually charged —
    // never a retro-fitted VAT breakdown they were never issued with.
    const t = decode(buildInvoicePdf({
      invoiceId: 'quote_old', reference: 'old', quoteTitle: 'Legacy project',
      customerEmail: 'a@b.example', amountUsd: 2500, status: 'paid',
      paymentMethod: 'bank_transfer', createdAt: AT, paidAt: AT,
    }));
    expect(t).toContain('quote_old');
    expect(t).toContain('2,500.00 USD');
    expect(t).not.toContain('Article 196');
  });

  it('is byte-identical for identical input', () => {
    expect(render()).toBe(render());
  });
});
