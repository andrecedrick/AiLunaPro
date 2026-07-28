import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Demo-request P0 regression suite.
 *
 * The route used to persist `demo_requests/{id}` and RETURN — nothing read that
 * collection, so a commercial lead produced no durable alert, no bell entry, no
 * admin email and no operator surface. These tests pin every leg of the loop:
 *
 *   1. the lead is stored
 *   2. a durable platform_alerts record exists
 *   3. an operator notification exists, routed to the Admin Center
 *   4. the admin email is attempted, replying straight to the prospect
 *   5. alert/email failure NEVER loses an already-captured lead
 *   6. the lead is visible through the operator read surface
 */

const store = vi.hoisted(() => ({
  writes: new Map<string, Record<string, unknown>>(),
  members: new Set<string>(),
  sends: [] as Array<{ to: string; slug: string; variables: Record<string, string>; replyTo?: string }>,
  sendOk: true,
  setThrowsOn: null as string | null,
  queryThrows: false,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  // Reads see what was written (so the duplicate probe can find an existing lead)
  // and, separately, the membership docs the auth gate looks up.
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    if (store.writes.has(path)) return store.writes.get(path)!;
    return store.members.has(path) ? { role: 'owner' } : null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, doc: Record<string, unknown>) => {
    if (store.setThrowsOn && path.startsWith(store.setThrowsOn)) throw new Error('firestore down');
    store.writes.set(path, doc);
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, q: { from?: Array<{ collectionId?: string }> }) => {
    if (store.queryThrows) throw new Error('FAILED_PRECONDITION: index required');
    const cid = q.from?.[0]?.collectionId ?? '';
    return [...store.writes.entries()]
      .filter(([k]) => k.startsWith(`${cid}/`))
      .map(([k, v]) => ({ name: `projects/p/databases/(default)/documents/${k}`, fields: v }));
  }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  verifyIdTokenClaims: vi.fn(async () => ({ uid: 'user-1', email: 'prospect@acme.com' })),
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', 'admin-1'); c.set('email', 'admin@ailunapro.com'); await next();
  },
}));
vi.mock('../../worker/src/lib/platformAdmin', () => ({
  requirePlatformAdmin: () => async (_c: unknown, next: () => Promise<void>) => { await next(); },
}));
vi.mock('../../worker/src/lib/sequenzy', () => ({
  sendTransactional: vi.fn(async (_k: string | undefined, p: { to: string; slug: string; variables: Record<string, string>; replyTo?: string }) => {
    store.sends.push(p);
    return store.sendOk ? { ok: true } : { ok: false, error: 'Sequenzy send failed (HTTP 404): template not found' };
  }),
}));

const ENV = {
  FIREBASE_PROJECT_ID: 'p',
  FIREBASE_SERVICE_ACCOUNT_JSON: '{"sa":true}',
  ADMIN_EMAIL: 'admin@ailunapro.com',
  SEQUENZY_API_KEY: 'key',
};

async function submit(body: Record<string, unknown>, env: Record<string, unknown> = ENV) {
  const route = (await import('../../worker/src/routes/demo-request')).default;
  const res = await route.request('/api/demo-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
    body: JSON.stringify(body),
  }, env);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

async function listAsAdmin() {
  const route = (await import('../../worker/src/routes/platform-demo-requests')).default;
  const res = await route.request('/api/platform/demo-requests', {}, ENV);
  return { status: res.status, body: await res.json() as Record<string, never> };
}

const VALID = { orgId: 'org-1', name: 'Ada Lovelace', email: 'typed@acme.com', company: 'Acme', message: 'Want a demo' };

const find = (prefix: string) => [...store.writes.entries()].find(([k]) => k.startsWith(prefix));

beforeEach(() => {
  store.writes.clear();
  store.members.clear();
  store.members.add('organizations/org-1/members/user-1');
  store.sends = [];
  store.sendOk = true;
  store.setThrowsOn = null;
  store.queryThrows = false;
  vi.resetModules();
});

const adminSends = () => store.sends.filter(s => s.slug === 'demo-request-admin');
const prospectSends = () => store.sends.filter(s => s.slug === 'demo-request-confirmation');

