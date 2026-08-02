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
 * Auth:    requires Firebase JWT; the caller must be an owner/billing member of
 *          the Stripe-resolved org (membership enforced below). orgId is never
 *          taken from the request body — only from the Stripe session/sub.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { getStripe } from '../lib/stripe';
import { firestoreSet, firestoreGet } from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import { syncBalanceAllocation } from '../lib/tokens';
import { planLabelFromProductId, extractProductIdFromSubscription, resolvePlanProducts } from '../lib/billing-admin-shared';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const sync = new Hono<AppEnv>();

interface SyncBody {
  sessionId: string;
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

  dlog(env, '[sync-session] sessionId=', sessionId, 'uid=', uid);

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

  dlog(env, '[sync-session] stripe session client_reference_id=', session.client_reference_id);
  dlog(env, '[sync-session] metadata.orgId=', session.metadata?.orgId);
  dlog(env, '[sync-session] payment_status=', session.payment_status, 'status=', session.status);

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

  // ── orgId resolution: Stripe-ONLY ────────────────────
  // The org is derived solely from the Stripe session/subscription. We must NOT
  // fall back to a client-supplied body.orgId: a billing-role member could pass
  // a metadata-less paid session id + their own orgId and bind a subscription
  // they never paid for to their workspace (plan forgery). No Stripe org = 400.
  const orgId =
    session.client_reference_id
    ?? (session.metadata?.orgId as string | undefined)
    ?? (sub.metadata?.orgId as string | undefined);

  if (!orgId) {
    console.error('[sync-session] no orgId found anywhere');
    return c.json({
      error: 'No orgId found on Stripe session or subscription metadata. Re-create the checkout session with client_reference_id set.',
    }, 400);
  }

  dlog(env, '[sync-session] resolved orgId=', orgId);

  // Membership guard: the caller must be a billing-capable member of the
  // resolved org. Without this, any authenticated user with a replayed/known
  // session id could write to another org's subscription doc (cross-workspace
  // write). Service account read bypasses rules; we enforce role here.
  {
    const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saJson) {
      return c.json({ error: 'Service account not configured' }, 503);
    }
    const member = await firestoreGet(saJson, `organizations/${orgId}/members/${uid}`);
    const role   = member?.role as string | undefined;
    if (!role || !['owner', 'billing'].includes(role)) {
      console.warn('[sync-session] membership denied — uid:', uid, 'orgId:', orgId, 'role:', role ?? 'none');
      return c.json({ error: 'Forbidden: not a billing member of this organization', code: 'FORBIDDEN' }, 403);
    }
  }

  // Resolve plan: metadata.plan first, fallback product map
  const metadataPlan = session.metadata?.plan ?? sub.metadata?.plan;
  const productId    = extractProductIdFromSubscription(sub);
  const plan = (metadataPlan && ['Starter', 'Professional', 'Enterprise'].includes(metadataPlan as string))
    ? (metadataPlan as 'Starter' | 'Professional' | 'Enterprise')
    : planLabelFromProductId(productId, resolvePlanProducts(env));

  dlog(env, '[sync-session] subscriptionId=', sub.id, 'plan=', plan, 'productId=', productId);

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
    dlog(env, '[sync-session] write success orgId=', orgId, 'plan=', plan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firestore write failed';
    console.error('[sync-session] write failed:', msg);
    return c.json({ error: `Firestore write failed: ${msg}` }, 500);
  }

  // J1: sync token allocation to plan. Must match webhook behavior so the
  // frontend fallback path leaves tokens/current in the same state as the
  // webhook would. Non-fatal — failure here does not abort the sync flow.
  try {
    await syncBalanceAllocation(env.FIREBASE_SERVICE_ACCOUNT_JSON, orgId, plan);
  } catch (err) {
    console.warn('[sync-session] syncBalanceAllocation failed (non-fatal):', err);
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
