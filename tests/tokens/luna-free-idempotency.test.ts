import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Free-Luna event idempotency (P1 fix).
 *
 * The free path does not REQUIRE a client eventId (only the paid path 400s
 * without one). It previously fell back to crypto.randomUUID(), so a retried
 * request wrote a SECOND free event and inflated usage counts.
 *
 * Guarantee under test: one request == one event.
 *   - freeEventId is deterministic for (uid, UTC day, freeIndex)
 *   - it changes for the NEXT free message, and across days and users
 *   - it never encodes message content
 *   - recordFreeUsage with the same id twice writes exactly one document
 */

const store = vi.hoisted(() => ({ docs: new Map<string, { data: Record<string, unknown>; ut: number }>() }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => store.docs.get(path)?.data ?? null),
  firestoreGetWithMeta: vi.fn(async (_sa: string, path: string) => {
    const d = store.docs.get(path);
    return d ? { data: d.data, updateTime: String(d.ut) } : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    store.docs.set(path, { data, ut: 1 });
  }),
  firestoreSetIfMatch: vi.fn(async () => { /* unused here */ }),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    if (store.docs.has(path)) throw new Error('ALREADY_EXISTS');
    store.docs.set(path, { data: { ...data }, ut: 1 });
  }),
  firestoreDelete: vi.fn(async (_sa: string, path: string) => { store.docs.delete(path); }),
}));

import { recordFreeUsage } from '../../worker/src/lib/tokens';
import { freeEventId } from '../../worker/src/routes/luna';

const ORG = 'orgFree';
const UID = 'user-42';
const usagePath = (e: string) => `organizations/${ORG}/tokens/current/usage/${e}`;

beforeEach(() => { store.docs.clear(); });

describe('freeEventId — deterministic', () => {
  it('is stable for the same (uid, day, index) — a retry reuses it', () => {
    const day = new Date('2026-07-22T09:00:00.000Z');
    const a = freeEventId(UID, 0, day);
    const b = freeEventId(UID, 0, new Date('2026-07-22T23:59:59.000Z')); // same UTC day
    expect(a).toBe(b);
  });

  it('differs for the next free message of the day', () => {
    const day = new Date('2026-07-22T09:00:00.000Z');
    expect(freeEventId(UID, 0, day)).not.toBe(freeEventId(UID, 1, day));
  });

  it('differs across days and across users', () => {
    expect(freeEventId(UID, 0, new Date('2026-07-22T09:00:00.000Z')))
      .not.toBe(freeEventId(UID, 0, new Date('2026-07-23T09:00:00.000Z')));
    expect(freeEventId('user-a', 0, new Date('2026-07-22T09:00:00.000Z')))
      .not.toBe(freeEventId('user-b', 0, new Date('2026-07-22T09:00:00.000Z')));
  });

  it('never encodes message content', () => {
    const id = freeEventId(UID, 2, new Date('2026-07-22T09:00:00.000Z'));
    expect(id).toBe('luna_free_user-42_2026-07-22_2');
    expect(id).not.toMatch(/[?!.]|\s/); // no free text could survive in this shape
  });
});

describe('one request == one event', () => {
  it('replaying the same deterministic id writes exactly ONE document', async () => {
    const id = freeEventId(UID, 0, new Date('2026-07-22T09:00:00.000Z'));

    await recordFreeUsage('sa', ORG, 'luna.message', UID, id, { source: 'luna' });
    const afterFirst = store.docs.get(usagePath(id))!;

    // Retry of the same request (client omitted eventId both times).
    await recordFreeUsage('sa', ORG, 'luna.message', UID, id, { source: 'luna' });
    await recordFreeUsage('sa', ORG, 'luna.message', UID, id, { source: 'luna' });

    const freeDocs = [...store.docs.keys()].filter(k => k.includes('/usage/'));
    expect(freeDocs).toHaveLength(1);
    expect(store.docs.get(usagePath(id))!.ut).toBe(afterFirst.ut); // never overwritten
    expect(store.docs.get(usagePath(id))!.data.tokens).toBe(0);
    expect(store.docs.get(usagePath(id))!.data.mode).toBe('free');
  });

  it('the NEXT free message still gets its own event', async () => {
    const day = new Date('2026-07-22T09:00:00.000Z');
    await recordFreeUsage('sa', ORG, 'luna.message', UID, freeEventId(UID, 0, day));
    await recordFreeUsage('sa', ORG, 'luna.message', UID, freeEventId(UID, 1, day));
    expect([...store.docs.keys()].filter(k => k.includes('/usage/'))).toHaveLength(2);
  });

  it('a client-supplied eventId still wins (unchanged behaviour)', async () => {
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'client-evt-1');
    await recordFreeUsage('sa', ORG, 'luna.message', UID, 'client-evt-1');
    expect([...store.docs.keys()].filter(k => k.includes('/usage/'))).toHaveLength(1);
    expect(store.docs.has(usagePath('client-evt-1'))).toBe(true);
  });
});
