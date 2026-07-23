import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Platform token-usage aggregation (Phase 4).
 *
 * Proves the cross-org rollup:
 *   - groups by action with the free/included/overflow/legacy split
 *   - counts DISTINCT organizations (per action and overall), never lists them
 *   - emits no PII (no uid / email / org name fields in the payload)
 *   - ignores docs outside the canonical token-ledger path
 *   - sorts by tokens desc so the head of byAction is "top actions"
 *   - reports `capped` when the scan cap is hit
 *
 * The Firestore collection-group query is mocked; the route's aggregation is real.
 */

const q = vi.hoisted(() => ({ docs: [] as Array<{ name: string; fields: Record<string, unknown> }> }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, sq: { limit?: number }) =>
    q.docs.slice(0, sq.limit ?? q.docs.length)),
}));

// Auth middlewares are exercised elsewhere; here they pass through so the
// aggregation itself is under test.
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}' };

/**
 * The route holds a 60s in-memory cache in module scope, so every case imports a
 * FRESH module instance (after vi.resetModules) to get an empty cache.
 */
async function loadRoute() {
  const mod = await import('../../worker/src/routes/platform-token-usage');
  return mod.default;
}

const usageDoc = (orgId: string, eventId: string, action: string, tokens: number, mode?: string) => ({
  name: `projects/p/databases/(default)/documents/organizations/${orgId}/tokens/current/usage/${eventId}`,
  fields: { eventId, action, tokens, ...(mode ? { mode } : {}) },
});

