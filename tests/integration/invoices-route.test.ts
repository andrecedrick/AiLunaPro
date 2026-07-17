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
const seq = vi.hoisted(() => ({ sends: [] as Array<Record<string, unknown>>, ok: true }));
// Customer invoice links are HMAC-signed; the signature itself is covered by the
// audit-express-share suite, so here we drive the route's verification branches.
const share = vi.hoisted(() => ({ verify: vi.fn(), sign: vi.fn(async () => ({ token: 'signed-tok', exp: 9_999_999_999 })) }));
vi.mock('../../worker/src/lib/audit-express-share', () => ({
  signShareToken: (...a: unknown[]) => share.sign(...(a as [])),
  verifyShareToken: (...a: unknown[]) => share.verify(...(a as [])),
}));

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
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    if (state.docs.has(path)) throw new Error('ALREADY_EXISTS');
    state.docs.set(path, { ...data });
  }),
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string, p: Record<string, unknown>) => { seq.sends.push(p); return seq.ok ? { ok: true } : { ok: false, error: 'SEQUENZY_API_KEY not configured' }; }),
}));

import invoices from '../../worker/src/routes/invoices';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', SEQUENZY_API_KEY: 'k', ADMIN_EMAIL: 'admin@x.com', APP_BASE_URL: 'https://audit.ailunapro.com', AUDIT_SHARE_SECRET: 'sec' } as unknown as Record<string, unknown>;
const get = (org = 'orgA') => invoices.request(`/api/invoices?orgId=${org}`, { headers: { Authorization: 'Bearer t' } }, ENV);
// Fixed-price: confirm is RE-SEND only (no amount input — the amount is immutable).
const confirm = (id: string, org = 'orgA') =>
  invoices.request(`/api/invoices/${id}/confirm?orgId=${org}`, {
    method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: org }),
  }, ENV);

beforeEach(() => {
  runQuery.mockClear(); seq.sends.length = 0; seq.ok = true; state.docs.clear();
  share.verify.mockReset(); share.sign.mockClear();
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

describe('POST /api/invoices/:id/confirm — re-send only (no re-amount)', () => {
  it('re-sends a pending invoice at its LOCKED amount (unchanged)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', status: 'pending', amount: 15000 });
    const res = await confirm('quote_a');
    expect(res.status).toBe(200);
    const j = await res.json() as { status: string; emailed: boolean };
    expect(j.emailed).toBe(true);
    expect(state.docs.get('invoices/quote_a')!.amount).toBe(15000);   // NOT re-amounted
    const send = seq.sends.find(s => s.slug === 'invoice-client')!;
    expect(send.to).toBe('c@x.com');
    const v = send.variables as Record<string, string>;
    expect(v.AMOUNT).toBe('$15,000');
    // The client is NOT an org member: their link must be the signed no-login invoice,
    // never /#/invoices (the member panel = sign-in wall). This assertion previously
    // pinned that exact customer-facing defect.
    expect(v.INVOICE_URL).toContain('/api/invoices/shared/');
    expect(v.INVOICE_URL).not.toContain('/#/invoices');
    expect(v.BANK_DETAILS).toContain('available on request');   // graceful fallback, never blank
  });

  it('includes the configured region bank details in the email', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', customerEmail: 'c@x.com', status: 'pending', amount: 15000 });
    state.docs.set('organizations/orgA/settings/billing', { region: 'eu', accountName: 'Acme SARL', iban: 'FR7630006000011234567890189', bic: 'BNPAFRPP' });
    await confirm('quote_a');
    const v = seq.sends.find(s => s.slug === 'invoice-client')!.variables as Record<string, string>;
    expect(v.BANK_DETAILS).toContain('FR7630006000011234567890189');
    expect(v.BANK_DETAILS).toContain('IBAN:');
  });

  it('rejects re-sending an invoice from another org (cross-org guard)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'pending', amount: 15000 });
    const res = await confirm('quote_a', 'orgB');
    expect(res.status).toBe(404);
    expect(seq.sends.length).toBe(0);
  });

  it('a PAID invoice re-sends the PAYMENT CONFIRMATION (receipt) — never the pay request (BUG 1)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', status: 'paid', amount: 9000 });
    const res = await confirm('quote_a');
    expect(res.status).toBe(200);
    const j = await res.json() as { alreadyConfirmed?: boolean; emailed?: boolean };
    expect(j.alreadyConfirmed).toBe(true);
    expect(j.emailed).toBe(true);
    const send = seq.sends.find(s => s.slug === 'payment-confirmation')!;   // receipt, NOT invoice-client
    expect(send).toBeTruthy();
    expect(send.to).toBe('c@x.com');
    expect((send.variables as Record<string, string>).AMOUNT).toBe('$9,000');
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeFalsy();   // no pay-request re-send
    expect(state.docs.get('invoices/quote_a')!.status).toBe('paid');        // state preserved
  });

  it('a PAID invoice with no client email → 409 NO_RECIPIENT (no silent skip)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'paid', amount: 9000 });
    const res = await confirm('quote_a');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('NO_RECIPIENT');
    expect(seq.sends.length).toBe(0);
  });

  it('409 when the invoice has no amount yet', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'draft', amount: null });
    const res = await confirm('quote_a');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('NO_AMOUNT');
  });
});

