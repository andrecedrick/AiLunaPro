/**
 * POST /api/billing/checkout — Phase J1.3C
 *
 * Currency is determined SERVER-SIDE. Customers do NOT pass it manually.
 * Admin/internal callers may still pass body.currency for override.
 *
 * Detection order:
 *   1. body.currency (admin/test override only)
 *   2. request.cf.country → REGION_TO_CURRENCY
 *   3. Accept-Language → region → REGION_TO_CURRENCY
 *   4. billing_config.currencySettings.defaultCurrency
 *   5. 'usd'
 *
 * Price resolution:
 *   A. activePriceIdsByCurrency[plan][detectedCurrency]
 *   B. stripe.prices.list({ product, active, recurring monthly, currency })
 *   C. Fallback: defaultCurrency (mark currencyFallbackUsed: true)
 *   D. Else: 400 generic message (no "choose another currency" hint)
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { dlog } from '../lib/log';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import { isSupportedCurrency, type Currency } from '../lib/currency';
import { detectCurrencyFromRequest } from '../lib/geo-currency';
import { resolvePlanProducts, isValidPlan, type Plan } from '../lib/billing-admin-shared';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const checkout = new Hono<AppEnv>();

interface CheckoutBody {
  orgId:      string;
  plan?:      Plan;
  planKey?:   Plan;
  currency?:  string;       // admin/test override only
  productId?: string;
}

interface PaymentSettingsFs {
  billingAddressCollection?: 'auto' | 'required';
  taxIdCollection?:          'off' | 'required';
  allowPromotionCodes?:      boolean;
}

interface CurrencySettingsFs {
  defaultCurrency?:   Currency;
  enabledCurrencies?: Currency[];
}

/**
 * Try Firestore activePriceIdsByCurrency, else stripe.prices.list.
 */
async function resolvePriceForCurrency(
  stripe: Stripe,
  productId: string,
  currency: Currency,
  activeMap: Record<string, Record<string, string>> | undefined,
  plan: Plan,
): Promise<string | null> {
  // A. Firestore admin override
  const override = activeMap?.[plan]?.[currency];
  if (override) return override;

  // B. Stripe prices.list filtered by currency
  try {
    const prices = await stripe.prices.list({
      product:  productId,
      active:   true,
      type:     'recurring',
      currency,
      limit:    20,
    });
    const monthly = prices.data.find(p => p.recurring?.interval === 'month');
    return (monthly ?? prices.data[0])?.id ?? null;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.warn('[checkout] prices.list failed for', currency, ':', err.message);
    }
    return null;
  }
}

