import { describe, it, expect } from 'vitest';

/**
 * P1.2 — Stripe live-activation preflight.
 *
 * Each case here is a real way a live switch fails silently: the money becomes
 * real but something is still pointed at test mode, and the first person to find
 * out is a paying customer.
 */

import {
  checkStaticReadiness, checkPriceProbes, buildReport, classifyKeyMode,
  STRIPE_MODE_VARS, PRICE_VARS, WEBHOOK_NOTE,
  type PriceProbe,
} from '../../worker/src/lib/stripe-readiness';

const LIVE = {
  STRIPE_SECRET_KEY:          'sk_live_abc123',
  STRIPE_PUBLISHABLE_KEY:     'pk_live_abc123',
  STRIPE_WEBHOOK_SECRET:      'whsec_abc123',
  STRIPE_PRICE_STARTER:       'price_1',
  STRIPE_PRICE_PROFESSIONAL:  'price_2',
  STRIPE_PRICE_ENTERPRISE:    'price_3',
};

const findingFor = (env: Record<string, string | undefined>, variable: string) =>
  checkStaticReadiness(env).findings.find(f => f.variable === variable);

describe('key mode classification', () => {
  it('reads the mode from the prefix', () => {
    expect(classifyKeyMode('sk_live_x', 'sk_live_', 'sk_test_')).toBe('live');
    expect(classifyKeyMode('sk_test_x', 'sk_live_', 'sk_test_')).toBe('test');
    expect(classifyKeyMode('', 'sk_live_', 'sk_test_')).toBe('unset');
    expect(classifyKeyMode('garbage', 'sk_live_', 'sk_test_')).toBe('unknown');
  });
});

describe('static preflight', () => {
  it('passes a consistent live configuration', () => {
    const r = checkStaticReadiness(LIVE);
    expect(r.mode).toBe('live');
    expect(r.findings).toEqual([]);
    expect(r.priceIds.map(p => p.variable)).toEqual([
      'STRIPE_PRICE_STARTER', 'STRIPE_PRICE_PROFESSIONAL', 'STRIPE_PRICE_ENTERPRISE',
    ]);
  });

  it('CATCHES a test publishable key left behind on a live secret key', () => {
    // The browser would run test mode while the server charges real money.
    const f = findingFor({ ...LIVE, STRIPE_PUBLISHABLE_KEY: 'pk_test_abc' }, 'STRIPE_PUBLISHABLE_KEY');
    expect(f?.code).toBe('MODE_MISMATCH');
    expect(f?.detail).toContain('live');
  });

  it('catches a live publishable key while the secret key is still test', () => {
    const f = findingFor(
      { ...LIVE, STRIPE_SECRET_KEY: 'sk_test_abc', STRIPE_PUBLISHABLE_KEY: 'pk_live_abc' },
      'STRIPE_PUBLISHABLE_KEY');
    expect(f?.code).toBe('MODE_MISMATCH');
  });

  it('reports every missing required variable', () => {
    const r = checkStaticReadiness({ STRIPE_SECRET_KEY: 'sk_live_abc' });
    const missing = r.findings.filter(f => f.code === 'MISSING').map(f => f.variable);
    expect(missing).toEqual([
      'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRICE_STARTER', 'STRIPE_PRICE_PROFESSIONAL', 'STRIPE_PRICE_ENTERPRISE',
    ]);
  });

  it('does not demand the optional token price ids', () => {
    expect(checkStaticReadiness(LIVE).findings).toEqual([]);
  });

  it('flags a malformed price id', () => {
    expect(findingFor({ ...LIVE, STRIPE_PRICE_STARTER: 'prod_123' }, 'STRIPE_PRICE_STARTER')?.code)
      .toBe('MALFORMED');
  });

  it('flags a webhook secret that is not a signing secret', () => {
    expect(findingFor({ ...LIVE, STRIPE_WEBHOOK_SECRET: 'sk_live_oops' }, 'STRIPE_WEBHOOK_SECRET')?.code)
      .toBe('MALFORMED');
  });

  it('reports a missing secret key rather than guessing a mode', () => {
    const r = checkStaticReadiness({});
    expect(r.mode).toBe('unset');
    expect(r.findings[0]).toMatchObject({ variable: 'STRIPE_SECRET_KEY', code: 'MISSING' });
  });

  it('NEVER returns a secret value', () => {
    const serialized = JSON.stringify(checkStaticReadiness({
      ...LIVE, STRIPE_PUBLISHABLE_KEY: 'pk_test_LEAKME', STRIPE_WEBHOOK_SECRET: 'nope_SECRETVALUE',
    }));
    expect(serialized).not.toContain('LEAKME');
    expect(serialized).not.toContain('SECRETVALUE');
    expect(serialized).not.toContain('sk_live_abc123');
  });

  it('covers every mode-sensitive variable', () => {
    expect(STRIPE_MODE_VARS.map(v => v.name)).toContain('STRIPE_TOKEN_PRICE_OVERAGE');
    expect(PRICE_VARS).toHaveLength(7);
  });
});

