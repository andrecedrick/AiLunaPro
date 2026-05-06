/**
 * POST /api/stripe/webhook — Phase J1.1
 *
 * Real webhook handler with Stripe signature verification.
 * No auth middleware — Stripe signs its own events via Stripe-Signature header.
 * Syncs subscription state to Firestore after each relevant event.
 *
 * Pricing Table flow (J1.1):
 *   1. checkout.session.completed →
 *        orgId  = session.client_reference_id (Pricing Table) OR session.metadata.orgId (custom)
 *        plan   = PRODUCT_TO_PLAN[ subscription.items[0].price.product ]
 *        write  organizations/{orgId}/subscriptions/current
 *        update sub.metadata { orgId, plan } so future events resolve natively
 *   2. customer.subscription.updated/created → read sub.metadata.orgId
 *   3. customer.subscription.deleted → read sub.metadata.orgId, set Free/canceled
 *
 * Secrets: STRIPE_WEBHOOK_SECRET server-side only.
 */

import { Hono } from 'hono';
import { getStripe } from '../lib/stripe';
import { firestoreSet } from '../lib/firestoreAdmin';
import { recordWebhookEvent } from './billing-config';
import type { AppEnv } from '../index';
import type Stripe from 'stripe';

const stripe = new Hono<AppEnv>();

// ── Product → app plan map (J1.1) ────────────────────────────
// Real Stripe test-mode product IDs. Update for J2 production.
const PRODUCT_TO_PLAN: Record<string, 'Starter' | 'Professional' | 'Enterprise'> = {
  prod_USl0378mg0WpXH: 'Starter',
  prod_USl1qstrufNmjk: 'Professional',
  prod_USl2FAygpK0wW2: 'Enterprise',
};

function planFromProduct(productId: string | null | undefined): 'Starter' | 'Professional' | 'Enterprise' {
  if (productId && PRODUCT_TO_PLAN[productId]) return PRODUCT_TO_PLAN[productId];
  return 'Starter';
}

function extractProductId(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  if (!item) return null;
  const price = item.price;
  // price.product is either a string id or an expanded Product
  if (typeof price.product === 'string') return price.product;
  if (price.product && typeof price.product === 'object' && 'id' in price.product) {
    return (price.product as Stripe.Product).id;
  }
  return null;
}

stripe.post('/api/stripe/webhook', async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: 'Stripe not configured' }, 503);
  }

  const sig = c.req.header('Stripe-Signature');
  if (!sig) {
    return c.json({ error: 'Missing Stripe-Signature' }, 400);
  }

  const rawBody = await c.req.text();
  const stripeClient = getStripe(env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = await stripeClient.webhooks.constructEventAsync(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    recordWebhookEvent('unknown', false, msg);
    return c.json({ error: msg }, 400);
  }

  recordWebhookEvent(event.id, true);
  console.log('[webhook]', event.type, event.id);

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ received: true, warning: 'No service account — sync skipped' });
  }

  try {
    await handleEvent(event, env.FIREBASE_SERVICE_ACCOUNT_JSON, stripeClient);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Event handling failed';
    console.error('[webhook] handler error:', msg);
    recordWebhookEvent(event.id, false, msg);
    // Return 200 to prevent Stripe retries for non-signature errors
    return c.json({ received: true, error: msg });
  }

  return c.json({ received: true });
});

async function handleEvent(
  event: Stripe.Event,
  saJson: string,
  stripeClient: Stripe,
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Pricing Table: client_reference_id. Custom checkout: metadata.orgId.
      const orgId = session.client_reference_id ?? session.metadata?.orgId;
      if (!orgId) {
        console.warn('[webhook] checkout.completed missing orgId (no client_reference_id or metadata.orgId)');
        break;
      }
      if (!session.customer || !session.subscription) {
        console.warn('[webhook] checkout.completed missing customer or subscription');
        break;
      }

      const subId = String(session.subscription);

      // Retrieve subscription with price expanded → resolve product → plan
      const sub = await stripeClient.subscriptions.retrieve(subId, {
        expand: ['items.data.price'],
      });

      const productId = extractProductId(sub);
      const plan      = planFromProduct(productId);
      const item      = sub.items?.data?.[0];

      await firestoreSet(saJson, `organizations/${orgId}/subscriptions/current`, {
        stripeCustomerId:     String(session.customer),
        stripeSubscriptionId: subId,
        stripeProductId:      productId ?? null,
        plan,
        status:               sub.status,
        currency:             sub.currency ?? null,
        currentPeriodStart:   item ? new Date(item.current_period_start * 1000).toISOString() : null,
        currentPeriodEnd:     item ? new Date(item.current_period_end * 1000).toISOString() : null,
        cancelAtPeriodEnd:    sub.cancel_at_period_end,
        updatedAt:            new Date().toISOString(),
      });

      // Persist orgId + plan onto subscription metadata so future events
      // (subscription.updated/deleted) can resolve without client_reference_id.
      await stripeClient.subscriptions.update(subId, {
        metadata: { orgId, plan },
      });

      console.log('[webhook] checkout synced — orgId:', orgId, 'plan:', plan, 'product:', productId);
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      if (!orgId) {
        console.warn('[webhook] subscription.', event.type, 'missing metadata.orgId — skipping');
        break;
      }

      const productId = extractProductId(sub);
      const plan      = planFromProduct(productId);
      const item      = sub.items?.data?.[0];

      await firestoreSet(saJson, `organizations/${orgId}/subscriptions/current`, {
        stripeCustomerId:     String(sub.customer),
        stripeSubscriptionId: sub.id,
        stripeProductId:      productId ?? null,
        plan,
        status:               sub.status,
        currency:             sub.currency ?? null,
        currentPeriodStart:   item ? new Date(item.current_period_start * 1000).toISOString() : null,
        currentPeriodEnd:     item ? new Date(item.current_period_end * 1000).toISOString() : null,
        cancelAtPeriodEnd:    sub.cancel_at_period_end,
        updatedAt:            new Date().toISOString(),
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      if (!orgId) {
        console.warn('[webhook] subscription.deleted missing metadata.orgId — skipping');
        break;
      }

      await firestoreSet(saJson, `organizations/${orgId}/subscriptions/current`, {
        stripeCustomerId:     String(sub.customer),
        stripeSubscriptionId: sub.id,
        stripeProductId:      null,
        plan:                 'Free',
        status:               'canceled',
        cancelAtPeriodEnd:    false,
        updatedAt:            new Date().toISOString(),
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const rawInvoice = invoice as unknown as Record<string, unknown>;
      const subId = typeof rawInvoice.subscription === 'string'
        ? rawInvoice.subscription
        : null;
      console.warn('[webhook] payment_failed for subscription:', subId ?? 'unknown');
      break;
    }

    default:
      break;
  }
}

export default stripe;
