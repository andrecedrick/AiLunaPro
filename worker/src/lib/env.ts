/**
 * Environment helpers — Phase J1.4A-Hardening.
 *
 * APP_ENV resolution:
 *   - Reads env.APP_ENV, normalizes to lowercase
 *   - Valid values: 'development' | 'staging' | 'production'
 *   - Default when unset / invalid: 'development' (fail-safe — refuses to charge
 *     real cards by blocking sk_live_ until APP_ENV explicitly set to production)
 *
 * Production wiring:
 *   - Cloudflare secret: `wrangler secret put APP_ENV`  (paste: production)
 *   - OR env-scoped vars: [env.production.vars] APP_ENV = "production"
 *   - NEVER add to global [vars] in wrangler.toml — would make local dev think
 *     it is production.
 */

type AppEnvName = 'development' | 'staging' | 'production';

interface EnvLike {
  APP_ENV?:           string;
  STRIPE_SECRET_KEY?: string;
}

export function resolveAppEnv(env: EnvLike): AppEnvName {
  const raw = (env.APP_ENV ?? '').trim().toLowerCase();
  if (raw === 'production' || raw === 'staging' || raw === 'development') return raw;
  return 'development';
}

export function isProduction(env: EnvLike): boolean {
  return resolveAppEnv(env) === 'production';
}

export function isDev(env: EnvLike): boolean {
  return resolveAppEnv(env) !== 'production';
}

/**
 * Assert that the configured Stripe key is appropriate for the current
 * environment.
 *
 * Returns:
 *   - null when allowed (no rejection)
 *   - { status, body } when blocked — caller should `return c.json(body, status)`
 *
 * Rules:
 *   - sk_test_ allowed everywhere (incl. production for safe test runs)
 *   - sk_live_ allowed ONLY when APP_ENV === 'production'
 *   - sk_live_ in dev/staging → 403 with structured error code
 */
export function assertStripeKeyAllowed(env: EnvLike): { status: 403; body: { error: string; code: string } } | null {
  const key = env.STRIPE_SECRET_KEY ?? '';
  if (!key.startsWith('sk_live_')) return null;
  if (isProduction(env)) return null;
  return {
    status: 403,
    body: {
      error: 'Live Stripe key refused in non-production environment. Use sk_test_ key for development and staging.',
      code:  'LIVE_KEY_BLOCKED',
    },
  };
}