describe('price probes', () => {
  const probe = (o: Partial<PriceProbe> = {}): PriceProbe => ({
    variable: 'STRIPE_PRICE_STARTER', id: 'price_1', found: true,
    livemode: true, active: true, currency: 'usd', ...o,
  });

  it('CATCHES a test price id kept after switching to live', () => {
    // The single most common live-activation mistake. Stripe answers "no such
    // price" and nobody can check out.
    const f = checkPriceProbes('live', [probe({ found: false, livemode: null, active: null })]);
    expect(f[0]).toMatchObject({ code: 'NOT_FOUND_IN_STRIPE' });
    expect(f[0].detail).toContain('every customer');
  });

  it('catches a price that exists but belongs to the other mode', () => {
    expect(checkPriceProbes('live', [probe({ livemode: false })])[0].code).toBe('WRONG_LIVEMODE');
    expect(checkPriceProbes('test', [probe({ livemode: true })])[0].code).toBe('WRONG_LIVEMODE');
  });

  it('catches an archived price', () => {
    expect(checkPriceProbes('live', [probe({ active: false })])[0].code).toBe('INACTIVE');
  });

  it('passes a correct live price', () => {
    expect(checkPriceProbes('live', [probe()])).toEqual([]);
  });
});

describe('the readiness verdict', () => {
  const clean = { staticChecks: true, pricesVerified: true, productsVerified: true, portalVerified: true, webhookObserved: true };

  it('is ready only when everything checked out AND the mode is live', () => {
    expect(buildReport('live', [], clean).ready).toBe(true);
  });

  it('is NOT ready while still in test mode', () => {
    expect(buildReport('test', [], clean).ready).toBe(false);
  });

  it('is NOT ready with any finding outstanding', () => {
    const r = buildReport('live', [{ variable: 'X', code: 'MISSING', detail: '' }], clean);
    expect(r.ready).toBe(false);
  });

  it('is NOT ready until a live webhook has actually been verified', () => {
    // Both modes use whsec_, so nothing static can prove the secret is right.
    // A stale test secret means payments succeed and no invoice is marked paid.
    expect(buildReport('live', [], { ...clean, webhookObserved: false }).ready).toBe(false);
  });

  it('is NOT ready when the prices were never verified against Stripe', () => {
    expect(buildReport('live', [], { ...clean, pricesVerified: false }).ready).toBe(false);
  });

  it('always explains the webhook limitation rather than implying certainty', () => {
    expect(buildReport('live', [], clean).webhookNote).toBe(WEBHOOK_NOTE);
    expect(WEBHOOK_NOTE).toContain('marked paid');
  });
});

/* ── P1.2 Phase A — the false pass this closes ─────────────────────────── */

