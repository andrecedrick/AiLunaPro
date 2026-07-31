import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Notification center V2 — read/unread, per-recipient visibility, mark read/all.
 *
 * Proves: a caller sees only their own user notifications + operator ones iff
 * platform-admin; unread count; filter unread/read; mark-one is ownership-checked
 * (403 for someone else's); mark-all clears only the caller's; createNotification
 * writes the durable doc.
 */

const store = vi.hoisted(() => ({
  docs: new Map<string, Record<string, unknown>>(),
  isOperator: false,
  /** Every structuredQuery filter set issued, as "field=value&…". */
  queries: [] as string[],
  /** Write count per firestoreCommit call. */
  commits: [] as number[],
}));

/**
 * The mock APPLIES the query's filters rather than returning everything. That is
 * the point of these tests now: the route stopped scanning the collection and
 * started issuing targeted equality queries, so a mock that ignores `where`
 * would pass whether or not the route actually narrows the read.
 * `store.queries` records what was asked for, which is how the read cost is
 * asserted.
 */
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>) => {
    const comp = sq.where as { compositeFilter?: { filters: Array<{ fieldFilter: { field: { fieldPath: string }; value: { stringValue: string } } }> } } | undefined;
    const wanted = (comp?.compositeFilter?.filters ?? []).map(f => [f.fieldFilter.field.fieldPath, f.fieldFilter.value.stringValue] as const);
    store.queries.push(wanted.map(([k, v]) => `${k}=${v}`).join('&'));
    return [...store.docs.entries()]
      .filter(([k]) => k.startsWith('notifications/'))
      .filter(([, v]) => wanted.every(([path, val]) => String(v[path] ?? '') === val))
      .slice(0, (sq.limit as number) ?? 1000)
      .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }));
  }),
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, o?: { merge?: boolean }) => {
    const cur = store.docs.get(p);
    store.docs.set(p, o?.merge && cur ? { ...cur, ...data } : { ...data });
  }),
  firestoreCommit: vi.fn(async (_sa: string, writes: Array<{ path: string; data: Record<string, unknown> }>) => {
    store.commits.push(writes.length);
    for (const w of writes) store.docs.set(w.path, { ...(store.docs.get(w.path) ?? {}), ...w.data });
  }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', 'user-me'); c.set('email', 'me@x.com'); c.set('emailVerified', true); await next();
  },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  isPlatformAdmin: vi.fn(() => store.isOperator),
}));

