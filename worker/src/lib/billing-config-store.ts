/**
 * Billing-scope configuration — Firestore-authoritative.
 *
 * WHY: the plan-limit + overflow-charge SCOPE used to live in wrangler.toml
 * ([env.production.vars]). That coupled a business rule to the deploy artifact —
 * a worker rollback to an older version silently changed WHO gets billed. Scope
 * now lives in a single Firestore doc that survives worker version changes.
 *
 *   platform_config/billing = {
 *     enablePlanLimits:            'true' | 'false',
 *     planLimitsOrgs:             '*' | 'orgA,orgB' | '',
 *     enableRecommendationCharge:  'true' | 'false',
 *     recommendationChargeOrgs:   '*' | 'orgA' | '',
 *     updatedAt: ISO,
 *   }
 *
 * - rollback-safe:      the doc is independent of the deployed worker version.
 * - version-independent: any worker build reads the same live scope.
 * - auditable:          one queryable doc + these git-committed defaults.
 *
 * Bootstrap: the doc is SELF-SEEDED (createIfNotExists) from BILLING_CONFIG_DEFAULTS
 * on first read, so removing the vars from wrangler.toml causes NO behaviour change
 * — the defaults below are the exact values that were in the toml. The seed is
 * idempotent and never overwrites an operator's later edit.
 *
 * Fail-safe: on any Firestore error the DEFAULTS are returned, so a config-read
 * hiccup can never silently disable enforcement or flip billing scope.
 */

import { firestoreGet, firestoreCreateIfNotExists } from './firestoreAdmin';

/** Shape consumed by planLimitsEnabledFor / recommendationChargeEnabledFor. */
export interface BillingScopeConfig {
  ENABLE_PLAN_LIMITS?:                string;
  ENABLE_PLAN_LIMITS_ORGS?:           string;
  ENABLE_RECOMMENDATION_CHARGE?:      string;
  ENABLE_RECOMMENDATION_CHARGE_ORGS?: string;
}

/**
 * Committed defaults = the exact values previously in wrangler.toml
 * [env.production.vars]. Changing production scope is done by editing the
 * Firestore doc, NOT this constant (which only seeds a fresh project).
 */
export const BILLING_CONFIG_DEFAULTS = {
  enablePlanLimits:           'true',
  planLimitsOrgs:             '*',
  enableRecommendationCharge: 'true',
  recommendationChargeOrgs:   'org_ux6EH21A_1779743372219_71670faf',
} as const;

const CONFIG_PATH = 'platform_config/billing';
const CACHE_TTL_MS = 60_000;

let cache: { value: BillingScopeConfig; exp: number } | null = null;

function toScope(doc: Record<string, unknown>): BillingScopeConfig {
  return {
    ENABLE_PLAN_LIMITS:                String(doc.enablePlanLimits ?? BILLING_CONFIG_DEFAULTS.enablePlanLimits),
    ENABLE_PLAN_LIMITS_ORGS:           String(doc.planLimitsOrgs ?? BILLING_CONFIG_DEFAULTS.planLimitsOrgs),
    ENABLE_RECOMMENDATION_CHARGE:      String(doc.enableRecommendationCharge ?? BILLING_CONFIG_DEFAULTS.enableRecommendationCharge),
    ENABLE_RECOMMENDATION_CHARGE_ORGS: String(doc.recommendationChargeOrgs ?? BILLING_CONFIG_DEFAULTS.recommendationChargeOrgs),
  };
}

function defaultsAsScope(): BillingScopeConfig {
  return toScope(BILLING_CONFIG_DEFAULTS as unknown as Record<string, unknown>);
}

/**
 * Resolve the live billing scope. Reads platform_config/billing, seeding it from
 * the committed defaults on first run. 60s per-isolate cache. Fail-safe to the
 * defaults on any error.
 */
export async function resolveBillingConfig(saJson: string): Promise<BillingScopeConfig> {
  const now = Date.now();
  if (cache && cache.exp > now) return cache.value;

  let value: BillingScopeConfig;
  try {
    const doc = await firestoreGet(saJson, CONFIG_PATH) as Record<string, unknown> | null;
    if (doc) {
      value = toScope(doc);
    } else {
      // First run: seed the doc from the committed defaults (idempotent — a
      // concurrent seed loses the create and we still return the same values).
      value = defaultsAsScope();
      try {
        await firestoreCreateIfNotExists(saJson, CONFIG_PATH, {
          ...BILLING_CONFIG_DEFAULTS,
          seededAt:  new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch { /* ALREADY_EXISTS or transient — defaults are correct either way */ }
    }
  } catch (err) {
    console.warn('[billing-config] read failed — using committed defaults:', err instanceof Error ? err.message : err);
    value = defaultsAsScope();
  }

  cache = { value, exp: now + CACHE_TTL_MS };
  return value;
}

/** Test-only: clear the per-isolate cache. */
export function __clearBillingConfigCache(): void { cache = null; }
