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
  const clean = { staticChecks: true, pricesVerified: true, portalVerified: true, webhookObserved: true };

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
