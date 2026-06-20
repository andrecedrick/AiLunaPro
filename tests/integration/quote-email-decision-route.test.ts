import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * B2 + B3 — quote email + discussion endpoints.
 *  - email: optional client recipient (else token email), reply-to = token email,
 *    per-user rate limit (anti-abuse).
 *  - decision (discuss): sanitized message stored on the quote doc + admin email
 *    carrying TYPE / MESSAGE / EMAIL / CONTEXT.
 */

const seq = vi.hoisted(() => ({ sends: [] as Array<Record<string, unknown>> }));
const rl  = vi.hoisted(() => ({ cooldown: vi.fn(async () => ({ ok: true })), cap: vi.fn(async () => ({ ok: true })) }));
const store = vi.hoisted(() => ({ writes: new Map<string, Record<string, unknown>>(), invoices: new Map<string, Record<string, unknown>>(), stored: null as Record<string, unknown> | null }));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', c.req.header('x-test-uid') ?? 'uid-1');
    const em = c.req.header('x-test-email'); if (em) c.set('email', em);
    await next();
  },
}));
vi.mock('../../worker/src/middleware/requireRole', () => ({
  requireRole: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('orgId', c.req.header('x-test-org') ?? 'orgA');
    c.set('role', 'owner');
    await next();
  },
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string, p: Record<string, unknown>) => { seq.sends.push(p); return { ok: true }; }),
}));
vi.mock('../../worker/src/lib/rateLimit', () => ({ checkCooldown: rl.cooldown, checkDailyCap: rl.cap }));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    if (path.startsWith('invoices/')) return store.invoices.get(path) ?? null;
    return path.includes('/quotes/') ? store.stored : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    if (path.startsWith('invoices/')) store.invoices.set(path, data);
    store.writes.set(path, { ...(store.writes.get(path) ?? {}), ...data });
  }),
  firestoreDelete: vi.fn(async () => {}),
}));
vi.mock('../../worker/src/lib/audit-express-share', () => ({
  signShareToken: vi.fn(async () => ({ token: 'tok' })),
  verifyShareToken: vi.fn(),
}));

import quote from '../../worker/src/routes/quote';

const ENV = {
  FIREBASE_SERVICE_ACCOUNT_JSON: '{}', AUDIT_SHARE_SECRET: 'sec', SEQUENZY_API_KEY: 'key',
  ADMIN_EMAIL: 'admin@x.com', FIREBASE_PROJECT_ID: 'audit-ai',
} as unknown as Record<string, unknown>;

const H = (uid = 'uid-1', email = 'owner@acme.com', org = 'orgA') =>
  ({ 'Content-Type': 'application/json', 'x-test-uid': uid, 'x-test-email': email, 'x-test-org': org });

const emailReq = (body: unknown) =>
  quote.request('/api/quote/email', { method: 'POST', headers: H(), body: JSON.stringify(body) }, ENV);
const decisionReq = (quoteId: string, body: unknown) =>
  quote.request(`/api/quote/${quoteId}/decision`, { method: 'POST', headers: H(), body: JSON.stringify(body) }, ENV);

beforeEach(() => {
  seq.sends.length = 0; store.writes.clear(); store.invoices.clear();
  rl.cooldown.mockResolvedValue({ ok: true }); rl.cap.mockResolvedValue({ ok: true });
  store.stored = {
    createdAt: '2026-06-20T00:00:00.000Z', priceMinUsd: 10000, priceMaxUsd: 20000,
    renderJson: JSON.stringify({ docTitle: 'Quote for Acme', solutionLabel: 'AI Agent', rangeText: '$10k–$20k', negInitial: '$15k', negBudget: '', negAdjusted: '' }),
  };
  vi.clearAllMocks();
  rl.cooldown.mockResolvedValue({ ok: true }); rl.cap.mockResolvedValue({ ok: true });
});

