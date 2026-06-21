import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * Invoices — GET /api/invoices (FIX 6, org-scoped read) and
 * POST /api/invoices/:id/confirm (Step B: admin sets amount → pending → send the
 * invoice-client email). Cross-org guarded, idempotent, no Stripe/charge.
 */

const state = vi.hoisted(() => ({
  rows: [] as Array<{ name: string; fields: Record<string, unknown> }>,
  docs: new Map<string, Record<string, unknown>>(),
}));
const seq = vi.hoisted(() => ({ sends: [] as Array<Record<string, unknown>> }));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => { c.set('uid', 'u1'); await next(); },
}));
vi.mock('../../worker/src/middleware/requireRole', () => ({
  requireRole: () => async (c: { req: { query: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('orgId', c.req.query('orgId') ?? 'orgA'); c.set('role', 'owner'); await next();
  },
}));
const runQuery = vi.hoisted(() => vi.fn(async () => state.rows));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: runQuery,
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    state.docs.set(path, { ...(state.docs.get(path) ?? {}), ...data });
  }),
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string, p: Record<string, unknown>) => { seq.sends.push(p); return { ok: true }; }),
}));

import invoices from '../../worker/src/routes/invoices';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', SEQUENZY_API_KEY: 'k', ADMIN_EMAIL: 'admin@x.com', APP_BASE_URL: 'https://audit.ailunapro.com' } as unknown as Record<string, unknown>;
const get = (org = 'orgA') => invoices.request(`/api/invoices?orgId=${org}`, { headers: { Authorization: 'Bearer t' } }, ENV);
const confirm = (id: string, amount: unknown, org = 'orgA') =>
  invoices.request(`/api/invoices/${id}/confirm?orgId=${org}`, {
    method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: org, amount }),
  }, ENV);

beforeEach(() => {
  runQuery.mockClear(); seq.sends.length = 0; state.docs.clear();
  state.rows = [
    { name: 'documents/invoices/quote_a', fields: { id: 'quote_a', quoteId: 'a', orgId: 'orgA', customerEmail: 'c@x.com', amount: null, currency: 'usd', rangeMinUsd: 10000, rangeMaxUsd: 20000, status: 'draft', createdAt: '2026-06-19T00:00:00.000Z' } },
    { name: 'documents/invoices/quote_b', fields: { id: 'quote_b', quoteId: 'b', orgId: 'orgA', amount: 5000, currency: 'usd', status: 'pending', createdAt: '2026-06-20T00:00:00.000Z' } },
  ];
  state.docs.set('invoices/quote_a', { id: 'quote_a', quoteId: 'a', orgId: 'orgA', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', amount: null, status: 'draft', rangeMaxUsd: 20000 });
});

describe('GET /api/invoices', () => {
  it('returns the org invoices mapped and newest-first', async () => {
    const res = await get();
    expect(res.status).toBe(200);
    const { invoices: list } = await res.json() as { invoices: Array<Record<string, unknown>> };
    expect(list).toHaveLength(2);
    expect(list[0].quoteId).toBe('b');
    expect(list[1].amount).toBeNull();
    expect((runQuery.mock.calls[0][1] as { where: { fieldFilter: { value: { stringValue: string } } } }).where.fieldFilter.value.stringValue).toBe('orgA');
  });

  it('returns an empty list when the org has no invoices', async () => {
    state.rows = [];
    expect((await (await get()).json() as { invoices: unknown[] }).invoices).toEqual([]);
  });
});

describe('POST /api/invoices/:id/confirm (Step B)', () => {
  it('confirms a draft → pending, sets amount, sends the invoice-client email', async () => {
    const res = await confirm('quote_a', 15000);
    expect(res.status).toBe(200);
    const j = await res.json() as { status: string; emailed: boolean };
    expect(j.status).toBe('pending');
    expect(j.emailed).toBe(true);                        // delivery confirmed to the caller
    const doc = state.docs.get('invoices/quote_a')!;
    expect(doc.status).toBe('pending');
    expect(doc.amount).toBe(15000);
    const send = seq.sends.find(s => s.slug === 'invoice-client')!;
    expect(send.to).toBe('c@x.com');
    const v = send.variables as Record<string, string>;
    expect(v.PROJECT).toBe('Acme bot');
    expect(v.AMOUNT).toBe('$15,000');
    expect(v.INVOICE_URL).toContain('/#/invoices');      // "View your invoice" link
    expect(v.BANK_DETAILS).toContain('available on request');   // FIX 4 — graceful fallback, never blank
  });

  it('includes the configured region bank details in the email (FIX 4)', async () => {
    state.docs.set('organizations/orgA/settings/billing', { region: 'eu', accountName: 'Acme SARL', iban: 'FR7630006000011234567890189', bic: 'BNPAFRPP' });
    await confirm('quote_a', 15000);
    const v = seq.sends.find(s => s.slug === 'invoice-client')!.variables as Record<string, string>;
    expect(v.BANK_DETAILS).toContain('FR7630006000011234567890189');
    expect(v.BANK_DETAILS).toContain('IBAN:');
  });

  it('rejects confirming an invoice from another org (cross-org guard)', async () => {
    const res = await confirm('quote_a', 15000, 'orgB');   // verified org = orgB, invoice = orgA
    expect(res.status).toBe(404);
    expect(state.docs.get('invoices/quote_a')!.status).toBe('draft');  // unchanged
    expect(seq.sends.length).toBe(0);
  });

  it('re-confirms + re-sends a pending invoice (explicit admin resend)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', customerEmail: 'c@x.com', status: 'pending', amount: 9000 });
    const res = await confirm('quote_a', 12000);
    expect(res.status).toBe(200);
    expect(state.docs.get('invoices/quote_a')!.amount).toBe(12000);                 // updated
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeTruthy();          // re-sent
  });

  it('does not re-amount or re-send a PAID invoice (final)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'paid', amount: 9000 });
    const res = await confirm('quote_a', 12000);
    expect(res.status).toBe(200);
    expect((await res.json() as { alreadyConfirmed?: boolean }).alreadyConfirmed).toBe(true);
    expect(state.docs.get('invoices/quote_a')!.amount).toBe(9000);   // unchanged
    expect(seq.sends.length).toBe(0);
  });

  it('rejects an invalid amount', async () => {
    expect((await confirm('quote_a', 0)).status).toBe(400);
    expect((await confirm('quote_a', 'x')).status).toBe(400);
  });
});