describe('POST /api/invoices/:id/confirm — FIX 2 resend reliability + reporting', () => {
  it('NO_RECIPIENT (409) when the invoice has no client email — no send, LOUD not silent', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', status: 'pending', amount: 15000 });   // no customerEmail
    const res = await confirm('quote_a');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('NO_RECIPIENT');
    expect(seq.sends.length).toBe(0);
  });

  it('audits a successful resend (lastResentAt + lastResentBy)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', customerEmail: 'c@x.com', status: 'pending', amount: 15000 });
    const res = await confirm('quote_a');
    expect(res.status).toBe(200);
    expect((await res.json() as { emailed: boolean }).emailed).toBe(true);
    const inv = state.docs.get('invoices/quote_a')!;
    expect(typeof inv.lastResentAt).toBe('string');
    expect(inv.lastResentBy).toBe('u1');
  });

  it('reports EMAIL_FAILED (200, emailed:false) when the provider send fails — invoice state preserved', async () => {
    seq.ok = false;   // sendTransactional returns { ok:false }
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', customerEmail: 'c@x.com', status: 'pending', amount: 15000 });
    const res = await confirm('quote_a');
    expect(res.status).toBe(200);
    const j = await res.json() as { emailed: boolean; code?: string };
    expect(j.emailed).toBe(false);
    expect(j.code).toBe('EMAIL_FAILED');
    expect(state.docs.get('invoices/quote_a')!.status).toBe('pending');   // unchanged
    expect(state.docs.get('invoices/quote_a')!.lastResentAt).toBeUndefined();   // not audited on failure
  });

  it('re-sends a BANK-TRANSFER invoice (awaiting_transfer) — instructions, no Stripe link, no re-amount', async () => {
    state.docs.set('invoices/quote_h', { orgId: 'orgA', quoteId: 'h', customerEmail: 'c@x.com', status: 'awaiting_transfer', amount: 60000, paymentMethod: 'bank_transfer', transferDeadline: '2026-07-28T00:00:00.000Z' });
    const res = await confirm('quote_h');
    expect(res.status).toBe(200);
    const j = await res.json() as { emailed: boolean; paymentUrl: string | null; amount: number; status: string };
    expect(j.emailed).toBe(true);
    expect(j.paymentUrl).toBeNull();                     // bank transfer → never a Stripe link
    expect(j.amount).toBe(60000);                        // NOT re-amounted
    expect(j.status).toBe('awaiting_transfer');          // state preserved (not regressed)
    const v = seq.sends.find(s => s.slug === 'invoice-client')!.variables as Record<string, string>;
    expect(v.BANK_TRANSFER).toBe('1');
    expect(v.BANK_DETAILS).toBeTruthy();
  });
});

