import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * §27.4c — the value handed to Stripe, not the outcome.
 *
 * A whitespace-padded STRIPE_WEBHOOK_SECRET took live fulfilment down for 80
 * minutes because a padded secret and a WRONG secret fail identically. Every
 * Stripe id in this codebase is installed by hand and exposed to the same paste
 * artefact, so the top-up price is trimmed at the point of use.
 *
 * A mocked Stripe accepts anything, so only the ARGUMENT can prove it. These
 * tests capture `line_items` and assert on the id itself.
 */

const captured = vi.hoisted(() => ({ params: null as Record<string, unknown> | null }));

vi.mock('../../worker/src/lib/stripe', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: async (params: Record<string, unknown>) => {
          captured.params = params;
          return { id: 'cs_live_1', url: 'https://checkout.stripe.com/c/pay/cs_live_1' };
        },
      },
    },
  }),
}));
vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: string) => void }, next: () => Promise<void>) => {
    c.set('uid', 'uid_1'); await next();
  },
}));
vi.mock('../../worker/src/middleware/requireRole', () => ({
  requireRole: () => async (c: { set: (k: string, v: string) => void; req: { raw: Request } }, next: () => Promise<void>) => {
    const body = await c.req.raw.clone().json() as { orgId?: string };
    c.set('orgId', body.orgId ?? 'orgA'); c.set('role', 'owner'); await next();
  },
}));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async () => null),
  firestoreSet: vi.fn(async () => undefined),
  firestoreGetWithMeta: vi.fn(async () => null),
  firestoreSetIfMatch: vi.fn(async () => true),
  firestoreCreateIfNotExists: vi.fn(async () => undefined),
  firestoreRunQuery: vi.fn(async () => []),
}));

import tokensRoute from '../../worker/src/routes/tokens';

const post = (env: Record<string, unknown>) => tokensRoute.request('/api/tokens/topup', {
  method: 'POST',
  headers: { Authorization: 'Bearer x', 'Content-Type': 'application/json' },
  body: JSON.stringify({ orgId: 'orgA', pack: 'starter' }),
}, env);

const BASE = {
  STRIPE_SECRET_KEY: 'sk_live_x',
  FIREBASE_SERVICE_ACCOUNT_JSON: '{}',
  APP_ENV: 'production',
  APP_BASE_URL: 'https://audit.ailunapro.com',
};

beforeEach(() => { captured.params = null; });

describe('token top-up — the price id handed to Stripe', () => {
  it('trims a padded price id', async () => {
    const res = await post({ ...BASE, STRIPE_TOKEN_PRICE_STARTER: '  price_live_starter\n' });
    expect(res.status).toBe(200);
    expect(captured.params?.line_items).toEqual([{ price: 'price_live_starter', quantity: 1 }]);
  });

  it('passes a clean price id through untouched', async () => {
    await post({ ...BASE, STRIPE_TOKEN_PRICE_STARTER: 'price_live_starter' });
    expect(captured.params?.line_items).toEqual([{ price: 'price_live_starter', quantity: 1 }]);
  });

  it('a whitespace-only secret is treated as unset — 503, and Stripe is never called', async () => {
    // Without the trim this reaches Stripe as "   " and fails there instead,
    // which is the difference between a clean product error and a Stripe error.
    const res = await post({ ...BASE, STRIPE_TOKEN_PRICE_STARTER: '   ' });
    expect(res.status).toBe(503);
    expect((await res.json() as { code: string }).code).toBe('PACK_NOT_CONFIGURED');
    expect(captured.params).toBeNull();
  });

  it('an absent secret returns PACK_NOT_CONFIGURED, never a Stripe call', async () => {
    const res = await post({ ...BASE });
    expect(res.status).toBe(503);
    expect(captured.params).toBeNull();
  });
});
