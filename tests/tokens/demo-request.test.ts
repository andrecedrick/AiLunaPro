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
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => (store.members.has(path) ? { role: 'owner' } : null)),
  firestoreSet: vi.fn(async (_sa: string, path: string, doc: Record<string, unknown>) => {
    if (store.setThrowsOn && path.startsWith(store.setThrowsOn)) throw new Error('firestore down');
    store.writes.set(path, doc);
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, q: { from?: Array<{ collectionId?: string }> }) => {
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
  vi.resetModules();
});

describe('demo request — capture', () => {
  it('stores the lead and returns its id', async () => {
    const res = await submit(VALID);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const stored = find('demo_requests/');
    expect(stored).toBeDefined();
    expect(stored?.[1]).toMatchObject({ name: 'Ada Lovelace', company: 'Acme', orgId: 'org-1', status: 'new', source: 'dashboard-cta' });
  });

  it('records the VERIFIED token email, not the client-supplied one', async () => {
    await submit(VALID);
    expect(find('demo_requests/')?.[1].email).toBe('prospect@acme.com');
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
    expect(store.sends).toHaveLength(1);
    expect(store.sends[0]).toMatchObject({ to: 'admin@ailunapro.com', slug: 'demo-request-admin', replyTo: 'prospect@acme.com' });
    expect(store.sends[0].variables).toMatchObject({ NAME: 'Ada Lovelace', COMPANY: 'Acme', ORG_ID: 'org-1' });
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

  it('skips the email when ADMIN_EMAIL is unset, without failing the lead', async () => {
    const { ADMIN_EMAIL: _drop, ...noAdmin } = ENV;
    const res = await submit(VALID, noAdmin);
    expect(res.status).toBe(200);
    expect(store.sends).toHaveLength(0);
    expect(find('demo_requests/')).toBeDefined();
  });
});

describe('demo request — operator visibility', () => {
  it('a submitted lead is readable through the platform surface', async () => {
    await submit(VALID);
    const res = await listAsAdmin();
    expect(res.status).toBe(200);
    const items = res.body.items as unknown as Array<{ name: string; email: string; status: string }>;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Ada Lovelace', email: 'prospect@acme.com', status: 'new' });
    expect(res.body.newCount).toBe(1);
  });

  it('an empty collection renders as an empty inbox, not an error', async () => {
    const res = await listAsAdmin();
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
});