import { createNotification } from '../../worker/src/lib/notifications';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}', PLATFORM_ADMIN_EMAILS: 'me@x.com' };
async function route() { return (await import('../../worker/src/routes/notifications')).default; }
async function get(qs = '') {
  const res = await (await route()).request(`/api/notifications${qs}`, {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}
async function post(path: string, body: unknown) {
  const res = await (await route()).request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

function seed(id: string, o: Record<string, unknown>) {
  store.docs.set(`notifications/${id}`, {
    id, audience: 'user', uid: 'user-me', type: 'reply', targetType: 'support_ticket', targetId: 't1',
    route: 'help', title: 'x', severity: 'info', read: false, readAt: '', at: '2026-07-25T10:00:00Z', ...o,
  });
}

beforeEach(() => {
  store.docs.clear(); store.isOperator = false;
  store.queries.length = 0; store.commits.length = 0;
  vi.resetModules();
});

describe('GET /api/notifications', () => {
  it('shows my user notifications, not another user’s', async () => {
    seed('n1', { uid: 'user-me', at: '2026-07-25T11:00:00Z' });
    seed('n2', { uid: 'someone-else', at: '2026-07-25T12:00:00Z' });
    const items = (await get()).body.items as unknown as Array<{ id: string }>;
    expect(items.map(i => i.id)).toEqual(['n1']);
  });

  it('hides operator notifications from a non-operator, shows them to an operator', async () => {
    seed('op1', { audience: 'operator', uid: '', type: 'feedback' });
    expect(((await get()).body.items as unknown as unknown[])).toHaveLength(0); // not operator
    store.isOperator = true; vi.resetModules();
    expect(((await get()).body.items as unknown as unknown[]).length).toBe(1);
  });

  /**
   * The regression these guard is the one the Cloudflare audit found: the route
   * read the newest 200 notifications platform-wide and filtered by uid in
   * memory, so every bell load cost 200 document reads regardless of ownership.
   */
  it('issues a TARGETED query — never a bare collection scan', async () => {
    seed('n1', {});
    await get();
    expect(store.queries).toEqual(['audience=user&uid=user-me']);
    // An unfiltered query would appear as an empty filter string.
    expect(store.queries).not.toContain('');
  });

  it('a non-operator does NOT pay for the operator feed', async () => {
    seed('n1', {});
    seed('op1', { audience: 'operator', uid: '' });
    const items = (await get()).body.items as unknown as unknown[];
    expect(items).toHaveLength(1);
    expect(store.queries).toHaveLength(1); // one query, own notifications only
  });

  it('an operator gets both feeds, merged newest-first', async () => {
    store.isOperator = true; vi.resetModules();
    seed('mine', { at: '2026-07-25T10:00:00Z' });
    seed('op1', { audience: 'operator', uid: '', at: '2026-07-25T12:00:00Z' });
    const items = (await get()).body.items as unknown as Array<{ id: string }>;
    expect(items.map(i => i.id)).toEqual(['op1', 'mine']);
    expect(store.queries.sort()).toEqual(['audience=operator', 'audience=user&uid=user-me']);
  });

  it('reads only the caller\'s documents, not the whole collection', async () => {
    seed('mine', {});
    for (let i = 0; i < 300; i++) seed(`other${i}`, { uid: `stranger${i}` });
    const items = (await get()).body.items as unknown as unknown[];
    expect(items).toHaveLength(1);
    // 1 document read out of 301 present. The old code read 200 of them.
    expect(store.docs.size).toBe(301);
  });

  it('falls back to a scan when the composite index is missing, instead of showing nothing', async () => {
    const { firestoreRunQuery } = await import('../../worker/src/lib/firestoreAdmin');
    seed('n1', {});
    seed('other', { uid: 'someone-else' });
    // First call = the targeted query; make it fail the way a missing index does.
    vi.mocked(firestoreRunQuery).mockRejectedValueOnce(
      new Error('FAILED_PRECONDITION: The query requires an index.'));
    const items = (await get()).body.items as unknown as Array<{ id: string }>;
    // Still the caller's own notification, and still only theirs.
    expect(items.map(i => i.id)).toEqual(['n1']);
  });

  it('reports unread count and filters', async () => {
    seed('a', { read: false }); seed('b', { read: true });
    const all = await get();
    expect(all.body.unreadCount as unknown as number).toBe(1);
    expect(((await get('?filter=unread')).body.items as unknown as unknown[])).toHaveLength(1);
    expect(((await get('?filter=read')).body.items as unknown as unknown[])).toHaveLength(1);
  });
});

describe('POST /api/notifications/read', () => {
  it('marks my notification read', async () => {
    seed('n1', { read: false });
    const { status } = await post('/api/notifications/read', { id: 'n1' });
    expect(status).toBe(200);
    expect(store.docs.get('notifications/n1')!.read).toBe(true);
    expect(store.docs.get('notifications/n1')!.readAt).toBeTruthy();
  });

  it('403s when the notification belongs to someone else', async () => {
    seed('n2', { uid: 'someone-else' });
    expect((await post('/api/notifications/read', { id: 'n2' })).status).toBe(403);
  });

  it('404s for an unknown id', async () => {
    expect((await post('/api/notifications/read', { id: 'nope' })).status).toBe(404);
  });
});

describe('POST /api/notifications/read-all', () => {
  it('marks all MY unread read, leaving others alone', async () => {
    seed('a', { read: false }); seed('b', { read: false }); seed('c', { uid: 'other', read: false });
    const { body } = await post('/api/notifications/read-all', {});
    expect(body.marked as unknown as number).toBe(2);
    expect(store.docs.get('notifications/a')!.read).toBe(true);
    expect(store.docs.get('notifications/c')!.read).toBe(false); // not mine
  });

  it('marks them in ONE commit, not one write per notification', async () => {
    for (let i = 0; i < 20; i++) seed(`n${i}`, { read: false });
    const { body } = await post('/api/notifications/read-all', {});
    expect(body.marked as unknown as number).toBe(20);
    expect(store.commits).toEqual([20]); // a single batched round trip
  });

  it('commits nothing when there is nothing unread', async () => {
    seed('a', { read: true });
    expect((await post('/api/notifications/read-all', {})).body.marked as unknown as number).toBe(0);
    expect(store.commits).toEqual([0]);
  });
});

describe('createNotification', () => {
  it('writes a durable notification doc', async () => {
    await createNotification('sa', { id: 'x1', audience: 'user', uid: 'user-me', type: 'reply', title: 'hi', route: 'help' });
    const doc = store.docs.get('notifications/x1')!;
    expect(doc.audience).toBe('user');
    expect(doc.read).toBe(false);
    expect(doc.route).toBe('help');
  });
});
