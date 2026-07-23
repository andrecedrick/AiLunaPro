import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Monthly token rollups (Phase 3).
 *
 * Proves: a fresh month seeds the doc; subsequent bumps accumulate per action
 * and per mode; concurrent bumps (PRECONDITION_FAILED) retry and never lose a
 * count; the month key is UTC; the rollup replaces a raw-doc scan with a single
 * doc that grows with ACTIONS, not events.
 */

const store = vi.hoisted(() => ({
  docs: new Map<string, { data: Record<string, unknown>; ut: number }>(),
  failFirstMatch: false,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGetWithMeta: vi.fn(async (_sa: string, p: string) => {
    const d = store.docs.get(p);
    return d ? { data: d.data, updateTime: String(d.ut) } : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>) => {
    const cur = store.docs.get(p);
    store.docs.set(p, { data: { ...data }, ut: (cur?.ut ?? 0) + 1 });
  }),
  firestoreSetIfMatch: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, ut: string) => {
    if (store.failFirstMatch) { store.failFirstMatch = false; throw new Error('PRECONDITION_FAILED'); }
    const cur = store.docs.get(p);
    if (!cur || String(cur.ut) !== ut) throw new Error('PRECONDITION_FAILED');
    store.docs.set(p, { data: { ...data }, ut: cur.ut + 1 });
  }),
}));

import { bumpRollup, rollupPath, rollupMonthKey } from '../../worker/src/lib/token-rollups';

const ORG = 'orgR';
const DAY = new Date('2026-07-23T10:00:00.000Z');
const path = rollupPath(ORG, '2026-07');

beforeEach(() => { store.docs.clear(); store.failFirstMatch = false; });

describe('bumpRollup', () => {
  it('seeds the month doc on the first event', async () => {
    await bumpRollup('sa', ORG, 'luna.message', 'free', 0, DAY);
    const a = (store.docs.get(path)!.data.actions as Record<string, Record<string, number>>)['luna.message'];
    expect(a).toEqual({ count: 1, tokens: 0, free: 1, included: 0, overflow: 0 });
  });

  it('accumulates per action and per mode', async () => {
    await bumpRollup('sa', ORG, 'luna.message', 'free', 0, DAY);
    await bumpRollup('sa', ORG, 'luna.message', 'included', 50, DAY);
    await bumpRollup('sa', ORG, 'quote.generation', 'included', 60, DAY);
    const actions = store.docs.get(path)!.data.actions as Record<string, Record<string, number>>;
    expect(actions['luna.message']).toEqual({ count: 2, tokens: 50, free: 1, included: 1, overflow: 0 });
    expect(actions['quote.generation']).toEqual({ count: 1, tokens: 60, free: 0, included: 1, overflow: 0 });
  });

  it('retries on a concurrent bump and never loses a count', async () => {
    await bumpRollup('sa', ORG, 'luna.message', 'included', 50, DAY); // seed
    store.failFirstMatch = true;                                       // next setIfMatch fails once
    await bumpRollup('sa', ORG, 'luna.message', 'included', 50, DAY); // must retry → succeed
    const a = (store.docs.get(path)!.data.actions as Record<string, Record<string, number>>)['luna.message'];
    expect(a.count).toBe(2);
    expect(a.tokens).toBe(100);
  });

  it('uses a UTC month key', () => {
    expect(rollupMonthKey(new Date('2026-07-31T23:30:00.000Z'))).toBe('2026-07');
    expect(rollupMonthKey(new Date('2026-08-01T00:30:00.000Z'))).toBe('2026-08');
  });

  it('one doc per month regardless of event count (bounded read)', async () => {
    for (let i = 0; i < 25; i++) await bumpRollup('sa', ORG, 'luna.message', 'included', 50, DAY);
    const rollupDocs = [...store.docs.keys()].filter(k => k.includes('/rollups/'));
    expect(rollupDocs).toHaveLength(1); // 25 events → 1 doc
    expect((store.docs.get(path)!.data.actions as Record<string, Record<string, number>>)['luna.message'].count).toBe(25);
  });
});
