import { describe, it, expect } from 'vitest';
import {
  computePreview,
  validateTaps,
  PREVIEW_DISCLAIMER,
  type PreviewTaps,
} from '../../worker/src/lib/audit-express-preview';
import { ENGINE_VERSION, stableStringify } from '../../worker/src/lib/determinism';

/*
 * Phase 3 — Audit Express preview: determinism + privacy proofs.
 *
 * computePreview is PURE: same taps => identical payload. The payload carries
 * NO PII (no email/name/phone/company/lead/ip fields or values).
 */

const TAPS: PreviewTaps = {
  workflow:     'finance',
  monthlyHours: 'medium',
  hourlyCost:   'medium',
  aiUsage:      'team',
  shadowAi:     'partial_visibility',
};

/** Recursively collect every object key and every string value. */
function collect(node: unknown, keys: string[], values: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((n) => collect(n, keys, values));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      keys.push(k);
      collect(v, keys, values);
    }
  } else if (typeof node === 'string') {
    values.push(node);
  }
}

describe('Audit Express preview — determinism', () => {
  it('validates the reference taps', () => {
    expect(validateTaps(TAPS)).toBeNull();
  });

  it('rejects unknown enum values', () => {
    expect(validateTaps({ ...TAPS, workflow: 'not_a_workflow' })).not.toBeNull();
    expect(validateTaps({ ...TAPS, monthlyHours: 'huge' })).not.toBeNull();
    expect(validateTaps({})).not.toBeNull();
  });

  it('produces identical output across runs (deep equality)', () => {
    expect(computePreview(TAPS)).toEqual(computePreview(TAPS));
  });

  it('is byte-identical via stable serialization', () => {
    expect(stableStringify(computePreview(TAPS))).toBe(stableStringify(computePreview(TAPS)));
  });

  it('is independent of tap key insertion order', () => {
    const reordered: PreviewTaps = {
      shadowAi:     TAPS.shadowAi,
      aiUsage:      TAPS.aiUsage,
      hourlyCost:   TAPS.hourlyCost,
      monthlyHours: TAPS.monthlyHours,
      workflow:     TAPS.workflow,
    };
    expect(computePreview(reordered)).toEqual(computePreview(TAPS));
  });

  it('stamps engineVersion + ruleset versions and carries trace on both outputs', () => {
    const p = computePreview(TAPS);
    expect(p.engineVersion).toBe(ENGINE_VERSION);
    expect(typeof p.k1a.rulesetVersion).toBe('string');
    expect(typeof p.k2a.rulesetVersion).toBe('string');
    expect(Object.keys(p.k1a.trace).length).toBeGreaterThan(0);
    expect(Object.keys(p.k2a.trace).length).toBeGreaterThan(0);
  });

  it('marks K1A as partial (short preview) and includes the disclaimer', () => {
    const p = computePreview(TAPS);
    expect(p.k1a.partial).toBe(true);
    expect(p.disclaimer).toBe(PREVIEW_DISCLAIMER);
  });
});

describe('Audit Express preview — privacy (no PII)', () => {
  it('payload contains no PII keys', () => {
    const keys: string[] = [];
    const values: string[] = [];
    collect(computePreview(TAPS), keys, values);
    const pii = /email|name|phone|company|lead|ip|address|consent/i;
    for (const k of keys) {
      // recommendedAgentIds is allowed; ensure it is not a PII field name
      expect(pii.test(k)).toBe(false);
    }
  });

  it('payload contains no email-like values', () => {
    const keys: string[] = [];
    const values: string[] = [];
    collect(computePreview(TAPS), keys, values);
    for (const v of values) {
      expect(v.includes('@')).toBe(false);
    }
  });
});
