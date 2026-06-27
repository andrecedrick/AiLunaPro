import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Contacts route — RBAC (real requireRole + requirePlatformAdmin), org isolation,
 * dedup, member ownership, super-admin cross-org READ-ONLY.
 */

const state = vi.hoisted(() => ({
  roles: new Map<string, string>(),                 // `${orgId}/${uid}` -> role
  docs:  new Map<string, Record<string, unknown>>(),// full path -> fields
}));

// Auth middleware: set uid/email/emailVerified from headers (real requireRole/platformAdmin run).
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
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) { const r = state.roles.get(`${m[1]}/${m[2]}`); return r ? { role: r } : null; }
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
    const prev = opts?.merge ? (state.docs.get(path) ?? {}) : {};
    state.docs.set(path, { ...prev, ...data });
  }),
  firestoreDelete: vi.fn(async (_sa: string, path: string) => { state.docs.delete(path); }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string; allDescendants?: boolean }>)[0];
    const where = sq.where as { fieldFilter?: { field: { fieldPath: string }; value: { stringValue: string } } } | undefined;
    const out: Array<{ name: string; fields: Record<string, unknown> }> = [];
    for (const [p, f] of state.docs) {
      const isContact = from.allDescendants
        ? /^organizations\/[^/]+\/contacts\/[^/]+$/.test(p)               // cross-org
        : p.startsWith(`${parent}/contacts/`);                            // org-scoped
      if (!isContact) continue;
      if (where?.fieldFilter) {
        const { field, value } = where.fieldFilter;
        if ((f[field.fieldPath] ?? '') !== value.stringValue) continue;
      }
      out.push({ name: p, fields: f });
    }
    return out;
  }),
}));

import contacts, { contactsPlatform } from '../../worker/src/routes/contacts';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;

const H = (uid: string, email?: string) => {
  const h: Record<string, string> = { 'Content-Type': 'application/json', 'x-test-uid': uid };
  if (email) h['x-test-email'] = email;
  return h;
};
const create = (app: typeof contacts, uid: string, body: unknown, email?: string) =>
  app.request('/api/contacts/create', { method: 'POST', headers: H(uid, email), body: JSON.stringify(body) }, ENV);
const list = (uid: string, q = '', email?: string) =>
  contacts.request(`/api/contacts/list?orgId=orgA${q}`, { headers: H(uid, email) }, ENV);

beforeEach(() => { state.roles.clear(); state.docs.clear(); vi.clearAllMocks(); });

describe('contacts — RBAC create/list', () => {
  beforeEach(() => {
    state.roles.set('orgA/owner1', 'owner');
    state.roles.set('orgA/admin1', 'admin');
    state.roles.set('orgA/mem1', 'member');
    state.roles.set('orgA/mem2', 'member');
    state.roles.set('orgA/bill1', 'billing');
    state.roles.set('orgA/cli1', 'client');
  });

  it('billing and client are denied (requireRole 403)', async () => {
    expect((await create(contacts, 'bill1', { orgId: 'orgA', name: 'A', email: 'a@x.com' })).status).toBe(403);
    expect((await create(contacts, 'cli1', { orgId: 'orgA', name: 'A', email: 'a@x.com' })).status).toBe(403);
    expect((await list('bill1')).status).toBe(403);
    expect((await list('cli1')).status).toBe(403);
  });

  it('owner/admin/member can create; invalid email rejected', async () => {
    expect((await create(contacts, 'owner1', { orgId: 'orgA', name: 'A', email: 'a@x.com' })).status).toBe(200);
    expect((await create(contacts, 'mem1', { orgId: 'orgA', name: 'B', email: 'b@x.com' })).status).toBe(200);
    expect((await create(contacts, 'owner1', { orgId: 'orgA', name: 'C', email: 'not-an-email' })).status).toBe(400);
  });

  it('owner sees ALL org contacts; member sees only own', async () => {
    await create(contacts, 'mem1', { orgId: 'orgA', name: 'Mine', email: 'm1@x.com' });
    await create(contacts, 'mem2', { orgId: 'orgA', name: 'Other', email: 'm2@x.com' });
    const ownerList = await (await list('owner1')).json() as { contacts: Array<{ email: string }> };
    expect(ownerList.contacts.map(c => c.email).sort()).toEqual(['m1@x.com', 'm2@x.com']);
    const memList = await (await list('mem1')).json() as { contacts: Array<{ email: string }> };
    expect(memList.contacts.map(c => c.email)).toEqual(['m1@x.com']);
  });

  it('filters by tag / source / status', async () => {
    await create(contacts, 'owner1', { orgId: 'orgA', name: 'T', email: 't@x.com', tags: ['vip'], source: 'quote', status: 'inactive' });
    await create(contacts, 'owner1', { orgId: 'orgA', name: 'U', email: 'u@x.com', tags: ['cold'], source: 'manual' });
    expect((await (await list('owner1', '&tag=vip')).json() as { contacts: unknown[] }).contacts.length).toBe(1);
    expect((await (await list('owner1', '&source=quote')).json() as { contacts: unknown[] }).contacts.length).toBe(1);
    expect((await (await list('owner1', '&status=inactive')).json() as { contacts: unknown[] }).contacts.length).toBe(1);
  });
});