import { checkProductProbes, type ProductProbe } from '../../worker/src/lib/stripe-readiness';
import { resolvePlanProducts, DEFAULT_PLAN_PRODUCTS, productToPlan, planLabelFromProductId } from '../../worker/src/lib/billing-admin-shared';

describe('plan products come from the environment', () => {
  it('falls back to the compiled test ids when nothing is set', () => {
    expect(resolvePlanProducts({})).toEqual(DEFAULT_PLAN_PRODUCTS);
    expect(resolvePlanProducts(undefined)).toEqual(DEFAULT_PLAN_PRODUCTS);
  });

  it('uses the configured live products when supplied', () => {
    const r = resolvePlanProducts({
      STRIPE_PRODUCT_STARTER: 'prod_live1',
      STRIPE_PRODUCT_PROFESSIONAL: 'prod_live2',
      STRIPE_PRODUCT_ENTERPRISE: 'prod_live3',
    });
    expect(r).toEqual({ starter: 'prod_live1', professional: 'prod_live2', enterprise: 'prod_live3' });
  });

  it('overrides per plan, so a partial switch is still coherent', () => {
    const r = resolvePlanProducts({ STRIPE_PRODUCT_STARTER: 'prod_liveOnly' });
    expect(r.starter).toBe('prod_liveOnly');
    expect(r.professional).toBe(DEFAULT_PLAN_PRODUCTS.professional);
  });

  it('IGNORES a malformed value rather than sending garbage to Stripe', () => {
    expect(resolvePlanProducts({ STRIPE_PRODUCT_STARTER: 'price_wrongKind' }).starter)
      .toBe(DEFAULT_PLAN_PRODUCTS.starter);
    expect(resolvePlanProducts({ STRIPE_PRODUCT_STARTER: '   ' }).starter)
      .toBe(DEFAULT_PLAN_PRODUCTS.starter);
  });

  it('maps a product back to its plan against the ACTIVE set', () => {
    const live = resolvePlanProducts({ STRIPE_PRODUCT_PROFESSIONAL: 'prod_liveP' });
    expect(productToPlan('prod_liveP', live)).toBe('professional');
    expect(productToPlan(DEFAULT_PLAN_PRODUCTS.professional, live)).toBeNull();
  });

  it('labels a subscription from the environment products, not the defaults', () => {
    // Otherwise every live subscription would silently record as "Starter".
    const live = resolvePlanProducts({ STRIPE_PRODUCT_ENTERPRISE: 'prod_liveE' });
    expect(planLabelFromProductId('prod_liveE', live)).toBe('Enterprise');
  });

  it('still defaults an unknown product to Starter (pre-existing behaviour)', () => {
    expect(planLabelFromProductId('prod_unknown', DEFAULT_PLAN_PRODUCTS)).toBe('Starter');
    expect(planLabelFromProductId(null)).toBe('Starter');
  });
});

describe('product probes — no false pass', () => {
  const probe = (o: Partial<ProductProbe> = {}): ProductProbe => ({
    plan: 'starter', variable: 'STRIPE_PRODUCT_STARTER', productId: 'prod_1',
    found: true, livemode: true, active: true, currencies: ['usd'], ...o,
  });

  it('CATCHES a test product left behind after switching to live', () => {
    // The exact false pass: prices validated, products never checked, and every
    // plan purchase fails with "No active Stripe price found".
    const f = checkProductProbes('live', [probe({ found: false, livemode: null, active: null, currencies: [] })], ['usd']);
    expect(f[0].code).toBe('NOT_FOUND_IN_STRIPE');
    expect(f[0].detail).toContain('every customer');
  });

  it('catches a product that exists but in the wrong mode', () => {
    expect(checkProductProbes('live', [probe({ livemode: false })], ['usd'])[0].code).toBe('WRONG_LIVEMODE');
    expect(checkProductProbes('test', [probe({ livemode: true })], ['usd'])[0].code).toBe('WRONG_LIVEMODE');
  });

  it('catches an archived product', () => {
    expect(checkProductProbes('live', [probe({ active: false })], ['usd'])[0].code).toBe('INACTIVE');
  });

  it('catches a product with NO price in a required currency', () => {
    const f = checkProductProbes('live', [probe({ currencies: ['usd'] })], ['eur', 'usd']);
    expect(f[0].code).toBe('MISSING');
    expect(f[0].detail).toContain('eur');
  });

  it('says so plainly when usd itself is missing — the final fallback', () => {
    const f = checkProductProbes('live', [probe({ currencies: ['eur'] })], ['eur', 'usd']);
    expect(f[0].detail).toContain('nothing left to fall back to');
  });

  it('passes a correct live product', () => {
    expect(checkProductProbes('live', [probe({ currencies: ['eur', 'usd'] })], ['eur', 'usd'])).toEqual([]);
  });
});

