import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * consumeTokens — free-usage bypass fix (audit B1).
 *
 * The old code marked an insufficient-balance attempt status:'failed' but KEPT the
 * usage marker; a retry with the same eventId then hit ALREADY_EXISTS and returned
 * tokensConsumed:0 → a free action. The fix: a marker only short-circuits when
 * status==='consumed'; failure/interrupted paths delete the marker so a retry bills.
 *
 * In-memory Firestore mock modelling optimistic concurrency via a per-doc updateTime.
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

import { consumeTokens } from '../../worker/src/lib/tokens';
import { TOKEN_COSTS, type TokenAction } from '../../worker/src/lib/token-costs';

// A real action with a non-zero cost.
const [ACTION, COST] = (Object.entries(TOKEN_COSTS).find(([, c]) => (c as number) > 0)!) as [TokenAction, number];

const ORG = 'orgA';
const BAL = `organizations/${ORG}/tokens/current`;
const usagePath = (e: string) => `${BAL}/usage/${e}`;

function seedBalance(balance: number) {
  store.docs.set(BAL, {
    data: {
      balance, monthlyAllocation: 100_000, consumed: 0, rollover: 0, topupTotal: 0,
      lastReset: new Date().toISOString(),
      cycleEnd: new Date(Date.now() + 30 * 864e5).toISOString(),  // far future → no cycle reset
      updatedAt: new Date().toISOString(),
    },
    ut: 1,
  });
}

const balanceOf = () => store.docs.get(BAL)!.data.balance as number;

beforeEach(() => { store.docs.clear(); vi.clearAllMocks(); });

describe('consumeTokens — always charges, never a free bypass (B1)', () => {
  it('happy path: charges COST and records a consumed marker', async () => {
    seedBalance(1000);
    const r = await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-ok');
    expect(r).toMatchObject({ ok: true, tokensConsumed: COST, balanceAfter: 1000 - COST });
    expect(balanceOf()).toBe(1000 - COST);
    expect(store.docs.get(usagePath('e-ok'))!.data.status).toBe('consumed');
  });

  it('insufficient balance DELETES the marker (no poisoning stub left behind)', async () => {
    seedBalance(0);
    const r = await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-poor');
    expect(r.ok).toBe(false);
    expect((r as { status: number }).status).toBe(402);
    expect(store.docs.has(usagePath('e-poor'))).toBe(false);   // marker gone → retry can bill
  });

  it('retry after a top-up ACTUALLY charges (the core bug: no free action)', async () => {
    seedBalance(0);
    const first = await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-retry');
    expect(first.ok).toBe(false);                              // 402, marker deleted

    store.docs.get(BAL)!.data.balance = 1000;                  // simulate top-up
    const second = await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-retry');   // SAME eventId
    expect(second).toMatchObject({ ok: true, tokensConsumed: COST });            // charged, NOT free
    expect(balanceOf()).toBe(1000 - COST);
  });

  it('genuine repeat of a CONSUMED event is idempotent (no double charge)', async () => {
    seedBalance(1000);
    await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-dup');
    expect(balanceOf()).toBe(1000 - COST);
    const again = await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-dup');   // same eventId, already consumed
    expect(again).toMatchObject({ ok: true, tokensConsumed: 0 });             // idempotent no-op
    expect(balanceOf()).toBe(1000 - COST);                                    // NOT charged twice
  });

  it('a stale NON-consumed marker (legacy "failed") self-heals: it bills, not free', async () => {
    seedBalance(1000);
    // Simulate the old poisoned marker left by the pre-fix code.
    store.docs.set(usagePath('e-stale'), { data: { status: 'failed', tokens: COST }, ut: 1 });
    const r = await consumeTokens('{}', ORG, ACTION, 'uid-1', 'e-stale');
    expect(r).toMatchObject({ ok: true, tokensConsumed: COST });   // charged despite the stale marker
    expect(balanceOf()).toBe(1000 - COST);
    expect(store.docs.get(usagePath('e-stale'))!.data.status).toBe('consumed');
  });
});
