import { describe, it, expect, beforeEach, vi } from 'vitest';

/*
 * Firestore-authoritative billing config (Phase 2).
 *
 * Proves: reads platform_config/billing when present; self-seeds from committed
 * defaults when absent (behaviour-preserving); the seeded defaults equal the
 * values previously in wrangler.toml; fail-safe to defaults on a read error.
 */

const store = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), throwOnGet: false }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => {
    if (store.throwOnGet) throw new Error('read hiccup');
    return store.docs.get(p) ?? null;
  }),
  firestoreCreateIfNotExists: vi.fn(async (_sa: string, p: string, data: Record<string, unknown>) => {
    if (store.docs.has(p)) throw new Error('ALREADY_EXISTS');
    store.docs.set(p, { ...data });
  }),
}));

import { resolveBillingConfig, __clearBillingConfigCache, BILLING_CONFIG_DEFAULTS } from '../../worker/src/lib/billing-config-store';

const PATH = 'platform_config/billing';

beforeEach(() => { store.docs.clear(); store.throwOnGet = false; __clearBillingConfigCache(); });

describe('resolveBillingConfig', () => {
  it('self-seeds the doc from committed defaults on first read', async () => {
    const cfg = await resolveBillingConfig('sa');
    // Seeded doc exists…
    expect(store.docs.has(PATH)).toBe(true);
    // …and the resolved scope equals the OLD wrangler.toml values.
    expect(cfg.ENABLE_PLAN_LIMITS).toBe('true');
    expect(cfg.ENABLE_PLAN_LIMITS_ORGS).toBe('*');
    expect(cfg.ENABLE_RECOMMENDATION_CHARGE).toBe('true');
    expect(cfg.ENABLE_RECOMMENDATION_CHARGE_ORGS).toBe(BILLING_CONFIG_DEFAULTS.recommendationChargeOrgs);
  });

  it('reads an operator-edited doc instead of the defaults', async () => {
    store.docs.set(PATH, {
      enablePlanLimits: 'true', planLimitsOrgs: 'orgA,orgB',
      enableRecommendationCharge: 'false', recommendationChargeOrgs: '',
    });
    __clearBillingConfigCache();
    const cfg = await resolveBillingConfig('sa');
    expect(cfg.ENABLE_PLAN_LIMITS_ORGS).toBe('orgA,orgB');
    expect(cfg.ENABLE_RECOMMENDATION_CHARGE).toBe('false');
  });

  it('does not overwrite an existing doc (seed is idempotent)', async () => {
    store.docs.set(PATH, {
      enablePlanLimits: 'false', planLimitsOrgs: '',
      enableRecommendationCharge: 'false', recommendationChargeOrgs: '',
    });
    __clearBillingConfigCache();
    await resolveBillingConfig('sa');
    expect(store.docs.get(PATH)!.enablePlanLimits).toBe('false'); // untouched
  });

  it('fails safe to committed defaults on a read error (never silently disables)', async () => {
    store.throwOnGet = true;
    const cfg = await resolveBillingConfig('sa');
    expect(cfg.ENABLE_PLAN_LIMITS).toBe('true');
    expect(cfg.ENABLE_PLAN_LIMITS_ORGS).toBe('*');
  });
});
