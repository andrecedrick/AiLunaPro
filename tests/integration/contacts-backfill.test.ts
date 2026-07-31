import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Company backfill — the repair for contacts written before signup captured a
 * company, which render as "Company —" in the CRM and which nothing else will
 * ever fill (upsertLeadContact only fills a blank when the same prospect submits
 * again, and a completed signup never does).
 *
 * The properties that matter are safety properties: it must not invent data, must
 * not overwrite an operator's correction, and must be safe to run twice.
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
  firestoreRunQuery: vi.fn(async () => [...state.docs.entries()]
    .filter(([p]) => /^organizations\/[^/]+\/contacts\/[^/]+$/.test(p))
    .map(([name, fields]) => ({ name, fields }))),
}));

import backfill from '../../worker/src/routes/contacts-backfill';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;
const OPS = 'ops@ailuna.com';

interface Result {
  scanned: number; blank: number; fillable: number; unassigned: number;
  written: number; remaining: number; dryRun: boolean;
  sample: Array<{ name: string; company: string }>;
}

const run = async (body: unknown, uid = 'ops', email: string | undefined = OPS) => {
  const res = await backfill.request('/api/contacts/backfill-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-uid': uid, ...(email ? { 'x-test-email': email } : {}) },
    body: JSON.stringify(body),
  }, ENV);
  return { status: res.status, body: await res.json() as Result };
};

const contact = (orgId: string, id: string, f: Record<string, unknown>) =>
  state.docs.set(`organizations/${orgId}/contacts/${id}`, { name: id, company: '', createdByUid: 'u1', ...f });

beforeEach(() => {
  state.docs.clear(); state.commits.length = 0; vi.clearAllMocks();
  state.docs.set('organizations/orgA', { name: 'Acme Workspace' });
  state.docs.set('organizations/orgB', { name: '' });          // unnamed workspace
});

describe('backfill — safety', () => {
  it('is super-admin only', async () => {
    expect((await run({}, 'someone', 'someone@acme.com')).status).toBe(403);
  });

  it('DRY RUN by default — reports the damage without writing', async () => {
    contact('orgA', 'c1', {});
    const { body } = await run({});
    expect(body.dryRun).toBe(true);
    expect(body.fillable).toBe(1);
    expect(body.written).toBe(0);
    expect(state.commits).toEqual([]);
    expect(state.docs.get('organizations/orgA/contacts/c1')!.company).toBe('');
  });

  it('an empty body is still a dry run — a forgotten flag cannot cause a write', async () => {
    contact('orgA', 'c1', {});
    const res = await backfill.request('/api/contacts/backfill-company', {
      method: 'POST', headers: { 'x-test-uid': 'ops', 'x-test-email': OPS },
    }, ENV);
    expect(((await res.json()) as Result).dryRun).toBe(true);
    expect(state.commits).toEqual([]);
  });
});

describe('backfill — what it fills', () => {
  it('fills a blank company from the workspace name', async () => {
    contact('orgA', 'c1', { name: 'Beverly Richards' });
    const { body } = await run({ dryRun: false });
    expect(state.docs.get('organizations/orgA/contacts/c1')!.company).toBe('Acme Workspace');
    expect(body.sample[0]).toMatchObject({ name: 'Beverly Richards', company: 'Acme Workspace' });
  });

  it('NEVER overwrites a company that is already set', async () => {
    contact('orgA', 'c1', { company: 'Operator Corrected Ltd' });
    const { body } = await run({ dryRun: false });
    expect(state.docs.get('organizations/orgA/contacts/c1')!.company).toBe('Operator Corrected Ltd');
    expect(body.blank).toBe(0);
  });

  it('invents nothing when the workspace itself has no name', async () => {
    contact('orgB', 'c1', {});
    const { body } = await run({ dryRun: false });
    expect(state.docs.get('organizations/orgB/contacts/c1')!.company).toBe('');
    // `remaining` is the verification answer: still blank, and honestly reported.
    expect(body.blank).toBe(1);
    expect(body.fillable).toBe(0);
    expect(body.remaining).toBe(1);
  });

  it('is IDEMPOTENT — a second run finds nothing left to do', async () => {
    contact('orgA', 'c1', {});
    await run({ dryRun: false });
    state.commits.length = 0;
    const { body } = await run({ dryRun: false });
    expect(body.blank).toBe(0);
    expect(body.remaining).toBe(0);
    expect(state.commits).toEqual([]);   // nothing written the second time
  });

  it('also repairs a missing assignment, so visibility stops depending on a fallback', async () => {
    contact('orgA', 'c1', { company: 'Set', createdByUid: 'sales1' });   // no assignedToUid
    const { body } = await run({ dryRun: false });
    expect(body.unassigned).toBe(1);
    expect(state.docs.get('organizations/orgA/contacts/c1')!.assignedToUid).toBe('sales1');
  });

  it('leaves an existing assignment alone', async () => {
    contact('orgA', 'c1', { company: 'Set', createdByUid: 'sales1', assignedToUid: 'sales2' });
    await run({ dryRun: false });
    expect(state.docs.get('organizations/orgA/contacts/c1')!.assignedToUid).toBe('sales2');
  });

  it('writes in batched commits, not one round trip per contact', async () => {
    for (let i = 0; i < 120; i++) contact('orgA', `c${i}`, {});
    await run({ dryRun: false });
    // 120 company fills + 120 assignment fills, in one commit.
    expect(state.commits).toEqual([240]);
  });

  it('reports zero work on an empty CRM', async () => {
    const { body } = await run({ dryRun: false });
    expect(body).toMatchObject({ scanned: 0, blank: 0, fillable: 0, written: 0, remaining: 0 });
  });
});
