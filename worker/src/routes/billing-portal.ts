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
import { requireRole } from '../middleware/requireRole';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const portal = new Hono<AppEnv>();

// Owner ⊇ Billing only. requireRole also verifies org membership (non-member →
// no role → 403), closing the prior any-authenticated-user gap.
portal.post('/api/billing/portal', requireAuth(), requireRole(['owner', 'billing']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    APP_BASE_URL?: string;
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

  // J1: APP_BASE_URL-driven return URL. localhost is dev-only fallback.
  const baseUrl   = env.APP_BASE_URL ?? 'http://localhost:5173';
  const returnUrl = `${baseUrl}/#/billing`;
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
