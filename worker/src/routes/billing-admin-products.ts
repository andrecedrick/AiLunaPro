/**
 * Admin products + prices — Phase J1.3 (owner-only).
 *
 *   GET  /api/billing/admin/products?orgId=...
 *   POST /api/billing/admin/prices
 *
 * Multi-currency. Real Stripe prices per (plan, currency).
 * Updating a price NEVER edits the existing Stripe price (immutable).
 * Creates a new Stripe Price + writes activePriceIdsByCurrency mapping.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { getStripe } from '../lib/stripe';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import { isSupportedCurrency, isSupportedInterval } from '../lib/currency';
import {
  resolvePlanProducts,
  PLAN_NAMES,
  isValidPlan,
  stripSecrets,
  type Plan,
} from '../lib/billing-admin-shared';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const products = new Hono<AppEnv>();

// ── GET /api/billing/admin/products ───────────────────

products.get('/api/billing/admin/products', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
  const orgId = c.get('orgId') as string;

  if (!env.STRIPE_SECRET_KEY)            return c.json({ error: 'Stripe not configured' }, 503);
  { const blocked = assertStripeKeyAllowed(env); if (blocked) return c.json(blocked.body, blocked.status); }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  const config = await firestoreGet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON!,
    `organizations/${orgId}/billing_config/current`,
  );
  const activeMap = (config?.activePriceIdsByCurrency as Record<string, Record<string, string>> | undefined) ?? {};

  const out: Array<{
    plan:             Plan;
    productId:        string;
    name:             string;
    active:           boolean;
    pricesByCurrency: Record<string, {
      priceId: string; amount: number; currency: string; interval: string; active: boolean;
    }>;
  }> = [];

  for (const plan of ['starter', 'professional', 'enterprise'] as Plan[]) {
    const productId = resolvePlanProducts(env)[plan];
    let product: Stripe.Product;
    try {
      product = await stripe.products.retrieve(productId);
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        console.warn('[admin-products] product retrieve failed:', err.message);
        continue;
      }
      throw err;
    }

    let pricesList: Stripe.ApiList<Stripe.Price>;
    try {
      pricesList = await stripe.prices.list({ product: productId, active: true, limit: 100 });
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        console.warn('[admin-products] prices.list failed:', err.message);
        continue;
      }
      throw err;
    }

    // Group prices by currency. Honor activePriceIdsByCurrency override; else
    // pick first matching active recurring per currency (last-created first).
    const pricesByCurrency: Record<string, {
      priceId: string; amount: number; currency: string; interval: string; active: boolean;
    }> = {};

    for (const p of pricesList.data) {
      if (!p.recurring || !p.unit_amount) continue;
      const cur = p.currency;
      const overrideId = activeMap[plan]?.[cur];
      if (overrideId && p.id !== overrideId) continue;       // skip if not the chosen one
      if (pricesByCurrency[cur] && !overrideId) continue;     // first wins (Stripe returns newest first)
      pricesByCurrency[cur] = {
        priceId:  p.id,
        amount:   p.unit_amount,
        currency: cur,
        interval: p.recurring.interval,
        active:   p.active,
      };
    }

    out.push({
      plan,
      productId,
      name:   product.name ?? PLAN_NAMES[plan],
      active: product.active,
      pricesByCurrency,
    });
  }

  return c.json({ products: out });
});

// ── POST /api/billing/admin/prices ────────────────────

interface CreatePriceBody {
  orgId:       string;
  plan:        Plan;
  amountCents: number;
  currency:    string;
  interval:    string;
}

products.post('/api/billing/admin/prices', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid')   as string;

  if (!env.STRIPE_SECRET_KEY)            return c.json({ error: 'Stripe not configured' }, 503);
  { const blocked = assertStripeKeyAllowed(env); if (blocked) return c.json(blocked.body, blocked.status); }

  let body: CreatePriceBody;
  try {
    body = stripSecrets(await c.req.json<CreatePriceBody>());
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!isValidPlan(body.plan))               return c.json({ error: 'Invalid plan' }, 400);
  if (!isSupportedCurrency(body.currency))   return c.json({ error: 'Unsupported currency' }, 400);
  if (!isSupportedInterval(body.interval))   return c.json({ error: 'Unsupported interval' }, 400);
  if (!Number.isInteger(body.amountCents) || body.amountCents < 50) {
    return c.json({ error: 'amountCents must be an integer ≥ 50' }, 400);
  }

  const productId = resolvePlanProducts(env)[body.plan];
  const stripe    = getStripe(env.STRIPE_SECRET_KEY);

  let price: Stripe.Price;
  try {
    price = await stripe.prices.create({
      product:     productId,
      unit_amount: body.amountCents,
      currency:    body.currency,
      recurring:   { interval: body.interval },
    });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[admin-prices] create failed:', err.message);
      return c.json({ error: err.message, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  // Read existing maps then merge
  const config = await firestoreGet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON!,
    `organizations/${orgId}/billing_config/current`,
  );
  const existingActive = (config?.activePriceIdsByCurrency as Record<string, Record<string, string>> | undefined) ?? {};
  const existingDisplay = (config?.displayPricesByCurrency as Record<string, Record<string, unknown>> | undefined) ?? {};

  const newActive  = { ...existingActive, [body.plan]:  { ...(existingActive[body.plan]  ?? {}), [body.currency]: price.id } };
  const newDisplay = { ...existingDisplay, [body.plan]: { ...(existingDisplay[body.plan] ?? {}), [body.currency]: {
    amount:    body.amountCents,
    currency:  body.currency,
    interval:  body.interval,
    priceId:   price.id,
    createdAt: new Date().toISOString(),
  }}};

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/billing_config/current`,
      {
        activePriceIdsByCurrency: newActive as Record<string, Record<string, string>>,
        displayPricesByCurrency:  newDisplay as Record<string, Record<string, Record<string, string | number>>>,
        updatedAt:                new Date().toISOString(),
        updatedBy:                uid,
      },
      { merge: true },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firestore write failed';
    return c.json({ error: `Firestore write failed: ${msg}` }, 500);
  }

  dlog(env, '[admin-prices] created', body.plan, body.currency, body.amountCents, '→', price.id);

  return c.json({
    priceId:  price.id,
    amount:   body.amountCents,
    currency: body.currency,
    interval: body.interval,
    displayPrice: {
      priceId:  price.id,
      amount:   body.amountCents,
      currency: body.currency,
      interval: body.interval,
      active:   true,
    },
  });
});

export default products;
