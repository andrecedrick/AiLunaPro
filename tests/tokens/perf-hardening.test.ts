import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Performance hardening — proven fixes only.
 *
 * 1. my-tickets now filters by uid SERVER-SIDE (was: read up to 300 ticket docs
 *    and filter in JS, so every customer paid for the whole recent collection).
 *    Asserts the emitted structuredQuery carries the equality filter and NO
 *    orderBy (equality + orderBy would need a composite index; indexes are empty).
 * 2. Ownership is still enforced after the change.
 */

const store = vi.hoisted(() => ({
  docs: new Map<string, Record<string, unknown>>(),
  lastQuery: null as Record<string, unknown> | null,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, q: Record<string, unknown>) => {
    store.lastQuery = q;
    return [...store.docs.entries()]
      .filter(([k]) => k.startsWith('support_tickets/'))
      .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }));
  }),
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p) ?? null),
  firestoreSet: vi.fn(async () => {}),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', 'cust-1'); c.set('email', 'cust@x.com'); await next();
  },
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({ sendTransactional: vi.fn(async () => ({ ok: true })) }));

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}' };

async function listMine() {
  const route = (await import('../../worker/src/routes/my-tickets')).default;
  const res = await route.request('/api/support/my-tickets', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

function seed(id: string, uid: string, createdAt: string) {
  store.docs.set(`support_tickets/${id}`, {
    id, uid, type: 'bug', status: 'open', description: 'x',
    email: 'cust@x.com', phone: '+33612345678', createdAt,
  });
}

beforeEach(() => { store.docs.clear(); store.lastQuery = null; vi.resetModules(); });

describe('my-tickets — server-side ownership filter (read reduction)', () => {
  it('emits a uid equality filter so Firestore returns only the caller rows', async () => {
    seed('t1', 'cust-1', '2026-07-25T10:00:00Z');
    await listMine();

    const q = store.lastQuery as { where?: { fieldFilter?: { field?: { fieldPath?: string }; op?: string; value?: { stringValue?: string } } }; orderBy?: unknown };
    expect(q.where?.fieldFilter?.field?.fieldPath).toBe('uid');
    expect(q.where?.fieldFilter?.op).toBe('EQUAL');
    expect(q.where?.fieldFilter?.value?.stringValue).toBe('cust-1');
  });

  it('omits orderBy — equality + orderBy would require a composite index', async () => {
    seed('t1', 'cust-1', '2026-07-25T10:00:00Z');
    await listMine();
    expect((store.lastQuery as { orderBy?: unknown }).orderBy).toBeUndefined();
  });

  it('still returns newest-first (sorted in memory, bounded by own tickets)', async () => {
    seed('old', 'cust-1', '2026-07-20T10:00:00Z');
    seed('new', 'cust-1', '2026-07-25T10:00:00Z');
    seed('mid', 'cust-1', '2026-07-22T10:00:00Z');
    const items = (await listMine()).body.items as unknown as Array<{ id: string }>;
    expect(items.map(i => i.id)).toEqual(['new', 'mid', 'old']);
  });

  it('ownership still enforced — another customer never leaks through', async () => {
    seed('mine',   'cust-1',       '2026-07-25T10:00:00Z');
    seed('theirs', 'someone-else', '2026-07-25T11:00:00Z');
    const items = (await listMine()).body.items as unknown as Array<{ id: string }>;
    expect(items.map(i => i.id)).toEqual(['mine']);
  });
});
