import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Customer "My Tickets" — ownership + reply-back loop.
 *
 * Proves: a customer only sees/acts on their OWN tickets (uid match); a customer
 * reply appends to the SAME thread with repliedBy:'customer' and flips the ticket
 * back to 'open' (operator queue); replying to someone else's ticket is 403;
 * close is ownership-checked.
 */

const store = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>() }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async () => [...store.docs.entries()]
    .filter(([k]) => k.startsWith('support_tickets/'))
    .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }))),
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, o?: { merge?: boolean }) => {
    const cur = store.docs.get(p);
    store.docs.set(p, o?.merge && cur ? { ...cur, ...data } : { ...data });
  }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', 'cust-1'); c.set('email', 'cust@x.com'); await next();
  },
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({ sendTransactional: vi.fn(async () => ({ ok: true })) }));

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}', ADMIN_EMAIL: 'ops@x.com' };
async function route() { return (await import('../../worker/src/routes/my-tickets')).default; }
async function get() { const r = await route(); const res = await r.request('/api/support/my-tickets', {}, ENV); return { status: res.status, body: await res.json() as Record<string, never> }; }
async function post(path: string, body: unknown) { const r = await route(); const res = await r.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ENV); return { status: res.status, body: await res.json() as Record<string, never> }; }

function seed(id: string, uid: string, o: Record<string, unknown> = {}) {
  store.docs.set(`support_tickets/${id}`, { id, uid, type: 'bug', status: 'answered', description: 'broke', email: 'cust@x.com', phone: '+33612345678', createdAt: '2026-07-25T10:00:00Z', replies: [{ message: 'op reply', repliedAt: 'x', repliedBy: 'operator@x.com' }], ...o });
}

beforeEach(() => { store.docs.clear(); vi.resetModules(); });

describe('GET /api/support/my-tickets', () => {
  it('returns only the caller’s own tickets', async () => {
    seed('t1', 'cust-1'); seed('t2', 'someone-else');
    const items = (await get()).body.items as unknown as Array<{ id: string }>;
    expect(items.map(i => i.id)).toEqual(['t1']);
  });
});

describe('POST /api/support/my-reply', () => {
  it('appends the customer reply to the SAME thread and reopens the ticket', async () => {
    seed('t1', 'cust-1', { status: 'answered' });
    const { status, body } = await post('/api/support/my-reply', { ticketId: 't1', message: 'thanks, still stuck' });
    expect(status).toBe(200);
    expect(body.status as unknown as string).toBe('open');   // back to operator
    const doc = store.docs.get('support_tickets/t1')!;
    const replies = doc.replies as Array<Record<string, string>>;
    expect(replies).toHaveLength(2);
    expect(replies[1]).toMatchObject({ message: 'thanks, still stuck', repliedBy: 'customer' });
    expect(doc.status).toBe('open');
  });

  it('403s when replying to someone else’s ticket', async () => {
    seed('t2', 'someone-else');
    expect((await post('/api/support/my-reply', { ticketId: 't2', message: 'x' })).status).toBe(403);
  });

  it('rejects an empty message and unknown ticket', async () => {
    seed('t1', 'cust-1');
    expect((await post('/api/support/my-reply', { ticketId: 't1', message: '  ' })).status).toBe(400);
    expect((await post('/api/support/my-reply', { ticketId: 'nope', message: 'x' })).status).toBe(404);
  });
});

describe('POST /api/support/my-close', () => {
  it('closes the caller’s ticket with closedBy customer', async () => {
    seed('t1', 'cust-1');
    const { status } = await post('/api/support/my-close', { ticketId: 't1' });
    expect(status).toBe(200);
    const doc = store.docs.get('support_tickets/t1')!;
    expect(doc.status).toBe('closed');
    expect(doc.closedBy).toBe('customer');
  });

  it('403s on someone else’s ticket', async () => {
    seed('t2', 'someone-else');
    expect((await post('/api/support/my-close', { ticketId: 't2' })).status).toBe(403);
  });
});
