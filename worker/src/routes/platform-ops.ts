/**
 * Platform-operator ops status (J7 Batch 1).
 *
 * GET /api/platform/ops-status
 *   Auth + platform-admin required. Returns BOOLEANS ONLY (configured: true/false)
 *   for operationally-relevant secrets/bindings, plus the app env marker. It NEVER
 *   returns secret values, and never last4 of secret material. Powers the read-only
 *   Operator Config Console (J7A) + guided wrangler setup (J7B). 403 for non-admins
 *   (requirePlatformAdmin), so this is NOT a public probe.
 *
 * Security: fail-closed. No value, no length, no last4 of any secret. The only
 * non-secret detail is the publishable-key Stripe mode (test/live/unset), which
 * Stripe designs for client exposure.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { detectMode } from '../lib/maskKey';
import type { AppEnv } from '../index';

const platformOps = new Hono<AppEnv>();

function configured(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

platformOps.get('/api/platform/ops-status', requireAuth(), requirePlatformAdmin(), c => {
  const e = c.env;
  return c.json({
    appEnv: (e.APP_ENV ?? '').toLowerCase() || 'development(default)',
    stripeMode: detectMode((e as unknown as Record<string, string | undefined>).STRIPE_PUBLISHABLE_KEY),
    secrets: {
      // Booleans only — never the value, never last4 of secret material.
      stripeSecretKey:        configured(e.STRIPE_SECRET_KEY),
      stripeWebhookSecret:    configured(e.STRIPE_WEBHOOK_SECRET),
      firebaseServiceAccount: configured(e.FIREBASE_SERVICE_ACCOUNT_JSON),
      turnstileSecret:        configured(e.TURNSTILE_SECRET_KEY),
      sequenzyApiKey:         configured((e as unknown as Record<string, string | undefined>).SEQUENZY_API_KEY),
      platformAdminEmails:    configured(e.PLATFORM_ADMIN_EMAILS),
      tokenPriceOverage:      configured((e as unknown as Record<string, string | undefined>).STRIPE_TOKEN_PRICE_OVERAGE),
      tokenPriceStarter:      configured(e.STRIPE_TOKEN_PRICE_STARTER),
      tokenPricePro:          configured(e.STRIPE_TOKEN_PRICE_PRO),
      tokenPriceMax:          configured(e.STRIPE_TOKEN_PRICE_MAX),
      appBaseUrl:             configured(e.APP_BASE_URL),
    },
  });
});

export default platformOps;
