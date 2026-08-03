import { describe, it, expect } from 'vitest';

/**
 * P1.2 Phase B — the Stripe setup script's planner.
 *
 * This planner decides what gets created in a real payment account, where a
 * mistake is expensive and a price cannot be edited afterwards. The tests that
 * matter here are the ones that stop it writing something wrong: idempotency on
 * re-run, refusing to duplicate a price slot, and never letting a token pack be
 * created as a subscription.
 */

// @ts-expect-error — plain-JS script module, no type declarations by design.
import * as catalog from '../../scripts/stripe-catalog.mjs';

const {
  detectMode, validateCatalog, planCatalog, hasConflicts, summarise,
  renderPhaseCBlock, missingPhaseCIds, productKey, priceKey, tokenPriceKey,
  MANAGED_KEY, ENV_VAR,
} = catalog as {
  detectMode: (k?: string) => string;
  validateCatalog: (c: unknown) => string[];
  planCatalog: (c: unknown, a: unknown) => Array<Record<string, unknown>>;
  hasConflicts: (a: unknown[]) => boolean;
  summarise: (a: unknown[]) => Record<string, number>;
  renderPhaseCBlock: (r: Record<string, string>) => string;
  missingPhaseCIds: (r: Record<string, string>) => string[];
  productKey: (p: string) => string;
  priceKey: (p: string, c: string, i: string) => string;
  tokenPriceKey: (p: string) => string;
  MANAGED_KEY: string;
  ENV_VAR: Record<string, string>;
};

const VALID = {
  plans: {
    starter:      { prices: [{ currency: 'usd', amountMinor: 4900, interval: 'month' }] },
    professional: { prices: [{ currency: 'usd', amountMinor: 14900, interval: 'month' }] },
    enterprise:   { prices: [{ currency: 'usd', amountMinor: 49900, interval: 'month' }] },
  },
  tokenPacks: {
    overage: { currency: 'usd', amountMinor: 3000 },
    starter: { currency: 'usd', amountMinor: 49000 },
    pro:     { currency: 'usd', amountMinor: 199000 },
    max:     { currency: 'usd', amountMinor: 699000 },
  },
  promotions: [] as unknown[],
};

const EMPTY_ACCOUNT = { products: [], prices: [], coupons: [], promotionCodes: [] };

const mk = (key: string, extra: Record<string, unknown> = {}) => ({
  id: `obj_${key.replace(/[:]/g, '_')}`, active: true, metadata: { [MANAGED_KEY]: key }, ...extra,
});

describe('mode detection never touches the secret', () => {
  it('reads the mode from the prefix alone', () => {
    expect(detectMode('sk_live_abc')).toBe('live');
    expect(detectMode('sk_test_abc')).toBe('test');
    expect(detectMode('rk_live_abc')).toBe('live');
    expect(detectMode('')).toBe('unset');
    expect(detectMode('nonsense')).toBe('unknown');
  });

  it('returns only a mode, never any part of the value', () => {
    expect(JSON.stringify(detectMode('sk_live_SUPERSECRET'))).not.toContain('SUPERSECRET');
  });
});

describe('catalog validation', () => {
  it('accepts a well-formed catalog', () => {
    expect(validateCatalog(VALID)).toEqual([]);
  });

  it('REQUIRES a usd price on every plan', () => {
    // usd is checkout's final fallback; without it a customer in an unpriced
    // currency has nothing left to fall back to.
    const c = structuredClone(VALID);
    c.plans.starter.prices = [{ currency: 'eur', amountMinor: 4900, interval: 'month' }];
    expect(validateCatalog(c).join()).toContain('usd price is required');
  });

  it('rejects an amount that is not a positive integer', () => {
    for (const bad of [0, -100, 49.99, null, '4900']) {
      const c = structuredClone(VALID);
      (c.plans.starter.prices[0] as Record<string, unknown>).amountMinor = bad;
      expect(validateCatalog(c).join()).toContain('positive integer');
    }
  });

  it('rejects a missing plan outright', () => {
    const c = structuredClone(VALID) as Record<string, never>;
    delete (c.plans as Record<string, unknown>).enterprise;
    expect(validateCatalog(c).join()).toContain('plans.enterprise');
  });

  it('rejects a token pack with no amount', () => {
    const c = structuredClone(VALID);
    (c.tokenPacks.pro as Record<string, unknown>).amountMinor = null;
    expect(validateCatalog(c).join()).toContain('tokenPacks.pro');
  });

  it('validates promotion codes', () => {
    expect(validateCatalog({ ...VALID, promotions: [{ code: 'no lowercase!', percentOff: 10 }] }).join())
      .toContain('invalid code');
    expect(validateCatalog({ ...VALID, promotions: [{ code: 'LAUNCH20', percentOff: 0 }] }).join())
      .toContain('percentOff');
    expect(validateCatalog({ ...VALID, promotions: [{ code: 'LAUNCH20', percentOff: 20, appliesTo: 'gold' }] }).join())
      .toContain('appliesTo');
  });
});

