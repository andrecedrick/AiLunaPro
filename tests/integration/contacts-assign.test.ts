import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Contact assignment + CSV import routes.
 *
 * The two together are what makes ownership real: assignment decides who holds a
 * lead, import is the bulk path that must never create a lead nobody holds.
 */

const state = vi.hoisted(() => ({
  members: new Map<string, { role: string; email: string; status?: string }>(), // `${orgId}/${uid}`
  docs:    new Map<string, Record<string, unknown>>(),
  commits: [] as number[],
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
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) return state.members.get(`${m[1]}/${m[2]}`) ?? null;
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
    const prev = opts?.merge ? (state.docs.get(path) ?? {}) : {};
    state.docs.set(path, { ...prev, ...data });
  }),
  firestoreDelete: vi.fn(async () => {}),
  // The import writes the whole batch in one commit. Recorded so a test can
  // assert it is ONE round trip and not one per row.
  firestoreCommit: vi.fn(async (_sa: string, writes: Array<{ path: string; data: Record<string, unknown> }>) => {
    state.commits.push(writes.length);
    for (const w of writes) state.docs.set(w.path, { ...(state.docs.get(w.path) ?? {}), ...w.data });
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string }>)[0];
    const out: Array<{ name: string; fields: Record<string, unknown> }> = [];
    if (from.collectionId === 'members') {
      for (const [k, v] of state.members) {
        const [orgId, uid] = k.split('/');
        if (`organizations/${orgId}` === parent) out.push({ name: `organizations/${orgId}/members/${uid}`, fields: v });
      }
      return out;
    }
    for (const [p, f] of state.docs) {
      if (p.startsWith(`${parent}/contacts/`)) out.push({ name: p, fields: f });
    }
    return out;
  }),
}));

import assignRoutes from '../../worker/src/routes/contacts-assign';
import importRoutes from '../../worker/src/routes/contacts-import';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;
const OPS = 'ops@ailuna.com';

const H = (uid: string, email?: string) => {
  const h: Record<string, string> = { 'Content-Type': 'application/json', 'x-test-uid': uid };
  if (email) h['x-test-email'] = email;
  return h;
};
const post = (app: typeof assignRoutes, path: string, uid: string, body: unknown, email?: string) =>
  app.request(path, { method: 'POST', headers: H(uid, email), body: JSON.stringify(body) }, ENV);

const CONTACT = 'organizations/orgA/contacts/c1';

beforeEach(() => {
  state.members.clear(); state.docs.clear(); state.commits.length = 0; vi.clearAllMocks();
  state.members.set('orgA/sales1', { role: 'member', email: 'sales1@acme.com' });
  state.members.set('orgA/sales2', { role: 'admin',  email: 'sales2@acme.com' });
  state.members.set('orgA/gone',   { role: 'member', email: 'gone@acme.com', status: 'disabled' });
  state.members.set('orgA/payer',  { role: 'billing', email: 'payer@acme.com' });
  state.docs.set(CONTACT, {
    contactId: 'c1', orgId: 'orgA', name: 'Lead', email: 'lead@x.com', emailKey: 'lead@x.com',
    company: 'Acme', createdByUid: 'prospect', assignedToUid: '',
  });
});

