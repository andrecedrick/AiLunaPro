import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * P4.1 — accept must NEVER leave a quote accepted-but-un-invoiced.
 *
 * When the auto-invoice on accept fails transiently, the quote is still recorded as
 * accepted (decidedAt set), but the invoice is missing. This suite proves the three
 * recovery guarantees:
 *   1. a client token-confirm REPLAY heals the missing invoice (idempotent);
 *   2. the admin route POST /api/quote/:quoteId/finalize creates the missing invoice;
 *   3. every path is idempotent → NO duplicate invoice, NO duplicate charge.
 *
 * `store.failCreate` forces firestoreCreateIfNotExists to throw a transient (non
 * ALREADY_EXISTS) error N times for invoice paths — simulating the finalise failure.
 */

const seq = vi.hoisted(() => ({ sends: [] as Array<Record<string, unknown>> }));
const rl  = vi.hoisted(() => ({ cooldown: vi.fn(async () => ({ ok: true })), cap: vi.fn(async () => ({ ok: true })) }));
const store = vi.hoisted(() => ({ writes: new Map<string, Record<string, unknown>>(), invoices: new Map<string, Record<string, unknown>>(), stored: null as Record<string, unknown> | null, failCreate: 0 }));
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
    // Simulate a transient finalise failure on the invoice create.
    if (store.failCreate > 0 && path.startsWith('invoices/')) { store.failCreate--; throw new Error('TRANSIENT'); }
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

const qDoc = 'organizations/orgA/quotes/q1';
const invPath = 'invoices/quote_q1';
const okV2 = { ok: true, payload: { orgId: 'orgA', auditId: 'q1', exp: 9_999_999_999, shareVersion: 2 } };

const decisionReq = (quoteId: string, body: unknown) =>
  quote.request(`/api/quote/${quoteId}/decision`, { method: 'POST', headers: H(), body: JSON.stringify(body) }, ENV);
const confirmReq = (body: unknown) =>
  quote.request('/api/quote/decision/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ENV);
const finalizeReq = (quoteId: string, headers = H()) =>
  quote.request(`/api/quote/${quoteId}/finalize?orgId=orgA`, { method: 'POST', headers, body: JSON.stringify({ orgId: 'orgA' }) }, ENV);

beforeEach(() => {
  seq.sends.length = 0; store.writes.clear(); store.invoices.clear(); store.failCreate = 0;
  rl.cooldown.mockResolvedValue({ ok: true }); rl.cap.mockResolvedValue({ ok: true });
  share.verify.mockReset();
  store.stored = {
    createdAt: '2026-06-20T00:00:00.000Z', priceUsd: 15000, price: 15000,
    customerEmail: 'client@co.com',
    renderJson: JSON.stringify({ docTitle: 'Quote for Acme', solutionLabel: 'AI Agent' }),
  };
});

describe('P4.1 — accept whose auto-invoice fails is recoverable', () => {
  it('a transient finalise failure records the accept but leaves NO invoice, and notifies admins', async () => {
    store.failCreate = 1;                                  // finalise create throws once
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);                          // accept still succeeds
    expect(store.invoices.has(invPath)).toBe(false);       // but no invoice was created
    expect(store.writes.get(qDoc)!.decidedAt).toBeTruthy();
    expect(store.writes.get(qDoc)!.stage).toBe('client_responded');   // NOT advanced to invoice_sent
    expect(seq.sends.find(s => s.slug === 'invoice-admin-pending')).toBeTruthy();  // human alerted
  });

  it('a client token-confirm REPLAY heals the missing invoice (idempotent, no admin re-notify)', async () => {
    // Quote already accepted (decidedAt set) but the auto-invoice never landed.
    store.stored!.decidedAt = '2026-06-21T00:00:00.000Z';
    store.stored!.decision  = 'accepted';
    share.verify.mockResolvedValue(okV2);

    const res = await confirmReq({ token: 'tok', decision: 'accepted' });
    expect(res.status).toBe(200);
    const j = await res.json() as { alreadyRecorded?: boolean; paymentMethod?: string };
    expect(j.alreadyRecorded).toBe(true);                 // decision NOT re-written
    expect(store.invoices.has(invPath)).toBe(true);        // invoice HEALED
    expect((store.invoices.get(invPath) as Record<string, unknown>).amount).toBe(15000);
    expect(seq.sends.find(s => s.slug === 'invoice-admin-pending')).toBeFalsy();  // no re-flood
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeTruthy();        // client invoiced
  });

  it('the admin recovery route POST /:quoteId/finalize creates the missing invoice', async () => {
    store.stored!.decidedAt = '2026-06-21T00:00:00.000Z';
    store.stored!.decision  = 'accepted';
    const res = await finalizeReq('q1');
    expect(res.status).toBe(200);
    const j = await res.json() as { finalized: boolean; paymentMethod: string };
    expect(j.finalized).toBe(true);
    expect(j.paymentMethod).toBe('stripe');
    expect(store.invoices.has(invPath)).toBe(true);
    expect((store.invoices.get(invPath) as Record<string, unknown>).amount).toBe(15000);
  });

  it('recovery is IDEMPOTENT — a second finalize makes no duplicate invoice / no duplicate charge', async () => {
    store.stored!.decidedAt = '2026-06-21T00:00:00.000Z';
    await finalizeReq('q1');                               // creates the invoice
    seq.sends.length = 0;
    const res = await finalizeReq('q1');                   // second call
    expect(res.status).toBe(200);
    expect((await res.json() as { finalized: boolean }).finalized).toBe(true);
    expect(store.invoices.size).toBe(1);                   // still exactly ONE invoice
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeFalsy();  // no second charge/email
  });

  it('recovery REFUSES an un-accepted quote (409 NOT_ACCEPTED)', async () => {
    delete store.stored!.decidedAt;
    const res = await finalizeReq('q1');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('NOT_ACCEPTED');
    expect(store.invoices.size).toBe(0);
  });

  it('recovery REFUSES a blocked / suspended quote (409 QUOTE_BLOCKED)', async () => {
    store.stored!.decidedAt = '2026-06-21T00:00:00.000Z';
    store.stored!.adminState = 'blocked';
    const res = await finalizeReq('q1');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('QUOTE_BLOCKED');
    expect(store.invoices.size).toBe(0);
  });

  it('recovery on an unknown quote → 404; on a price-less quote → 409 NO_PRICE', async () => {
    const saved = store.stored; store.stored = null;
    expect((await finalizeReq('qX')).status).toBe(404);
    store.stored = { createdAt: '2026-06-20T00:00:00.000Z', decidedAt: '2026-06-21T00:00:00.000Z' };  // accepted, no price
    const res = await finalizeReq('q1');
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('NO_PRICE');
    store.stored = saved;
  });

  it('the normal happy path (finalise succeeds on accept) stays single-invoice and recovery is a no-op', async () => {
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    expect(store.invoices.size).toBe(1);
    expect(seq.sends.find(s => s.slug === 'invoice-admin-pending')).toBeFalsy();  // invoiced → no admin alert
    // recovery over an already-invoiced accepted quote → idempotent no-op, still one invoice
    store.stored!.decidedAt = '2026-06-21T00:00:00.000Z';
    const rec = await finalizeReq('q1');
    expect(rec.status).toBe(200);
    expect(store.invoices.size).toBe(1);
  });
});
