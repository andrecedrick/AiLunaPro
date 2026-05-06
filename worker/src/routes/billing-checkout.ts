/**
 * POST /api/billing/checkout — Phase J1.3 (multi-currency)
 *
 * Resolution:
 *   plan ∈ {starter, professional, enterprise}
 *   currency? ∈ enabledCurrencies
 *
 * Selection order:
 *   1. activePriceIdsByCurrency[plan][currency]      (admin override)
 *   2. legacy activePriceIds[plan]                    (only if no explicit currency)
 *   3. PLAN_TO_PRODUCT[plan] → prices.list           (only if no explicit currency)
 *
 * Strict failure:
 *   If user EXPLICITLY selects a currency and step 1 returns nothing,
 *   return 400 — no silent fallback to USD.
 *
 * Auth:    Firebase JWT
 * Secrets: STRIPE_SECRET_KEY server-side only
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import { isSupportedCurrency } from '../lib/currency';
import { PLAN_TO_PRODUCT, isValidPlan, type Plan } from '../lib/billing-admin-shared';
import type { AppEnv } from '../index';

const checkout = new Hono<AppEnv>();

const SUCCESS_URL = 'http://localhost:5173/#/billing/success';
const CANCEL_URL  = 'http://localhost:5173/#/billing?status=cancel';

interface CheckoutBody {
  orgId:      string;
  plan?:      Plan;
  planKey?:   Plan;
  currency?:  string;
  productId?: string;
}

interface PaymentSettingsFs {
  billingAddressCollection?: 'auto' | 'required';
  taxIdCollection?:          'off' | 'required';
  allowPromotionCodes?:      boolean;
}

async function resolvePriceFromProduct(stripe: Stripe, productId: string): Promise<string | null> {
  const prices = await stripe.prices.list({
    product: productId, active: true, type: 'recurring', limit: 10,
  });
  const monthly = prices.data.find(p => p.recurring?.interval === 'month');
  return (monthly ?? prices.data[0])?.id ?? null;
}

checkout.post('/api/billing/checkout', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };

  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' }, 503);
  if (env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    return c.json({ error: 'Live Stripe key blocked in dev. Use sk_test_ key only.' }, 403);
  }

  let body: CheckoutBody;
  try { body = await c.req.json<CheckoutBody>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const orgId = body.orgId;
  const plan  = (body.plan ?? body.planKey) as Plan | undefined;
  const explicitProductId = body.productId;
  const explicitCurrency  = body.currency?.toLowerCase();

  if (!orgId)                                        return c.json({ error: 'Missing orgId' }, 400);
  if (!plan && !explicitProductId)                   return c.json({ error: 'Missing plan or productId' }, 400);
  if (plan && !isValidPlan(plan))                    return c.json({ error: 'Invalid plan' }, 400);
  if (explicitCurrency && !isSupportedCurrency(explicitCurrency)) {
    return c.json({ error: `Unsupported currency: ${explicitCurrency}` }, 400);
  }

  // Read billing config (best-effort)
  const config = env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/billing_config/current`)
    : null;

  const activeByCurrency = (config?.activePriceIdsByCurrency as Record<string, Record<string, string>> | undefined) ?? {};
  const legacyActive     = (config?.activePriceIds          as Record<string, string>                | undefined) ?? {};
  const paymentSettings  = (config?.paymentSettings         as PaymentSettingsFs                     | undefined) ?? {};

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  // ── Price resolution ──────────────────────────────────
  let priceId: string | null = null;
  let resolvedCurrency: string | undefined;

  if (plan && explicitCurrency) {
    // Strict: explicit currency MUST have an active price
    const id = activeByCurrency[plan]?.[explicitCurrency];
    if (!id) {
      console.warn('[checkout] explicit currency miss — plan:', plan, 'currency:', explicitCurrency);
      return c.json({
        error: `No active price configured for ${plan} in ${explicitCurrency.toUpperCase()}`,
      }, 400);
    }
    priceId = id;
    resolvedCurrency = explicitCurrency;
  } else if (plan) {
    // No explicit currency → try legacy then prices.list
    priceId = legacyActive[plan] ?? null;
    if (!priceId) {
      try {
        priceId = await resolvePriceFromProduct(stripe, PLAN_TO_PRODUCT[plan]);
      } catch (err) {
        if (err instanceof Stripe.errors.StripeError) {
          return c.json({ error: `Stripe prices.list: ${err.message}`, code: err.code ?? err.type }, 400);
        }
        throw err;
      }
    }
  } else if (explicitProductId) {
    // productId path (legacy)
    try {
      priceId = await resolvePriceFromProduct(stripe, explicitProductId);
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        return c.json({ error: `Stripe prices.list: ${err.message}`, code: err.code ?? err.type }, 400);
      }
      throw err;
    }
  }

  if (!priceId) {
    return c.json({ error: `Could not resolve a Stripe price for plan: ${plan ?? '(none)'}` }, 422);
  }

  console.log('[checkout] orgId=', orgId, 'plan=', plan, 'currency=', resolvedCurrency ?? '(default)', 'priceId=', priceId);

  // ── Session creation with payment settings ────────────
  const successUrl = `${SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`;
  console.log('[checkout] success_url=', successUrl);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode:                 'subscription',
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          successUrl,
    cancel_url:           CANCEL_URL,
    client_reference_id:  orgId,
    metadata:             { orgId, ...(plan ? { plan } : {}), ...(resolvedCurrency ? { currency: resolvedCurrency } : {}) },
    subscription_data:    { metadata: { orgId, ...(plan ? { plan } : {}), ...(resolvedCurrency ? { currency: resolvedCurrency } : {}) } },
    allow_promotion_codes:      paymentSettings.allowPromotionCodes      ?? true,
    billing_address_collection: paymentSettings.billingAddressCollection ?? 'auto',
  };
  if (paymentSettings.taxIdCollection === 'required') {
    sessionParams.tax_id_collection = { enabled: true };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[checkout] session create failed:', err.type, err.code, err.message);
      const status = err.statusCode ?? 502;
      return c.json({
        error: err.message,
        code:  err.code ?? err.type,
      }, status as 400 | 401 | 402 | 403 | 404 | 422 | 500 | 502);
    }
    throw err;
  }

  if (!session.url) {
    return c.json({ error: 'Stripe session created but URL is empty' }, 502);
  }

  console.log('[checkout] session created:', session.id);
  return c.json({ url: session.url });
});

export default checkout;
