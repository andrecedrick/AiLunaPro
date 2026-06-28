/**
 * Boolean feature flags (build-time, Vite env). Default OFF.
 *
 * Distinct from featureFlags.ts (which resolves the mock|firebase DATA LAYER).
 * These gate user-visible behavior so a deploy is inert until the flag is flipped.
 *
 * Set in the Pages env / .env.production:
 *   VITE_ENABLE_TOKEN_MODEL_V2=true   → shows value hints + session value tracker
 */
function envFlag(v: unknown): boolean {
  return v === 'true' || v === true;
}

/** Token value model v2 UI: per-action "value €" hints + session value tracker. Default OFF. */
export const ENABLE_TOKEN_MODEL_V2 = envFlag(import.meta.env.VITE_ENABLE_TOKEN_MODEL_V2);
