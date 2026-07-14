import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * Fixed-price quote flow — email (locks the price), accept (auto-invoices at the locked
 * price → Stripe pay link), superadmin list, governance-only PATCH. No admin pricing,
 * no negotiation, no pending queue.
 */

const seq = vi.hoisted(() => ({ sends: [] as Array<Record<string, unknown>> }));
const rl  = vi.hoisted(() => ({ cooldown: vi.fn(async () => ({ ok: true })), cap: vi.fn(async () => ({ ok: true })) }));
const store = vi.hoisted(() => ({ writes: new Map<string, Record<string, unknown>>(), invoices: new Map<string, Record<string, unknown>>(), stored: null as Record<string, unknown> | null }));
const share = vi.hoisted(() => ({ verify: vi.fn() }));
const runQuery = vi.hoisted(() => vi.fn(async () => [] as Array<{ name: string; fields: Record<string, unknown> }>));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', c.req.header('x-test-uid') ?? 'uid-1');
    const em = c.req.header('x-test-email'); if (em) c.set('email', em);
    c.set('emailVerified', true);
    await next();
  },
}));
vi.mock('../../worker/src/middleware/requireRole', () => ({
  requireRole: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('orgId', c.req.header('x-test-org') ?? 'orgA');
    c.set('role', c.req.header('x-test-role') ?? 'owner');
    await next();
  },
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string, p: Record<string, unknown>) => { seq.sends.push(p); return { ok: true }; }),
}));
vi.mock('../../worker/src/lib/rateLimit', () => ({ checkCooldown: rl.cooldown, checkDailyCap: rl.cap }));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: runQuery,
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    if (path.startsWith('invoices/')) return store.invoices.get(path) ?? null;
    return path.includes('/quotes/') ? store.stored : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    if (path.startsWith('invoices/')) store.invoices.set(path, { ...(store.invoices.get(path) ?? {}), ...data });
    store.writes.set(path, { ...(store.writes.get(path) ?? {}), ...data });
  }),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    const map = path.startsWith('invoices/') ? store.invoices : store.writes;
    if (map.has(path)) throw new Error('ALREADY_EXISTS');
    map.set(path, data);
  }),
  firestoreDelete: vi.fn(async () => {}),
}));
vi.mock('../../worker/src/lib/audit-express-share', () => ({
  signShareToken: vi.fn(async () => ({ token: 'tok' })),
  verifyShareToken: (...args: unknown[]) => share.verify(...args),
}));

import quote from '../../worker/src/routes/quote';

const ENV = {
  FIREBASE_SERVICE_ACCOUNT_JSON: '{}', AUDIT_SHARE_SECRET: 'sec', SEQUENZY_API_KEY: 'key',
  ADMIN_EMAIL: 'admin@x.com', FIREBASE_PROJECT_ID: 'audit-ai',
} as unknown as Record<string, unknown>;

const H = (uid = 'uid-1', email = 'owner@acme.com', org = 'orgA') =>
  ({ 'Content-Type': 'application/json', 'x-test-uid': uid, 'x-test-email': email, 'x-test-org': org });

// Fixed-price: a send REQUIRES a budget ≥ the estimate minimum (10000 in the fixture).
const emailReq = (body: Record<string, unknown>) =>
  quote.request('/api/quote/email', { method: 'POST', headers: H(), body: JSON.stringify({ expectedBudgetUsd: 15000, ...body }) }, ENV);
const decisionReq = (quoteId: string, body: unknown) =>
  quote.request(`/api/quote/${quoteId}/decision`, { method: 'POST', headers: H(), body: JSON.stringify(body) }, ENV);
