import { Hono } from 'hono';
import type { AppEnv } from '../index';

const health = new Hono<AppEnv>();

/**
 * GET /healthz
 * No auth. Used by uptime monitors + dev sanity checks.
 * Returns boolean flags only — never the secret values themselves.
 */
health.get('/healthz', c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };

  const stripeConfigured     = Boolean(env.STRIPE_SECRET_KEY);
  const webhookConfigured    = Boolean(env.STRIPE_WEBHOOK_SECRET);
  const firestoreConfigured  = Boolean(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const stripeMode =
    !env.STRIPE_SECRET_KEY ? 'unset'
    : env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test'
    : env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live'
    : 'unknown';

  return c.json({
    ok: true,
    timestamp: new Date().toISOString(),
    stripeConfigured,
    webhookConfigured,
    firestoreConfigured,
    stripeMode,
  });
});

export default health;