describe('contacts — dedup + isolation', () => {
  beforeEach(() => {
    state.roles.set('orgA/owner1', 'owner');
    state.roles.set('orgB/owner1', 'owner'); // same uid, member of both orgs
  });

  it('duplicate email in same org -> 409; same email in a DIFFERENT org -> 200', async () => {
    expect((await create(contacts, 'owner1', { orgId: 'orgA', name: 'A', email: 'dup@x.com' })).status).toBe(200);
    expect((await create(contacts, 'owner1', { orgId: 'orgA', name: 'A2', email: 'DUP@x.com' })).status).toBe(409); // case-insensitive
    expect((await create(contacts, 'owner1', { orgId: 'orgB', name: 'B', email: 'dup@x.com' })).status).toBe(200);
  });

  it('cross-tenant: a member of A cannot create/list under org B (requireRole 403)', async () => {
    state.roles.set('orgA/memX', 'member'); // memX is ONLY in orgA
    expect((await create(contacts, 'memX', { orgId: 'orgB', name: 'X', email: 'x@x.com' })).status).toBe(403);
    expect((await contacts.request('/api/contacts/list?orgId=orgB', { headers: H('memX') }, ENV)).status).toBe(403);
  });
});

describe('contacts — patch/delete ownership + block gating', () => {
  let mineId = '', othersId = '';
  beforeEach(async () => {
    state.roles.set('orgA/owner1', 'owner');
    state.roles.set('orgA/mem1', 'member');
    state.roles.set('orgA/mem2', 'member');
    mineId = (await (await create(contacts, 'mem1', { orgId: 'orgA', name: 'Mine', email: 'mine@x.com' })).json() as { contactId: string }).contactId;
    othersId = (await (await create(contacts, 'mem2', { orgId: 'orgA', name: 'Other', email: 'other@x.com' })).json() as { contactId: string }).contactId;
  });
  const patch = (uid: string, id: string, body: unknown) =>
    contacts.request(`/api/contacts/${id}`, { method: 'PATCH', headers: H(uid), body: JSON.stringify({ orgId: 'orgA', ...(body as object) }) }, ENV);
  const del = (uid: string, id: string) =>
    contacts.request(`/api/contacts/${id}?orgId=orgA`, { method: 'DELETE', headers: H(uid) }, ENV);

  it('member edits own (200) but not another member\'s (403)', async () => {
    expect((await patch('mem1', mineId, { company: 'Acme' })).status).toBe(200);
    expect((await patch('mem1', othersId, { company: 'Hack' })).status).toBe(403);
  });

  it('member CANNOT block (status change) — owner/admin only', async () => {
    const r = await patch('mem1', mineId, { status: 'blocked' });
    expect(r.status).toBe(403);
    expect((await r.json()).code).toBe('FORBIDDEN_STATUS');
    expect((await patch('owner1', mineId, { status: 'blocked' })).status).toBe(200); // owner can block any
  });

  it('member deletes own (200), not another\'s (403); owner deletes any (200)', async () => {
    expect((await del('mem1', othersId)).status).toBe(403);
    expect((await del('mem1', mineId)).status).toBe(200);
    expect((await del('owner1', othersId)).status).toBe(200);
  });
});

describe('contacts — super-admin cross-org READ ONLY', () => {
  beforeEach(async () => {
    state.roles.set('orgA/owner1', 'owner');
    state.roles.set('orgB/owner2', 'owner');
    await create(contacts, 'owner1', { orgId: 'orgA', name: 'A', email: 'a@x.com' });
    await create(contacts, 'owner2', { orgId: 'orgB', name: 'B', email: 'b@x.com' });
  });

  it('platform operator reads ALL contacts across orgs (with orgId)', async () => {
    const res = await contactsPlatform.request('/api/contacts/all', { headers: H('ops', 'ops@ailuna.com') }, ENV);
    expect(res.status).toBe(200);
    const { contacts: all } = await res.json() as { contacts: Array<{ email: string; orgId: string }> };
    expect(all.map(c => `${c.orgId}:${c.email}`).sort()).toEqual(['orgA:a@x.com', 'orgB:b@x.com']);
  });

  it('a non-operator email is denied /all (403)', async () => {
    const res = await contactsPlatform.request('/api/contacts/all', { headers: H('owner1', 'owner1@acme.com') }, ENV);
    expect(res.status).toBe(403);
  });

  it('super-admin has NO write path — operator with no org membership cannot create (403)', async () => {
    const res = await create(contacts, 'ops', { orgId: 'orgA', name: 'Z', email: 'z@x.com' }, 'ops@ailuna.com');
    expect(res.status).toBe(403); // requireRole: operator is not a member of orgA
  });
});
