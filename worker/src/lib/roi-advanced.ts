/**
 * Advanced ROI engine (G5) — time → money, fully developed formulas.
 *
 * Server-side AUTHORITATIVE. Deterministic, no LLM, no Date, no locale, no
 * randomness — same inputs always yield identical output. Mirrored byte-for-byte
 * in src/lib/roi/advanced.ts for the client preview; parity is locked by
 * tests/unit/roi-advanced-parity.test.ts.
 *
 * This is additive: the locked K2A `computeRoi` (roi-shared.ts) is untouched.
 * The advanced engine adds the consulting-grade figures from the
 * "AUDIT TEMPS → ARGENT" method (docs/audit-ia-methode-complete.md §1):
 *   - loaded hourly rate (Tᶜ)                       §1.2
 *   - time worked / time saved (month + year)        §1.7 / §2
 *   - cost saved at loaded rate (per person + team)  §1.3 / §1.4
 *   - Cost of Inaction — COI (day / month / year)    §1.5
 *   - implementation cost (frais) → payback + ROI%   §1.6
 *   - freed capacity → FTE + optional revenue         §1.7
 *
 * Reuses SAVINGS_RATE as the default automation rate so a workflow chosen in the
 * existing calculator maps straight into the advanced result.
 */

import {
  SAVINGS_RATE,
  WORKFLOW_TO_AGENTS,
  AGENT_DEFAULT_MONTHLY_USD,
  WEEKS_PER_MONTH,
  WORKING_DAYS_PER_YEAR,
  PRODUCTIVE_HOURS_PER_FTE,
  LOAD_COEFFICIENT_DEFAULT,
  LOAD_COEFFICIENT_MIN,
  LOAD_COEFFICIENT_MAX,
  AUTOMATION_RATE_MAX,
  isWorkflow,
  WORKFLOW_VALUES,
  type Workflow,
} from '../data/roi-config';
import {
  stamp,
  ruleRef,
  benchmarkRef,
  type DeterminismStamp,
  type Trace,
} from './determinism';

/**
 * Advanced ROI ruleset version (constants, formula, rounding). BUMP on any change
 * to a coefficient, the formula, or a rounding rule.
 */
export const ROI_ADVANCED_RULESET_VERSION = '1.0.0';

/* ── Inputs ────────────────────────────────────────────────── */

export interface RoiAdvancedInputs {
  /** People who currently perform the task (team-scale multiplier). ≥ 1. */
  teamSize:           number;
  /**
   * Current hours spent on the task, PER PERSON, PER MONTH.
   * If you only know weekly hours, multiply by WEEKS_PER_MONTH first
   * (helper `monthlyFromWeekly` is exported below).
   */
  monthlyHoursPerPerson: number;
  /** Raw (un-loaded) hourly rate of that person, in the chosen currency unit. > 0. */
  baseHourlyRate:     number;
  /** Loaded-cost coefficient (salary→true employer cost). Default 1.8. */
  loadCoefficient:    number;
  /** Which workflow — drives the default automation rate via SAVINGS_RATE. */
  targetWorkflow:     Workflow;
  /**
   * Optional explicit automation rate (0–0.95). When provided it overrides the
   * workflow default. Lets an auditor tune "how much of THIS task is removable".
   */
  automationRateOverride?: number | null;
  /** One-off implementation / setup fee (frais d'installation). ≥ 0. Default 0. */
  implementationCost: number;
  /** Recurring monthly tool/agent cost. ≥ 0. Default = AGENT_DEFAULT_MONTHLY_USD. */
  recurringMonthlyCost: number;
  /**
   * Optional: revenue generated per freed productive hour, used to convert
   * recovered capacity into top-line growth (méthode §12.3). 0 = skip.
   */
  revenuePerFreedHour?: number | null;
}

/* ── Result ────────────────────────────────────────────────── */

export interface RoiAdvancedResult {
  /* Rates */
  loadedHourlyRate:          number;   // Tᶜ
  appliedAutomationRate:     number;   // fraction 0–0.95

  /* Time (per person) */
  timeSavedHoursPerMonth:    number;
  timeSavedHoursPerYear:     number;

  /* Time (team-scale) */
  teamTimeSavedHoursPerMonth: number;
  teamTimeSavedHoursPerYear:  number;
  fteRecovered:               number;  // freed hours / 1800

  /* Money — per person */
  monthlyCostSaved:          number;
  yearlyCostSaved:           number;

  /* Money — team-scale (the headline figures) */
  teamMonthlyCostSaved:      number;
  teamYearlyCostSaved:       number;

