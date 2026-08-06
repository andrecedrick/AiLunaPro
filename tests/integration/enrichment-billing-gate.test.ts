import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * The billing gate on POST /api/enrichment/run (P2.1a).
 *
 * An Apify run costs real money at the provider. Until this gate the route
 * checked auth and the org role and nothing else — privilege was the only
 * control, and privilege is not a budget: any owner on a Free plan could spend
 * the platform's Apify budget without limit.
 *
 * Every test below asserts on `apify.calls` — whether the provider was reached —
 * rather than on the HTTP status alone. A gate that returns 402 *after* starting
 * an actor has already lost the money it was meant to protect.
 */

const state = vi.hoisted(() => ({
  docs: new Map<string, Record<string, unknown>>(),
  usageRows: [] as Array<Record<string, unknown>>,
  balance: 1000,
}));
const apify = vi.hoisted(() => ({ calls: 0 }));
const pipeline = vi.hoisted(() => ({ evidence: 1, throws: false }));

vi.mock('../../worker/src/middleware/auth', () => ({
  verifyIdToken: async () => 'uid_1',
}));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    state.docs.set(path, { ...(state.docs.get(path) ?? {}), ...data });
  }),
  firestoreRunQuery: vi.fn(async () => state.usageRows),
  firestoreGetWithMeta: vi.fn(async () => null),
  firestoreSetIfMatch: vi.fn(async () => true),
  firestoreCreateIfNotExists: vi.fn(async () => undefined),
  firestoreDelete: vi.fn(async () => undefined),
}));
vi.mock('../../worker/src/lib/tokens', () => ({
  ensureTokenCycleFresh: vi.fn(async () => ({ balance: state.balance })),
  consumeTokens: vi.fn(async (_sa, _org, _action, _uid, _id, _meta, _mode, cost?: number) => {
    if (state.balance < (cost ?? 0)) return { ok: false, status: 402, balance: state.balance, required: cost };
    state.balance -= cost ?? 0;
    return { ok: true, balanceAfter: state.balance, tokensConsumed: cost };
  }),
  incrementBalance: vi.fn(async (_sa, _org, amount: number) => {
    state.balance += amount; return { balanceAfter: state.balance };
  }),
}));
vi.mock('../../worker/src/lib/billing-alerts', () => ({ recordBillingAlert: vi.fn(async () => undefined) }));
// The collector stands in for Apify: constructing it means the provider is reachable.
vi.mock('../../worker/src/lib/apify-collector', () => ({
  buildApifyConfig: () => ({ token: 't', actors: { website: 'a/b' }, memoryMb: 1024 }),
  ApifyCollector: class { id = 'apify'; version = '1'; },
}));
vi.mock('../../worker/src/lib/agent-reach-collector', () => ({ AgentReachCollector: class { id = 'bridge'; version = '1'; } }));
vi.mock('../../worker/src/lib/agent-reach-client', () => ({ buildBridgeConfig: () => null }));
vi.mock('../../worker/src/lib/enrichment-pipeline', () => ({
  runEnrichment: vi.fn(async () => {
    apify.calls += 1;                       // ← the money moment
    if (pipeline.throws) throw new Error('provider exploded');
    return {
      snapshot: { snapshotId: 'snap_1', createdAt: '2026-08-07T00:00:00.000Z', evidence: new Array(pipeline.evidence).fill({}), droppedCount: 0 },
      rejected: [], coverage: {}, stored: true, storeError: undefined,
    };
  }),
}));
vi.mock('../../worker/src/lib/enrichment-store', () => ({ listSnapshots: vi.fn(async () => []) }));
vi.mock('../../worker/src/lib/enrichment-report', () => ({ loadEnrichmentReport: vi.fn(async () => null) }));

import enrichmentRoute from '../../worker/src/routes/enrichment';

const ORG = 'orgA';
const ENV = {
  FIREBASE_SERVICE_ACCOUNT_JSON: '{}', FIREBASE_PROJECT_ID: 'p',
  APIFY_TOKEN: 't', APIFY_ACTORS: '{"website":"a/b"}', APIFY_MEMORY_MB: '1024',
  APP_ENV: 'production',
} as unknown as Record<string, unknown>;

const run = (body: Record<string, unknown> = {}) => enrichmentRoute.request('/api/enrichment/run', {
  method: 'POST',
  headers: { Authorization: 'Bearer x', 'Content-Type': 'application/json' },
  body: JSON.stringify({ orgId: ORG, subjectDomain: 'example.com', ...body }),
}, ENV);