describe('GET /api/invoices — data consistency (the invoice must have ONE identity everywhere)', () => {
  it('returns quoteTitle so invoice rows/events render the project name, not a raw uuid', async () => {
    state.rows = [
      { name: 'documents/invoices/quote_z', fields: { id: 'quote_z', quoteId: '4332d263-bfb2-4ed7-b0d0-cd08fecef1c6', orgId: 'orgA', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', amount: 6500, status: 'paid', paidAt: '2026-07-15T00:00:00.000Z', createdAt: '2026-07-14T00:00:00.000Z' } },
    ];
    const { invoices: list } = await (await get()).json() as { invoices: Array<Record<string, unknown>> };
    // Regression: quoteTitle was persisted at invoice birth but never mapped by this
    // route → the UI fell back to "Quote · <uuid>" while quote-sourced rows showed the
    // real name. Same invoice, two identities across surfaces.
    expect(list[0].quoteTitle).toBe('Acme bot');
    expect(list[0].status).toBe('paid');
    expect(list[0].paidAt).toBe('2026-07-15T00:00:00.000Z');
    expect(list[0].amount).toBe(6500);
  });

  it('requests a window large enough that a recent invoice is never silently dropped', async () => {
    await get();
    // firestoreRunQuery(saJson, structuredQuery) → the query is arg[1].
    const sq = runQuery.mock.calls[0][1] as unknown as { limit: number; where: unknown };
    expect(sq.limit).toBeGreaterThanOrEqual(1000);   // was 200 in arbitrary key order
    expect(sq.where).toBeTruthy();                   // still org-scoped
  });

  it('a PAID invoice is returned with every field the admin feed needs', async () => {
    state.rows = [
      { name: 'documents/invoices/quote_p', fields: { id: 'quote_p', quoteId: 'p', orgId: 'orgA', quoteTitle: 'Paid project', amount: 6500, status: 'paid', paidAt: '2026-07-15T00:00:00.000Z', createdAt: '2026-07-10T00:00:00.000Z', paymentMethod: 'stripe' } },
    ];
    const { invoices: list } = await (await get()).json() as { invoices: Array<Record<string, unknown>> };
    const inv = list[0];
    // Everything buildOrgActivity needs for a 💰 paid event dated by paidAt:
    expect([inv.status, inv.paidAt, inv.amount, inv.quoteTitle]).toEqual(['paid', '2026-07-15T00:00:00.000Z', 6500, 'Paid project']);
  });
});

describe('GET /api/invoices/:id/pdf — downloadable invoice document (BUG 2)', () => {
  const pdf = (id: string, org = 'orgA') =>
    invoices.request(`/api/invoices/${id}/pdf?orgId=${org}`, { headers: { Authorization: 'Bearer t' } }, ENV);

  it('a PAID invoice downloads as a real PDF receipt (magic bytes + headers)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', status: 'paid', amount: 6500, paidAt: '2026-07-15T00:00:00.000Z', createdAt: '2026-07-14T00:00:00.000Z', paymentMethod: 'stripe' });
    const res = await pdf('quote_a');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('invoice-quote_a.pdf');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(...buf.slice(0, 5))).toBe('%PDF-');   // real PDF, not JSON/HTML
    expect(buf.length).toBeGreaterThan(1000);
  });

  it('a PENDING invoice is downloadable too (amount due document)', async () => {
    state.docs.set('invoices/quote_b2', { orgId: 'orgA', quoteId: 'b2', customerEmail: 'c@x.com', status: 'pending', amount: 15000, createdAt: '2026-07-14T00:00:00.000Z', paymentMethod: 'bank_transfer' });
    const res = await pdf('quote_b2');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('cross-org guard: another org cannot download (404)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'paid', amount: 6500 });
    expect((await pdf('quote_a', 'orgB')).status).toBe(404);
  });

  it('409 NO_AMOUNT for an amount-less legacy draft', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'draft', amount: null });
    expect((await pdf('quote_a')).status).toBe(409);
  });
});