describe('planning against an empty account', () => {
  it('creates every object exactly once', () => {
    const actions = planCatalog(VALID, EMPTY_ACCOUNT);
    const s = summarise(actions);
    expect(s.create).toBe(3 + 3 + 4);   // products + plan prices + token packs
    expect(s.reuse ?? 0).toBe(0);
    expect(hasConflicts(actions)).toBe(false);
  });

  it('creates token packs as ONE-OFF prices, never recurring', () => {
    // A recurring token price would start a subscription instead of granting a
    // top-up — the customer would be billed monthly for a one-time purchase.
    const packs = planCatalog(VALID, EMPTY_ACCOUNT).filter(a => a.type === 'token_price');
    expect(packs).toHaveLength(4);
    for (const p of packs) expect(p).not.toHaveProperty('interval');
  });
});

describe('idempotency', () => {
  const populated = {
    products: ['starter', 'professional', 'enterprise'].map(p => mk(productKey(p))),
    prices: [
      mk(priceKey('starter', 'usd', 'month'), { unit_amount: 4900, currency: 'usd', recurring: { interval: 'month' } }),
      mk(priceKey('professional', 'usd', 'month'), { unit_amount: 14900, currency: 'usd', recurring: { interval: 'month' } }),
      mk(priceKey('enterprise', 'usd', 'month'), { unit_amount: 49900, currency: 'usd', recurring: { interval: 'month' } }),
      mk(tokenPriceKey('overage'), { unit_amount: 3000, currency: 'usd' }),
      mk(tokenPriceKey('starter'), { unit_amount: 49000, currency: 'usd' }),
      mk(tokenPriceKey('pro'), { unit_amount: 199000, currency: 'usd' }),
      mk(tokenPriceKey('max'), { unit_amount: 699000, currency: 'usd' }),
    ],
    coupons: [], promotionCodes: [],
  };

  it('creates NOTHING on a second run', () => {
    const s = summarise(planCatalog(VALID, populated));
    expect(s.create ?? 0).toBe(0);
    expect(s.reuse).toBe(10);
  });

  it('creates only what is genuinely missing after a partial run', () => {
    const partial = { ...populated, prices: populated.prices.slice(0, 3) };
    const actions = planCatalog(VALID, partial);
    expect(summarise(actions).create).toBe(4);   // the four token packs
    expect(actions.filter(a => a.op === 'create').every(a => a.type === 'token_price')).toBe(true);
  });

  it('matches on the managed key, not on price or name', () => {
    // An unrelated product costing the same must never be adopted.
    const decoy = {
      ...EMPTY_ACCOUNT,
      products: [{ id: 'prod_decoy', active: true, name: 'Starter', metadata: {} }],
      prices: [{ id: 'price_decoy', active: true, unit_amount: 4900, currency: 'usd', metadata: {} }],
    };
    const s = summarise(planCatalog(VALID, decoy));
    expect(s.create).toBe(10);
    expect(s.reuse ?? 0).toBe(0);
  });
});

describe('conflicts stop the run', () => {
  it('refuses to add a second price to a slot that already has one', () => {
    // Stripe prices are immutable. Creating another active price for the same
    // slot is how an account starts charging two customers different amounts.
    const drifted = {
      ...EMPTY_ACCOUNT,
      products: ['starter', 'professional', 'enterprise'].map(p => mk(productKey(p))),
      prices: [mk(priceKey('starter', 'usd', 'month'), { unit_amount: 9900, currency: 'usd', recurring: { interval: 'month' } })],
    };
    const actions = planCatalog(VALID, drifted);
    const conflict = actions.find(a => a.op === 'conflict');
    expect(conflict).toBeTruthy();
    expect(String(conflict!.reason)).toContain('immutable');
    expect(hasConflicts(actions)).toBe(true);
  });

  it('flags a token pack that already exists as a subscription', () => {
    const bad = {
      ...EMPTY_ACCOUNT,
      products: ['starter', 'professional', 'enterprise'].map(p => mk(productKey(p))),
      prices: [mk(tokenPriceKey('pro'), { unit_amount: 199000, currency: 'usd', recurring: { interval: 'month' } })],
    };
    const conflict = planCatalog(VALID, bad).find(a => a.op === 'conflict');
    expect(String(conflict!.reason)).toContain('RECURRING');
  });

  it('flags an archived product rather than silently reusing it', () => {
    const archived = {
      ...EMPTY_ACCOUNT,
      products: [mk(productKey('starter'), { active: false })],
    };
    const conflict = planCatalog(VALID, archived).find(a => a.op === 'conflict');
    expect(String(conflict!.reason)).toContain('archived');
  });
});

describe('promotions', () => {
  const withPromo = { ...VALID, promotions: [{ code: 'LAUNCH20', percentOff: 20, appliesTo: 'starter' }] };

  it('creates a coupon and its promotion code together', () => {
    const actions = planCatalog(withPromo, EMPTY_ACCOUNT);
    expect(actions.some(a => a.type === 'coupon' && a.op === 'create')).toBe(true);
    expect(actions.some(a => a.type === 'promotion_code' && a.op === 'create')).toBe(true);
  });

  it('reuses an existing promotion code by its code', () => {
    const existing = { ...EMPTY_ACCOUNT, promotionCodes: [{ id: 'promo_1', code: 'LAUNCH20' }] };
    const pc = planCatalog(withPromo, existing).find(a => a.type === 'promotion_code');
    expect(pc!.op).toBe('reuse');
  });
});

