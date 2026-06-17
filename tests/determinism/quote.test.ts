import { describe, it, expect } from 'vitest';
import {
  scoreQuote,
  computeQuote,
  validateInputs,
  QUOTE_RULESET_VERSION,
  type QuoteInputs,
} from '../../worker/src/lib/quote-shared';
import {
  QUOTE_RANGES,
  QUOTE_TIERS,
  QUOTE_CATEGORIES,
} from '../../worker/src/data/quote-config';
import { ENGINE_VERSION, stableStringify } from '../../worker/src/lib/determinism';

/*
 * Phase Q0 — Quote estimator determinism + config integrity.
 *
 * "Same input" for the quote engine = QuoteInputs (category, tier, + optional
 * segmentation qualifiers). Qualifiers are intentionally ignored by the price
 * (no dynamic pricing). No timestamps, no random ids, no locale in the output.
 */

const VALID_INPUTS: QuoteInputs = {
  category: 'ai_agent',
  tier:     'contextual',
  businessSize: 'medium',
  urgency:      'standard',
  budgetBand:   '50k_150k',
};

describe('Quote — determinism', () => {
  it('validates the reference input set', () => {
    expect(validateInputs(VALID_INPUTS)).toBeNull();
  });

  it('produces identical output across two runs (deep equality)', () => {
    expect(scoreQuote(VALID_INPUTS)).toEqual(scoreQuote(VALID_INPUTS));
  });

  it('is byte-identical via stable serialization', () => {
    expect(stableStringify(scoreQuote(VALID_INPUTS))).toBe(stableStringify(scoreQuote(VALID_INPUTS)));
  });

  it('ignores optional qualifiers in the price (no dynamic pricing)', () => {
    const a = scoreQuote(VALID_INPUTS);
    const b = scoreQuote({ category: 'ai_agent', tier: 'contextual' });
    expect(b.estimate.priceMinUsd).toBe(a.estimate.priceMinUsd);
    expect(b.estimate.priceMaxUsd).toBe(a.estimate.priceMaxUsd);
    const c = scoreQuote({ ...VALID_INPUTS, businessSize: 'solo', urgency: 'high', budgetBand: 'under_10k' });
    expect(c.estimate.priceMinUsd).toBe(a.estimate.priceMinUsd);
    expect(c.estimate.priceMaxUsd).toBe(a.estimate.priceMaxUsd);
  });

  it('stamps engineVersion + rulesetVersion', () => {
    const r = scoreQuote(VALID_INPUTS);
    expect(r.engineVersion).toBe(ENGINE_VERSION);
    expect(r.rulesetVersion).toBe(QUOTE_RULESET_VERSION);
  });

  it('attaches a reason reference to every produced field (traceability)', () => {
    const r = scoreQuote(VALID_INPUTS);
    const fields = ['priceMinUsd', 'priceMaxUsd', 'openEnded', 'solutionKey', 'scopeKeys', 'nextStepKeys', 'opsCostUpliftPct'];
    for (const field of fields) {
      expect(Array.isArray(r.trace[field])).toBe(true);
      expect(r.trace[field].length).toBeGreaterThan(0);
      for (const ref of r.trace[field]) {
        expect(ref.kind === 'rule' || ref.kind === 'benchmark').toBe(true);
        expect(typeof ref.ref).toBe('string');
        expect(ref.ref.length).toBeGreaterThan(0);
      }
    }
  });

  it('returns only stable keys — no localized text leaks into the engine', () => {
    const e = scoreQuote(VALID_INPUTS).estimate;
    expect(e.solutionKey).toBe('ai_agent.contextual');
    expect(e.scopeKeys.every(k => /^[a-zA-Z]+$/.test(k))).toBe(true);
  });

  it('contains no timestamp/random/PII fields in the scored output', () => {
    const r = scoreQuote(VALID_INPUTS);
    const keys = Object.keys(r);
    for (const forbidden of ['id', 'createdAt', 'consentAt', 'expiresAt', 'email', 'lead', 'projectDescription']) {
      expect(keys).not.toContain(forbidden);
    }
  });
});

