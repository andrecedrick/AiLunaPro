/**
 * GET /api/billing/config-status — Phase I.5
 *
 * Read-only diagnostic endpoint. Returns booleans + masked metadata only.
 * NEVER returns raw secret values.
 *
 * Auth: requires valid Firebase JWT. Role-gating (owner-only) is enforced
 * client-side in I.5 (Sidebar hides the page from non-owners). The endpoint
 * itself returns no secret data, so a non-owner reaching it leaks nothing.
 * Full role enforcement at the worker requires a Firestore membership read,
 * deferred to J1.
 *
 * Webhook health is in-memory only (resets on worker restart). KV persistence
 * deferred to J1.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { last4, detectMode, isConfigured } from '../lib/maskKey';
import type { AppEnv } from '../index';

interface BillingConfigEnv {
  // Server-side secrets — set via `wrangler secret put`. Never exposed raw.
  STRIPE_SECRET_KEY?:           string;
  STRIPE_WEBHOOK_SECRET?:       string;
  // Publishable key — safe to derive last4 from. Stripe designs it for client.
  STRIPE_PUBLISHABLE_KEY?:      string;
  // Price IDs — not secret in Stripe's model, but we still mask to last4.
  STRIPE_PRICE_STARTER?:        string;
  STRIPE_PRICE_PROFESSIONAL?:   string;
  STRIPE_PRICE_ENTERPRISE?:     string;
}

// In-memory ring buffer for webhook health. Ephemeral — resets on worker restart.
// Module-level state is per-isolate; acceptable for I.5 dev diagnostic only.
interface WebhookHealth {
  lastEventId:        string | null;
  lastEventTimestamp: string | null;
  lastVerified:       boolean | null;
  lastError:          string | null;
}

const webhookHealth: WebhookHealth = {
  lastEventId:        null,
  lastEventTimestamp: null,
  lastVerified:       null,
  lastError:          null,
};

/** Internal: webhook handler (J1) will call this to record verification result. */
export function recordWebhookEvent(eventId: string, verified: boolean, error?: string): void {
  webhookHealth.lastEventId        = eventId;
  webhookHealth.lastEventTimestamp = new Date().toISOString();
  webhookHealth.lastVerified       = verified;
  webhookHealth.lastError          = error ?? null;
}

const billingConfig = new Hono<AppEnv>();

billingConfig.get('/api/billing/config-status', requireAuth(), c => {
  const env = c.env as unknown as BillingConfigEnv & AppEnv['Bindings'];

  const pk = env.STRIPE_PUBLISHABLE_KEY;

  return c.json({
    mode: detectMode(pk),
    publishableKey: {
      configured: isConfigured(pk),
      last4:      last4(pk),
    },
    secretKey: {
      // Boolean only. Never expose any portion of the secret value.
      configured: isConfigured(env.STRIPE_SECRET_KEY),
    },
    webhookSecret: {
      configured: isConfigured(env.STRIPE_WEBHOOK_SECRET),
    },
    priceIds: {
      starter: {
        configured: isConfigured(env.STRIPE_PRICE_STARTER),
        last4:      last4(env.STRIPE_PRICE_STARTER),
      },
      professional: {
        configured: isConfigured(env.STRIPE_PRICE_PROFESSIONAL),
        last4:      last4(env.STRIPE_PRICE_PROFESSIONAL),
      },
      enterprise: {
        configured: isConfigured(env.STRIPE_PRICE_ENTERPRISE),
        last4:      last4(env.STRIPE_PRICE_ENTERPRISE),
      },
    },
    webhook: {
      lastEventId:        webhookHealth.lastEventId,
      lastEventTimestamp: webhookHealth.lastEventTimestamp,
      lastVerified:       webhookHealth.lastVerified,
      lastError:          webhookHealth.lastError,
    },
  });
});

export default billingConfig;
