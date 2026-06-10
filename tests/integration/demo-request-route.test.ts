import { describe, it, expect, vi, beforeEach } from 'vitest';

/* B2.2 — demo-request route: authed + org-gated, validates at the boundary,
 * persists to the worker-only demo_requests collection. */

const state = vi.hoisted(() => ({
  members: new Map<string, string>(),
  docs: new Map<string, Record<string, unknown>>(),
}));

vi.mock('../../worker/src/middleware/auth', async (orig) => {
  const actual = await orig<typeof import('../../worker/src/middleware/auth')>();
  return {
    ...actual,
    verifyIdToken: vi.fn(async (token?: string) =>
      token === 'owner-token' ? 'uid-1' : token === 'outsider-token' ? 'uid-9' : null),
  };
});

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) { const role = state.members.get(`${m[1]}/${m[2]}`); return role ? { role } : null; }
    return state.docs.get(path) ?? null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    state.docs.set(path, data);
  }),
}));

import demoRequest from '../../worker/src/routes/demo-request';

const ENV = { FIREBASE_PROJECT_ID: 'audit-ai', FIREBASE_SERVICE_ACCOUNT_JSON: '{}' } as unknown as Record<string, unknown>;

function post(body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return demoRequest.request('/api/demo-request', { method: 'POST', headers, body: JSON.stringify(body) }, ENV);
}

const VALID = { orgId: 'orgA', name: 'Aaron Fox', email: 'Aaron@Example.com ', company: 'FOX Co', message: 'Interested in a demo.' };

beforeEach(() => {
  state.members.clear(); state.docs.clear();
  state.members.set('orgA/uid-1', 'owner');
  vi.clearAllMocks();
});

describe('POST /api/demo-request (B2.2)', () => {
  it('requires auth', async () => {
    const res = await post(VALID);
    expect(res.status).toBe(401);
  });

  it('rejects non-members of the org (no cross-tenant writes)', async () => {
    const res = await post(VALID, 'outsider-token');
    expect(res.status).toBe(403);
  });

  it('validates name and email at the boundary', async () => {
    expect((await post({ ...VALID, name: '  ' }, 'owner-token')).status).toBe(400);
    expect((await post({ ...VALID, email: 'not-an-email' }, 'owner-token')).status).toBe(400);
  });

  it('persists a bounded, normalized doc to the worker-only demo_requests store', async () => {
    const res = await post(VALID, 'owner-token');
    expect(res.status).toBe(200);
    const { ok, id } = await res.json() as { ok: boolean; id: string };
    expect(ok).toBe(true);
    expect(res.headers.get('cache-control')).toBe('no-store');

    const doc = state.docs.get(`demo_requests/${id}`)!;
    expect(doc).toBeTruthy();
    expect(doc.email).toBe('aaron@example.com');   // lowercased + trimmed
    expect(doc.name).toBe('Aaron Fox');
    expect(doc.orgId).toBe('orgA');
    expect(doc.uid).toBe('uid-1');
    expect(doc.status).toBe('new');
    expect(doc.source).toBe('dashboard-cta');
  });

  it('caps message length (bounded store)', async () => {
    const res = await post({ ...VALID, message: 'x'.repeat(5000) }, 'owner-token');
    expect(res.status).toBe(200);
    const { id } = await res.json() as { id: string };
    expect((state.docs.get(`demo_requests/${id}`)!.message as string).length).toBe(2000);
  });
});
