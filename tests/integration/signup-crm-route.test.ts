import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * POST /api/signup/crm — the signup → CRM bridge.
 *
 * Pins the two things that actually went wrong in production: a new account that
 * never reached the CRM at all, and one that reached it with an empty company.
 */

const state = vi.hoisted(() => ({
  docs:   new Map<string, Record<string, unknown>>(),
  alerts: [] as Array<{ kind: string; message: string }>,
  claims: { uid: 'newuser', email: 'ada@acme.com' } as { uid: string; email: string } | null,
}));

vi.mock('../../worker/src/middleware/auth', () => ({
  verifyIdTokenClaims: vi.fn(async () => state.claims),
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
    const prev = opts?.merge ? (state.docs.get(path) ?? {}) : {};
    state.docs.set(path, { ...prev, ...data });
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const where = sq.where as { fieldFilter?: { field: { fieldPath: string }; value: { stringValue: string } } } | undefined;
    const out: Array<{ name: string; fields: Record<string, unknown> }> = [];
    for (const [p, f] of state.docs) {
      if (!p.startsWith(`${parent}/contacts/`)) continue;
      if (where?.fieldFilter) {
        const { field, value } = where.fieldFilter;
        if ((f[field.fieldPath] ?? '') !== value.stringValue) continue;
      }
      out.push({ name: p, fields: f });
    }
    return out;
  }),
}));

vi.mock('../../worker/src/lib/billing-alerts', () => ({
  recordBillingAlert: vi.fn(async (_sa: string, a: { kind: string; message: string }) => { state.alerts.push(a); }),
}));

import signupCrm from '../../worker/src/routes/signup-crm';

// Twenty is intentionally NOT configured here: the CRM contact must be created
// whether or not the sales CRM is reachable.
const ENV = { FIREBASE_PROJECT_ID: 'p', FIREBASE_SERVICE_ACCOUNT_JSON: '{}' } as unknown as Record<string, unknown>;

const call = (body: unknown) => signupCrm.request('/api/signup/crm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t', 'CF-IPCountry': 'FR' },
  body: JSON.stringify(body),
}, ENV);

const contact = () => [...state.docs.entries()].find(([p]) => p.includes('/contacts/'))?.[1];

beforeEach(() => {
  state.docs.clear(); state.alerts.length = 0;
  state.claims = { uid: 'newuser', email: 'ada@acme.com' };
  state.docs.set('organizations/orgA/members/newuser', { role: 'owner' });
  state.docs.set('organizations/orgA', { name: 'Acme Workspace' });
  vi.clearAllMocks();
});

describe('signup → CRM', () => {
  it('creates the contact with company, phone and edge country', async () => {
    const r = await call({ orgId: 'orgA', name: 'Ada Lovelace', company: 'Acme Ltd', phone: '+33612345678' });
    expect(r.status).toBe(200);
    expect(contact()).toMatchObject({
      name: 'Ada Lovelace', email: 'ada@acme.com', company: 'Acme Ltd',
      phone: '+33612345678', countryCode: 'FR', phoneCountry: 'FR',
      source: 'demo_request', leadStatus: 'new',
    });
  });

  it('COMPANY FALLBACK: a lost stash falls back to the workspace name', async () => {
    await call({ orgId: 'orgA', name: 'Ada Lovelace', phone: '+33612345678' });
    expect(contact()!.company).toBe('Acme Workspace');
  });

  it('a supplied company is never overwritten by the workspace name', async () => {
    await call({ orgId: 'orgA', name: 'Ada', company: 'Real Co' });
    expect(contact()!.company).toBe('Real Co');
  });

  it('identity is the VERIFIED token email, not anything the client sends', async () => {
    await call({ orgId: 'orgA', name: 'Ada', company: 'Acme', email: 'attacker@evil.com' });
    expect(contact()!.email).toBe('ada@acme.com');
  });

  it('an unusable phone is dropped rather than blocking the account', async () => {
    const r = await call({ orgId: 'orgA', name: 'Ada', company: 'Acme', phone: '12' });
    expect(r.status).toBe(200);
    expect(contact()!.phone).toBe('');
  });

  it('is IDEMPOTENT — a repeat push updates instead of creating a second contact', async () => {
    await call({ orgId: 'orgA', name: 'Ada', company: 'Acme' });
    await call({ orgId: 'orgA', name: 'Ada', company: 'Acme' });
    expect([...state.docs.keys()].filter(p => p.includes('/contacts/'))).toHaveLength(1);
  });

  it('rejects a caller who is not a member of the workspace (403)', async () => {
    state.docs.delete('organizations/orgA/members/newuser');
    expect((await call({ orgId: 'orgA', name: 'Ada', company: 'Acme' })).status).toBe(403);
  });

  it('requires authentication (401) and an orgId (400)', async () => {
    state.claims = null;
    expect((await call({ orgId: 'orgA', name: 'Ada', company: 'Acme' })).status).toBe(401);
    state.claims = { uid: 'newuser', email: 'ada@acme.com' };
    expect((await call({ name: 'Ada', company: 'Acme' })).status).toBe(400);
  });
});
