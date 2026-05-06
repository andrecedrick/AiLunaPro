/**
 * GET /api/billing/admin/status?orgId=... — Phase J1.3
 * Owner-only. Stripe + Firestore + webhook diagnostics. No secrets.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import { getWebhookHealth } from './billing-config';
import type { AppEnv } from '../index';

const status = new Hono<AppEnv>();

status.get('/api/billing/admin/status', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
  const orgId = c.get('orgId') as string;

  const stripeConfigured     = Boolean(env.STRIPE_SECRET_KEY);
  const webhookConfigured    = Boolean(env.STRIPE_WEBHOOK_SECRET);
  const firestoreConfigured  = Boolean(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const stripeMode =
    !env.STRIPE_SECRET_KEY                       ? 'unset'
    : env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test'
    : env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live'
    : 'unknown';

  // Last webhook event (ephemeral)
  const wh = getWebhookHealth();
  const lastWebhookEvent = wh.lastEventId ? {
    id:    wh.lastEventId,
    type:  undefined,                 // not tracked by recordWebhookEvent today
    ok:    wh.lastVerified === true,
    error: wh.lastError ?? undefined,
    at:    wh.lastEventTimestamp ?? '',
  } : null;

  // Last invoice count for org (best-effort)
  let lastInvoiceCount = 0;
  if (stripeConfigured && firestoreConfigured) {
    try {
      const sub = await firestoreGet(
        env.FIREBASE_SERVICE_ACCOUNT_JSON!,
        `organizations/${orgId}/subscriptions/current`,
      );
      const customerId = sub?.stripeCustomerId as string | undefined;
      if (customerId) {
        const stripe = getStripe(env.STRIPE_SECRET_KEY!);
        const list = await stripe.invoices.list({ customer: customerId, limit: 1 });
        lastInvoiceCount = list.has_more ? 100 : list.data.length;
      }
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        console.warn('[admin-status] invoices.list failed:', err.message);
      }
    }
  }

  // Currency default
  const config = firestoreConfigured
    ? await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}/billing_config/current`)
    : null;
  const currencyDefault =
    (config?.currencySettings as { defaultCurrency?: string } | undefined)?.defaultCurrency ?? 'usd';

  return c.json({
    ok: stripeConfigured && webhookConfigured && firestoreConfigured,
    stripeMode,
    stripeConfigured,
    webhookConfigured,
    firestoreConfigured,
    lastWebhookEvent,
    lastInvoiceCount,
    currencyDefault,
  });
});

export default status;