describe('CUSTOMER invoice access — no account, no sign-in (GET /api/invoices/shared/:token)', () => {
  const shared = (token: string, dl = false) =>
    invoices.request(`/api/invoices/shared/${token}${dl ? '?dl=1' : ''}`, {}, ENV);   // NOTE: no Authorization header

  it('a paying customer opens their PAID invoice with NO auth header at all', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', status: 'paid', amount: 6500, paidAt: '2026-07-15T00:00:00.000Z', createdAt: '2026-07-14T00:00:00.000Z' });
    share.verify.mockResolvedValue({ ok: true, payload: { orgId: 'orgA', auditId: 'quote_a', exp: 9_999_999_999, shareVersion: 3 } });
    const res = await shared('tok');
    expect(res.status).toBe(200);                       // NOT 401 — the token is the gate
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('inline');   // opens in the browser
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(...buf.slice(0, 5))).toBe('%PDF-');
  });

  it('?dl=1 downloads the receipt as an attachment', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'paid', amount: 6500, quoteId: 'a', createdAt: '2026-07-14T00:00:00.000Z' });
    share.verify.mockResolvedValue({ ok: true, payload: { orgId: 'orgA', auditId: 'quote_a', exp: 9_999_999_999, shareVersion: 3 } });
    const res = await shared('tok', true);
    expect(res.headers.get('Content-Disposition')).toContain('attachment');
  });

  it('a quote-PDF (v1) or accept (v2) token can NEVER open an invoice', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', status: 'paid', amount: 6500 });
    for (const v of [1, 2]) {
      share.verify.mockResolvedValue({ ok: true, payload: { orgId: 'orgA', auditId: 'quote_a', exp: 9_999_999_999, shareVersion: v } });
      expect((await shared('tok')).status).toBe(401);
    }
  });

  it('a token for org A cannot read org B\'s invoice (cross-tenant)', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgB', status: 'paid', amount: 6500 });
    share.verify.mockResolvedValue({ ok: true, payload: { orgId: 'orgA', auditId: 'quote_a', exp: 9_999_999_999, shareVersion: 3 } });
    expect((await shared('tok')).status).toBe(404);
  });

  it('an expired link is 410 and an invalid one is 401', async () => {
    share.verify.mockResolvedValueOnce({ ok: false, code: 'SHARE_EXPIRED' });
    expect((await shared('old')).status).toBe(410);
    share.verify.mockResolvedValueOnce({ ok: false, code: 'SHARE_INVALID' });
    expect((await shared('bad')).status).toBe(401);
  });
});