async function call() {
  const route = await loadRoute();
  const res = await route.request('/api/platform/token-usage?month=2026-07', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

// A monthly rollup doc: one per org, holding a per-action counter map.
const rollupDoc = (orgId: string, month: string, actions: Record<string, { count: number; tokens: number; free?: number; included?: number; overflow?: number }>) => ({
  name: `projects/p/databases/(default)/documents/organizations/${orgId}/tokens/current/rollups/${month}`,
  fields: { month, actions },
});

beforeEach(() => {
  q.docs = [];
  // Bust the route's 60s in-memory cache between cases.
  vi.resetModules();
});

describe('GET /api/platform/token-usage — ROLLUP path (bounded by orgs)', () => {
  it('aggregates monthly rollup docs across orgs, one doc per org', async () => {
    q.docs = [
      rollupDoc('orgA', '2026-07', {
        'luna.message':     { count: 3, tokens: 100, free: 1, included: 2, overflow: 0 },
        'quote.generation': { count: 1, tokens: 60,  free: 0, included: 1, overflow: 0 },
      }),
      rollupDoc('orgB', '2026-07', {
        'luna.message':     { count: 2, tokens: 100, free: 0, included: 2, overflow: 0 },
      }),
    ];
    const { status, body } = await call();
    expect(status).toBe(200);
    expect(body.source as unknown as string).toBe('rollup');

    const byAction = body.byAction as unknown as Array<Record<string, number | string>>;
    const luna = byAction.find(b => b.action === 'luna.message')!;
    expect(luna.count).toBe(5);       // 3 + 2 across orgs
    expect(luna.tokens).toBe(200);
    expect(luna.orgs).toBe(2);        // distinct orgs, counted not listed

    const totals = body.totals as unknown as Record<string, number>;
    expect(totals.count).toBe(6);     // 3 + 1 + 2
    expect(totals.orgs).toBe(2);
    // scanned == docs read == ORG count, NOT event count (the whole point).
    expect(body.scanned as unknown as number).toBe(2);
  });

  it('emits no PII in the rollup path — orgs counted, never listed', async () => {
    q.docs = [rollupDoc('orgSecret', '2026-07', { 'luna.message': { count: 1, tokens: 50 } })];
    const serialized = JSON.stringify((await call()).body);
    expect(serialized).not.toContain('orgSecret');
    expect(serialized).not.toContain('@');
  });
});

describe('GET /api/platform/token-usage — SCAN fallback', () => {
  it('groups by action with mode split and distinct org counts', async () => {
    q.docs = [
      usageDoc('orgA', 'e1', 'luna.message', 50, 'included'),
      usageDoc('orgA', 'e2', 'luna.message', 0,  'free'),
      usageDoc('orgB', 'e3', 'luna.message', 50, 'included'),
      usageDoc('orgB', 'e4', 'quote.generation', 60, 'included'),
      usageDoc('orgC', 'e5', 'recommendation.run', 30, 'overflow'),
    ];

    const { status, body } = await call();
    expect(status).toBe(200);

    const byAction = body.byAction as unknown as Array<Record<string, number | string>>;
    const luna = byAction.find(b => b.action === 'luna.message')!;
    expect(luna.count).toBe(3);
    expect(luna.tokens).toBe(100);
    expect(luna.free).toBe(1);
    expect(luna.included).toBe(2);
    expect(luna.orgs).toBe(2);              // orgA + orgB, counted not listed

    const reco = byAction.find(b => b.action === 'recommendation.run')!;
    expect(reco.overflow).toBe(1);

    const totals = body.totals as unknown as Record<string, number>;
    expect(totals.count).toBe(5);
    expect(totals.tokens).toBe(190);
    expect(totals.orgs).toBe(3);            // orgA, orgB, orgC
  });

  it('counts rows without a mode as legacy, never inferring one', async () => {
    q.docs = [usageDoc('orgA', 'e1', 'luna.message', 50)]; // pre-v2 row: no mode
    const { body } = await call();
    const luna = (body.byAction as unknown as Array<Record<string, number>>)[0];
    expect(luna.unknown).toBe(1);
    expect(luna.included).toBe(0);
    expect(luna.free).toBe(0);
  });

  it('ignores documents outside the token-ledger path', async () => {
    q.docs = [
      usageDoc('orgA', 'e1', 'luna.message', 50, 'included'),
      { name: 'projects/p/databases/(default)/documents/somewhere/else/usage/x', fields: { action: 'bogus', tokens: 999 } },
    ];
    const { body } = await call();
    const totals = body.totals as unknown as Record<string, number>;
    expect(totals.count).toBe(1);
    expect(totals.tokens).toBe(50);
  });

  it('sorts actions by tokens desc (head = top actions)', async () => {
    q.docs = [
      usageDoc('orgA', 'e1', 'report.export.pdf', 5, 'included'),
      usageDoc('orgA', 'e2', 'quote.generation', 60, 'included'),
      usageDoc('orgA', 'e3', 'luna.message', 50, 'included'),
    ];
    const { body } = await call();
    const actions = (body.byAction as unknown as Array<{ action: string }>).map(b => b.action);
    expect(actions).toEqual(['quote.generation', 'luna.message', 'report.export.pdf']);
  });

  it('returns no PII — only aggregate fields', async () => {
    q.docs = [{
      name: 'projects/p/databases/(default)/documents/organizations/orgA/tokens/current/usage/e1',
      fields: { eventId: 'e1', action: 'luna.message', tokens: 50, mode: 'included', uid: 'user-secret' },
    }];
    const { body } = await call();
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('user-secret');
    expect(serialized).not.toContain('uid');
    expect(serialized).not.toContain('@');
    expect(serialized).not.toContain('orgA');   // orgs are counted, never listed
  });

  it('flags capped when the scan cap is reached', async () => {
    q.docs = Array.from({ length: 5000 }, (_, i) => usageDoc('orgA', `e${i}`, 'luna.message', 1, 'included'));
    const { body } = await call();
    expect(body.capped as unknown as boolean).toBe(true);
    expect(body.scanned as unknown as number).toBe(5000);
  });

  it('503s when Firestore is not configured', async () => {
    const route = await loadRoute();
    const res = await route.request('/api/platform/token-usage', {}, {});
    expect(res.status).toBe(503);
  });
});
