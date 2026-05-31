import { describe, it, expect } from 'vitest';
import {
  scoreDiagnostic,
  computeScore,
  validateAnswers,
  DIAGNOSTIC_RULESET_VERSION,
} from '../../worker/src/lib/diagnostic-shared';
import { ENGINE_VERSION, stableStringify } from '../../worker/src/lib/determinism';

/*
 * Phase 0 — Determinism Foundation: K1A Diagnostic replay-equality proof.
 *
 * "Same input" for K1A = the set of answers (one validated option value per
 * weighted/weight-0 question). Key insertion order is NOT part of the input
 * (scoreDiagnostic canonicalizes). No timestamps, no random ids, no locale.
 */

const VALID_ANSWERS: Record<string, string> = {
  ai_usage:                'team',
  process_automation:      'moderate',
  data_readiness:          'mostly_ready',
  compliance_awareness:    'documented',
  shadow_ai:               'partial_visibility',
  business_impact:         'some_metrics',
  team_skills:             'good',
  implementation_priority: 'compliance',
};

describe('K1A Diagnostic — determinism', () => {
  it('validates the reference answer set', () => {
    expect(validateAnswers(VALID_ANSWERS)).toBeNull();
  });

  it('produces identical output across two runs (deep equality)', () => {
    const a = scoreDiagnostic(VALID_ANSWERS);
    const b = scoreDiagnostic(VALID_ANSWERS);
    expect(a).toEqual(b);
  });

  it('is byte-identical via stable serialization', () => {
    const a = stableStringify(scoreDiagnostic(VALID_ANSWERS));
    const b = stableStringify(scoreDiagnostic(VALID_ANSWERS));
    expect(a).toBe(b);
  });

  it('is independent of answer key insertion order', () => {
    const reordered: Record<string, string> = {};
    for (const key of Object.keys(VALID_ANSWERS).reverse()) {
      reordered[key] = VALID_ANSWERS[key];
    }
    expect(scoreDiagnostic(reordered)).toEqual(scoreDiagnostic(VALID_ANSWERS));
  });

  it('stamps engineVersion + rulesetVersion', () => {
    const r = scoreDiagnostic(VALID_ANSWERS);
    expect(r.engineVersion).toBe(ENGINE_VERSION);
    expect(r.rulesetVersion).toBe(DIAGNOSTIC_RULESET_VERSION);
  });

  it('attaches a reason reference to every produced field (traceability)', () => {
    const r = scoreDiagnostic(VALID_ANSWERS);
    for (const field of ['normalizedScore', 'bucket', 'recommendedAgentIds']) {
      expect(Array.isArray(r.trace[field])).toBe(true);
      expect(r.trace[field].length).toBeGreaterThan(0);
      for (const ref of r.trace[field]) {
        expect(ref.kind === 'rule' || ref.kind === 'benchmark').toBe(true);
        expect(typeof ref.ref).toBe('string');
        expect(ref.ref.length).toBeGreaterThan(0);
      }
    }
  });

  it('contains no timestamp/random/PII fields in the scored output', () => {
    const r = scoreDiagnostic(VALID_ANSWERS);
    const keys = Object.keys(r);
    for (const forbidden of ['id', 'createdAt', 'consentAt', 'expiresAt', 'email', 'lead']) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('core computeScore is stable for the same answers', () => {
    expect(computeScore(VALID_ANSWERS)).toEqual(computeScore(VALID_ANSWERS));
  });

  it('weight-0 question (implementation_priority) does not change the score', () => {
    const a = scoreDiagnostic(VALID_ANSWERS);
    const b = scoreDiagnostic({ ...VALID_ANSWERS, implementation_priority: 'save_time' });
    expect(b.normalizedScore).toBe(a.normalizedScore);
    expect(b.bucket).toBe(a.bucket);
  });
});
