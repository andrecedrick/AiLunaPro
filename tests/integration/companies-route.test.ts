import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Company registry API — list, rename, merge, reconcile. SUPER ADMIN ONLY.
 *
 * The properties under test are the destructive ones: a rename must not strand
 * the contacts that render the old name, a merge must move every contact and
 * must not delete the evidence that two names were one company, and reconcile
 * must not write anything unless it is explicitly told to.
 */

const state = vi.hoisted(() => ({
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
  COMMIT_MAX_WRITES: 500,
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreCommit: vi.fn(async (_sa: string, writes: Array<{ path: string; data: Record<string, unknown> }>) => {
    state.commits.push(writes.length);
    for (const w of writes) state.docs.set(w.path, { ...(state.docs.get(w.path) ?? {}), ...w.data });
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string; allDescendants?: boolean }>)[0];
    const where = sq.where as { fieldFilter?: { field: { fieldPath: string }; value: { stringValue: string } } } | undefined;
    const re = from.allDescendants
      ? new RegExp(`^organizations/[^/]+/${from.collectionId}/[^/]+$`)
      : new RegExp(`^${parent}/${from.collectionId}/[^/]+$`);
    return [...state.docs.entries()]
      .filter(([p]) => re.test(p))
      .filter(([, f]) => !where?.fieldFilter ||
        (f[where.fieldFilter.field.fieldPath] ?? '') === where.fieldFilter.value.stringValue)
      .map(([name, fields]) => ({ name, fields }));
  }),
}));

import companies from '../../worker/src/routes/companies';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;
const OPS = 'ops@ailuna.com';
const H = (uid = 'ops', email: string | undefined = OPS) => {
  const h: Record<string, string> = { 'Content-Type': 'application/json', 'x-test-uid': uid };
  if (email) h['x-test-email'] = email;
  return h;
};

const req = (path: string, method: string, body?: unknown, uid?: string, email?: string) =>
  companies.request(path, { method, headers: H(uid, email), ...(body ? { body: JSON.stringify(body) } : {}) }, ENV);

const company = (orgId: string, id: string, f: Record<string, unknown>) =>
  state.docs.set(`organizations/${orgId}/companies/${id}`, {
    companyId: id, orgId, name: id, nameKey: id, source: 'manual',
    twentyCompanyId: '', createdByUid: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    mergedIntoId: '', ...f,
  });

const contact = (orgId: string, id: string, f: Record<string, unknown>) =>
  state.docs.set(`organizations/${orgId}/contacts/${id}`, { companyId: '', company: '', twentyCompanyId: '', ...f });

beforeEach(() => { state.docs.clear(); state.commits.length = 0; vi.clearAllMocks(); });

describe('registry listing', () => {
  it('is super-admin only', async () => {
    expect((await req('/api/companies/all', 'GET', undefined, 'someone', 'a@b.com')).status).toBe(403);
  });

  it('lists companies with a live contact count', async () => {
    company('orgA', 'c1', { name: 'Acme', nameKey: 'acme', twentyCompanyId: 'tw-1' });
    contact('orgA', 'ct1', { companyId: 'c1', company: 'Acme' });
    contact('orgA', 'ct2', { companyId: 'c1', company: 'Acme' });
    const body = await (await req('/api/companies/all', 'GET')).json() as { companies: Array<Record<string, unknown>> };
    expect(body.companies).toHaveLength(1);
    expect(body.companies[0]).toMatchObject({ name: 'Acme', contactCount: 2, twentyCompanyId: 'tw-1' });
  });

  it('hides merged tombstones from the UI but keeps them in Firestore', async () => {
    company('orgA', 'keep', { name: 'Acme', nameKey: 'acme' });
    company('orgA', 'gone', { name: 'ACME Ltd', nameKey: 'acme', mergedIntoId: 'keep' });
    const body = await (await req('/api/companies/all', 'GET')).json() as { companies: Array<{ name: string }> };
    expect(body.companies.map(c => c.name)).toEqual(['Acme']);
    expect(state.docs.get('organizations/orgA/companies/gone')).toBeTruthy();
  });
});