describe('Phase C output', () => {
  it('lists every env var the activation needs', () => {
    const out = renderPhaseCBlock({});
    for (const envVar of Object.values(ENV_VAR)) expect(out).toContain(envVar);
    expect(Object.keys(ENV_VAR)).toHaveLength(7);   // 3 products + 4 token packs
  });

  it('marks ids that were never created instead of printing a blank', () => {
    expect(renderPhaseCBlock({})).toContain('MISSING');
    expect(missingPhaseCIds({})).toHaveLength(7);
  });

  it('reports nothing missing once every id is resolved', () => {
    const resolved = Object.fromEntries(Object.keys(ENV_VAR).map(k => [k, `id_${k}`]));
    expect(missingPhaseCIds(resolved)).toEqual([]);
    expect(renderPhaseCBlock(resolved)).not.toContain('MISSING');
  });

  it('never emits a key or signing secret — only ids', () => {
    const resolved = Object.fromEntries(Object.keys(ENV_VAR).map(k => [k, `id_${k}`]));
    const out = renderPhaseCBlock(resolved);
    expect(out).not.toMatch(/sk_(live|test)_[A-Za-z0-9]/);
    expect(out).not.toMatch(/whsec_[A-Za-z0-9]/);
    // The three credential names appear as instructions to collect them manually.
    expect(out).toContain('STRIPE_WEBHOOK_SECRET');
  });
});

describe('secret redaction', () => {
  // @ts-expect-error — plain-JS script module.
  const { redact } = catalog as { redact: (t: unknown) => string };

  it('removes a key Stripe echoed back in its own error', () => {
    // Stripe masks all but the last four; those four are still part of the key.
    const msg = 'Invalid API Key provided: sk_test_**************e123';
    expect(redact(msg)).toBe('Invalid API Key provided: sk_test_[redacted]');
    expect(redact(msg)).not.toContain('e123');
  });

  it('redacts every key form, live and test, secret restricted and publishable', () => {
    for (const k of ['sk_live_ABC123', 'sk_test_ABC123', 'rk_live_ABC123', 'pk_live_ABC123']) {
      expect(redact(`failed with ${k} today`)).not.toContain('ABC123');
    }
  });

  it('redacts every occurrence, not just the first', () => {
    const out = redact('sk_live_AAA and sk_live_BBB');
    expect(out).not.toContain('AAA');
    expect(out).not.toContain('BBB');
  });

  it('leaves ordinary text alone', () => {
    expect(redact('Stripe GET /prices: rate limited')).toBe('Stripe GET /prices: rate limited');
    expect(redact(undefined)).toBe('');
  });
});

describe('a token pack can be explicitly not offered', () => {
  // The app already tolerates an unconfigured pack — /api/tokens/topup answers
  // PACK_NOT_CONFIGURED — so demanding a price would be stricter than the
  // product and would push an operator into inventing an amount.
  const skipped = (over: Record<string, unknown> = {}) => ({
    ...VALID,
    tokenPacks: { ...VALID.tokenPacks, overage: { skip: true, ...over } },
  });

  it('accepts skip: true with no amount at all', () => {
    expect(validateCatalog(skipped())).toEqual([]);
  });

  it('still REJECTS a bare null — unresolved is not the same as not-offered', () => {
    const c = structuredClone(VALID);
    (c.tokenPacks.overage as Record<string, unknown>).amountMinor = null;
    const errs = validateCatalog(c).join();
    expect(errs).toContain('tokenPacks.overage');
    expect(errs).toContain('skip');   // the error names the way out
  });

  it('plans no action for a skipped pack', () => {
    const actions = planCatalog(skipped(), EMPTY_ACCOUNT);
    const overage = actions.filter(a => a.key === tokenPriceKey('overage'));
    expect(overage).toHaveLength(1);
    expect(overage[0].op).toBe('skip');
    expect(actions.filter(a => a.op === 'create' && a.type === 'token_price')).toHaveLength(3);
  });

  it('a skipped pack is not counted as a missing Phase C id', () => {
    const resolved = Object.fromEntries(
      Object.keys(ENV_VAR).filter(k => k !== tokenPriceKey('overage')).map(k => [k, `id_${k}`]));
    const skip = new Set([tokenPriceKey('overage')]);
    expect(missingPhaseCIds(resolved, skip)).toEqual([]);
    expect(missingPhaseCIds(resolved)).toEqual([tokenPriceKey('overage')]);   // without the skip set, still missing
  });

  it('reads as a decision in the Phase C block, not as a failure', () => {
    const resolved = Object.fromEntries(
      Object.keys(ENV_VAR).filter(k => k !== tokenPriceKey('overage')).map(k => [k, `id_${k}`]));
    const out = renderPhaseCBlock(resolved, new Set([tokenPriceKey('overage')]));
    expect(out).toContain('skipped — pack not offered');
    expect(out).not.toContain('MISSING');
  });
});
