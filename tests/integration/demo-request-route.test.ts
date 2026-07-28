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
    // The route uses the VERIFIED token email as identity (C3 anti-spoof fix).
    verifyIdTokenClaims: vi.fn(async (token?: string) =>
      token === 'owner-token'     ? { uid: 'uid-1', email: 'owner@example.com' }
      : token === 'noemail-token' ? { uid: 'uid-1' }                              // member, no email claim
      : token === 'outsider-token' ? { uid: 'uid-9', email: 'out@example.com' }
      : null),
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

// `phone` is required since the CRM-enrichment change: sales calls demo leads
// back, so the route rejects a lead with no reachable number (INVALID_PHONE).
const VALID = { orgId: 'orgA', name: 'Aaron Fox', email: 'Aaron@Example.com ', phone: '+33612345678', company: 'FOX Co', message: 'Interested in a demo.' };

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

  it('requires a name at the boundary', async () => {
    expect((await post({ ...VALID, name: '  ' }, 'owner-token')).status).toBe(400);
  });

  it('uses the verified token email and ignores a spoofed body email (C3)', async () => {
    const res = await post({ ...VALID, email: 'victim@competitor.com' }, 'owner-token');
    expect(res.status).toBe(200);
    const { id } = await res.json() as { id: string };
    // Identity is the token email — the client-supplied body email is ignored.
    expect(state.docs.get(`demo_requests/${id}`)!.email).toBe('owner@example.com');
  });

  it('falls back to a validated body email only when the token carries no email claim', async () => {
    // No token email → body email is used, and still validated.
    expect((await post({ ...VALID, email: 'not-an-email' }, 'noemail-token')).status).toBe(400);
    const res = await post({ ...VALID, email: 'Contact@Example.com ' }, 'noemail-token');
    expect(res.status).toBe(200);
    const { id } = await res.json() as { id: string };
    expect(state.docs.get(`demo_requests/${id}`)!.email).toBe('contact@example.com');  // trimmed + lowercased
  });

  it('persists a bounded, normalized doc to the worker-only demo_requests store', async () => {
    const res = await post(VALID, 'owner-token');
    expect(res.status).toBe(200);
    const { ok, id } = await res.json() as { ok: boolean; id: string };
    expect(ok).toBe(true);
    expect(res.headers.get('cache-control')).toBe('no-store');

    const doc = state.docs.get(`demo_requests/${id}`)!;
    expect(doc).toBeTruthy();
    expect(doc.email).toBe('owner@example.com');   // verified token email (not body)
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