describe('BUG 4 — paid chain end state: paid invoice → confirmation resend + PDF receipt', () => {
  it('after a payment (status paid), /confirm re-sends the confirmation AND /pdf serves the receipt', async () => {
    state.docs.set('invoices/quote_a', { orgId: 'orgA', quoteId: 'a', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', status: 'paid', amount: 6500, paidAt: '2026-07-15T00:00:00.000Z', createdAt: '2026-07-14T00:00:00.000Z' });
    const conf = await confirm('quote_a');
    expect(conf.status).toBe(200);
    expect((await conf.json() as { emailed: boolean }).emailed).toBe(true);
    expect(seq.sends.find(s => s.slug === 'payment-confirmation')).toBeTruthy();     // customer receipt email
    const res = await invoices.request('/api/invoices/quote_a/pdf?orgId=orgA', { headers: { Authorization: 'Bearer t' } }, ENV);
    expect(res.status).toBe(200);                                                    // downloadable receipt
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });
});

describe('POST /api/invoices/finalize — REMOVED (no admin pricing in the fixed-price model)', () => {
  it('the finalize route no longer exists (404)', async () => {
    const res = await invoices.request('/api/invoices/finalize?orgId=orgA', {
      method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: 'orgA', quoteId: 'qX', amount: 15000 }),
    }, ENV);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/invoices/:id/payment-link (graceful Stripe)', () => {
  const payLink = (id: string, org = 'orgA') =>
    invoices.request(`/api/invoices/${id}/payment-link?orgId=${org}`, {
      method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId: org }),
    }, ENV);

  it('503 when Stripe is not configured (UI falls back to bank transfer)', async () => {
    state.docs.set('invoices/quote_a', { id: 'quote_a', orgId: 'orgA', status: 'pending', amount: 9000, quoteTitle: 'Acme' });
    expect((await payLink('quote_a')).status).toBe(503);   // ENV has no STRIPE_SECRET_KEY
  });

  it('404 for another org\'s invoice (no cross-tenant)', async () => {
    state.docs.set('invoices/quote_a', { id: 'quote_a', orgId: 'orgA', status: 'pending', amount: 9000 });
    expect((await payLink('quote_a', 'orgB')).status).toBe(404);
  });

  it('409 when the invoice has no amount yet', async () => {
    state.docs.set('invoices/quote_a', { id: 'quote_a', orgId: 'orgA', status: 'draft', amount: null });
    expect((await payLink('quote_a')).status).toBe(409);
  });

  it('BANK_TRANSFER_ONLY for a >15k invoice — never mints Stripe', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', orgId: 'orgA', status: 'pending', amount: 60000, quoteTitle: 'Acme', paymentMethod: 'bank_transfer' });
    const res = await payLink('quote_h');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('BANK_TRANSFER_ONLY');
  });

  it('BANK_TRANSFER_ONLY even if paymentMethod unset (amount > 15k threshold)', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', orgId: 'orgA', status: 'pending', amount: 30000, quoteTitle: 'Acme' });
    expect((await payLink('quote_h')).status).toBe(409);
  });
});

describe('GET /api/invoices/:id/transfer-details (PUBLIC, high-ticket)', () => {
  const td = (id: string) => invoices.request(`/api/invoices/${id}/transfer-details`, {}, ENV);

  it('returns bank fields + reference(quoteId) + amount + deadline from org settings', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', quoteId: 'h', orgId: 'orgA', status: 'awaiting_transfer', amount: 60000, currency: 'usd', paymentMethod: 'bank_transfer', transferDeadline: '2026-07-28T00:00:00.000Z' });
    state.docs.set('organizations/orgA/settings/billing', { region: 'eu', accountName: 'Acme SARL', bankName: 'BNP', iban: 'FR7630006000011234567890189', bic: 'BNPAFRPP' });
    const j = await (await td('quote_h')).json() as Record<string, unknown>;
    expect(j.paymentMethod).toBe('bank_transfer');
    expect(j.reference).toBe('h');
    expect(j.amount).toBe(60000);
    expect(j.iban).toBe('FR7630006000011234567890189');
    expect(j.swiftBic).toBe('BNPAFRPP');
    expect(j.companyName).toBe('Acme SARL');
    expect(j.deadlineIso).toBe('2026-07-28T00:00:00.000Z');
    expect(j.available).toBe(true);
  });

  it('falls back to "Available upon request" when billing is not configured', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', quoteId: 'h', orgId: 'orgA', status: 'pending', amount: 60000, paymentMethod: 'bank_transfer' });
    const j = await (await td('quote_h')).json() as Record<string, unknown>;
    expect(j.bankText).toContain('Available upon request');
    expect(j.available).toBe(false);
  });

  it('404 for an unknown invoice', async () => {
    expect((await td('nope')).status).toBe(404);
  });
});

