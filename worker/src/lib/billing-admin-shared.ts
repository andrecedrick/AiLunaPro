/**
 * Shared constants/helpers for billing admin routes — Phase J1.3.
 */

export type Plan = 'starter' | 'professional' | 'enterprise';

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
