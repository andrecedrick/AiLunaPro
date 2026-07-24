import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Notification center V2 — read/unread, per-recipient visibility, mark read/all.
 *
 * Proves: a caller sees only their own user notifications + operator ones iff
 * platform-admin; unread count; filter unread/read; mark-one is ownership-checked
 * (403 for someone else's); mark-all clears only the caller's; createNotification
 * writes the durable doc.
 */

const store = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), isOperator: false }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async () => [...store.docs.entries()]
    .filter(([k]) => k.startsWith('notifications/'))
    .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }))),
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, o?: { merge?: boolean }) => {
    const cur = store.docs.get(p);
    store.docs.set(p, o?.merge && cur ? { ...cur, ...data } : { ...data });
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

beforeEach(() => { store.docs.clear(); store.isOperator = false; vi.resetModules(); });

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