describe('assignment — who may assign', () => {
  it('a super admin assigns; the ledger records who and when', async () => {
    const r = await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: 'sales1' }, OPS);
    expect(r.status).toBe(200);
    const doc = state.docs.get(CONTACT)!;
    expect(doc.assignedToUid).toBe('sales1');
    expect(doc.assignedToEmail).toBe('sales1@acme.com');
    expect(doc.owner).toBe('sales1@acme.com');       // the display column stays in step
    expect(doc.assignedByEmail).toBe(OPS);
    expect(doc.assignedAt).toBeTruthy();
    expect(doc.lastReassignedAt).toBeUndefined();    // first assignment is not a transfer
  });

  /**
   * The ownership ledger on the contact records only the CURRENT holder, and a
   * transfer overwrites assignedAt — so the write that ends a tenure destroys
   * the evidence of it. Without a timeline event, "who had this lead in July"
   * was unanswerable. TIMELINE_KINDS declared assigned/reassigned/unassigned and
   * nothing ever wrote them.
   */
  it('writes an ASSIGNED event to the timeline', async () => {
    await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: 'sales1' }, OPS);
    const ev = [...state.docs.entries()].find(([p]) => p.includes('/contacts/c1/timeline/'))![1] as Record<string, string>;
    expect(ev).toMatchObject({ kind: 'assigned', actor: OPS, data_to: 'sales1' });
    expect(ev.summary).toContain('Assigned to');
  });

  it('records a transfer as REASSIGNED, keeping the previous holder', async () => {
    await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: 'sales1' }, OPS);
    await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: 'sales2' }, OPS);
    const evs = [...state.docs.entries()]
      .filter(([p]) => p.includes('/contacts/c1/timeline/'))
      .map(([, f]) => f as Record<string, string>);
    const re = evs.find(e => e.kind === 'reassigned')!;
    expect(re).toMatchObject({ data_from: 'sales1', data_to: 'sales2' });
    // Both events survive: the history is append-only.
    expect(evs.map(e => e.kind).sort()).toEqual(['assigned', 'reassigned']);
  });

  it('records an UNASSIGN', async () => {
    await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: 'sales1' }, OPS);
    await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: '' }, OPS);
    const kinds = [...state.docs.entries()]
      .filter(([p]) => p.includes('/contacts/c1/timeline/'))
      .map(([, f]) => (f as Record<string, string>).kind);
    expect(kinds).toContain('unassigned');
  });

  it('an ORG ADMIN cannot assign (403) — assignment is not a role power', async () => {
    const r = await post(assignRoutes, '/api/contacts/assign', 'sales2', { orgId: 'orgA', contactId: 'c1', assignToUid: 'sales1' }, 'sales2@acme.com');
    expect(r.status).toBe(403);
    expect(state.docs.get(CONTACT)!.assignedToUid).toBe('');
  });
});

describe('assignment — transfer and unassign', () => {
  const assign = (to: string) => post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'c1', assignToUid: to }, OPS);

  it('a second assignment is recorded as a TRANSFER', async () => {
    await assign('sales1');
    const r = await assign('sales2');
    expect(r.status).toBe(200);
    expect((await r.json()).transferred).toBe(true);
    const doc = state.docs.get(CONTACT)!;
    expect(doc.assignedToUid).toBe('sales2');
    expect(doc.lastReassignedByEmail).toBe(OPS);
    expect(doc.lastReassignedAt).toBeTruthy();
  });

  it('an empty target UNASSIGNS, so a misassignment can be undone', async () => {
    await assign('sales1');
    expect((await assign('')).status).toBe(200);
    const doc = state.docs.get(CONTACT)!;
    expect(doc.assignedToUid).toBe('');
    expect(doc.assignedToEmail).toBe('');
  });

  it('re-assigning to the SAME holder is not reported as a transfer', async () => {
    await assign('sales1');
    expect((await (await assign('sales1')).json()).transferred).toBe(false);
  });

  it('refuses a target who is not a member, or is disabled', async () => {
    expect((await assign('stranger')).status).toBe(400);
    expect((await assign('gone')).status).toBe(400);
    expect(state.docs.get(CONTACT)!.assignedToUid).toBe('');
  });

  it('404s on a contact that does not exist', async () => {
    const r = await post(assignRoutes, '/api/contacts/assign', 'ops', { orgId: 'orgA', contactId: 'nope', assignToUid: 'sales1' }, OPS);
    expect(r.status).toBe(404);
  });
});

describe('assignable members', () => {
  const get = (uid: string, email?: string) =>
    assignRoutes.request('/api/contacts/assignable?orgId=orgA', { headers: H(uid, email) }, ENV);

  it('lists only enabled content roles', async () => {
    const { members } = await (await get('ops', OPS)).json() as { members: Array<{ uid: string }> };
    expect(members.map(m => m.uid).sort()).toEqual(['sales1', 'sales2']); // no billing, no disabled
  });

  it('is super-admin only', async () => {
    expect((await get('sales2', 'sales2@acme.com')).status).toBe(403);
  });
});

