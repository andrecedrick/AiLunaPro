/**
 * Client-side ROI preview calculator — A1 Change 2b (value-first).
 *
 * Mirrors the worker's authoritative `computeRoi` (worker/src/lib/roi-shared.ts)
 * on the same savings rates so a visitor sees their estimated savings + payback
 * BEFORE the email gate. The server stays authoritative on submit (and returns
 * `recommendedAgentIds`); this only previews the numeric savings.
 *
 * Strict parity with the worker is locked by tests/unit/roi-score-parity.test.ts.
 * teamSize is intentionally NOT an input here — it does not affect the formula.
 */

import { SAVINGS_RATE, AGENT_DEFAULT_MONTHLY_USD, type Workflow } from '../../data/roi-config';

export interface RoiPreviewInputs {
  monthlyHoursOnRepetitiveWork: number;
  averageHourlyCost:            number;
  targetWorkflow:               Workflow;
}

export interface RoiPreview {
  estimatedTimeSavedHoursPerMonth: number;
  estimatedMonthlyCostSaved:       number;
  estimatedYearlyCostSaved:        number;
  estimatedPaybackMonths:          number | null;
}

// Rounding helpers — identical to worker/src/lib/roi-shared.ts.
const round0 = (n: number): number => Math.round(n);
const round1 = (n: number): number => Math.round(n * 10) / 10;

export function computeRoiPreview(inputs: RoiPreviewInputs): RoiPreview {
  const rate        = SAVINGS_RATE[inputs.targetWorkflow];
  const timeSaved   = round1(inputs.monthlyHoursOnRepetitiveWork * rate);
  const monthlyCost = round0(timeSaved * inputs.averageHourlyCost);
  const yearlyCost  = monthlyCost * 12;
  const payback     = monthlyCost > 0
    ? round1(AGENT_DEFAULT_MONTHLY_USD / monthlyCost)
    : null;
  return {
    estimatedTimeSavedHoursPerMonth: timeSaved,
    estimatedMonthlyCostSaved:       monthlyCost,
    estimatedYearlyCostSaved:        yearlyCost,
    estimatedPaybackMonths:          payback,
  };
}