const setPlan = (plan: string | null) => {
  if (plan === null) state.docs.delete(`organizations/${ORG}/subscriptions/current`);
  else state.docs.set(`organizations/${ORG}/subscriptions/current`, { plan, status: 'active' });
};

beforeEach(() => {
  state.docs.clear(); state.usageRows = []; state.balance = 1000;
  apify.calls = 0; pipeline.evidence = 1; pipeline.throws = false;
  state.docs.set(`organizations/${ORG}/members/uid_1`, { role: 'owner' });
  setPlan('Starter');
});

describe('the Free plan never reaches Apify', () => {
  it('denies PLAN_REQUIRED without calling the provider', async () => {
    setPlan('Free');
    state.balance = 999_999;                 // money is not the issue
    const res = await run();
    expect(res.status).toBe(402);
    expect((await res.json() as { code: string }).code).toBe('PLAN_REQUIRED');
    expect(apify.calls).toBe(0);
  });

  it('treats an org with no subscription document as Free', async () => {
    setPlan(null);
    const res = await run();
    expect((await res.json() as { code: string }).code).toBe('PLAN_REQUIRED');
    expect(apify.calls).toBe(0);
  });
});

describe('caps are enforced before the provider is called', () => {
  const consumedToday = (n: number) => {
    const today = new Date().toISOString().slice(0, 10);
    state.usageRows = new Array(n).fill(null).map(() => ({ fields: { at: { stringValue: `${today}T09:00:00.000Z` } } }));
  };

  it('denies at the daily cap with 429 and no provider call', async () => {
    consumedToday(2);                        // Starter daily cap = 2
    const res = await run();
    expect(res.status).toBe(429);
    expect((await res.json() as { code: string }).code).toBe('DAILY_CAP_REACHED');
    expect(apify.calls).toBe(0);
  });

  it('allows a run below the cap', async () => {
    consumedToday(1);
    expect((await run()).status).toBe(200);
    expect(apify.calls).toBe(1);
  });
});

describe('balance', () => {
  it('denies INSUFFICIENT_TOKENS before the provider is called', async () => {
    state.balance = 10;                      // website costs 50
    const res = await run();
    expect(res.status).toBe(402);
    expect((await res.json() as { code: string }).code).toBe('INSUFFICIENT_TOKENS');
    expect(apify.calls).toBe(0);
  });

  it('a Starter allocation cannot fund a social run — the upsell, by design', async () => {
    state.balance = 1000;                    // social costs 4200
    const res = await run({ scrapeClass: 'social' });
    expect(res.status).toBe(402);
    expect(apify.calls).toBe(0);
  });

  it('charges the class price: website 50, social 4200', async () => {
    await run();
    expect(state.balance).toBe(950);

    state.balance = 10_000;
    setPlan('Enterprise');
    await run({ scrapeClass: 'social' });
    expect(state.balance).toBe(5_800);
  });

  it('debits BEFORE the provider call, so concurrency cannot double-spend', async () => {
    // The debit is the reservation. If the check and the call were separate,
    // two concurrent requests would both pass and both spend at the provider.
    state.balance = 50;                      // funds exactly one run
    const [a, b] = await Promise.all([run(), run()]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 402]);
    expect(apify.calls).toBe(1);
  });

  it('warns without blocking when the balance drops below the floor', async () => {
    state.balance = 80;                      // 80 - 50 = 30 < 60
    const res = await run();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ warnLowBalance: true, minBalance: 60 });
  });
});

describe('refunds', () => {
  it('refunds when the run throws', async () => {
    pipeline.throws = true;
    const res = await run();
    expect(res.status).toBe(500);
    expect(state.balance).toBe(1000);         // charged 50, refunded 50
  });

  it('refunds when the snapshot carries no evidence', async () => {
    pipeline.evidence = 0;
    const res = await run();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ tokensCharged: 0 });
    expect(state.balance).toBe(1000);
  });

  it('does NOT refund a run that produced evidence', async () => {
    // Partial coverage is a valid audit result under §26.15 — a blocked source
    // is evidence, not a failure — so it is charged.
    pipeline.evidence = 3;
    await run();
    expect(state.balance).toBe(950);
  });
});

describe('fail-closed on a quota read failure', () => {
  it('refuses rather than assuming zero usage', async () => {
    // Assuming zero would uncap Apify spend during a Firestore outage.
    const { firestoreRunQuery } = await import('../../worker/src/lib/firestoreAdmin');
    vi.mocked(firestoreRunQuery).mockRejectedValueOnce(new Error('firestore down'));
    const res = await run();
    expect(res.status).toBe(503);
    expect((await res.json() as { code: string }).code).toBe('QUOTA_UNAVAILABLE');
    expect(apify.calls).toBe(0);
  });
});
