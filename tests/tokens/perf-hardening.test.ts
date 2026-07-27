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
  tokenDocs: [] as Array<{ name: string; fields: Record<string, unknown> }>,
  lastQuery: null as Record<string, unknown> | null,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreRunQuery: vi.fn(async (_sa: string, q: Record<string, unknown>) => {
    store.lastQuery = q;
    const from = (q.from as Array<{ collectionId?: string }> | undefined)?.[0];
    if (from?.collectionId === 'tokens') return store.tokenDocs;
    return [...store.docs.entries()]
      .filter(([k]) => k.startsWith('support_tickets/'))
      .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }));
  }),
  firestoreGet: vi.fn(async (_sa: string, p: string) => store.docs.get(p) ?? null),
  firestoreSet: vi.fn(async () => {}),
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
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

beforeEach(() => { store.docs.clear(); store.tokenDocs = []; store.lastQuery = null; vi.resetModules(); });

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

/*
 * platform-metrics token-active-orgs count.
 *
 * The collectionGroup query used to AND in `__name__ EQUAL {stringValue}`. Firestore
 * requires a resource `referenceValue` for __name__, so the query was rejected, the
 * route's catch swallowed it, and the metric silently reported 0 forever.
 */
async function getMetrics() {
  const route = (await import('../../worker/src/routes/platform-metrics')).default;
  const res = await route.request('/api/platform/metrics', {}, ENV);   // no STRIPE_SECRET_KEY → Stripe skipped
  return { status: res.status, body: await res.json() as Record<string, never> };
}
const tokenDoc = (orgId: string, balance: number, docId = 'current') => ({
  name: `projects/p/databases/(default)/documents/organizations/${orgId}/tokens/${docId}`,
  fields: { balance },
});

describe('platform-metrics — token-active orgs (collection-group query)', () => {
  it('never sends a __name__ filter — it is invalid and rejected the whole query', async () => {
    await getMetrics();
    expect(JSON.stringify(store.lastQuery)).not.toContain('__name__');
  });

  it('filters on balance > 0 server-side', async () => {
    await getMetrics();
    const q = store.lastQuery as { from?: Array<{ collectionId?: string; allDescendants?: boolean }>; where?: { fieldFilter?: { field?: { fieldPath?: string }; op?: string } } };
    expect(q.from?.[0]).toMatchObject({ collectionId: 'tokens', allDescendants: true });
    expect(q.where?.fieldFilter?.field?.fieldPath).toBe('balance');
    expect(q.where?.fieldFilter?.op).toBe('GREATER_THAN');
  });

  it('counts token-active orgs instead of always reporting 0', async () => {
    store.tokenDocs = [tokenDoc('org-a', 500), tokenDoc('org-b', 20)];
    expect((await getMetrics()).body.tokenActiveOrgsCount).toBe(2);
  });

  it('still restricts to the `current` doc client-side', async () => {
    store.tokenDocs = [tokenDoc('org-a', 500), tokenDoc('org-a', 10, 'archive-2026-06')];
    expect((await getMetrics()).body.tokenActiveOrgsCount).toBe(1);
  });

  it('stays fail-soft at 0 when the query throws (index not deployed yet)', async () => {
    store.tokenDocs = [tokenDoc('org-a', 500), tokenDoc('org-b', 20)];   // would count 2 if the query succeeded
    const { firestoreRunQuery } = await import('../../worker/src/lib/firestoreAdmin');
    vi.mocked(firestoreRunQuery).mockRejectedValueOnce(new Error('FAILED_PRECONDITION: index required'));
    const res = await getMetrics();
    expect(res.status).toBe(200);
    expect(res.body.tokenActiveOrgsCount).toBe(0);
  });
});