const confirmReq = (body: unknown) =>
  quote.request('/api/quote/decision/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ENV);
const okV2 = { ok: true, payload: { orgId: 'orgA', auditId: 'q1', exp: 9_999_999_999, shareVersion: 2 } };
const qDoc = 'organizations/orgA/quotes/q1';

beforeEach(() => {
  seq.sends.length = 0; store.writes.clear(); store.invoices.clear();
  rl.cooldown.mockResolvedValue({ ok: true }); rl.cap.mockResolvedValue({ ok: true });
  store.stored = {
    createdAt: '2026-06-20T00:00:00.000Z', priceUsd: 15000,
    customerEmail: 'client@co.com',
    renderJson: JSON.stringify({ docTitle: 'Quote for Acme', solutionLabel: 'AI Agent', rangeText: '$15,000' }),
  };
  vi.clearAllMocks();
  share.verify.mockReset();
  rl.cooldown.mockResolvedValue({ ok: true }); rl.cap.mockResolvedValue({ ok: true });
});

describe('POST /api/quote/email — sends at the fixed published price', () => {
  it('sends the quote + LOCKS the published price (= priceUsd) at USD, token email as reply-to', async () => {
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'Client@Co.com' });
    expect(res.status).toBe(200);
    const send = seq.sends.find(s => s.slug === 'quote-en')!;
    expect(send.to).toBe('client@co.com');
    expect(send.replyTo).toBe('owner@acme.com');
    const w = store.writes.get(qDoc)!;
    expect(w.price).toBe(15000);        // = stored.priceUsd (the published price)
    expect(w.priceUsd).toBe(15000);
    expect(w.currency).toBe('usd');
    // the email BUDGET var is the single published price (USD), no range / negotiation vars
    const v = send.variables as Record<string, string>;
    expect(v.BUDGET).toBe('$15,000');
    expect(v.ACCEPT_URL).toContain('action=accept');
    expect(v.ACCEPT_URL).toContain('budgetUsd=15000');   // confirm page shows the same price
    expect(v.DISCUSS_URL).toBeUndefined();
    expect(v.RANGE).toBeUndefined();
  });

  it('ignores any client-sent budget — the amount is always the published price', async () => {
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'client@co.com', expectedBudgetUsd: 999999 });
    expect(res.status).toBe(200);
    expect(store.writes.get(qDoc)!.price).toBe(15000);   // client budget IGNORED (no budget-based pricing)
  });

  it('a re-send keeps the same published price (idempotent, no lock conflict)', async () => {
    store.stored!.price = 15000;
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'client@co.com' });
    expect(res.status).toBe(200);
    expect(store.writes.get(qDoc)!.price).toBe(15000);
    expect(seq.sends.some(s => s.slug === 'quote-en')).toBe(true);
  });

  it('rejects a quote with no published price (NO_PRICE, no send)', async () => {
    store.stored = { createdAt: '2026-06-20T00:00:00.000Z', customerEmail: 'client@co.com' };
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'client@co.com' });
    expect(res.status).toBe(500);
    expect((await res.json() as { code: string }).code).toBe('NO_PRICE');
    expect(seq.sends.length).toBe(0);
  });

  it('rate-limits the sender (cooldown → 429, no send)', async () => {
    rl.cooldown.mockResolvedValueOnce({ ok: false, retryAfterSec: 12 });
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'client@co.com' });
    expect(res.status).toBe(429);
    expect(seq.sends.length).toBe(0);
  });

  it('falls back to the CF edge country language when no locale is supplied', async () => {
    const res = await quote.request('/api/quote/email',
      { method: 'POST', headers: { ...H(), 'CF-IPCountry': 'FR' }, body: JSON.stringify({ orgId: 'orgA', quoteId: 'q1' }) }, ENV);
    expect(res.status).toBe(200);
    expect(seq.sends.some(s => s.slug === 'quote-fr')).toBe(true);
  });

  it('S1 — sanitizes client render vars: no HTML / {{merge}} reaches the template; URLs preserved', async () => {
    const res = await emailReq({
      orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'client@co.com',
      render: { docTitle: '<script>alert(1)</script>Acme', solutionLabel: '<b>AI</b> Agent', rangeText: '{{X}}' },
    });
    expect(res.status).toBe(200);
    const v = seq.sends.find(s => s.slug === 'quote-en')!.variables as Record<string, string>;
    for (const k of ['QUOTE_TITLE', 'SOLUTION', 'BUDGET']) expect(v[k]).not.toMatch(/[<>{}]/);
    expect(v.ACCEPT_URL).toContain('/#/quote/result?action=accept');
    expect(v.PDF_URL).toContain('/api/quote/shared/');
  });
});

