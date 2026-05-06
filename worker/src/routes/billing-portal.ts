/**
 * POST /api/billing/portal — Phase J1
 *
 * Creates a Stripe Customer Portal session.
 * Reads stripeCustomerId from Firestore organizations/{orgId}/subscriptions/current.
 * Returns { url } — frontend redirects to Stripe-hosted portal.
 *
 * Auth: requires valid Firebase JWT.
 * Secrets: STRIPE_SECRET_KEY server-side only.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const portal = new Hono<AppEnv>();

portal.post('/api/billing/portal', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };

  if (!env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 503);
  }
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Service account not configured' }, 503);
  }

  let body: { orgId?: string };
  try {
    body = await c.req.json<{ orgId: string }>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const orgId = body.orgId;
  if (!orgId) return c.json({ error: 'Missing orgId' }, 400);

  console.log('[portal] orgId=', orgId);

  const sub = await firestoreGet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON,
    `organizations/${orgId}/subscriptions/current`,
  );

  const customerId = sub?.stripeCustomerId as string | null;
  if (!customerId) {
    console.warn('[portal] no stripeCustomerId found for orgId=', orgId);
    return c.json({ error: 'No active Stripe customer found for this organization' }, 404);
  }
  console.log('[portal] customerId=', customerId);

  const returnUrl = 'http://localhost:5173/#/billing';
  const stripe    = getStripe(env.STRIPE_SECRET_KEY);

  let session;
  try {
    session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: returnUrl,
    });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[portal] Stripe error:', err.message);
      const status = err.statusCode ?? 502;
      return c.json({ error: err.message, code: err.code ?? err.type }, status as 400 | 401 | 402 | 403 | 404 | 422 | 500 | 502);
    }
    throw err;
  }

  console.log('[portal] session created url=', session.url);
  return c.json({ url: session.url });
});

export default portal;