describe('POST /api/quote/email (B2 — client recipient + reply-to + rate limit)', () => {
  it('sends to a valid client email with the token email as reply-to', async () => {
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'Client@Co.com' });
    expect(res.status).toBe(200);
    const send = seq.sends.find(s => s.slug === 'quote-en')!;
    expect(send.to).toBe('client@co.com');          // lowercased
    expect(send.replyTo).toBe('owner@acme.com');     // sender always the reply-to
  });

  it('falls back to the token email when the client email is missing or invalid', async () => {
    await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'not-an-email' });
    expect(seq.sends.find(s => s.slug === 'quote-en')!.to).toBe('owner@acme.com');
    seq.sends.length = 0;
    await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en' });
    expect(seq.sends.find(s => s.slug === 'quote-en')!.to).toBe('owner@acme.com');
  });

  it('rate-limits the sender (cooldown → 429, no send)', async () => {
    rl.cooldown.mockResolvedValueOnce({ ok: false, retryAfterSec: 12 });
    const res = await emailReq({ orgId: 'orgA', quoteId: 'q1', locale: 'en', clientEmail: 'client@co.com' });
    expect(res.status).toBe(429);
    expect(seq.sends.length).toBe(0);
  });

  it('falls back to the CF edge country language when no locale is supplied (Part 4)', async () => {
    const res = await quote.request('/api/quote/email',
      { method: 'POST', headers: { ...H(), 'CF-IPCountry': 'FR' }, body: JSON.stringify({ orgId: 'orgA', quoteId: 'q1' }) }, ENV);
    expect(res.status).toBe(200);
    expect(seq.sends.some(s => s.slug === 'quote-fr')).toBe(true);   // FR edge → French template
  });
});

describe('accept → draft invoice (Part 2)', () => {
  it('opens a draft invoice on accept and notifies the admin (no customer email yet)', async () => {
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    const inv = store.invoices.get('invoices/quote_q1')!;
    expect(inv.status).toBe('draft');
    expect(inv.amount).toBeNull();                 // admin confirms the amount later (Step B)
    expect(inv.customerEmail).toBe('owner@acme.com');
    expect(inv.quoteId).toBe('q1');
    expect(inv.rangeMinUsd).toBe(10000);
    expect(inv.rangeMaxUsd).toBe(20000);
    // No invoice-client (customer) email at draft time; the admin IS notified (Part 1).
    expect(seq.sends.find(s => s.slug === 'invoice-client')).toBeFalsy();
    const admin = seq.sends.find(s => s.slug === 'invoice-admin-pending');
    expect(admin).toBeTruthy();
    expect((admin!.variables as Record<string, string>).CUSTOMER_EMAIL).toBe('owner@acme.com');
  });

  it('is idempotent — never overwrites an already-created invoice', async () => {
    store.invoices.set('invoices/quote_q1', { status: 'pending', amount: 5000 });
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    const inv = store.invoices.get('invoices/quote_q1')!;
    expect(inv.status).toBe('pending');            // confirmed invoice preserved
    expect(inv.amount).toBe(5000);
  });

  it('does not open an invoice on discuss', async () => {
    await decisionReq('q1', { orgId: 'orgA', decision: 'discussion', message: 'hi' });
    expect(store.invoices.has('invoices/quote_q1')).toBe(false);
  });
});

describe('POST /api/quote/:id/decision (B3 — discussion message)', () => {
  it('stores a sanitized message and notifies the admin with TYPE/MESSAGE/EMAIL/CONTEXT', async () => {
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'discussion', expectedBudgetUsd: 12000, message: 'Please <script>x</script> lower it to 12k.' });
    expect(res.status).toBe(200);
    const patch = store.writes.get('organizations/orgA/quotes/q1')!;
    expect(patch.discussionMessage).toContain('lower it to 12k');
    expect(String(patch.discussionMessage)).not.toContain('<script>');   // markup defanged
    const admin = seq.sends.find(s => s.slug === 'quote-discussion-admin')!;
    expect(admin.to).toBe('admin@x.com');
    expect(admin.replyTo).toBe('owner@acme.com');
    const v = admin.variables as Record<string, string>;
    expect(v.TYPE).toBe('discussion');
    expect(v.MESSAGE).toContain('lower it to 12k');
    expect(v.EMAIL).toBe('owner@acme.com');
    expect(v.CONTEXT).toContain('Quote for Acme');
    expect(v.BUDGET).toBe('$12,000');
  });

  it('does not notify the admin on an accept', async () => {
    const res = await decisionReq('q1', { orgId: 'orgA', decision: 'accepted' });
    expect(res.status).toBe(200);
    expect(seq.sends.find(s => s.slug === 'quote-discussion-admin')).toBeFalsy();
  });
});
