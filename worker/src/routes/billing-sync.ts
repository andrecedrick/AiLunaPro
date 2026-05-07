/**
 * POST /api/billing/sync-session — Phase J1.2
 *
 * Fallback subscription sync. Frontend only sends sessionId — worker derives
 * orgId from Stripe session itself, so it works even if frontend lost org
 * context across the Stripe redirect.
 *
 * Input:  { sessionId }
 *
 * orgId resolution order:
 *   1. session.client_reference_id
 *   2. session.metadata.orgId
 *   3. subscription.metadata.orgId
 * → if none found, 400 with clear message.
 *
 * Auth:    requires Firebase JWT (uid extracted but not strictly enforced
 *          against orgId membership in J1.2 test mode — logged for J2 hardening).
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { getStripe } from '../lib/stripe';
import { firestoreSet } from '../lib/firestoreAdmin';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const sync = new Hono<AppEnv>();

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
  if (typeof price.product === 'string') return price.product;
  if (price.product && typeof price.product === 'object' && 'id' in price.product) {
    return (price.product as Stripe.Product).id;
  }
  return null;
}

interface SyncBody {
  sessionId: string;
  orgId?:    string; // optional — fallback if Stripe session metadata is missing
}

sync.post('/api/billing/sync-session', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
  const uid = c.get('uid'); // from requireAuth middleware

  if (!env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 503);
  }
  const blocked = assertStripeKeyAllowed(env);
  if (blocked) return c.json(blocked.body, blocked.status);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Service account not configured' }, 503);
  }

  let body: SyncBody;
  try {
    body = await c.req.json<SyncBody>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { sessionId } = body;
  if (!sessionId) {
    return c.json({ error: 'Missing sessionId' }, 400);
  }

  console.log('[sync-session] sessionId=', sessionId, 'uid=', uid);

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.items.data.price', 'customer'],
    });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[sync-session] retrieve failed:', err.message);
      return c.json({ error: `Stripe retrieve: ${err.message}`, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  console.log('[sync-session] stripe session client_reference_id=', session.client_reference_id);
  console.log('[sync-session] metadata.orgId=', session.metadata?.orgId);
  console.log('[sync-session] payment_status=', session.payment_status, 'status=', session.status);

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return c.json({
      error:          'Payment not yet completed',
      sessionStatus:  session.status,
      paymentStatus:  session.payment_status,
    }, 409);
  }

  // Resolve subscription
  const subRaw = session.subscription;
  if (!subRaw) {
    return c.json({ error: 'Session has no subscription attached' }, 422);
  }
  const sub: Stripe.Subscription = typeof subRaw === 'string'
    ? await stripe.subscriptions.retrieve(subRaw, { expand: ['items.data.price'] })
    : (subRaw as Stripe.Subscription);

  // ── orgId resolution: Stripe-first, body fallback ─────
  const orgId =
    session.client_reference_id
    ?? (session.metadata?.orgId as string | undefined)
    ?? (sub.metadata?.orgId as string | undefined)
    ?? body.orgId;

  if (!orgId) {
    console.error('[sync-session] no orgId found anywhere');
    return c.json({
      error: 'No orgId found on Stripe session or subscription metadata. Re-create the checkout session with client_reference_id set.',
    }, 400);
  }

  console.log('[sync-session] resolved orgId=', orgId);

  // Resolve plan: metadata.plan first, fallback product map
  const metadataPlan = session.metadata?.plan ?? sub.metadata?.plan;
  const productId    = extractProductId(sub);
  const plan = (metadataPlan && ['Starter', 'Professional', 'Enterprise'].includes(metadataPlan as string))
    ? (metadataPlan as 'Starter' | 'Professional' | 'Enterprise')
    : planFromProduct(productId);

  console.log('[sync-session] subscriptionId=', sub.id, 'plan=', plan, 'productId=', productId);

  const item       = sub.items?.data?.[0];
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? null;

  if (!customerId) {
    return c.json({ error: 'Session has no customer attached' }, 422);
  }

  const subDoc = {
    stripeCustomerId:     customerId,
    stripeSubscriptionId: sub.id,
    stripeProductId:      productId ?? null,
    plan,
    status:               sub.status,
    currency:             sub.currency ?? null,
    currentPeriodStart:   item ? new Date(item.current_period_start * 1000).toISOString() : null,
    currentPeriodEnd:     item ? new Date(item.current_period_end   * 1000).toISOString() : null,
    cancelAtPeriodEnd:    sub.cancel_at_period_end,
    updatedAt:            new Date().toISOString(),
  };

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON,
      `organizations/${orgId}/subscriptions/current`,
      subDoc,
    );
    console.log('[sync-session] write success orgId=', orgId, 'plan=', plan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firestore write failed';
    console.error('[sync-session] write failed:', msg);
    return c.json({ error: `Firestore write failed: ${msg}` }, 500);
  }

  // Persist orgId+plan onto sub metadata for future webhook events
  try {
    await stripe.subscriptions.update(sub.id, { metadata: { orgId, plan } });
  } catch (err) {
    console.warn('[sync-session] metadata update failed (non-fatal):', err);
  }

  return c.json({
    ok: true,
    orgId,
    subscription: subDoc,
  });
});

export default sync;
