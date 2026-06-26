/**
 * Client-side ADVANCED ROI preview — mirror of the worker's authoritative
 * computeRoiAdvanced (worker/src/lib/roi-advanced.ts).
 *
 * Lets a visitor see the full time→money breakdown (loaded rate, time saved,
 * team-scale, Cost of Inaction, frais → payback / ROI%, freed FTE, optional
 * revenue) BEFORE the email gate. The server stays authoritative on submit.
 *
 * Strict numeric parity with the worker is locked by
 * tests/unit/roi-advanced-parity.test.ts — any drift in a constant, the formula,
 * or a rounding rule fails the test.
 */

import {
  SAVINGS_RATE,
  WORKFLOW_TO_AGENTS,
  WORKING_DAYS_PER_YEAR,
  PRODUCTIVE_HOURS_PER_FTE,
  WEEKS_PER_MONTH,
  AUTOMATION_RATE_MAX,
  type Workflow,
} from '../../data/roi-config';

export interface RoiAdvancedPreviewInputs {
  teamSize:                number;
  monthlyHoursPerPerson:   number;
  baseHourlyRate:          number;
  loadCoefficient:         number;
  targetWorkflow:          Workflow;
  automationRateOverride?: number | null;
  implementationCost:      number;
  recurringMonthlyCost:    number;
  revenuePerFreedHour?:    number | null;
}

export interface RoiAdvancedPreview {
  loadedHourlyRate:           number;
  appliedAutomationRate:      number;
  timeSavedHoursPerMonth:     number;
  timeSavedHoursPerYear:      number;
  teamTimeSavedHoursPerMonth: number;
  teamTimeSavedHoursPerYear:  number;
  fteRecovered:               number;
  monthlyCostSaved:           number;
  yearlyCostSaved:            number;
  teamMonthlyCostSaved:       number;
  teamYearlyCostSaved:        number;
  coiPerDay:                  number;
  coiPerMonth:                number;
  coiPerYear:                 number;
  firstYearInvestment:        number;
  netGainYear1:               number;
  roiPercentYear1:            number | null;
  paybackMonths:              number | null;
  additionalRevenueYear:      number | null;
  recommendedAgentIds:        string[];
}

// Rounding helpers — identical to worker/src/lib/roi-advanced.ts.
const round0 = (n: number): number => Math.round(n);
const round1 = (n: number): number => Math.round(n * 10) / 10;
const round2 = (n: number): number => Math.round(n * 100) / 100;
const clamp  = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/** Weekly → monthly hours (mirror of the worker helper). */
export const monthlyFromWeekly = (weeklyHours: number): number =>
  round1(weeklyHours * WEEKS_PER_MONTH);

export function computeRoiAdvancedPreview(inputs: RoiAdvancedPreviewInputs): RoiAdvancedPreview {
  const loadedHourlyRate = round2(inputs.baseHourlyRate * inputs.loadCoefficient);

  const appliedAutomationRate = clamp(
    inputs.automationRateOverride ?? SAVINGS_RATE[inputs.targetWorkflow],
    0,
    AUTOMATION_RATE_MAX,
  );

  const timeSavedHoursPerMonth = round1(inputs.monthlyHoursPerPerson * appliedAutomationRate);
  const timeSavedHoursPerYear  = round1(timeSavedHoursPerMonth * 12);

  const teamTimeSavedHoursPerMonth = round1(timeSavedHoursPerMonth * inputs.teamSize);
  const teamTimeSavedHoursPerYear  = round1(timeSavedHoursPerYear * inputs.teamSize);
  const fteRecovered = round2(teamTimeSavedHoursPerYear / PRODUCTIVE_HOURS_PER_FTE);

  const monthlyCostSaved = round0(timeSavedHoursPerMonth * loadedHourlyRate);
  const yearlyCostSaved  = monthlyCostSaved * 12;
  const teamMonthlyCostSaved = round0(monthlyCostSaved * inputs.teamSize);
  const teamYearlyCostSaved  = teamMonthlyCostSaved * 12;

  const coiPerYear  = teamYearlyCostSaved;
  const coiPerMonth = teamMonthlyCostSaved;
  const coiPerDay   = round0(teamYearlyCostSaved / WORKING_DAYS_PER_YEAR);

  const firstYearInvestment = round0(inputs.implementationCost + inputs.recurringMonthlyCost * 12);
  const netGainYear1        = teamYearlyCostSaved - firstYearInvestment;
  const roiPercentYear1     = firstYearInvestment > 0
    ? round0((netGainYear1 / firstYearInvestment) * 100)
    : null;
  const teamMonthlyNet = teamMonthlyCostSaved - inputs.recurringMonthlyCost;
  const paybackMonths  = teamMonthlyNet > 0
    ? round1(inputs.implementationCost / teamMonthlyNet)
    : null;

  const additionalRevenueYear = inputs.revenuePerFreedHour != null && inputs.revenuePerFreedHour > 0
    ? round0(teamTimeSavedHoursPerYear * inputs.revenuePerFreedHour)
    : null;

  return {
    loadedHourlyRate,
    appliedAutomationRate,
    timeSavedHoursPerMonth,
    timeSavedHoursPerYear,
    teamTimeSavedHoursPerMonth,
    teamTimeSavedHoursPerYear,
    fteRecovered,
    monthlyCostSaved,
    yearlyCostSaved,
    teamMonthlyCostSaved,
    teamYearlyCostSaved,
    coiPerDay,
    coiPerMonth,
    coiPerYear,
    firstYearInvestment,
    netGainYear1,
    roiPercentYear1,
    paybackMonths,
    additionalRevenueYear,
    recommendedAgentIds: [...WORKFLOW_TO_AGENTS[inputs.targetWorkflow]],
  };
}