describe('Quote — pricing table integrity', () => {
  it('looks up the exact 2026 reference ranges', () => {
    expect(computeQuote({ category: 'ai_agent', tier: 'simple' })).toMatchObject({ priceMinUsd: 15_000, priceMaxUsd: 40_000, openEnded: false });
    expect(computeQuote({ category: 'ai_agent', tier: 'multi_agent' })).toMatchObject({ priceMinUsd: 120_000, priceMaxUsd: 400_000, openEnded: true });
    expect(computeQuote({ category: 'website', tier: 'simple' })).toMatchObject({ priceMinUsd: 3_000, priceMaxUsd: 10_000, openEnded: false });
    expect(computeQuote({ category: 'website', tier: 'custom' })).toMatchObject({ priceMinUsd: 50_000, priceMaxUsd: 250_000, openEnded: true });
    expect(computeQuote({ category: 'audit', tier: 'feasibility' })).toMatchObject({ priceMinUsd: 2_000, priceMaxUsd: 5_000, openEnded: false });
  });

  it('prices automation identically to AI agents (decision 4)', () => {
    for (const tier of QUOTE_TIERS.ai_agent) {
      const agent = computeQuote({ category: 'ai_agent', tier });
      const auto = computeQuote({ category: 'automation', tier });
      expect(auto.priceMinUsd).toBe(agent.priceMinUsd);
      expect(auto.priceMaxUsd).toBe(agent.priceMaxUsd);
      expect(auto.openEnded).toBe(agent.openEnded);
    }
  });

  it('annotates ops-cost uplift only for AI agents & automation', () => {
    expect(computeQuote({ category: 'ai_agent', tier: 'simple' }).opsCostUpliftPct).toEqual({ minPct: 40, maxPct: 80 });
    expect(computeQuote({ category: 'automation', tier: 'simple' }).opsCostUpliftPct).toEqual({ minPct: 40, maxPct: 80 });
    expect(computeQuote({ category: 'website', tier: 'simple' }).opsCostUpliftPct).toBeNull();
    expect(computeQuote({ category: 'audit', tier: 'feasibility' }).opsCostUpliftPct).toBeNull();
  });

  it('has a range + scope set for every declared category/tier', () => {
    for (const category of QUOTE_CATEGORIES) {
      for (const tier of QUOTE_TIERS[category]) {
        const range = QUOTE_RANGES[category][tier];
        expect(range, `${category}:${tier}`).toBeDefined();
        expect(range.minUsd).toBeLessThanOrEqual(range.maxUsd);
        expect(range.minUsd).toBeGreaterThan(0);
      }
    }
  });
});

describe('Quote — validation', () => {
  it('rejects unknown category', () => {
    expect(validateInputs({ category: 'spaceship', tier: 'simple' })).toMatch(/category must be one of/);
  });

  it('rejects a tier that does not belong to the category', () => {
    // 'feasibility' is an audit-only tier; invalid for ai_agent.
    expect(validateInputs({ category: 'ai_agent', tier: 'feasibility' })).toMatch(/tier is not valid/);
    // 'custom' is website-only; invalid for ai_agent.
    expect(validateInputs({ category: 'ai_agent', tier: 'custom' })).toMatch(/tier is not valid/);
  });

  it('rejects invalid optional qualifiers when present', () => {
    expect(validateInputs({ category: 'website', tier: 'simple', businessSize: 'enormous' })).toMatch(/businessSize/);
    expect(validateInputs({ category: 'website', tier: 'simple', urgency: 'yesterday' })).toMatch(/urgency/);
    expect(validateInputs({ category: 'website', tier: 'simple', budgetBand: 'infinite' })).toMatch(/budgetBand/);
  });

  it('accepts inputs with no optional qualifiers', () => {
    expect(validateInputs({ category: 'audit', tier: 'feasibility' })).toBeNull();
  });

  it('rejects non-object input', () => {
    expect(validateInputs(null)).toMatch(/object/);
    expect(validateInputs('quote')).toMatch(/object/);
  });
});