describe('rename', () => {
  beforeEach(() => {
    company('orgA', 'c1', { name: 'acme ltd', nameKey: 'acme' });
    contact('orgA', 'ct1', { companyId: 'c1', company: 'acme ltd' });
    contact('orgA', 'ct2', { companyId: 'other', company: 'Other' });
  });

  it('renames the company AND every contact that renders the old name', async () => {
    const res = await req('/api/companies/c1', 'PATCH', { orgId: 'orgA', name: 'Acme Ltd.' });
    expect(res.status).toBe(200);
    expect(state.docs.get('organizations/orgA/companies/c1')!.name).toBe('Acme Ltd.');
    // Leaving the contact string stale would show the old name in the table and
    // in every CSV export, which is where operators actually read it.
    expect(state.docs.get('organizations/orgA/contacts/ct1')!.company).toBe('Acme Ltd.');
    expect(state.docs.get('organizations/orgA/contacts/ct2')!.company).toBe('Other');
  });

  it('records who changed it and when', async () => {
    await req('/api/companies/c1', 'PATCH', { orgId: 'orgA', name: 'Acme Ltd.' });
    expect(state.docs.get('organizations/orgA/companies/c1')!.updatedByEmail).toBe(OPS);
  });

  it('refuses a rename ONTO an existing company — that is a merge', async () => {
    company('orgA', 'c2', { name: 'Northwind', nameKey: 'northwind' });
    const res = await req('/api/companies/c1', 'PATCH', { orgId: 'orgA', name: 'Northwind' });
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('DUPLICATE_COMPANY');
  });

  it('allows a cosmetic rename that keeps the same key', async () => {
    expect((await req('/api/companies/c1', 'PATCH', { orgId: 'orgA', name: 'ACME, Ltd.' })).status).toBe(200);
  });

  it('refuses a name that normalises to nothing', async () => {
    const res = await req('/api/companies/c1', 'PATCH', { orgId: 'orgA', name: '---' });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('INVALID_NAME');
  });

  it('404s on an unknown company', async () => {
    expect((await req('/api/companies/nope', 'PATCH', { orgId: 'orgA', name: 'X' })).status).toBe(404);
  });
});

describe('merge', () => {
  beforeEach(() => {
    company('orgA', 'keep', { name: 'Acme', nameKey: 'acme' });
    company('orgA', 'dupe', { name: 'ACME Ltd', nameKey: 'acmeltd', twentyCompanyId: 'tw-dupe' });
    contact('orgA', 'ct1', { companyId: 'dupe', company: 'ACME Ltd' });
    contact('orgA', 'ct2', { companyId: 'keep', company: 'Acme' });
  });

  it('moves every contact to the survivor', async () => {
    const res = await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' });
    expect(res.status).toBe(200);
    expect((await res.json()).contactsMoved).toBe(1);
    expect(state.docs.get('organizations/orgA/contacts/ct1')).toMatchObject({ companyId: 'keep', company: 'Acme' });
  });

  it('leaves a TOMBSTONE rather than deleting the loser', async () => {
    await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' });
    const tomb = state.docs.get('organizations/orgA/companies/dupe')!;
    expect(tomb.mergedIntoId).toBe('keep');
    expect(tomb.mergedByEmail).toBe(OPS);
  });

  it('carries the Twenty id up only when the survivor has none', async () => {
    await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' });
    expect(state.docs.get('organizations/orgA/companies/keep')!.twentyCompanyId).toBe('tw-dupe');
  });

  it('never overwrites a live Twenty link on the survivor', async () => {
    company('orgA', 'keep', { name: 'Acme', nameKey: 'acme', twentyCompanyId: 'tw-keep' });
    await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' });
    expect(state.docs.get('organizations/orgA/companies/keep')!.twentyCompanyId).toBe('tw-keep');
  });

  it('refuses self-merge, unknown ids and a double merge', async () => {
    expect((await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'keep' })).status).toBe(400);
    expect((await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'nope' })).status).toBe(404);
    await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' });
    const again = await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' });
    expect(again.status).toBe(409);
    expect((await again.json()).code).toBe('ALREADY_MERGED');
  });

  it('is super-admin only', async () => {
    const res = await req('/api/companies/merge', 'POST', { orgId: 'orgA', keepId: 'keep', mergeId: 'dupe' }, 'x', 'x@y.com');
    expect(res.status).toBe(403);
  });
});

