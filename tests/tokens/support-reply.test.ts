import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Support reply + status (Customer Response Center, Phases 2/3).
 *
 * Proves: a reply appends to the conversation history, flips status to
 * 'answered', persists BEFORE the email (a mail failure never loses the reply),
 * and emails the ticket contact; close sets status/closedAt/closedBy; status is
 * validated; an unknown ticket 404s; and the read surfaces replies + close event
 * for the timeline.
 */

const store = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), emailOk: true, emailCalls: [] as unknown[] }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>, o?: { merge?: boolean }) => {
    const cur = store.docs.get(p);
    store.docs.set(p, o?.merge && cur ? { ...cur, ...data } : { ...data });
  }),
  firestoreRunQuery: vi.fn(async () => [...store.docs.entries()]
    .filter(([k]) => k.startsWith('support_tickets/'))
    .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }))),
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_key: string, payload: unknown) => { store.emailCalls.push(payload); return { ok: store.emailOk }; }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => { c.set('email', 'operator@ailunapro.com'); await next(); },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));

import { sendTransactional } from '../../worker/src/lib/sequenzy';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}' };

async function route() { return (await import('../../worker/src/routes/platform-feedback')).default; }
async function post(path: string, bodyObj: unknown) {
  const r = await route();
  const res = await r.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj) }, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}
async function getSupport() {
  const r = await route();
  const res = await r.request('/api/platform/support', {}, ENV);
  return await res.json() as Record<string, never>;
}

function seedTicket(id: string, o: Record<string, unknown> = {}) {
  store.docs.set(`support_tickets/${id}`, {
    id, type: 'bug', status: 'open', email: 'cust@corp.com', phone: '+33612345678',
    description: 'it broke', context: { route: 'quote' }, cf: { country: 'FR' },
    createdAt: '2026-07-24T10:00:00Z', ...o,
  });
}

beforeEach(() => { store.docs.clear(); store.emailOk = true; store.emailCalls = []; vi.resetModules(); });

describe('POST /api/platform/support/reply', () => {
  it('appends the reply, flips to answered, and emails the contact', async () => {
    seedTicket('t1');
    const { status, body } = await post('/api/platform/support/reply', { ticketId: 't1', message: 'Here is the fix.' });
    expect(status).toBe(200);
    expect(body.status as unknown as string).toBe('answered');
    expect(body.emailed as unknown as boolean).toBe(true);

    const doc = store.docs.get('support_tickets/t1')!;
    expect(doc.status).toBe('answered');
    const replies = doc.replies as Array<Record<string, string>>;
    expect(replies).toHaveLength(1);
    expect(replies[0].message).toBe('Here is the fix.');
    expect(replies[0].repliedBy).toBe('operator@ailunapro.com');
    expect(sendTransactional).toHaveBeenCalled();
  });

  it('persists the reply even when the email FAILS (emailed:false, reply kept)', async () => {
    seedTicket('t2');
    store.emailOk = false;
    const { body } = await post('/api/platform/support/reply', { ticketId: 't2', message: 'reply' });
    expect(body.emailed as unknown as boolean).toBe(false);
    expect((store.docs.get('support_tickets/t2')!.replies as unknown[])).toHaveLength(1); // NOT lost
  });

  it('rejects an empty message and an unknown ticket', async () => {
    seedTicket('t3');
    expect((await post('/api/platform/support/reply', { ticketId: 't3', message: '   ' })).status).toBe(400);
    expect((await post('/api/platform/support/reply', { ticketId: 'nope', message: 'x' })).status).toBe(404);
  });

  it('accumulates multiple replies in order', async () => {
    seedTicket('t4');
    await post('/api/platform/support/reply', { ticketId: 't4', message: 'first' });
    await post('/api/platform/support/reply', { ticketId: 't4', message: 'second' });
    const replies = store.docs.get('support_tickets/t4')!.replies as Array<Record<string, string>>;
    expect(replies.map(r => r.message)).toEqual(['first', 'second']);
  });
});

describe('POST /api/platform/support/status', () => {
  it('closes a ticket, recording closedAt + closedBy', async () => {
    seedTicket('t5', { status: 'answered' });
    const { status, body } = await post('/api/platform/support/status', { ticketId: 't5', status: 'closed' });
    expect(status).toBe(200);
    expect(body.status as unknown as string).toBe('closed');
    const doc = store.docs.get('support_tickets/t5')!;
    expect(doc.status).toBe('closed');
    expect(doc.closedBy).toBe('operator@ailunapro.com');
    expect(doc.closedAt).toBeTruthy();
  });

  it('rejects an invalid status', async () => {
    seedTicket('t6');
    expect((await post('/api/platform/support/status', { ticketId: 't6', status: 'archived' })).status).toBe(400);
  });
});

describe('GET /api/platform/support — timeline + counters', () => {
  it('surfaces replies + close event and counts open/awaiting', async () => {
    seedTicket('a', { status: 'open' });                              // awaiting
    seedTicket('b', { status: 'answered', replies: [{ message: 'hi', repliedAt: 'x', repliedBy: 'op' }] });
    seedTicket('c', { status: 'closed', closedAt: '2026-07-24T12:00:00Z', closedBy: 'op' });
    const body = await getSupport();
    expect(body.total as unknown as number).toBe(3);
    expect(body.open as unknown as number).toBe(2);      // open + answered (not closed)
    expect(body.awaiting as unknown as number).toBe(1);  // only 'open'
    const items = body.items as unknown as Array<{ id: string; replies: unknown[]; closedBy: string }>;
    const b = items.find(i => i.id === 'b')!;
    expect(b.replies).toHaveLength(1);
    const cc = items.find(i => i.id === 'c')!;
    expect(cc.closedBy).toBe('op');
  });
});