describe('the verdict gates on products', () => {
  const clean = { staticChecks: true, pricesVerified: true, productsVerified: true, portalVerified: true, webhookObserved: true };

  it('is NOT ready when products were never verified, even with prices green', () => {
    expect(buildReport('live', [], { ...clean, productsVerified: false }).ready).toBe(false);
  });

  it('is NOT ready without a verified portal configuration', () => {
    expect(buildReport('live', [], { ...clean, portalVerified: false }).ready).toBe(false);
  });

  it('is ready only when every gate holds', () => {
    expect(buildReport('live', [], clean).ready).toBe(true);
  });
});

describe('the verdict is always a real boolean', () => {
  it('reads as NOT ready when a gate is absent, never as undefined', () => {
    // `ready` is a safety verdict. A caller testing `=== false` must not be
    // defeated by an omitted field turning the conjunction into undefined.
    const partial = { staticChecks: true, pricesVerified: true, portalVerified: true, webhookObserved: true };
    const r = buildReport('live', [], partial as unknown as Parameters<typeof buildReport>[2]);
    expect(r.ready).toBe(false);
    expect(typeof r.ready).toBe('boolean');
  });
});

/*
 * §27.4c — the live-activation incidents of 2026-08-05. Every case below is a
 * configuration that produced `ready: true` while production could not sell,
 * mis-billed, or broke after the customer had already paid.
 */

import {
  checkProductUniqueness, checkProductFallback, checkOverrideProbes, checkCustomerProbe,
  type OverrideProbe, type CustomerProbe,
} from '../../worker/src/lib/stripe-readiness';

const productProbe = (plan: string, productId: string): ProductProbe => ({
  plan, variable: `STRIPE_PRODUCT_${plan.toUpperCase()}`, productId,
  found: true, livemode: true, active: true, currencies: ['eur', 'usd'],
});

describe('duplicate product detection', () => {
  it('catches two plans sharing one product — the shifted-secret mis-bill', () => {
    // What actually shipped: PROFESSIONAL held Starter's product, so a
    // Professional subscriber would have been charged 49.99, not 149.99.
    const findings = checkProductUniqueness([
      productProbe('starter', 'prod_A'),
      productProbe('professional', 'prod_A'),
      productProbe('enterprise', 'prod_B'),
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].code).toBe('DUPLICATE_PRODUCT');
    expect(findings[0].detail).toContain('starter');
    expect(findings[0].detail).toContain('professional');
  });

  it('passes when all three are distinct', () => {
    expect(checkProductUniqueness([
      productProbe('starter', 'prod_A'),
      productProbe('professional', 'prod_B'),
      productProbe('enterprise', 'prod_C'),
    ])).toEqual([]);
  });

  it('every per-id check passing does not save you — only the SET catches it', () => {
    const probes = [productProbe('starter', 'prod_A'), productProbe('professional', 'prod_A')];
    expect(checkProductProbes('live', probes, ['usd'])).toEqual([]);   // each id is real, live, active
    expect(checkProductUniqueness(probes)).toHaveLength(1);
  });
});