  /* Cost of Inaction (the bleed if nothing changes) */
  coiPerDay:                 number;
  coiPerMonth:               number;
  coiPerYear:                number;

  /* Investment (frais) & returns */
  firstYearInvestment:       number;   // implementation + 12× recurring
  netGainYear1:              number;   // teamYearlySaved − firstYearInvestment
  roiPercentYear1:           number | null;
  paybackMonths:             number | null;

  /* Optional capacity → revenue */
  additionalRevenueYear:     number | null;

  /* Recommendation passthrough (same source as K2A) */
  recommendedAgentIds:       string[];
}

export interface RoiAdvancedScored extends DeterminismStamp {
  result: RoiAdvancedResult;
  trace:  Trace;
}

/* ── Rounding helpers (single source — mirror in client) ───── */
const round0 = (n: number): number => Math.round(n);
const round1 = (n: number): number => Math.round(n * 10) / 10;
const round2 = (n: number): number => Math.round(n * 100) / 100;
const clamp  = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/* ── Conversion helper (weekly → monthly hours) ────────────── */
export const monthlyFromWeekly = (weeklyHours: number): number =>
  round1(weeklyHours * WEEKS_PER_MONTH);

/* ── Validation ────────────────────────────────────────────── */

export function validateAdvancedInputs(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'inputs must be an object';
  const i = input as Record<string, unknown>;

  if (typeof i.teamSize !== 'number' || !Number.isInteger(i.teamSize) || i.teamSize < 1 || i.teamSize > 100000) {
    return 'teamSize must be an integer between 1 and 100000';
  }
  if (typeof i.monthlyHoursPerPerson !== 'number' || !Number.isFinite(i.monthlyHoursPerPerson) || i.monthlyHoursPerPerson < 0 || i.monthlyHoursPerPerson > 10000) {
    return 'monthlyHoursPerPerson must be between 0 and 10000';
  }
  if (typeof i.baseHourlyRate !== 'number' || !Number.isFinite(i.baseHourlyRate) || i.baseHourlyRate <= 0 || i.baseHourlyRate > 100000) {
    return 'baseHourlyRate must be greater than 0 and at most 100000';
  }
  if (typeof i.loadCoefficient !== 'number' || !Number.isFinite(i.loadCoefficient) || i.loadCoefficient < LOAD_COEFFICIENT_MIN || i.loadCoefficient > LOAD_COEFFICIENT_MAX) {
    return `loadCoefficient must be between ${LOAD_COEFFICIENT_MIN} and ${LOAD_COEFFICIENT_MAX}`;
  }
  if (!isWorkflow(i.targetWorkflow)) {
    return `targetWorkflow must be one of: ${WORKFLOW_VALUES.join(', ')}`;
  }
  if (i.automationRateOverride != null) {
    if (typeof i.automationRateOverride !== 'number' || !Number.isFinite(i.automationRateOverride) || i.automationRateOverride < 0 || i.automationRateOverride > AUTOMATION_RATE_MAX) {
      return `automationRateOverride must be between 0 and ${AUTOMATION_RATE_MAX}`;
    }
  }
  if (typeof i.implementationCost !== 'number' || !Number.isFinite(i.implementationCost) || i.implementationCost < 0 || i.implementationCost > 100000000) {
    return 'implementationCost must be between 0 and 100000000';
  }
  if (typeof i.recurringMonthlyCost !== 'number' || !Number.isFinite(i.recurringMonthlyCost) || i.recurringMonthlyCost < 0 || i.recurringMonthlyCost > 10000000) {
    return 'recurringMonthlyCost must be between 0 and 10000000';
  }
  if (i.revenuePerFreedHour != null) {
    if (typeof i.revenuePerFreedHour !== 'number' || !Number.isFinite(i.revenuePerFreedHour) || i.revenuePerFreedHour < 0 || i.revenuePerFreedHour > 1000000) {
      return 'revenuePerFreedHour must be between 0 and 1000000';
    }
  }
  return null;
}

/* ── Core computation ──────────────────────────────────────── */