describe('CSV import', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `P${i}`, email: `p${i}@x.com`, company: 'Acme' }));
  const doImport = (uid: string, body: unknown, email?: string) =>
    post(importRoutes, '/api/contacts/import', uid, body, email);

  it('a member can import, and the rows land ASSIGNED TO THEM', async () => {
    const r = await doImport('sales1', { orgId: 'orgA', rows: rows(3) }, 'sales1@acme.com');
    expect(r.status).toBe(200);
    expect((await r.json()).imported).toBe(3);
    const written = [...state.docs.values()].filter(d => d.source === 'import');
    expect(written).toHaveLength(3);
    expect(written.every(d => d.assignedToUid === 'sales1')).toBe(true);
    expect(written.every(d => d.assignedToEmail === 'sales1@acme.com')).toBe(true);
  });

  it('skips a row already in the org and still imports the rest', async () => {
    await doImport('sales1', { orgId: 'orgA', rows: [{ name: 'A', email: 'lead@x.com', company: 'Acme' }, ...rows(1)] }, 'sales1@acme.com');
    const res = await (await doImport('sales1', { orgId: 'orgA', rows: [{ name: 'B', email: 'p0@x.com', company: 'Acme' }] }, 'sales1@acme.com')).json() as { imported: number; rejected: Array<{ code: string }> };
    expect(res.imported).toBe(0);
    expect(res.rejected[0].code).toBe('DUPLICATE_EXISTING');
  });

  it('billing is refused entirely (requireRole 403)', async () => {
    expect((await doImport('payer', { orgId: 'orgA', rows: rows(1) }, 'payer@acme.com')).status).toBe(403);
  });

  it('only a super admin may direct an import at someone else', async () => {
    const denied = await doImport('sales1', { orgId: 'orgA', rows: rows(1), assignToUid: 'sales2' }, 'sales1@acme.com');
    expect(denied.status).toBe(403);
    expect((await denied.json()).code).toBe('FORBIDDEN_ASSIGN');
  });

  it('a super admin CAN direct an import at a member', async () => {
    state.members.set('orgA/boss', { role: 'owner', email: OPS });
    const r = await doImport('boss', { orgId: 'orgA', rows: rows(2), assignToUid: 'sales2' }, OPS);
    expect(r.status).toBe(200);
    const written = [...state.docs.values()].filter(d => d.source === 'import');
    expect(written.every(d => d.assignedToUid === 'sales2')).toBe(true);
  });

  it('an oversized batch is refused with a code the UI can explain', async () => {
    const r = await doImport('sales1', { orgId: 'orgA', rows: rows(501) }, 'sales1@acme.com');
    expect(r.status).toBe(413);
    expect((await r.json()).code).toBe('BATCH_TOO_LARGE');
  });

  it('an empty batch is a no-op, not an error', async () => {
    const r = await doImport('sales1', { orgId: 'orgA', rows: [] }, 'sales1@acme.com');
    expect(r.status).toBe(200);
    expect((await r.json()).imported).toBe(0);
  });

  it('handles a FULL batch of 500 rows', async () => {
    const r = await doImport('sales1', { orgId: 'orgA', rows: rows(500) }, 'sales1@acme.com');
    expect((await r.json()).imported).toBe(500);
  });

  /**
   * The performance regression this guards: the route wrote each contact with
   * its own PATCH in waves of 8, so 500 rows meant ~63 sequential round trips —
   * tens of seconds during which the modal looked frozen.
   */
  it('writes the whole batch in ONE commit, not one round trip per row', async () => {
    await doImport('sales1', { orgId: 'orgA', rows: rows(500) }, 'sales1@acme.com');
    expect(state.commits).toEqual([500]);
  });

  it('reads only the emailKey column when checking for duplicates', async () => {
    const { firestoreRunQuery } = await import('../../worker/src/lib/firestoreAdmin');
    await doImport('sales1', { orgId: 'orgA', rows: rows(1) }, 'sales1@acme.com');
    const call = vi.mocked(firestoreRunQuery).mock.calls.find(c => (c[1] as { select?: unknown }).select);
    expect(call).toBeTruthy();
    expect((call![1] as { select: { fields: Array<{ fieldPath: string }> } }).select.fields)
      .toEqual([{ fieldPath: 'emailKey' }]);
  });

  it('a failed commit reports EVERY row as failed — never a silent partial', async () => {
    const { firestoreCommit } = await import('../../worker/src/lib/firestoreAdmin');
    vi.mocked(firestoreCommit).mockRejectedValueOnce(new Error('commit exploded'));
    const res = await (await doImport('sales1', { orgId: 'orgA', rows: rows(4) }, 'sales1@acme.com')).json() as
      { imported: number; rejected: Array<{ code: string }> };
    expect(res.imported).toBe(0);
    expect(res.rejected).toHaveLength(4);
    expect(res.rejected.every(r => r.code === 'WRITE_FAILED')).toBe(true);
  });
});