describe('reconcile', () => {
  it('is a DRY RUN by default and writes nothing', async () => {
    contact('orgA', 'ct1', { company: 'Acme Ltd' });   // no companyId
    const body = await (await req('/api/companies/reconcile', 'POST', {})).json() as Record<string, number | boolean>;
    expect(body.dryRun).toBe(true);
    expect(body.unlinked).toBe(1);
    expect(body.createdCount).toBe(1);
    expect(state.commits).toEqual([]);
    expect(state.docs.get('organizations/orgA/contacts/ct1')!.companyId).toBe('');
  });

  it('creates the registry entry and links the contact when told to', async () => {
    contact('orgA', 'ct1', { company: 'Acme Ltd' });
    await req('/api/companies/reconcile', 'POST', { dryRun: false });
    const created = [...state.docs.entries()].find(([p]) => p.includes('/companies/'))!;
    expect(created[1]).toMatchObject({ name: 'Acme Ltd', nameKey: 'acme', source: 'reconcile' });
    expect(state.docs.get('organizations/orgA/contacts/ct1')!.companyId).toBe((created[1] as { companyId: string }).companyId);
  });

  it('gives contacts of the SAME company ONE registry entry, not one each', async () => {
    contact('orgA', 'ct1', { company: 'Acme Ltd' });
    contact('orgA', 'ct2', { company: 'ACME, Inc.' });
    contact('orgA', 'ct3', { company: 'acme' });
    await req('/api/companies/reconcile', 'POST', { dryRun: false });
    const made = [...state.docs.keys()].filter(p => p.includes('/companies/'));
    expect(made).toHaveLength(1);
  });

  it('attaches to an EXISTING registry entry rather than creating a rival', async () => {
    company('orgA', 'c1', { name: 'Acme', nameKey: 'acme' });
    contact('orgA', 'ct1', { company: 'ACME Ltd' });
    const body = await (await req('/api/companies/reconcile', 'POST', { dryRun: false })).json() as { createdCount: number };
    expect(body.createdCount).toBe(0);
    expect(state.docs.get('organizations/orgA/contacts/ct1')!.companyId).toBe('c1');
  });

  it('does not treat a contact with NO company as drift', async () => {
    contact('orgA', 'ct1', { company: '' });
    const body = await (await req('/api/companies/reconcile', 'POST', {})).json() as { unlinked: number };
    expect(body.unlinked).toBe(0);
  });

  it('reports duplicates, orphans and missing Twenty links', async () => {
    company('orgA', 'a', { name: 'Acme', nameKey: 'acme' });
    company('orgA', 'b', { name: 'Acme Ltd', nameKey: 'acme' });   // duplicate key
    company('orgA', 'lonely', { name: 'Nobody', nameKey: 'nobody' });
    contact('orgA', 'ct1', { companyId: 'a', company: 'Acme' });
    const body = await (await req('/api/companies/reconcile', 'POST', {})).json() as Record<string, number>;
    expect(body.duplicates).toBe(1);
    expect(body.orphans).toBe(2);      // 'b' and 'lonely' hold no contacts
    expect(body.noTwentyId).toBe(1);   // 'a' has contacts but no Twenty id
  });

  it('is idempotent — a second run finds nothing left to link', async () => {
    contact('orgA', 'ct1', { company: 'Acme Ltd' });
    await req('/api/companies/reconcile', 'POST', { dryRun: false });
    const body = await (await req('/api/companies/reconcile', 'POST', { dryRun: false })).json() as { unlinked: number; createdCount: number };
    expect(body.unlinked).toBe(0);
    expect(body.createdCount).toBe(0);
  });

  it('is super-admin only', async () => {
    expect((await req('/api/companies/reconcile', 'POST', {}, 'x', 'x@y.com')).status).toBe(403);
  });
});
