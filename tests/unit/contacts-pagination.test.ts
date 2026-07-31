import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Contacts pagination.
 *
 * The regression guarded here is a read-cost one: the list used to fetch up to
 * 1,000 contacts on every load and filter them in memory, so a member who could
 * see three of them still cost 1,000 document reads. The mock below HONOURS
 * limit and the startAt cursor, so a test that asserts "read 50, not 1000" is
 * asserting something real.
 */

const state = vi.hoisted(() => ({
  roles: new Map<string, string>(),
  docs:  new Map<string, Record<string, unknown>>(),
  /** limit of every query issued, in order. */
  limits: [] as number[],
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
    if (m) { const r = state.roles.get(`${m[1]}/${m[2]}`); return r ? { role: r } : null; }
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async () => {}),
  firestoreDelete: vi.fn(async () => {}),
  firestoreCommit: vi.fn(async () => {}),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string; allDescendants?: boolean }>)[0];
    let rows = [...state.docs.entries()]
      .filter(([p]) => (from.allDescendants
        ? /^organizations\/[^/]+\/contacts\/[^/]+$/.test(p)
        : p.startsWith(`${parent}/contacts/`)))
      .map(([name, fields]) => ({ name, fields }));

    // Newest-first on (createdAt, name) — the same order the route asks for.
    rows.sort((a, b) => {
      const ca = String(a.fields.createdAt ?? ''), cb = String(b.fields.createdAt ?? '');
      if (ca !== cb) return ca < cb ? 1 : -1;
      return a.name < b.name ? 1 : a.name > b.name ? -1 : 0;
    });

    const startAt = sq.startAt as { values: Array<{ stringValue?: string; referenceValue?: string }> } | undefined;
    if (startAt) {
      const at = startAt.values[0].stringValue ?? '';
      const id = startAt.values[1].referenceValue ?? '';
      const i = rows.findIndex(r => r.name === id && String(r.fields.createdAt ?? '') === at);
      rows = i >= 0 ? rows.slice(i + 1) : rows;
    }
    const limit = (sq.limit as number) ?? rows.length;
    state.limits.push(limit);
    return rows.slice(0, limit);
  }),
}));

import contacts, { contactsPlatform, encodeCursor, decodeCursor, clampLimit } from '../../worker/src/routes/contacts';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', PLATFORM_ADMIN_EMAILS: 'ops@ailuna.com' } as unknown as Record<string, unknown>;
const OPS = 'ops@ailuna.com';
const H = (uid: string, email?: string) => {
  const h: Record<string, string> = { 'x-test-uid': uid };
  if (email) h['x-test-email'] = email;
  return h;
};

interface Page { contacts: Array<{ email: string }>; nextCursor: string; scanned: number }
const list = async (qs: string, uid = 'boss', email: string | undefined = OPS): Promise<Page> =>
  (await contacts.request(`/api/contacts/list?orgId=orgA${qs}`, { headers: H(uid, email) }, ENV)).json() as Promise<Page>;

/** Seed `n` contacts with strictly ordered createdAt values. */
function seed(n: number, owner = 'sales1') {
  for (let i = 0; i < n; i++) {
    const id = `c${String(i).padStart(5, '0')}`;
    state.docs.set(`organizations/orgA/contacts/${id}`, {
      contactId: id, orgId: 'orgA', name: `P${i}`, email: `p${i}@x.com`, emailKey: `p${i}@x.com`,
      company: 'Acme', tags: [], status: 'active', source: 'import',
      assignedToUid: owner, createdByUid: owner,
      createdAt: new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString(),
    });
  }
}

beforeEach(() => {
  state.roles.clear(); state.docs.clear(); state.limits.length = 0; vi.clearAllMocks();
  state.roles.set('orgA/boss', 'owner');    // also the platform operator
  state.roles.set('orgA/sales1', 'member');
  state.roles.set('orgA/sales2', 'member');
});

