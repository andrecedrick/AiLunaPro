/**
 * Shared constants/helpers for billing admin routes — Phase J1.3.
 * J1 hardening: added PlanLabel + PRODUCT_TO_PLAN_LABEL + helpers consumed
 * by webhook (stripe.ts) and fallback sync (billing-sync.ts).
 */

import type Stripe from 'stripe';

export type Plan = 'starter' | 'professional' | 'enterprise';

/**
 * Capitalized plan label as written to Firestore subscriptions/current.plan.
 * 'Free' set by webhook on customer.subscription.deleted only.
 */
export type PlanLabel = 'Free' | 'Starter' | 'Professional' | 'Enterprise';

/**
 * Stripe plan products.
 *
 * A Stripe product id exists ONLY in the mode that created it, so these test-mode
 * ids cannot work against a live key: `products.retrieve` 404s, no price resolves,
 * and checkout fails for every plan. They therefore have to be configurable per
 * environment rather than compiled in.
 *
 * They remain the DEFAULTS so the current test environment keeps working with no
 * secret set — the switch to live is `wrangler secret put STRIPE_PRODUCT_*`, not
 * a code change.
 */
export const DEFAULT_PLAN_PRODUCTS: Record<Plan, string> = {
  starter:      'prod_USl0378mg0WpXH',
  professional: 'prod_USl1qstrufNmjk',
  enterprise:   'prod_USl2FAygpK0wW2',
};

/** @deprecated Use `resolvePlanProducts(env)`. Kept so nothing silently breaks. */
export const PLAN_TO_PRODUCT: Record<Plan, string> = DEFAULT_PLAN_PRODUCTS;

export interface PlanProductEnv {
  STRIPE_PRODUCT_STARTER?:      string;
  STRIPE_PRODUCT_PROFESSIONAL?: string;
  STRIPE_PRODUCT_ENTERPRISE?:   string;
}

/** The product ids this environment actually uses. Falls back per-plan. */
export function resolvePlanProducts(env: PlanProductEnv | undefined): Record<Plan, string> {
  const pick = (v: string | undefined, fallback: string): string => {
    const s = (v ?? '').trim();
    return s.startsWith('prod_') ? s : fallback;
  };
  return {
    starter:      pick(env?.STRIPE_PRODUCT_STARTER,      DEFAULT_PLAN_PRODUCTS.starter),
    professional: pick(env?.STRIPE_PRODUCT_PROFESSIONAL, DEFAULT_PLAN_PRODUCTS.professional),
    enterprise:   pick(env?.STRIPE_PRODUCT_ENTERPRISE,   DEFAULT_PLAN_PRODUCTS.enterprise),
  };
}

/** Reverse map for a given product set. */
export function productToPlan(productId: string, products: Record<Plan, string>): Plan | null {
  for (const plan of ['starter', 'professional', 'enterprise'] as const) {
    if (products[plan] === productId) return plan;
  }
  return null;
}

export const PRODUCT_TO_PLAN: Record<string, Plan> = {
  [DEFAULT_PLAN_PRODUCTS.starter]:      'starter',
  [DEFAULT_PLAN_PRODUCTS.professional]: 'professional',
  [DEFAULT_PLAN_PRODUCTS.enterprise]:   'enterprise',
};

export const PLAN_NAMES: Record<Plan, string> = {
  starter:      'Starter',
  professional: 'Professional',
  enterprise:   'Enterprise',
};

export function isValidPlan(p: string): p is Plan {
  return p === 'starter' || p === 'professional' || p === 'enterprise';
}

/**
 * Generate a safe uppercase promo code.
 * 12 chars, A-Z + 2-9, excludes I/O/0/1 to avoid visual ambiguity.
 */
export function generatePromoCode(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  for (let i = 0; i < length; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

/**
 * Strip secret-like keys recursively (defense-in-depth on admin POST bodies).
 */
const FORBIDDEN = /^(secret|webhook_secret|stripe_secret|stripe_secret_key|secret_key|api_key|apikey|password|token|auth|authorization|credential|private_key|publishable_key|stripe_publishable_key)$/i;

export function stripSecrets<T>(input: T): T {
  if (Array.isArray(input)) return input.map(stripSecrets) as unknown as T;
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      if (FORBIDDEN.test(k)) continue;
      out[k] = stripSecrets(v);
    }
    return out as T;
  }
  return input;
}

/* ── J1: shared Stripe product → plan label helpers ─────────
   Single source of truth for capitalized plan label written to
   subscriptions/current.plan. Used by webhook + sync fallback. */

export const PRODUCT_TO_PLAN_LABEL: Record<string, PlanLabel> = {
  [DEFAULT_PLAN_PRODUCTS.starter]:      'Starter',
  [DEFAULT_PLAN_PRODUCTS.professional]: 'Professional',
  [DEFAULT_PLAN_PRODUCTS.enterprise]:   'Enterprise',
};

const PLAN_LABELS: Record<Plan, PlanLabel> = {
  starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise',
};

/**
 * Resolve capitalized plan label from Stripe product ID.
 *
 * `products` should be the environment's resolved set; omitting it falls back to
 * the compiled defaults, which is only correct in test mode.
 *
 * The unknown-product fallback to 'Starter' is PRE-EXISTING behaviour and is
 * kept, but it is worth knowing what it means once products are environment-
 * driven: a mismatched product id records every subscription as Starter no
 * matter which plan was actually bought. That is precisely the failure the
 * live-readiness product check exists to prevent, so an unknown id is logged
 * rather than absorbed in silence.
 */
export function planLabelFromProductId(
  productId: string | null | undefined,
  products: Record<Plan, string> = DEFAULT_PLAN_PRODUCTS,
): PlanLabel {
  if (productId) {
    const plan = productToPlan(productId, products);
    if (plan) return PLAN_LABELS[plan];
    console.warn('[billing] unknown Stripe product id — defaulting plan to Starter:', productId);
  }
  return 'Starter';
}

/**
 * Extract Stripe product ID from a subscription's first item.
 * Handles both string product ref and expanded Product object.
 */
export function extractProductIdFromSubscription(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  if (!item) return null;
  const price = item.price;
  if (typeof price.product === 'string') return price.product;
  if (price.product && typeof price.product === 'object' && 'id' in price.product) {
    return (price.product as Stripe.Product).id;
  }
  return null;
}