describe('POST /api/invoices/:id/transfer-initiated (PUBLIC flag)', () => {
  const ti = (id: string) => invoices.request(`/api/invoices/${id}/transfer-initiated`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, ENV);

  it('flips a bank-transfer invoice pending → awaiting_transfer + timestamps it', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', orgId: 'orgA', status: 'pending', amount: 60000, paymentMethod: 'bank_transfer' });
    const res = await ti('quote_h');
    expect(res.status).toBe(200);
    expect((await res.json() as { status: string }).status).toBe('awaiting_transfer');
    const inv = state.docs.get('invoices/quote_h')!;
    expect(inv.status).toBe('awaiting_transfer');
    expect(typeof inv.transferInitiatedAt).toBe('string');
  });

  it('refuses a Stripe (≤15k) invoice (NOT_BANK_TRANSFER)', async () => {
    state.docs.set('invoices/quote_s', { id: 'quote_s', orgId: 'orgA', status: 'pending', amount: 5000, paymentMethod: 'stripe' });
    const res = await ti('quote_s');
    expect(res.status).toBe(400);
    expect((await res.json() as { code: string }).code).toBe('NOT_BANK_TRANSFER');
  });

  it('no-op on a PAID invoice (never un-pays)', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', orgId: 'orgA', status: 'paid', amount: 60000, paymentMethod: 'bank_transfer' });
    const res = await ti('quote_h');
    expect(res.status).toBe(200);
    expect((await res.json() as { status: string }).status).toBe('paid');
    expect(state.docs.get('invoices/quote_h')!.status).toBe('paid');
  });
});

describe('POST /api/invoices/:id/mark-paid (ADMIN, bank-transfer only)', () => {
  const markPaid = (id: string, org = 'orgA') =>
    invoices.request(`/api/invoices/${id}/mark-paid?orgId=${org}`, { method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId: org }) }, ENV);

  it('marks a bank-transfer invoice paid + records paidBy + mirrors the quote stage + emails the CONFIRMATION (BUG 1)', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', quoteId: 'h', quoteTitle: 'Acme bot', customerEmail: 'c@x.com', orgId: 'orgA', status: 'awaiting_transfer', amount: 60000, paymentMethod: 'bank_transfer' });
    const res = await markPaid('quote_h');
    expect(res.status).toBe(200);
    const j = await res.json() as { status: string; emailed?: boolean };
    expect(j.status).toBe('paid');
    expect(j.emailed).toBe(true);
    const inv = state.docs.get('invoices/quote_h')!;
    expect(inv.status).toBe('paid');
    expect(inv.paidBy).toBe('u1');
    expect(typeof inv.paidAt).toBe('string');
    expect(state.docs.get('organizations/orgA/quotes/h')!.stage).toBe('paid');
    // BUG 1 — the client receives the payment confirmation the moment payment is confirmed.
    const send = seq.sends.find(s => s.slug === 'payment-confirmation')!;
    expect(send).toBeTruthy();
    expect(send.to).toBe('c@x.com');
    expect((send.variables as Record<string, string>).AMOUNT).toBe('$60,000');
    expect((send.variables as Record<string, string>).REFERENCE).toBe('h');
  });

  it('refuses to mark a Stripe invoice paid (NOT_BANK_TRANSFER — no Stripe bypass)', async () => {
    state.docs.set('invoices/quote_s', { id: 'quote_s', orgId: 'orgA', status: 'pending', amount: 5000, paymentMethod: 'stripe' });
    const res = await markPaid('quote_s');
    expect(res.status).toBe(400);
    expect((await res.json() as { code: string }).code).toBe('NOT_BANK_TRANSFER');
  });

  it('cross-org guard (404)', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', orgId: 'orgA', status: 'awaiting_transfer', amount: 60000, paymentMethod: 'bank_transfer' });
    expect((await markPaid('quote_h', 'orgB')).status).toBe(404);
  });

  it('idempotent — an already-paid invoice returns paid', async () => {
    state.docs.set('invoices/quote_h', { id: 'quote_h', orgId: 'orgA', status: 'paid', amount: 60000, paymentMethod: 'bank_transfer' });
    const res = await markPaid('quote_h');
    expect(res.status).toBe(200);
    expect((await res.json() as { alreadyPaid?: boolean }).alreadyPaid).toBe(true);
  });
});
