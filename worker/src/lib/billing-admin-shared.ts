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

export const PLAN_TO_PRODUCT: Record<Plan, string> = {
  starter:      'prod_USl0378mg0WpXH',
  professional: 'prod_USl1qstrufNmjk',
  enterprise:   'prod_USl2FAygpK0wW2',
};

export const PRODUCT_TO_PLAN: Record<string, Plan> = {
  [PLAN_TO_PRODUCT.starter]:      'starter',
  [PLAN_TO_PRODUCT.professional]: 'professional',
  [PLAN_TO_PRODUCT.enterprise]:   'enterprise',
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
  [PLAN_TO_PRODUCT.starter]:      'Starter',
  [PLAN_TO_PRODUCT.professional]: 'Professional',
  [PLAN_TO_PRODUCT.enterprise]:   'Enterprise',
};

/**
 * Resolve capitalized plan label from Stripe product ID.
 * Defaults to 'Starter' for unknown paid products (mirrors prior J1.1 behavior).
 * 'Free' is set explicitly by the webhook on customer.subscription.deleted.
 */
export function planLabelFromProductId(productId: string | null | undefined): PlanLabel {
  if (productId && PRODUCT_TO_PLAN_LABEL[productId]) return PRODUCT_TO_PLAN_LABEL[productId];
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
