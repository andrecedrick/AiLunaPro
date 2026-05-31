import { describe, it, expect } from 'vitest';
import {
  scoreRoi,
  computeRoi,
  validateInputs,
  ROI_RULESET_VERSION,
  type RoiInputs,
} from '../../worker/src/lib/roi-shared';
import { ENGINE_VERSION, stableStringify } from '../../worker/src/lib/determinism';

/*
 * Phase 0 — Determinism Foundation: K2A ROI replay-equality proof.
 *
 * "Same input" for K2A = RoiInputs (teamSize, monthlyHoursOnRepetitiveWork,
 * averageHourlyCost, targetWorkflow). teamSize is intentionally ignored by the
 * formula. No timestamps, no random ids, no locale in the scored output.
 */

const VALID_INPUTS: RoiInputs = {
  teamSize:                     12,
  monthlyHoursOnRepetitiveWork: 80,
  averageHourlyCost:            45,
  targetWorkflow:               'finance',
};

describe('K2A ROI — determinism', () => {
  it('validates the reference input set', () => {
    expect(validateInputs(VALID_INPUTS)).toBeNull();
  });

  it('produces identical output across two runs (deep equality)', () => {
    expect(scoreRoi(VALID_INPUTS)).toEqual(scoreRoi(VALID_INPUTS));
  });

  it('is byte-identical via stable serialization', () => {
    expect(stableStringify(scoreRoi(VALID_INPUTS))).toBe(stableStringify(scoreRoi(VALID_INPUTS)));
  });

  it('ignores teamSize in the formula (same result for different team sizes)', () => {
    const a = scoreRoi(VALID_INPUTS);
    const b = scoreRoi({ ...VALID_INPUTS, teamSize: 999 });
    expect(b.result).toEqual(a.result);
  });

  it('stamps engineVersion + rulesetVersion', () => {
    const r = scoreRoi(VALID_INPUTS);
    expect(r.engineVersion).toBe(ENGINE_VERSION);
    expect(r.rulesetVersion).toBe(ROI_RULESET_VERSION);
  });

  it('attaches a reason reference to every produced number/range (traceability)', () => {
    const r = scoreRoi(VALID_INPUTS);
    const fields = [
      'estimatedTimeSavedHoursPerMonth',
      'estimatedMonthlyCostSaved',
      'estimatedYearlyCostSaved',
      'estimatedPaybackMonths',
      'recommendedAgentIds',
    ];
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

  it('payback carries a benchmark reference (agent default monthly cost)', () => {
    const refs = scoreRoi(VALID_INPUTS).trace.estimatedPaybackMonths;
    expect(refs.some(r => r.kind === 'benchmark')).toBe(true);
  });

  it('contains no timestamp/random/PII fields in the scored output', () => {
    const r = scoreRoi(VALID_INPUTS);
    const keys = Object.keys(r);
    for (const forbidden of ['id', 'createdAt', 'consentAt', 'expiresAt', 'email', 'lead']) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('core computeRoi is stable and uses fixed rounding', () => {
    const a = computeRoi(VALID_INPUTS);
    const b = computeRoi(VALID_INPUTS);
    expect(a).toEqual(b);
    expect(Number.isInteger(a.estimatedMonthlyCostSaved)).toBe(true);
  });
});
