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
 * Always returns 'mock' when the env var is absent or invalid.
 */
export function resolveLayer(domain: LayerDomain): DataLayer {
  const specific = import.meta.env[DOMAIN_ENV[domain]];
  if (specific === 'firebase' || specific === 'mock') return specific;

  const global = import.meta.env.VITE_DATA_LAYER;
  if (global === 'firebase' || global === 'mock') return global;

  return 'mock';
}