describe('Accept → auto-invoice at the locked price (Quote → Accept → Pay)', () => {
  it('accept auto-invoices at quote.price → invoice + client email, stage invoice_sent, NO admin email', async () => {
    store.stored!.price = 15000;
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    const inv = store.invoices.get('invoices/quote_q1') as Record<string, unknown> | undefined;
    expect(inv).toBeTruthy();
    expect(inv!.amount).toBe(15000);          // invoice amount === quote.price (same everywhere)
    expect(inv!.status).toBe('pending');
    expect(store.writes.get(qDoc)!.stage).toBe('invoice_sent');
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeTruthy();
    expect(seq.sends.find(s => s.slug === 'invoice-admin-pending')).toBeFalsy();
  });

  it('with no explicit price yet, accept invoices at the published price (quotePrice ← priceUsd)', async () => {
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    expect((store.invoices.get('invoices/quote_q1') as Record<string, unknown>).amount).toBe(15000);
  });

  it('negotiation is DISABLED — discussion → 400 NEGOTIATION_DISABLED, no write', async () => {
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'discussion', message: 'lower it' });
    expect(res.status).toBe(400);
    expect((await res.json() as { code: string }).code).toBe('NEGOTIATION_DISABLED');
    expect(store.writes.get(qDoc)).toBeUndefined();
  });

  it('a BLOCKED quote is NOT invoiced on accept — admins are notified instead', async () => {
    store.stored!.price = 15000;
    store.stored!.adminState = 'blocked';
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    expect(store.invoices.has('invoices/quote_q1')).toBe(false);
    expect(seq.sends.find(s => s.slug === 'invoice-admin-pending')).toBeTruthy();
  });

  it('the public token accept also auto-invoices', async () => {
    store.stored!.price = 15000;
    share.verify.mockResolvedValue(okV2);
    const res = await confirmReq({ token: 'tok', decision: 'accepted' });
    expect(res.status).toBe(200);
    expect((await res.json() as { status: string }).status).toBe('accepted');
    expect(store.invoices.has('invoices/quote_q1')).toBe(true);
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeTruthy();
  });

  it('the public token confirm rejects negotiation (400)', async () => {
    share.verify.mockResolvedValue(okV2);
    const res = await confirmReq({ token: 'tok', decision: 'discussion', message: 'x' });
    expect(res.status).toBe(400);
    expect((await res.json() as { code: string }).code).toBe('NEGOTIATION_DISABLED');
  });

  it('a second accept on the now-invoiced quote is blocked (D1 — no duplicate invoice)', async () => {
    store.stored!.price = 15000;
    await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });   // auto-invoices
    store.stored!.stage = 'invoice_sent';                              // now terminal
    seq.sends.length = 0;
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('QUOTE_LOCKED');
    expect(seq.sends.length).toBe(0);
  });
});

describe('D1 — terminal quotes are locked', () => {
  it('authed accept on an invoice_sent quote → 409 QUOTE_LOCKED, no write', async () => {
    store.stored!.stage = 'invoice_sent';
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('QUOTE_LOCKED');
    expect(store.writes.get(qDoc)).toBeUndefined();
  });

  it('public confirm backstops a terminal quote whose decidedAt is unset → 409', async () => {
    store.stored!.stage = 'finalized';
    share.verify.mockResolvedValue(okV2);
    const res = await confirmReq({ token: 'tok', decision: 'accepted' });
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('QUOTE_LOCKED');
  });
});

