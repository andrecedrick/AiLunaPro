/**
 * Admin promotion codes — Phase J1.3B (owner-only).
 *
 *   GET  /api/billing/admin/promotion-codes?orgId=...
 *   POST /api/billing/admin/promotion-codes
 *   POST /api/billing/admin/promotion-codes/:id/disable
 *
 * Stripe Coupon (% off) + Promotion Code (string redeemable code).
 * `appliesTo` plan → coupon.applies_to.products: [productId]
 * `appliesTo: 'all'` → omit applies_to.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { getStripe } from '../lib/stripe';
import { dlog } from '../lib/log';
import {
  resolvePlanProducts,
  generatePromoCode,
  isValidPlan,
  stripSecrets,
  type Plan,
} from '../lib/billing-admin-shared';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const promos = new Hono<AppEnv>();

type Duration   = 'once' | 'repeating' | 'forever';
type AppliesTo  = Plan | 'all';

interface PromoListItem {
  id:               string;
  code:             string;
  active:           boolean;
  percentOff:       number;
  duration:         Duration;
  durationInMonths: number | null;
  maxRedemptions:   number | null;
  timesRedeemed:    number;
  expiresAt:        string | null;
  appliesTo:        AppliesTo;
  createdAt:        string;
}

function appliesToFromCoupon(coupon: Stripe.Coupon | null | undefined, products: Record<Plan, string>): AppliesTo {
  if (!coupon?.applies_to?.products || coupon.applies_to.products.length === 0) return 'all';
  const productId = coupon.applies_to.products[0];
  for (const p of ['starter', 'professional', 'enterprise'] as Plan[]) {
    if (products[p] === productId) return p;
  }
  return 'all';
}

// ── GET ───────────────────────────────────────────────

promos.get('/api/billing/admin/promotion-codes', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & { STRIPE_SECRET_KEY?: string };
  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured' }, 503);
  { const blocked = assertStripeKeyAllowed(env); if (blocked) return c.json(blocked.body, blocked.status); }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  let list: Stripe.ApiList<Stripe.PromotionCode>;
  try {
    list = await stripe.promotionCodes.list({ limit: 50, expand: ['data.coupon'] });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return c.json({ error: err.message, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  const codes: PromoListItem[] = list.data.map(pc => {
    // Stripe SDK v22: coupon nested under promotion.coupon when type='coupon'
    const promo  = (pc as Stripe.PromotionCode).promotion;
    const coupon = (promo && promo.type === 'coupon' && typeof promo.coupon === 'object' && promo.coupon !== null)
      ? promo.coupon as Stripe.Coupon
      : null;
    return {
      id:               pc.id,
      code:             pc.code,
      active:           pc.active,
      percentOff:       coupon?.percent_off ?? 0,
      duration:         (coupon?.duration ?? 'once') as Duration,
      durationInMonths: coupon?.duration_in_months ?? null,
      maxRedemptions:   pc.max_redemptions ?? null,
      timesRedeemed:    pc.times_redeemed,
      expiresAt:        pc.expires_at ? new Date(pc.expires_at * 1000).toISOString() : null,
      appliesTo:        appliesToFromCoupon(coupon, resolvePlanProducts(env)),
      createdAt:        new Date(pc.created * 1000).toISOString(),
    };
  });

  return c.json({ codes });
});

// ── POST create ───────────────────────────────────────

interface CreatePromoBody {
  orgId:             string;
  code?:             string;
  percentOff:        number;
  duration:          Duration;
  durationInMonths?: number;
  maxRedemptions?:   number;
  expiresAt?:        string;
  appliesTo:         AppliesTo;
}

promos.post('/api/billing/admin/promotion-codes', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & { STRIPE_SECRET_KEY?: string };
  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured' }, 503);
  { const blocked = assertStripeKeyAllowed(env); if (blocked) return c.json(blocked.body, blocked.status); }

  let body: CreatePromoBody;
  try { body = stripSecrets(await c.req.json<CreatePromoBody>()); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  // Validation
  if (!Number.isFinite(body.percentOff) || body.percentOff <= 0 || body.percentOff > 100) {
    return c.json({ error: 'percentOff must be > 0 and ≤ 100' }, 400);
  }
  if (!['once', 'repeating', 'forever'].includes(body.duration)) {
    return c.json({ error: 'Invalid duration' }, 400);
  }
  if (body.duration === 'repeating') {
    if (!Number.isInteger(body.durationInMonths) || body.durationInMonths! < 1) {
      return c.json({ error: 'durationInMonths required for duration=repeating' }, 400);
    }
  }
  if (body.appliesTo !== 'all' && !isValidPlan(body.appliesTo)) {
    return c.json({ error: 'Invalid appliesTo' }, 400);
  }
  let expiresAtUnix: number | undefined;
  if (body.expiresAt) {
    const t = Date.parse(body.expiresAt);
    if (!Number.isFinite(t)) return c.json({ error: 'Invalid expiresAt' }, 400);
    if (t <= Date.now())     return c.json({ error: 'expiresAt must be in the future' }, 400);
    expiresAtUnix = Math.floor(t / 1000);
  }

  const code = (body.code && body.code.trim()) || generatePromoCode();
  if (!/^[A-Z0-9_-]{4,40}$/i.test(code)) {
    return c.json({ error: 'Code must be 4-40 chars [A-Z0-9_-]' }, 400);
  }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  // Build coupon params
  const couponParams: Stripe.CouponCreateParams = {
    percent_off:    body.percentOff,
    duration:       body.duration,
    name:           `${body.percentOff}% off ${body.appliesTo === 'all' ? 'all plans' : body.appliesTo}`,
  };
  if (body.duration === 'repeating' && body.durationInMonths) {
    couponParams.duration_in_months = body.durationInMonths;
  }
  if (body.maxRedemptions && body.maxRedemptions > 0) {
    couponParams.max_redemptions = body.maxRedemptions;
  }
  if (expiresAtUnix) couponParams.redeem_by = expiresAtUnix;

  if (body.appliesTo !== 'all') {
    couponParams.applies_to = { products: [resolvePlanProducts(env)[body.appliesTo as Plan]] };
  }

  let coupon: Stripe.Coupon;
  try {
    coupon = await stripe.coupons.create(couponParams);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return c.json({ error: `Coupon: ${err.message}`, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  // Promotion code (the user-facing string)
  // Stripe SDK v22: nest coupon inside promotion.{type:'coupon', coupon:id}
  const pcParams: Stripe.PromotionCodeCreateParams = {
    promotion: { type: 'coupon', coupon: coupon.id },
    code,
  };
  if (body.maxRedemptions && body.maxRedemptions > 0) pcParams.max_redemptions = body.maxRedemptions;
  if (expiresAtUnix) pcParams.expires_at = expiresAtUnix;

  let pc: Stripe.PromotionCode;
  try {
    pc = await stripe.promotionCodes.create(pcParams);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return c.json({ error: `PromotionCode: ${err.message}`, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  dlog(env, '[admin-promos] created', code, 'coupon=', coupon.id, 'pc=', pc.id);

  const result: PromoListItem = {
    id:               pc.id,
    code:             pc.code,
    active:           pc.active,
    percentOff:       coupon.percent_off ?? body.percentOff,
    duration:         body.duration,
    durationInMonths: coupon.duration_in_months ?? null,
    maxRedemptions:   pc.max_redemptions ?? null,
    timesRedeemed:    pc.times_redeemed,
    expiresAt:        pc.expires_at ? new Date(pc.expires_at * 1000).toISOString() : null,
    appliesTo:        body.appliesTo,
    createdAt:        new Date(pc.created * 1000).toISOString(),
  };

  return c.json({ ok: true, promo: result });
});

// ── POST disable ──────────────────────────────────────

promos.post('/api/billing/admin/promotion-codes/:id/disable', requireAuth(), requireOwner(), async c => {
  const env = c.env as AppEnv['Bindings'] & { STRIPE_SECRET_KEY?: string };
  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured' }, 503);
  { const blocked = assertStripeKeyAllowed(env); if (blocked) return c.json(blocked.body, blocked.status); }

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing promotion code id' }, 400);

  const stripe = getStripe(env.STRIPE_SECRET_KEY);

  try {
    await stripe.promotionCodes.update(id, { active: false });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return c.json({ error: err.message, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  dlog(env, '[admin-promos] disabled', id);
  return c.json({ ok: true });
});

export default promos;