describe('demo request — capture', () => {
  it('stores the lead and returns its id', async () => {
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const stored = find('demo_requests/');
    expect(stored).toBeDefined();
    expect(stored?.[1]).toMatchObject({ name: 'Ada Lovelace', company: 'Acme', orgId: 'org-1', status: 'new', source: 'dashboard-cta' });
  });

  it('keeps identity and contact emails apart instead of discarding the typed one', async () => {
    await submit(VALID);
    const lead = find('demo_requests/')?.[1] ?? {};
    // Identity is the VERIFIED token email — a member must not file a lead as anyone.
    expect(lead.identityEmail).toBe('prospect@acme.com');
    // The typed "Work email" used to be thrown away entirely.
    expect(lead.contactEmail).toBe('typed@acme.com');
    // Legacy field retained, still the identity address, for pre-v3 readers.
    expect(lead.email).toBe('prospect@acme.com');
    expect(lead.schemaVersion).toBe(3);
  });

  it('falls back to the identity email when the typed one is invalid', async () => {
    await submit({ ...VALID, email: 'not-an-email' });
    const lead = find('demo_requests/')?.[1] ?? {};
    expect(lead.contactEmail).toBe('prospect@acme.com');   // never lose a lead over a typo
    expect(lead.identityEmail).toBe('prospect@acme.com');
  });

  it('rejects a non-member of the workspace', async () => {
    store.members.clear();
    expect((await submit(VALID)).status).toBe(403);
  });
});

describe('demo request — operator alerting (the P0 gap)', () => {
  it('writes a durable platform_alerts record', async () => {
    await submit(VALID);
    const alert = find('platform_alerts/demo_request_received__');
    expect(alert).toBeDefined();
    expect(alert?.[1]).toMatchObject({ kind: 'demo_request_received', resolved: false });
  });

  it('keeps PII out of the durable alert and its context', async () => {
    await submit(VALID);
    const alert = find('platform_alerts/demo_request_received__')?.[1] ?? {};
    const blob = JSON.stringify(alert);
    expect(blob).not.toContain('Ada Lovelace');
    expect(blob).not.toContain('prospect@acme.com');
    expect(blob).not.toContain('typed@acme.com');
    expect(blob).not.toContain('Acme');
  });

  it('creates an operator notification routed to the Admin Center', async () => {
    await submit(VALID);
    const notif = find('notifications/notif_demo_request_received__');
    expect(notif).toBeDefined();
    expect(notif?.[1]).toMatchObject({ audience: 'operator', type: 'demo', route: 'admin', read: false });
  });

  it('attempts the demo-request-admin email, replying to the prospect', async () => {
    await submit(VALID);
    expect(adminSends()).toHaveLength(1);
    // Reply reaches the address the prospect nominated, not their login.
    expect(adminSends()[0]).toMatchObject({ to: 'admin@ailunapro.com', slug: 'demo-request-admin', replyTo: 'typed@acme.com' });
    expect(adminSends()[0].variables).toMatchObject({
      NAME: 'Ada Lovelace', COMPANY: 'Acme', ORG_ID: 'org-1',
      IDENTITY_EMAIL: 'prospect@acme.com',
      CONTACT_EMAIL:  'typed@acme.com',
      EMAIL:          'typed@acme.com',
    });
  });

  it('attempts the prospect confirmation, replying to a human operator', async () => {
    await submit(VALID);
    expect(prospectSends()).toHaveLength(1);
    expect(prospectSends()[0]).toMatchObject({
      to: 'typed@acme.com', slug: 'demo-request-confirmation', replyTo: 'admin@ailunapro.com',
    });
    expect(prospectSends()[0].variables).toMatchObject({ NAME: 'Ada Lovelace', COMPANY: 'Acme' });
  });

  it('sends the admin email BEFORE the prospect confirmation', async () => {
    await submit(VALID);
    // A confirmation must never be the reason the operator misses a lead.
    expect(store.sends.map(s => s.slug)).toEqual(['demo-request-admin', 'demo-request-confirmation']);
  });

  it('surfaces a failed email as its own durable alert', async () => {
    store.sendOk = false;
    await submit(VALID);
    const failed = find('platform_alerts/notification_email_failed__');
    expect(failed).toBeDefined();
    expect(String(failed?.[1].context)).toContain('demo-request-admin');
  });
});

describe('demo request — a captured lead is never lost to alerting', () => {
  it('still returns 200 when the email send fails', async () => {
    store.sendOk = false;
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(find('demo_requests/')).toBeDefined();
  });

  it('still returns 200 when the alert write fails', async () => {
    store.setThrowsOn = 'platform_alerts/';
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(find('demo_requests/')).toBeDefined();
  });

  it('skips the ADMIN email when ADMIN_EMAIL is unset, without failing the lead', async () => {
    const { ADMIN_EMAIL: _drop, ...noAdmin } = ENV;
    const res = await submit(VALID, noAdmin);
    expect(res.status).toBe(200);
    expect(adminSends()).toHaveLength(0);
    // The prospect is still confirmed — that path does not depend on ADMIN_EMAIL.
    expect(prospectSends()).toHaveLength(1);
    expect(find('demo_requests/')).toBeDefined();
  });
});

