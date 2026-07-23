/**
 * Feature-flag layer — Phase E.
 *
 * Controls which data source is active for each domain.
 * Default is 'mock' for every domain — safe for local development
 * without Firebase credentials.
 *
 * Switch a domain to Firebase by setting the corresponding variable
 * in .env.local:
 *   VITE_AUTH_LAYER=firebase
 *   VITE_DATA_LAYER=firebase        (global override for all data domains)
 *   VITE_REGISTRY_LAYER=firebase    (overrides VITE_DATA_LAYER for registry)
 *   VITE_AUDIT_LAYER=firebase       (overrides VITE_DATA_LAYER for audits)
 *   VITE_REPORTS_LAYER=firebase     (overrides VITE_DATA_LAYER for reports)
 *
 * Resolution order (highest → lowest priority):
 *   1. Domain-specific var  (VITE_AUTH_LAYER, VITE_REGISTRY_LAYER, …)
 *   2. Global var           (VITE_DATA_LAYER)
 *   3. Hard-coded default   ('mock')
 */

export type DataLayer = 'mock' | 'firebase';
export type LayerDomain = 'auth' | 'registry' | 'audit' | 'reports' | 'billing';

const DOMAIN_ENV: Record<LayerDomain, string> = {
  auth:     'VITE_AUTH_LAYER',
  registry: 'VITE_REGISTRY_LAYER',
  audit:    'VITE_AUDIT_LAYER',
  reports:  'VITE_REPORTS_LAYER',
  billing:  'VITE_BILLING_LAYER',
};

/**
 * Returns the active data layer for a given domain.
 * Returns 'mock' when the env var is absent or invalid — safe ONLY in dev.
 * In a production build this default is fatal; see assertProductionLayers().
 */
export function resolveLayer(domain: LayerDomain): DataLayer {
  const specific = import.meta.env[DOMAIN_ENV[domain]];
  if (specific === 'firebase' || specific === 'mock') return specific;

  const global = import.meta.env.VITE_DATA_LAYER;
  if (global === 'firebase' || global === 'mock') return global;

  return 'mock';
}

/**
 * Fail-closed guard against a silent mock boot in production.
 *
 * The resolver defaults to 'mock' when `VITE_AUTH_LAYER` / `VITE_DATA_LAYER` are
 * absent. In dev that is convenient; in a PRODUCTION build it is dangerous — a
 * Pages deploy that lost those env vars would boot against localStorage mock
 * auth/data, showing users a fake "logged-in" session over throwaway data with
 * NO error. This asserts the opposite: a production bundle MUST run auth (and,
 * because they share the funnel, billing) on Firebase. If not, throw a loud,
 * diagnosable error at boot instead of silently degrading.
 *
 * Dev / test builds (`import.meta.env.PROD === false`) are unaffected.
 *
 * @throws Error with a specific diagnosis when a prod build resolves to mock.
 */
export function assertProductionLayers(): void {
  if (!import.meta.env.PROD) return;

  const offenders = (['auth', 'billing'] as const)
    .filter(domain => resolveLayer(domain) !== 'firebase')
    .map(domain => DOMAIN_ENV[domain]);

  if (offenders.length > 0) {
    throw new Error(
      `[fail-closed] Production build resolved to MOCK for: ${offenders.join(', ')}. ` +
      `A production deploy must run on Firebase. Set VITE_AUTH_LAYER=firebase ` +
      `(and VITE_DATA_LAYER=firebase) in the Pages build environment, then redeploy. ` +
      `Refusing to boot in mock mode to avoid serving fake auth/data over real users.`,
    );
  }
}
