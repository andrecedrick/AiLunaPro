import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Usage-record traceability (observability MVP).
 *
 * Proves the ledger now records WHAT was settled and on WHICH terms:
 *   - consumeTokens writes mode + priceSnapshot + schemaV
 *   - the overflow path is recorded as mode:'overflow', not 'included'
 *   - recordFreeUsage writes a 0-token 'free' event WITHOUT touching the balance
 *     (free Luna messages used to leave no trace at all)
 *   - legacy rows are never mutated/backfilled
 *
 * Same in-memory Firestore mock as consume-tokens.test.ts.
 */

const store = vi.hoisted(() => ({ docs: new Map<string, { data: Record<string, unknown>; ut: number }>() }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => store.docs.get(path)?.data ?? null),
  firestoreGetWithMeta: vi.fn(async (_sa: string, path: string) => {
    const d = store.docs.get(path);
    return d ? { data: d.data, updateTime: String(d.ut) } : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
    const cur = store.docs.get(path);
    const next = opts?.merge && cur ? { ...cur.data, ...data } : { ...data };
    store.docs.set(path, { data: next, ut: (cur?.ut ?? 0) + 1 });
  }),
  firestoreSetIfMatch: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, updateTime: string, opts?: { merge?: boolean }) => {
    const cur = store.docs.get(path);
    if (!cur || String(cur.ut) !== updateTime) throw new Error('PRECONDITION_FAILED');
    const next = opts?.merge ? { ...cur.data, ...data } : { ...data };
    store.docs.set(path, { data: next, ut: cur.ut + 1 });
  }),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    if (store.docs.has(path)) throw new Error('ALREADY_EXISTS');
    store.docs.set(path, { data: { ...data }, ut: 1 });
  }),
  firestoreDelete: vi.fn(async (_sa: string, path: string) => { store.docs.delete(path); }),
}));

import { consumeTokens, recordFreeUsage } from '../../worker/src/lib/tokens';
import {
  TOKEN_COSTS, TOKEN_VALUE_USD, TOKEN_PRICE_USD, USAGE_SCHEMA_V,
} from '../../worker/src/lib/token-costs';

const ORG = 'orgTrace';
const UID = 'user-1';
const BAL = `organizations/${ORG}/tokens/current`;
const usagePath = (e: string) => `${BAL}/usage/${e}`;

function seedBalance(balance: number) {
  store.docs.set(BAL, {
    data: {
      balance, monthlyAllocation: 100_000, consumed: 0, rollover: 0, topupTotal: 0,
      lastReset: new Date().toISOString(),
      cycleEnd: new Date(Date.now() + 30 * 864e5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ut: 1,
  });
}

beforeEach(() => { store.docs.clear(); });

describe('consumeTokens — traceability fields', () => {
  it('records mode "included" by default, with a priceSnapshot and schema version', async () => {
    seedBalance(10_000);
    const r = await consumeTokens('sa', ORG, 'luna.message', UID, 'evt-1', { source: 'luna' });
    expect(r.ok).toBe(true);

    const doc = store.docs.get(usagePath('evt-1'))!.data;
    expect(doc.mode).toBe('included');
    expect(doc.schemaV).toBe(USAGE_SCHEMA_V);
    expect(doc.status).toBe('consumed');
    expect(doc.tokens).toBe(TOKEN_COSTS['luna.message']);
    expect(doc.priceSnapshot).toEqual({
      costTokens:    TOKEN_COSTS['luna.message'],
      valueUsd:      TOKEN_VALUE_USD['luna.message'],
      tokenPriceUsd: TOKEN_PRICE_USD,
    });
  });

  it('records the overflow path as mode "overflow"', async () => {
    seedBalance(10_000);
    await consumeTokens('sa', ORG, 'recommendation.run', UID, 'evt-of', { overflow: true }, 'overflow');
    expect(store.docs.get(usagePath('evt-of'))!.data.mode).toBe('overflow');
  });

  it('freezes the terms at charge time (snapshot is stored, not derived at read)', async () => {
    seedBalance(10_000);
    await consumeTokens('sa', ORG, 'quote.generation', UID, 'evt-q');
    const snap = store.docs.get(usagePath('evt-q'))!.data.priceSnapshot as Record<string, number>;
    expect(snap.costTokens).toBe(TOKEN_COSTS['quote.generation']);
    expect(snap.tokenPriceUsd).toBe(TOKEN_PRICE_USD);
  });
});

describe('recordFreeUsage — free events are measurable', () => {
  it('writes a 0-token free event and leaves the balance untouched', async () => {
    seedBalance(500);
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'free-1', { source: 'luna' });

    const doc = store.docs.get(usagePath('free-1'))!.data;
    expect(doc.tokens).toBe(0);
    expect(doc.status).toBe('free');
    expect(doc.mode).toBe('free');
    expect(doc.action).toBe('luna.message');
    expect(doc.schemaV).toBe(USAGE_SCHEMA_V);

    // No pricing change: balance and consumed are exactly as seeded.
    const bal = store.docs.get(BAL)!.data;
    expect(bal.balance).toBe(500);
    expect(bal.consumed).toBe(0);
  });

  it('still snapshots what the action WOULD have cost (0 charged)', async () => {
    seedBalance(500);
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'free-2');
    const snap = store.docs.get(usagePath('free-2'))!.data.priceSnapshot as Record<string, number>;
    expect(snap.costTokens).toBe(0);
    expect(snap.valueUsd).toBe(TOKEN_VALUE_USD['luna.message']);
  });

  it('is idempotent on eventId and never overwrites an existing record', async () => {
    seedBalance(500);
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'free-3');
    const first = store.docs.get(usagePath('free-3'))!;
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'free-3');
    expect(store.docs.get(usagePath('free-3'))!.ut).toBe(first.ut);
  });

  it('does not disturb a prior charged event for the same org', async () => {
    seedBalance(10_000);
    await consumeTokens('sa', ORG, 'luna.message', UID, 'evt-paid');
    const balAfterCharge = (store.docs.get(BAL)!.data as { balance: number }).balance;
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'free-4');
    expect((store.docs.get(BAL)!.data as { balance: number }).balance).toBe(balAfterCharge);
    expect(store.docs.get(usagePath('evt-paid'))!.data.status).toBe('consumed');
  });
});

describe('legacy rows', () => {
  it('are left untouched — no backfill of mode/priceSnapshot', async () => {
    seedBalance(10_000);
    // A pre-v2 row: no mode, no priceSnapshot, no schemaV.
    store.docs.set(usagePath('legacy-1'), {
      data: { eventId: 'legacy-1', action: 'luna.message', tokens: 50, uid: UID, status: 'consumed', at: '2026-06-20T10:00:00.000Z' },
      ut: 1,
    });

    await consumeTokens('sa', ORG, 'luna.message', UID, 'evt-new');

    const legacy = store.docs.get(usagePath('legacy-1'))!.data;
    expect(legacy.mode).toBeUndefined();
    expect(legacy.priceSnapshot).toBeUndefined();
    expect(legacy.schemaV).toBeUndefined();
  });
});