// Owner ⊇ Billing only. requireRole also verifies org membership.
checkout.post('/api/billing/checkout', requireAuth(), requireRole(['owner', 'billing']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    APP_BASE_URL?: string;
  };

  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured' }, 503);
  const blocked = assertStripeKeyAllowed(env);
  if (blocked) return c.json(blocked.body, blocked.status);

  // J1: base URL for Stripe redirects. Falls back to localhost only when
  // APP_BASE_URL is not configured (dev convenience). Production must set it.
  const baseUrl    = env.APP_BASE_URL ?? 'http://localhost:5173';
  const successUrl = `${baseUrl}/#/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${baseUrl}/#/billing?status=cancel`;

  let body: CheckoutBody;
  try { body = await c.req.json<CheckoutBody>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const orgId = body.orgId;
  const plan  = (body.plan ?? body.planKey) as Plan | undefined;
  const explicitProductId = body.productId;
  const explicitCurrency  = body.currency?.toLowerCase();

  if (!orgId)                                       return c.json({ error: 'Missing orgId' }, 400);
  if (!plan && !explicitProductId)                  return c.json({ error: 'Missing plan or productId' }, 400);
  if (plan && !isValidPlan(plan))                   return c.json({ error: 'Invalid plan' }, 400);
  if (explicitCurrency && !isSupportedCurrency(explicitCurrency)) {
    return c.json({ error: `Unsupported currency: ${explicitCurrency}` }, 400);
  }

  // Read billing config (currencySettings + paymentSettings + activePriceIdsByCurrency)
  const config = env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/billing_config/current`)
    : null;

  const currencySettings = (config?.currencySettings  as CurrencySettingsFs   | undefined) ?? {};
  const paymentSettings  = (config?.paymentSettings   as PaymentSettingsFs    | undefined) ?? {};
  const activeMap        = (config?.activePriceIdsByCurrency as Record<string, Record<string, string>> | undefined);

  const enabledCurrencies = (currencySettings.enabledCurrencies ?? ['usd']) as Currency[];
  const defaultCurrency   = (currencySettings.defaultCurrency   ?? 'usd')   as Currency;

  // ── Detect currency server-side ─────────────────────
  let detectedCurrency: Currency;
  let detectionSource: 'cf' | 'accept-language' | 'default' | 'admin-override';
  let detectedRegion:  string | null = null;

  if (explicitCurrency && isSupportedCurrency(explicitCurrency)) {
    detectedCurrency = explicitCurrency;
    detectionSource  = 'admin-override';
  } else {
    const det = detectCurrencyFromRequest(c, enabledCurrencies, defaultCurrency);
    detectedCurrency = det.currency;
    detectionSource  = det.source;
    detectedRegion   = det.region;
  }

  dlog(env, '[checkout] orgId=', orgId, 'plan=', plan,
              'detected_country=', detectedRegion ?? '(none)',
              'detected_currency=', detectedCurrency,
              'source=', detectionSource);

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  // Resolve productId
  const productId = explicitProductId
    ?? (plan ? resolvePlanProducts(env)[plan] : undefined);
  if (!productId) {
    return c.json({ error: `Unknown plan: ${plan}` }, 400);
  }
  const planKey = plan ?? ('starter' as Plan);

  // ── Price resolution with fallback ──────────────────
  let priceId: string | null = null;
  let checkoutCurrency: Currency = detectedCurrency;
  let currencyFallbackUsed = false;

  // Step A+B: try detected currency
  priceId = await resolvePriceForCurrency(stripe, productId, detectedCurrency, activeMap, planKey);

  // Step C: fallback to defaultCurrency if different and detected failed
  if (!priceId && defaultCurrency !== detectedCurrency) {
    dlog(env, '[checkout] no price for', detectedCurrency, '— falling back to default', defaultCurrency);
    priceId = await resolvePriceForCurrency(stripe, productId, defaultCurrency, activeMap, planKey);
    if (priceId) {
      checkoutCurrency     = defaultCurrency;
      currencyFallbackUsed = true;
    }
  }

  // Step D: still nothing → final fallback usd if not yet tried
  if (!priceId && detectedCurrency !== 'usd' && defaultCurrency !== 'usd') {
    priceId = await resolvePriceForCurrency(stripe, productId, 'usd', activeMap, planKey);
    if (priceId) {
      checkoutCurrency     = 'usd';
      currencyFallbackUsed = true;
    }
  }

  if (!priceId) {
    console.error('[checkout] no price resolvable for plan=', plan, 'product=', productId);
    return c.json({
      error: `No active Stripe price found for ${plan}. Please contact support.`,
    }, 400);
  }

  dlog(env, '[checkout] resolved priceId=', priceId,
              'checkout_currency=', checkoutCurrency,
              'fallback=', currencyFallbackUsed);

  // ── Create session ──────────────────────────────────
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode:                 'subscription',
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          successUrl,
    cancel_url:           cancelUrl,
    client_reference_id:  orgId,
    metadata: {
      orgId,
      ...(plan ? { plan } : {}),
      detectedCurrency,
      checkoutCurrency,
      currencyFallbackUsed: currencyFallbackUsed ? 'true' : 'false',
      ...(detectedRegion ? { detectedRegion } : {}),
    },
    subscription_data: {
      metadata: {
        orgId,
        ...(plan ? { plan } : {}),
        detectedCurrency,
        checkoutCurrency,
        currencyFallbackUsed: currencyFallbackUsed ? 'true' : 'false',
      },
    },
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
      return c.json({ error: err.message, code: err.code ?? err.type }, status as 400 | 401 | 402 | 403 | 404 | 422 | 500 | 502);
    }
    throw err;
  }

  if (!session.url) {
    return c.json({ error: 'Stripe session created but URL is empty' }, 502);
  }

  dlog(env, '[checkout] session created:', session.id);
  return c.json({
    url:                  session.url,
    detectedCurrency,
    checkoutCurrency,
    currencyFallbackUsed,
  });
});

export default checkout;