describe('production never falls back to the committed TEST products', () => {
  const PROD = { APP_ENV: 'production' };

  it('returns an empty id rather than a test default when the secret is missing', () => {
    const resolved = resolvePlanProducts({ ...PROD, STRIPE_PRODUCT_STARTER: 'prod_live1' });
    expect(resolved.starter).toBe('prod_live1');
    expect(resolved.professional).toBe('');
    expect(resolved.enterprise).toBe('');
  });

  it('still falls back outside production, so dev keeps working with no secrets', () => {
    expect(resolvePlanProducts({}).starter).toBe(DEFAULT_PLAN_PRODUCTS.starter);
  });

  it('reports the missing product instead of silently substituting one', () => {
    const resolved = resolvePlanProducts({ ...PROD });
    const findings = checkProductFallback('live', resolved, DEFAULT_PLAN_PRODUCTS);
    expect(findings).toHaveLength(3);
    expect(findings.every(f => f.code === 'MISSING')).toBe(true);
  });

  it('flags a product explicitly set to a known test default', () => {
    const findings = checkProductFallback('live', { starter: DEFAULT_PLAN_PRODUCTS.starter }, DEFAULT_PLAN_PRODUCTS);
    expect(findings).toHaveLength(1);
    expect(findings[0].code).toBe('WRONG_LIVEMODE');
  });

  it('says nothing in test mode — the defaults ARE the test products', () => {
    expect(checkProductFallback('test', { starter: DEFAULT_PLAN_PRODUCTS.starter }, DEFAULT_PLAN_PRODUCTS)).toEqual([]);
  });
});

describe('per-org price overrides', () => {
  const ov = (p: Partial<OverrideProbe> = {}): OverrideProbe => ({
    plan: 'starter', currency: 'usd', priceId: 'price_x',
    found: true, livemode: true, active: true, ...p,
  });

  it('catches an override pointing at a price that does not exist in this mode', () => {
    const findings = checkOverrideProbes('live', [ov({ found: false, livemode: null, active: null })]);
    expect(findings).toHaveLength(1);
    expect(findings[0].code).toBe('NOT_FOUND_IN_STRIPE');
    expect(findings[0].variable).toBe('activePriceIdsByCurrency.starter.usd');
  });

  it('catches a test-mode override on a live account', () => {
    expect(checkOverrideProbes('live', [ov({ livemode: false })])[0].code).toBe('WRONG_LIVEMODE');
  });

  it('catches an archived override', () => {
    expect(checkOverrideProbes('live', [ov({ active: false })])[0].code).toBe('INACTIVE');
  });

  it('passes a live, active override', () => {
    expect(checkOverrideProbes('live', [ov()])).toEqual([]);
  });

  it('no overrides configured is a valid state', () => {
    expect(checkOverrideProbes('live', [])).toEqual([]);
  });
});

describe("the org's stored Stripe customer", () => {
  const cust = (p: Partial<CustomerProbe> = {}): CustomerProbe => ({
    customerId: 'cus_x', found: true, livemode: true, ...p,
  });

  it('catches a customer that exists only in the other mode', () => {
    // The symptom lands on someone who has ALREADY paid: portal and invoices 404.
    const findings = checkCustomerProbe('live', cust({ found: false, livemode: null }));
    expect(findings).toHaveLength(1);
    expect(findings[0].code).toBe('NOT_FOUND_IN_STRIPE');
  });

  it('catches a test customer on a live account', () => {
    expect(checkCustomerProbe('live', cust({ livemode: false }))[0].code).toBe('WRONG_LIVEMODE');
  });

  it('passes a live customer', () => {
    expect(checkCustomerProbe('live', cust())).toEqual([]);
  });

  it('no customer yet is a valid state, not a finding', () => {
    expect(checkCustomerProbe('live', null)).toEqual([]);
  });
});