export function computeRoiAdvanced(inputs: RoiAdvancedInputs): RoiAdvancedResult {
  // 1. Loaded hourly rate — Tᶜ = baseRate × coefficient
  const loadedHourlyRate = round2(inputs.baseHourlyRate * inputs.loadCoefficient);

  // 2. Automation rate — override if given, else the workflow default
  const appliedAutomationRate = clamp(
    inputs.automationRateOverride ?? SAVINGS_RATE[inputs.targetWorkflow],
    0,
    AUTOMATION_RATE_MAX,
  );

  // 3. Time saved per person
  const timeSavedHoursPerMonth = round1(inputs.monthlyHoursPerPerson * appliedAutomationRate);
  const timeSavedHoursPerYear  = round1(timeSavedHoursPerMonth * 12);

  // 4. Time saved team-scale + FTE equivalent
  const teamTimeSavedHoursPerMonth = round1(timeSavedHoursPerMonth * inputs.teamSize);
  const teamTimeSavedHoursPerYear  = round1(timeSavedHoursPerYear * inputs.teamSize);
  const fteRecovered = round2(teamTimeSavedHoursPerYear / PRODUCTIVE_HOURS_PER_FTE);

  // 5. Money saved (at LOADED rate) — per person then team
  const monthlyCostSaved = round0(timeSavedHoursPerMonth * loadedHourlyRate);
  const yearlyCostSaved  = monthlyCostSaved * 12;
  const teamMonthlyCostSaved = round0(monthlyCostSaved * inputs.teamSize);
  const teamYearlyCostSaved  = teamMonthlyCostSaved * 12;

  // 6. Cost of Inaction — the money still lost every period by NOT acting
  const coiPerYear  = teamYearlyCostSaved;
  const coiPerMonth = teamMonthlyCostSaved;
  const coiPerDay   = round0(teamYearlyCostSaved / WORKING_DAYS_PER_YEAR);

  // 7. Investment (frais) & returns
  const firstYearInvestment = round0(inputs.implementationCost + inputs.recurringMonthlyCost * 12);
  const netGainYear1        = teamYearlyCostSaved - firstYearInvestment;
  const roiPercentYear1     = firstYearInvestment > 0
    ? round0((netGainYear1 / firstYearInvestment) * 100)
    : null;
  // Payback on the one-off fee, recovered by the monthly NET saving.
  const teamMonthlyNet = teamMonthlyCostSaved - inputs.recurringMonthlyCost;
  const paybackMonths  = teamMonthlyNet > 0
    ? round1(inputs.implementationCost / teamMonthlyNet)
    : null;

  // 8. Optional capacity → revenue
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

/* ── Stamped + traced entry point ──────────────────────────── */

export function scoreRoiAdvanced(inputs: RoiAdvancedInputs): RoiAdvancedScored {
  const result = computeRoiAdvanced(inputs);
  const wf = inputs.targetWorkflow;
  const rateRef = inputs.automationRateOverride != null
    ? ruleRef('roiAdv.automationRate.override')
    : ruleRef(`roi.savingsRate.${wf}`);
  const trace: Trace = {
    loadedHourlyRate:        [ruleRef('roiAdv.formula.loadedRate'), benchmarkRef('roiAdv.benchmark.loadCoefficient')],
    appliedAutomationRate:   [rateRef],
    timeSavedHoursPerMonth:  [rateRef, ruleRef('roiAdv.formula.timeSaved')],
    timeSavedHoursPerYear:   [ruleRef('roiAdv.formula.timeSavedYear(x12)')],
    teamTimeSavedHoursPerYear: [ruleRef('roiAdv.formula.teamScale')],
    fteRecovered:            [ruleRef('roiAdv.formula.fte'), benchmarkRef('roiAdv.benchmark.productiveHoursPerFte')],
    monthlyCostSaved:        [ruleRef('roiAdv.formula.monthlyCost(loadedRate)')],
    teamMonthlyCostSaved:    [ruleRef('roiAdv.formula.teamMonthlyCost')],
    teamYearlyCostSaved:     [ruleRef('roiAdv.formula.teamYearlyCost(x12)')],
    coiPerYear:              [ruleRef('roiAdv.formula.coi')],
    coiPerDay:               [ruleRef('roiAdv.formula.coiPerDay'), benchmarkRef('roiAdv.benchmark.workingDaysPerYear')],
    roiPercentYear1:         [ruleRef('roiAdv.formula.roiPct'), benchmarkRef('roi.benchmark.agentDefaultMonthlyUsd')],
    paybackMonths:           [ruleRef('roiAdv.formula.payback')],
    additionalRevenueYear:   [ruleRef('roiAdv.formula.capacityToRevenue')],
    recommendedAgentIds:     [ruleRef(`roi.workflowToAgents.${wf}`)],
  };
  return { ...stamp(ROI_ADVANCED_RULESET_VERSION), result, trace };
}

/** Re-export for callers that want the placeholder recurring cost as a default. */
export { AGENT_DEFAULT_MONTHLY_USD };