describe('POST /api/quote/decision/confirm — token gating + single-effect', () => {
  it('rejects a v1 PDF-link token (wrong share version)', async () => {
    share.verify.mockResolvedValue({ ok: true, payload: { orgId: 'orgA', auditId: 'q1', exp: 9_999_999_999, shareVersion: 1 } });
    expect((await confirmReq({ token: 'tok', decision: 'accepted' })).status).toBe(401);
  });

  it('rejects an invalid token (401) and an expired token (410)', async () => {
    share.verify.mockResolvedValueOnce({ ok: false, code: 'SHARE_INVALID' });
    expect((await confirmReq({ token: 'bad', decision: 'accepted' })).status).toBe(401);
    share.verify.mockResolvedValueOnce({ ok: false, code: 'SHARE_EXPIRED' });
    expect((await confirmReq({ token: 'old', decision: 'accepted' })).status).toBe(410);
  });

  it('is single-effect: a replay on an already-decided quote is an idempotent no-op', async () => {
    store.stored!.decidedAt = '2026-06-21T00:00:00.000Z';
    store.stored!.decision = 'accepted';
    share.verify.mockResolvedValue(okV2);
    const res = await confirmReq({ token: 'tok', decision: 'accepted' });
    expect(res.status).toBe(200);
    expect((await res.json() as { alreadyRecorded?: boolean }).alreadyRecorded).toBe(true);
    expect(store.invoices.size).toBe(0);
  });

  it('rate-limits replay bursts (per-quote cooldown → 429)', async () => {
    share.verify.mockResolvedValue(okV2);
    rl.cooldown.mockResolvedValueOnce({ ok: false, retryAfterSec: 8 });
    expect((await confirmReq({ token: 'tok', decision: 'accepted' })).status).toBe(429);
  });
});

describe('GET /api/quote/list — superadmin visibility', () => {
  it('returns createdBy / source / price / currency + joined payment status + Stripe id', async () => {
    store.invoices.set('invoices/quote_qPaid', { orgId: 'orgA', status: 'paid', paidAt: '2026-06-25T00:00:00.000Z', paymentSessionId: 'cs_123', paymentUrl: 'https://pay', amount: 15000 });
    runQuery.mockResolvedValueOnce([
      { name: 'organizations/orgA/quotes/qPaid', fields: { stage: 'invoice_sent', decision: 'accepted', customerEmail: 'b@x.com', createdBy: 'uid-9', source: 'audit', price: 15000, currency: 'usd', createdAt: '2026-06-19T00:00:00.000Z', decidedAt: '2026-06-22T00:00:00.000Z' } },
    ]);
    const res = await quote.request('/api/quote/list?orgId=orgA', { headers: H() }, ENV);
    expect(res.status).toBe(200);
    const { quotes } = await res.json() as { quotes: Array<Record<string, unknown>> };
    const q = quotes[0];
    expect(q.createdBy).toBe('uid-9');
    expect(q.source).toBe('audit');
    expect(q.price).toBe(15000);
    expect(q.currency).toBe('usd');
    expect(q.paymentStatus).toBe('paid');
    expect(q.stripePaymentId).toBe('cs_123');
    expect(q.paidAt).toBe('2026-06-25T00:00:00.000Z');
  });

  it('derives price from a legacy expectedBudgetUsd when price is absent (back-compat)', async () => {
    runQuery.mockResolvedValueOnce([
      { name: 'organizations/orgA/quotes/qOld', fields: { stage: 'sent', expectedBudgetUsd: 8000, priceMinUsd: 5000, createdAt: '2026-06-19T00:00:00.000Z' } },
    ]);
    const res = await quote.request('/api/quote/list?orgId=orgA', { headers: H() }, ENV);
    const { quotes } = await res.json() as { quotes: Array<Record<string, unknown>> };
    expect(quotes[0].price).toBe(8000);
  });

  it('?mine=1 returns only the caller\'s own staged quotes', async () => {
    runQuery.mockResolvedValueOnce([
      { name: 'organizations/orgA/quotes/qMine', fields: { stage: 'sent', createdBy: 'uid-1', createdAt: '2026-06-20T00:00:00.000Z' } },
      { name: 'organizations/orgA/quotes/qOther', fields: { stage: 'sent', createdBy: 'uid-2', createdAt: '2026-06-18T00:00:00.000Z' } },
    ]);
    const res = await quote.request('/api/quote/list?orgId=orgA&mine=1', { headers: H() }, ENV);
    const { quotes } = await res.json() as { quotes: Array<Record<string, unknown>> };
    expect(quotes.map(q => q.quoteId)).toEqual(['qMine']);
  });

  it('a super-admin whose org role is "member" still sees ALL org quotes', async () => {
    const ENV2 = { ...ENV, ADMIN_EMAILS: 'super@x.com' };
    runQuery.mockResolvedValueOnce([
      { name: 'organizations/orgA/quotes/qA', fields: { stage: 'sent', createdBy: 'someone', createdAt: '2026-06-22T00:00:00.000Z' } },
    ]);
    const res = await quote.request('/api/quote/list?orgId=orgA', { headers: { ...H('uid-1', 'super@x.com'), 'x-test-role': 'member' } }, ENV2);
    const { quotes } = await res.json() as { quotes: Array<Record<string, unknown>> };
    expect(quotes.map(q => q.quoteId)).toEqual(['qA']);
  });
});