describe('cursor encoding', () => {
  it('round-trips a createdAt and a document id', () => {
    const c = encodeCursor('2026-01-01T00:00:00.000Z', 'organizations/orgA/contacts/c1');
    expect(decodeCursor(c)).toEqual({ createdAt: '2026-01-01T00:00:00.000Z', docId: 'organizations/orgA/contacts/c1' });
  });

  it('is URL-safe base64 — no +, / or = to be mangled in a query string', () => {
    expect(encodeCursor('2026-01-01T00:00:00.000Z', 'organizations/o/contacts/aa+bb/cc')).not.toMatch(/[+/=]/);
  });

  it('refuses garbage instead of throwing', () => {
    expect(decodeCursor('')).toBeNull();
    expect(decodeCursor('!!!not base64!!!')).toBeNull();
  });
});

describe('limit clamping', () => {
  it('defaults to 50 and caps at 200', () => {
    expect(clampLimit(undefined)).toBe(50);
    expect(clampLimit('0')).toBe(50);
    expect(clampLimit('abc')).toBe(50);
    expect(clampLimit('-5')).toBe(50);
    expect(clampLimit('100')).toBe(100);
    // A caller cannot ask for the whole collection by inflating the limit.
    expect(clampLimit('100000')).toBe(200);
  });
});

describe('paging through 100 / 1000 / 10000 contacts', () => {
  for (const total of [100, 1000, 10000]) {
    it(`${total} contacts: one page reads a page, not the collection`, async () => {
      seed(total);
      const page = await list('&limit=50');
      expect(page.contacts).toHaveLength(50);
      expect(page.nextCursor).not.toBe('');
      // THE measurement: documents read for one page, independent of total size.
      expect(page.scanned).toBeLessThanOrEqual(75);
      expect(Math.max(...state.limits)).toBeLessThanOrEqual(75);
    });
  }

  it('walks the whole collection without repeating or skipping a row', async () => {
    seed(220);
    const seen: string[] = [];
    let cursor = '';
    for (let i = 0; i < 10; i++) {
      const page = await list(`&limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
      seen.push(...page.contacts.map(c => c.email));
      cursor = page.nextCursor;
      if (!cursor) break;
    }
    expect(seen).toHaveLength(220);
    expect(new Set(seen).size).toBe(220);  // no duplicates across page boundaries
  });

  it('newest first', async () => {
    seed(10);
    const page = await list('&limit=3');
    expect(page.contacts.map(c => c.email)).toEqual(['p9@x.com', 'p8@x.com', 'p7@x.com']);
  });
});

describe('paging respects assignment', () => {
  it('a member paging a big org reads a bounded number of documents', async () => {
    seed(1000, 'sales2');                                  // none of them are sales1's
    state.docs.set('organizations/orgA/contacts/mine', {
      contactId: 'mine', orgId: 'orgA', name: 'Mine', email: 'mine@x.com', emailKey: 'mine@x.com',
      company: 'Acme', tags: [], status: 'active', source: 'manual',
      assignedToUid: 'sales1', createdByUid: 'sales1', createdAt: '2027-01-01T00:00:00.000Z',
    });
    const page = await list('&limit=50', 'sales1', 'sales1@acme.com');
    expect(page.contacts.map(c => c.email)).toEqual(['mine@x.com']);
    // The scan cap is the guarantee: filtering happens after the read, so the
    // route must stop rather than walk 1,000 documents looking for a match.
    expect(page.scanned).toBeLessThanOrEqual(1000);
  });

  it('server-side status filter narrows the page as it is filled', async () => {
    seed(60);
    state.docs.set('organizations/orgA/contacts/blocked1', {
      contactId: 'blocked1', orgId: 'orgA', name: 'B', email: 'b@x.com', emailKey: 'b@x.com',
      company: 'Acme', tags: [], status: 'blocked', source: 'manual',
      assignedToUid: 'sales1', createdByUid: 'sales1', createdAt: '2027-01-01T00:00:00.000Z',
    });
    const page = await list('&limit=50&status=blocked');
    expect(page.contacts.map(c => c.email)).toEqual(['b@x.com']);
  });
});

describe('cross-org page', () => {
  it('is paginated too, and reports its cursor', async () => {
    seed(120);
    const res = await contactsPlatform.request('/api/contacts/all?limit=50', { headers: H('ops', OPS) }, ENV);
    const page = await res.json() as Page;
    expect(page.contacts).toHaveLength(50);
    expect(page.nextCursor).not.toBe('');
  });
});
