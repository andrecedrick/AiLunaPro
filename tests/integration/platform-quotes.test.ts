import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * FIX 3 — GET /api/platform/quotes: TRUE cross-org quote visibility for platform
 * operators. collectionGroup('quotes') across ALL orgs (root query), orgId parsed from
 * each doc path, root-level invoice joined for cross-org payment visibility. Gated by
 * requirePlatformAdmin (operators are non-members → NOT requireRole). Read-only.
 */

const state = vi.hoisted(() => ({ rows: [] as Array<{ name: string; fields: Record<string, unknown> }>, invRows: [] as Array<{ name: string; fields: Record<string, unknown> }>, invoices: new Map<string, Record<string, unknown>>() }));
// Two queries now: collectionGroup('quotes', allDescendants) → quote rows; root 'invoices' → invoice rows.
const runQuery = vi.hoisted(() => vi.fn(async (_sa: unknown, sq?: { from?: Array<{ collectionId?: string; allDescendants?: boolean }> }) =>
  sq?.from?.[0]?.collectionId === 'invoices' ? state.invRows : state.rows));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', 'op'); c.set('email', 'op@x.com'); c.set('emailVerified', true); await next();
  },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  isPlatformAdmin: () => true,
  isSuperAdmin: () => true,
  requirePlatformAdmin: () => async (c: { req: { header: (k: string) => string | undefined }; json: (b: unknown, s?: number) => unknown }, next: () => Promise<void>) =>
    c.req.header('x-op') === '1' ? next() : c.json({ error: 'Platform operator access required', code: 'FORBIDDEN' }, 403),
}));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: runQuery,
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.invoices.get(path) ?? null),
}));

import platform from '../../worker/src/routes/platform';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}' } as unknown as Record<string, unknown>;
const req = (op = true) => platform.request('/api/platform/quotes', { headers: op ? { Authorization: 'Bearer t', 'x-op': '1' } : { Authorization: 'Bearer t' } }, ENV);
const DOC = 'projects/p/databases/(default)/documents';

beforeEach(() => {
  runQuery.mockClear(); state.invoices.clear();
  state.rows = [
    { name: `${DOC}/organizations/orgA/quotes/q1`, fields: { stage: 'invoice_sent', decision: 'accepted', customerEmail: 'a@x.com', createdBy: 'u1', source: 'audit', price: 15000, currency: 'usd', createdAt: '2026-06-20T00:00:00.000Z', decidedAt: '2026-06-22T00:00:00.000Z' } },
    { name: `${DOC}/organizations/orgB/quotes/q2`, fields: { stage: 'sent', customerEmail: 'b@y.com', createdBy: 'u2', priceUsd: 60000, createdAt: '2026-06-25T00:00:00.000Z' } },
  ];
  // Invoice for q1 (orgA) — served by the single root-invoices query (no per-quote reads).
  state.invRows = [
    { name: `${DOC}/invoices/quote_q1`, fields: { id: 'quote_q1', orgId: 'orgA', quoteId: 'q1', quoteTitle: 'Acme bot', customerEmail: 'a@x.com', status: 'paid', paidAt: '2026-06-23T00:00:00.000Z', paymentSessionId: 'cs_1', amount: 15000, createdAt: '2026-06-22T01:00:00.000Z' } },
  ];
});

describe('GET /api/platform/quotes — cross-org visibility (FIX 3)', () => {
  it('403 for a non-operator (requirePlatformAdmin)', async () => {
    const res = await req(false);
    expect(res.status).toBe(403);
    expect((await res.json() as { code: string }).code).toBe('FORBIDDEN');
  });

  it('uses a root collectionGroup query (allDescendants) across all orgs', async () => {
    await req();
    // firestoreRunQuery(saJson, structuredQuery, parent) → query is arg[1], parent arg[2].
    const call = runQuery.mock.calls[0] as unknown as [string, { from: Array<{ collectionId: string; allDescendants: boolean }> }, string];
    expect(call[1].from[0]).toEqual({ collectionId: 'quotes', allDescendants: true });
    expect(call[2]).toBe('');   // root → every org
  });

  it('returns quotes from ALL orgs with orgId parsed from the path, newest activity first', async () => {
    const res = await req();
    expect(res.status).toBe(200);
    const { quotes } = await res.json() as { quotes: Array<Record<string, unknown>> };
    expect(quotes.map(q => q.quoteId)).toEqual(['q2', 'q1']);   // q2 createdAt newer than q1 decidedAt
    const q1 = quotes.find(q => q.quoteId === 'q1')!;
    const q2 = quotes.find(q => q.quoteId === 'q2')!;
    expect(q1.orgId).toBe('orgA');
    expect(q2.orgId).toBe('orgB');
    expect(q2.price).toBe(60000);   // derived from priceUsd via quotePrice
  });

  it('joins cross-org payment status / Stripe id for accepted quotes', async () => {
    const { quotes } = await (await req()).json() as { quotes: Array<Record<string, unknown>> };
    const q1 = quotes.find(q => q.quoteId === 'q1')!;
    expect(q1.paymentStatus).toBe('paid');
    expect(q1.stripePaymentId).toBe('cs_1');
    expect(q1.paidAt).toBe('2026-06-23T00:00:00.000Z');
    // q2 (not accepted) has no invoice joined
    const q2 = quotes.find(q => q.quoteId === 'q2')!;
    expect(q2.paymentStatus).toBe('');
  });

  it('the invoice join is org-guarded (a same-quoteId invoice from another org is ignored)', async () => {
    state.invRows = [{ name: `${DOC}/invoices/quote_q1`, fields: { id: 'quote_q1', orgId: 'orgZ', status: 'paid', amount: 15000 } }];   // wrong org
    const { quotes } = await (await req()).json() as { quotes: Array<Record<string, unknown>> };
    expect(quotes.find(q => q.quoteId === 'q1')!.paymentStatus).toBe('');   // guard rejects it
  });

  it('returns the FULL cross-org invoice list (every org, every payment state) in ONE query', async () => {
    state.invRows.push({ name: `${DOC}/invoices/quote_qX`, fields: { id: 'quote_qX', orgId: 'orgC', quoteId: 'qX', customerEmail: 'z@z.com', status: 'awaiting_transfer', amount: 60000, paymentMethod: 'bank_transfer', createdAt: '2026-06-26T00:00:00.000Z' } });
    const j = await (await req()).json() as { invoices: Array<Record<string, unknown>> };
    // Both invoices returned — including orgC's, whose quote is NOT in the quote list.
    expect(j.invoices.map(i => i.id).sort()).toEqual(['quote_q1', 'quote_qX']);
    const qx = j.invoices.find(i => i.id === 'quote_qX')!;
    expect(qx.orgId).toBe('orgC');
    expect(qx.status).toBe('awaiting_transfer');
    expect(qx.amount).toBe(60000);
    // Exactly TWO Firestore queries total (quotes CG + invoices root) — the N+1 is gone.
    expect(runQuery).toHaveBeenCalledTimes(2);
  });
});