describe('multi-admin notifications', () => {
  it('a blocked accept notifies EVERY admin (ADMIN_EMAILS + ADMIN_EMAIL), de-duped', async () => {
    store.stored!.price = 15000; store.stored!.adminState = 'blocked';
    const ENV2 = { ...ENV, ADMIN_EMAILS: 'A@x.com, b@x.com, admin@x.com' } as unknown as Record<string, unknown>;
    await quote.request('/api/quote/q1/decision', { method: 'POST', headers: H(), body: JSON.stringify({ orgId: 'orgA', decision: 'accepted' }) }, ENV2);
    const to = seq.sends.filter(s => s.slug === 'invoice-admin-pending').map(s => s.to);
    expect(new Set(to)).toEqual(new Set(['a@x.com', 'b@x.com', 'admin@x.com']));
    expect(to.length).toBe(3);
  });
});

describe('PATCH /api/quote/:id — governance only (no price/budget edit)', () => {
  const patch = (id: string, body: unknown) =>
    quote.request(`/api/quote/${id}`, { method: 'PATCH', headers: H(), body: JSON.stringify(body) }, ENV);

  it('blocks then re-activates a quote (adminState flag)', async () => {
    expect((await patch('q1', { orgId: 'orgA', adminState: 'blocked' })).status).toBe(200);
    expect(store.writes.get(qDoc)!.adminState).toBe('blocked');
    expect((await patch('q1', { orgId: 'orgA', adminState: 'active' })).status).toBe(200);
    expect(store.writes.get(qDoc)!.adminState).toBeNull();
  });

  it('a budget-only PATCH is rejected (no fields) — price cannot be edited', async () => {
    const res = await patch('q1', { orgId: 'orgA', expectedBudgetUsd: 7000 });
    expect(res.status).toBe(400);
    expect((await res.json() as { code: string }).code).toBe('NO_FIELDS');
  });

  it('rejects an invalid state (400) and 404 for an unknown quote', async () => {
    expect((await patch('q1', { orgId: 'orgA', adminState: 'nope' })).status).toBe(400);
    const saved = store.stored; store.stored = null;
    expect((await patch('qX', { orgId: 'orgA', adminState: 'blocked' })).status).toBe(404);
    store.stored = saved;
  });
});
