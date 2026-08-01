import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * GET /api/contacts/one — the sales-queue click path.
 *
 * The incident: opening a lead from the follow-up queue listed up to 200 contacts
 * and searched them in memory. For a SUPER ADMIN the queue is cross-org, so the
 * list call targeted the prospect's organisation, hit requireRole, and 403'd —
 * a platform operator is deliberately never a member of a tenant org. The client
 * swallowed the error, so the panel never opened and nothing was reported. An
 * admin never saw it because their queue only ever contains their own org.
 *
 * These tests pin the read cost AND the cross-org case that was actually broken.
 */

const state = vi.hoisted(() => ({
  members: new Map<string, Record<string, unknown>>(),
  docs:    new Map<string, Record<string, unknown>>(),
  /** Every firestoreGet path, so read COUNT is assertable. */
  reads:   [] as string[],
}));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', c.req.header('x-test-uid') ?? 'anon');
    const em = c.req.header('x-test-email'); if (em) c.set('email', em);
    c.set('emailVerified', true);
    await next();
  },
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    state.reads.push(path);
    if (path.includes('/members/')) return state.members.get(path) ?? null;
    return state.docs.get(path) ?? null;
  }),
  firestoreRunQuery: vi.fn(async () => { throw new Error('the single-contact route must never run a query'); }),
}));

import one from '../../worker/src/routes/contacts-one';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;
const OPS = 'ops@ailuna.com';

const get = (orgId: string, contactId: string, uid: string, email?: string) => {
  const h: Record<string, string> = { 'x-test-uid': uid };
  if (email) h['x-test-email'] = email;
  return one.request(`/api/contacts/one?orgId=${orgId}&contactId=${contactId}`, { headers: h }, ENV);
};

beforeEach(() => {
  state.members.clear(); state.docs.clear(); state.reads.length = 0; vi.clearAllMocks();
  state.members.set('organizations/orgA/members/sales1', { role: 'member', email: 'sales1@acme.com' });
  state.members.set('organizations/orgA/members/sales2', { role: 'member', email: 'sales2@acme.com' });
  state.docs.set('organizations/orgA/contacts/c1', {
    contactId: 'c1', name: 'Derrick Chapman', company: 'Greyvoid', email: 'd@x.com',
    assignedToUid: 'sales1', createdByUid: 'sales1', leadStatus: 'new',
    pipelineStatus: 'contacted', nextFollowUpAt: '2026-08-01T00:00:00.000Z',
  });
  // A lead living in a PROSPECT's own workspace — where signup leads actually land.
  state.docs.set('organizations/orgProspect/contacts/c9', {
    contactId: 'c9', name: 'John Martin', company: 'ECODE', email: 'j@x.com',
    assignedToUid: '', createdByUid: 'someone',
  });
});

describe('read cost', () => {
  it('costs TWO document reads for a member: membership, then the contact', async () => {
    const res = await get('orgA', 'c1', 'sales1', 'sales1@acme.com');
    expect(res.status).toBe(200);
    expect(state.reads).toEqual([
      'organizations/orgA/members/sales1',
      'organizations/orgA/contacts/c1',
    ]);
  });

  it('costs ONE document read for a super admin — no membership lookup needed', async () => {
    const res = await get('orgA', 'c1', 'ops', OPS);
    expect(res.status).toBe(200);
    expect(state.reads).toEqual(['organizations/orgA/contacts/c1']);
  });

  it('never runs a collection query — the old path listed 200 contacts', async () => {
    const { firestoreRunQuery } = await import('../../worker/src/lib/firestoreAdmin');
    await get('orgA', 'c1', 'sales1', 'sales1@acme.com');
    expect(firestoreRunQuery).not.toHaveBeenCalled();
  });
});

describe('cross-org — the case that was broken', () => {
  it('a SUPER ADMIN opens a lead in an org they are not a member of', async () => {
    // This is the exact click that used to do nothing: operator, prospect's org.
    const res = await get('orgProspect', 'c9', 'ops', OPS);
    expect(res.status).toBe(200);
    const body = await res.json() as { contact: { name: string; company: string; orgId: string } };
    expect(body.contact).toMatchObject({ name: 'John Martin', company: 'ECODE', orgId: 'orgProspect' });
  });

  it('a non-member who is NOT an operator is still refused', async () => {
    const res = await get('orgProspect', 'c9', 'sales1', 'sales1@acme.com');
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('FORBIDDEN');
  });
});

describe('authorisation', () => {
  it('a member cannot read a colleague\'s lead', async () => {
    const res = await get('orgA', 'c1', 'sales2', 'sales2@acme.com');
    expect(res.status).toBe(403);
  });

  it('a disabled member is refused before the contact is even read', async () => {
    state.members.set('organizations/orgA/members/sales1', { role: 'member', status: 'disabled' });
    const res = await get('orgA', 'c1', 'sales1', 'sales1@acme.com');
    expect(res.status).toBe(403);
    expect(state.reads).not.toContain('organizations/orgA/contacts/c1');
  });

  it('404s on an unknown contact and 400s on a missing parameter', async () => {
    expect((await get('orgA', 'nope', 'ops', OPS)).status).toBe(404);
    expect((await one.request('/api/contacts/one?orgId=orgA', { headers: { 'x-test-uid': 'ops', 'x-test-email': OPS } }, ENV)).status).toBe(400);
  });
});

describe('payload', () => {
  it('carries the pipeline fields the detail panel renders', async () => {
    const body = await (await get('orgA', 'c1', 'ops', OPS)).json() as { contact: Record<string, unknown> };
    // A missing projection here shows up as a blank panel field, which is exactly
    // the drift that having two copies of the mapper would have caused.
    expect(body.contact).toMatchObject({
      pipelineStatus: 'contacted',
      nextFollowUpAt: '2026-08-01T00:00:00.000Z',
      assignedToUid: 'sales1',
      company: 'Greyvoid',
    });
  });
});
