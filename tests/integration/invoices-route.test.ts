import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * FIX 6 — GET /api/invoices. Org-scoped (orgId from requireRole), auth-gated,
 * read-only. Maps the worker-only `invoices` docs and returns them newest-first.
 */

const state = vi.hoisted(() => ({ rows: [] as Array<{ name: string; fields: Record<string, unknown> }> }));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => { c.set('uid', 'u1'); await next(); },
}));
vi.mock('../../worker/src/middleware/requireRole', () => ({
  requireRole: () => async (c: { req: { query: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('orgId', c.req.query('orgId') ?? 'orgA'); c.set('role', 'owner'); await next();
  },
}));
const runQuery = vi.hoisted(() => vi.fn(async () => state.rows));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({ firestoreRunQuery: runQuery }));

import invoices from '../../worker/src/routes/invoices';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}' } as unknown as Record<string, unknown>;
const get = (org = 'orgA') =>
  invoices.request(`/api/invoices?orgId=${org}`, { headers: { Authorization: 'Bearer t' } }, ENV);

beforeEach(() => {
  runQuery.mockClear();
  state.rows = [
    { name: 'documents/invoices/quote_a', fields: { id: 'quote_a', quoteId: 'a', orgId: 'orgA', customerEmail: 'c@x.com', amount: null, currency: 'usd', rangeMinUsd: 10000, rangeMaxUsd: 20000, status: 'draft', createdAt: '2026-06-19T00:00:00.000Z' } },
    { name: 'documents/invoices/quote_b', fields: { id: 'quote_b', quoteId: 'b', orgId: 'orgA', amount: 5000, currency: 'usd', status: 'pending', createdAt: '2026-06-20T00:00:00.000Z' } },
  ];
});

describe('GET /api/invoices (FIX 6)', () => {
  it('returns the org invoices mapped and newest-first', async () => {
    const res = await get();
    expect(res.status).toBe(200);
    const { invoices: list } = await res.json() as { invoices: Array<Record<string, unknown>> };
    expect(list).toHaveLength(2);
    expect(list[0].quoteId).toBe('b');           // 06-20 first
    expect(list[0].status).toBe('pending');
    expect(list[0].amount).toBe(5000);
    expect(list[1].quoteId).toBe('a');
    expect(list[1].amount).toBeNull();
    expect(list[1].rangeMinUsd).toBe(10000);
    // The query is filtered by the membership-verified org (no cross-org).
    const q = runQuery.mock.calls[0][1] as { where: { fieldFilter: { value: { stringValue: string } } } };
    expect(q.where.fieldFilter.value.stringValue).toBe('orgA');
  });

  it('returns an empty list when the org has no invoices', async () => {
    state.rows = [];
    const res = await get();
    expect(res.status).toBe(200);
    expect((await res.json() as { invoices: unknown[] }).invoices).toEqual([]);
  });
});