describe('demo request — lead-management fields', () => {
  it('every lead carries createdAt, status=new, owner and lastContactAt', async () => {
    await submit(VALID);
    const lead = find('demo_requests/')?.[1] ?? {};
    expect(lead.status).toBe('new');
    expect(lead.owner).toBe('');              // unassigned
    expect(lead.lastContactAt).toBe('');      // never contacted
    expect(String(lead.createdAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(lead.schemaVersion).toBe(3);
  });

  it('the operator surface returns the lead-management fields', async () => {
    await submit(VALID);
    const items = (await listAsAdmin()).body.items as unknown as Array<Record<string, string>>;
    expect(items[0]).toMatchObject({ status: 'new', owner: '', lastContactAt: '' });
  });
});

describe('demo request — duplicate protection', () => {
  it('a repeated identical submission yields ONE lead, ONE alert, ONE admin email', async () => {
    const first  = await submit(VALID);
    const second = await submit(VALID);

    expect(first.body.duplicate).toBe(false);
    expect(second.body.duplicate).toBe(true);
    expect(second.body.id).toBe(first.body.id);

    const leads = [...store.writes.keys()].filter(k => k.startsWith('demo_requests/'));
    expect(leads).toHaveLength(1);
    const alerts = [...store.writes.keys()].filter(k => k.startsWith('platform_alerts/demo_request_received__'));
    expect(alerts).toHaveLength(1);
    expect(adminSends()).toHaveLength(1);
    expect(prospectSends()).toHaveLength(1);
  });

  it('a DIFFERENT message from the same prospect is a separate lead', async () => {
    await submit(VALID);
    const other = await submit({ ...VALID, message: 'Actually, two demos please' });
    expect(other.body.duplicate).toBe(false);
    expect([...store.writes.keys()].filter(k => k.startsWith('demo_requests/'))).toHaveLength(2);
  });

  it('a different prospect submitting identical content is a separate lead', async () => {
    await submit(VALID);
    const { verifyIdTokenClaims } = await import('../../worker/src/middleware/auth');
    vi.mocked(verifyIdTokenClaims).mockResolvedValueOnce({ uid: 'user-2', email: 'other@acme.com' } as never);
    store.members.add('organizations/org-1/members/user-2');
    const other = await submit(VALID);
    expect(other.body.duplicate).toBe(false);
    expect([...store.writes.keys()].filter(k => k.startsWith('demo_requests/'))).toHaveLength(2);
  });

  it('a failed duplicate probe writes the lead anyway (never lose a lead)', async () => {
    const { firestoreGet } = await import('../../worker/src/lib/firestoreAdmin');
    vi.mocked(firestoreGet).mockImplementationOnce(async () => ({ role: 'owner' }));       // membership gate
    vi.mocked(firestoreGet).mockImplementationOnce(async () => { throw new Error('probe down'); });
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(find('demo_requests/')).toBeDefined();
  });
});

describe('demo request — admin visibility failure is observable', () => {
  it('a broken read fails loudly instead of rendering an empty inbox', async () => {
    await submit(VALID);
    store.queryThrows = true;
    const res = await listAsAdmin();
    // An empty list here would be a comfortable lie: real leads exist.
    expect(res.status).toBe(500);
    expect(res.body.code).toBe('QUERY_FAILED');
  });

  it('and raises a durable critical alert for the operator', async () => {
    store.queryThrows = true;
    await listAsAdmin();
    const alert = find('platform_alerts/demo_visibility_failed__');
    expect(alert).toBeDefined();
    expect(alert?.[1]).toMatchObject({ kind: 'demo_visibility_failed', severity: 'critical' });
  });
});

describe('demo request — operator visibility', () => {
  it('a submitted lead is readable through the platform surface', async () => {
    await submit(VALID);
    const res = await listAsAdmin();
    expect(res.status).toBe(200);
    const items = res.body.items as unknown as Array<{ name: string; email: string; status: string }>;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: 'Ada Lovelace', identityEmail: 'prospect@acme.com', contactEmail: 'typed@acme.com', status: 'new',
    });
    expect(res.body.newCount).toBe(1);
  });

  it('a pre-v3 lead (only `email`) still renders both addresses', async () => {
    // Historical leads carry no identityEmail/contactEmail. Both must fall back to
    // the legacy field rather than rendering two blanks in the operator panel.
    store.writes.set('demo_requests/legacy-1', {
      id: 'legacy-1', name: 'Old Lead', email: 'legacy@acme.com',
      status: 'new', createdAt: '2026-01-01T00:00:00Z',
    });
    const items = (await listAsAdmin()).body.items as unknown as Array<Record<string, string>>;
    expect(items[0]).toMatchObject({
      identityEmail: 'legacy@acme.com',
      contactEmail:  'legacy@acme.com',
    });
  });

  it('an empty collection renders as an empty inbox, not an error', async () => {
    const res = await listAsAdmin();
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
});
