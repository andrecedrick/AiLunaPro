import { describe, it, expect } from 'vitest';
import { computeDecision, investmentFromRange } from '../../src/lib/quote/decision';

describe('quote decision engine — pure, no fake numbers', () => {
  it('computes ROI multiples, break-even and framing for a normal case', () => {
    // invest 24k, save 4,950/mo = 59,400/yr
    const d = computeDecision({ investmentUsd: 24_000, yearlySavedUsd: 59_400, monthlySavedUsd: 4_950 })!;
    expect(d).not.toBeNull();
    expect(d.roiYear1).toBeCloseTo(2.475, 3);
    expect(d.roi3yr).toBeCloseTo(7.425, 3);
    expect(d.paybackMonths).toBeCloseTo(4.848, 2);
    expect(d.strong).toBe(true); // 2.475× ≥ 1.5 → lead with year-1 multiple
  });

  it('flags a big build as NOT strong (year-1 ROI < 1.5×) → break-even framing', () => {
    // invest 50.6k (mid of 27.6k–73.6k), save 54,648/yr → year-1 ~1.08×
    const d = computeDecision({ investmentUsd: 50_600, yearlySavedUsd: 54_648, monthlySavedUsd: 4_554 })!;
    expect(d.roiYear1).toBeLessThan(1.5);
    expect(d.strong).toBe(false);
    expect(d.roi3yr).toBeGreaterThan(3); // 3-year still compelling
    expect(d.paybackMonths).toBeGreaterThan(10);
  });

  it('handles a tiny project with a large honest multiple', () => {
    const d = computeDecision({ investmentUsd: 2_000, yearlySavedUsd: 40_000, monthlySavedUsd: 3_333 })!;
    expect(d.roiYear1).toBe(20);
    expect(d.strong).toBe(true);
  });

  it('returns null when there is no meaningful decision (no savings or no investment)', () => {
    expect(computeDecision({ investmentUsd: 24_000, yearlySavedUsd: 0, monthlySavedUsd: 0 })).toBeNull();
    expect(computeDecision({ investmentUsd: 0, yearlySavedUsd: 59_400, monthlySavedUsd: 4_950 })).toBeNull();
    expect(computeDecision({ investmentUsd: -5, yearlySavedUsd: 100, monthlySavedUsd: 10 })).toBeNull();
  });

  it('payback is null when there is a yearly saving but no monthly figure', () => {
    const d = computeDecision({ investmentUsd: 24_000, yearlySavedUsd: 59_400, monthlySavedUsd: 0 })!;
    expect(d.paybackMonths).toBeNull();
    expect(d.roiYear1).toBeCloseTo(2.475, 3); // still computable from yearly
  });

  it('investmentFromRange: midpoint for bounded, max (conservative) for open-ended', () => {
    expect(investmentFromRange(30_000, 80_000, false)).toBe(55_000);
    expect(investmentFromRange(120_000, 400_000, true)).toBe(400_000); // never overstates ROI
  });
});
