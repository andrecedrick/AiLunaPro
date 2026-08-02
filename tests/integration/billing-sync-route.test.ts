import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * C2 — billing-sync must derive orgId ONLY from the Stripe session/subscription,
 * never from a client-supplied body.orgId. Otherwise a billing-role member could
 * bind a paid-but-metadata-less session id to their own org (plan forgery).
 */

const state = vi.hoisted(() => ({
  members: new Map<string, string>(),   // "org/uid" -> role
  writes:  new Map<string, Record<string, unknown>>(),
  session: null as Record<string, unknown> | null,
}));

// Pass-through auth: inject uid from a test header (real requireAuth does jwtVerify).
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { req: { header: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('uid', c.req.header('x-test-uid') ?? '');
    await next();
  },
}));

const fakeSub = {
  id: 'sub_1', status: 'active', currency: 'usd', metadata: {} as Record<string, string>,
  cancel_at_period_end: false,
  items: { data: [{ price: { id: 'price_1' }, current_period_start: 1_700_000_000, current_period_end: 1_702_592_000 }] },
};

vi.mock('../../worker/src/lib/stripe', () => ({
  getStripe: () => ({
    checkout: { sessions: { retrieve: vi.fn(async () => state.session) } },
    subscriptions: { retrieve: vi.fn(async () => fakeSub), update: vi.fn(async () => ({})) },
  }),
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => {
    const m = path.match(/^organizations\/([^/]+)\/members\/([^/]+)$/);
    if (m) { const role = state.members.get(`${m[1]}/${m[2]}`); return role ? { role } : null; }
    return null;
  }),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => { state.writes.set(path, data); }),
}));

vi.mock('../../worker/src/lib/env', () => ({ assertStripeKeyAllowed: () => undefined }));
vi.mock('../../worker/src/lib/tokens', () => ({ syncBalanceAllocation: vi.fn(async () => undefined) }));
vi.mock('../../worker/src/lib/billing-admin-shared', () => ({
  planLabelFromProductId: () => 'Professional',
  extractProductIdFromSubscription: () => 'prod_1',
  // Plan products are environment-driven (§27 P1.2 Phase A); the route resolves
  // them before labelling a subscription.
  resolvePlanProducts: () => ({ starter: 'prod_1', professional: 'prod_2', enterprise: 'prod_3' }),
}));

import sync from '../../worker/src/routes/billing-sync';

const ENV = { STRIPE_SECRET_KEY: 'sk_test_1', FIREBASE_SERVICE_ACCOUNT_JSON: '{}', FIREBASE_PROJECT_ID: 'audit-ai' } as unknown as Record<string, unknown>;

function post(body: unknown, uid: string) {
  return sync.request('/api/billing/sync-session',
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-test-uid': uid }, body: JSON.stringify(body) },
    ENV);
}

/** A paid, completed session with configurable org-binding metadata. */
function paidSession(opts: { clientRef?: string | null; metaOrg?: string | null } = {}) {
  return {
    client_reference_id: opts.clientRef ?? null,
    metadata: opts.metaOrg ? { orgId: opts.metaOrg } : {},
    payment_status: 'paid', status: 'complete', customer: 'cus_1',
    subscription: fakeSub,
  };
}

beforeEach(() => {
  state.members.clear(); state.writes.clear();
  state.members.set('orgA/uid-1', 'owner');   // caller is owner of orgA
  fakeSub.metadata = {};
  vi.clearAllMocks();
});

describe('POST /api/billing/sync-session (C2 — no cross-org binding)', () => {
  it('rejects a metadata-less session even with a spoofed body.orgId (no plan forgery)', async () => {
    state.session = paidSession({ clientRef: null, metaOrg: null });   // Stripe carries no org
    const res = await post({ sessionId: 'cs_x', orgId: 'orgA' }, 'uid-1');   // caller owns orgA, spoofs body.orgId
    expect(res.status).toBe(400);                                            // 400, not a write
    expect(state.writes.has('organizations/orgA/subscriptions/current')).toBe(false);
  });

  it('binds the subscription when the Stripe session names the org (client_reference_id)', async () => {
    state.session = paidSession({ clientRef: 'orgA' });
    const res = await post({ sessionId: 'cs_x' }, 'uid-1');
    expect(res.status).toBe(200);
    const doc = state.writes.get('organizations/orgA/subscriptions/current');
    expect(doc).toBeTruthy();
    expect(doc!.plan).toBe('Professional');
    expect(doc!.stripeSubscriptionId).toBe('sub_1');
  });

  it('forbids a caller who is not a billing member of the Stripe-resolved org', async () => {
    state.session = paidSession({ clientRef: 'orgB' });   // session names orgB; caller only owns orgA
    const res = await post({ sessionId: 'cs_x', orgId: 'orgA' }, 'uid-1');
    expect(res.status).toBe(403);
    expect(state.writes.has('organizations/orgB/subscriptions/current')).toBe(false);
  });
});
