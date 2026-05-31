/**
 * ROI Calculator — types, validation, scoring — Phase K2A.
 *
 * Server-side authoritative. Never trust client-submitted result fields
 * — server always recomputes via computeRoi().
 *
 * Reuses validateLead + expiresAtFromNow from diagnostic-shared (same
 * generic shape: email + optional companyName + consent + 90d retention).
 */

import {
  WORKFLOW_VALUES,
  SAVINGS_RATE,
  WORKFLOW_TO_AGENTS,
  AGENT_DEFAULT_MONTHLY_USD,
  isWorkflow,
  type Workflow,
} from '../data/roi-config';
import {
  stamp,
  ruleRef,
  benchmarkRef,
  type DeterminismStamp,
  type Trace,
} from './determinism';

export type { Workflow };

/**
 * ROI ruleset version (savings rates, agent benchmark, formula, rounding).
 * BUMP whenever any rate, benchmark, formula, or rounding rule changes.
 */
export const ROI_RULESET_VERSION = '1.0.0';

export interface RoiInputs {
  /**
   * Stored only for K2B segmentation. Does NOT affect the K2A formula —
   * computeRoi() ignores teamSize entirely. Validated and persisted.
   */
  teamSize:                       number;
  monthlyHoursOnRepetitiveWork:   number;
  averageHourlyCost:              number;     // USD/hour
  targetWorkflow:                 Workflow;
}

export interface RoiResult {
  estimatedTimeSavedHoursPerMonth: number;
  estimatedMonthlyCostSaved:       number;
  estimatedYearlyCostSaved:        number;
  estimatedPaybackMonths:          number | null;
  recommendedAgentIds:             string[];   // length 2
}

/**
 * Deterministic, stamped + traced K2A scored output (Phase 0).
 * Wraps RoiResult with engineVersion/rulesetVersion/trace. Additive metadata;
 * the numeric result fields are unchanged.
 */
export interface RoiScored extends DeterminismStamp {
  result: RoiResult;
  /** field name -> reason references (rule ids / benchmark keys). */
  trace:  Trace;
}

/* ── Rounding helpers (single source) ─────────────────────── */
const round0 = (n: number): number => Math.round(n);
const round1 = (n: number): number => Math.round(n * 10) / 10;

/* ── Validation ───────────────────────────────────────────── */

const TEAM_SIZE_MIN = 1;
const TEAM_SIZE_MAX = 10000;
const HOURS_MIN     = 0;
const HOURS_MAX     = 10000;
const COST_MIN      = 1;
const COST_MAX      = 1000;

/**
 * Validate inputs shape and ranges. Returns null on success, error string
 * otherwise. Client cannot bypass — server is the only computation source.
 */
export function validateInputs(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'inputs must be an object';
  const i = input as Record<string, unknown>;

  if (typeof i.teamSize !== 'number' || !Number.isFinite(i.teamSize) || !Number.isInteger(i.teamSize)) {
    return 'teamSize must be an integer';
  }
  if (i.teamSize < TEAM_SIZE_MIN || i.teamSize > TEAM_SIZE_MAX) {
    return `teamSize must be between ${TEAM_SIZE_MIN} and ${TEAM_SIZE_MAX}`;
  }

  if (typeof i.monthlyHoursOnRepetitiveWork !== 'number' || !Number.isFinite(i.monthlyHoursOnRepetitiveWork)) {
    return 'monthlyHoursOnRepetitiveWork must be a number';
  }
  if (i.monthlyHoursOnRepetitiveWork < HOURS_MIN || i.monthlyHoursOnRepetitiveWork > HOURS_MAX) {
    return `monthlyHoursOnRepetitiveWork must be between ${HOURS_MIN} and ${HOURS_MAX}`;
  }

  if (typeof i.averageHourlyCost !== 'number' || !Number.isFinite(i.averageHourlyCost)) {
    return 'averageHourlyCost must be a number';
  }
  if (i.averageHourlyCost < COST_MIN || i.averageHourlyCost > COST_MAX) {
    return `averageHourlyCost must be between ${COST_MIN} and ${COST_MAX} USD`;
  }

  if (!isWorkflow(i.targetWorkflow)) {
    return `targetWorkflow must be one of: ${WORKFLOW_VALUES.join(', ')}`;
  }

  return null;
}

/* ── Score ─────────────────────────────────────────────────
 *
 * Formula (per K2A spec):
 *   estimatedTimeSavedHoursPerMonth = round1(monthlyHours * SAVINGS_RATE[workflow])
 *   estimatedMonthlyCostSaved       = round0(estimatedTimeSavedHoursPerMonth * averageHourlyCost)
 *   estimatedYearlyCostSaved        = estimatedMonthlyCostSaved * 12
 *   estimatedPaybackMonths          = monthlySaved > 0
 *                                     ? round1(AGENT_DEFAULT_MONTHLY_USD / monthlySaved)
 *                                     : null
 *
 * teamSize is intentionally NOT used. K2B may add team-size weighting.
 */

export function computeRoi(inputs: RoiInputs): RoiResult {
  const rate = SAVINGS_RATE[inputs.targetWorkflow];
  const timeSaved   = round1(inputs.monthlyHoursOnRepetitiveWork * rate);
  const monthlyCost = round0(timeSaved * inputs.averageHourlyCost);
  const yearlyCost  = monthlyCost * 12;
  const payback     = monthlyCost > 0
    ? round1(AGENT_DEFAULT_MONTHLY_USD / monthlyCost)
    : null;
  const recommendedAgentIds = [...WORKFLOW_TO_AGENTS[inputs.targetWorkflow]];
  return {
    estimatedTimeSavedHoursPerMonth: timeSaved,
    estimatedMonthlyCostSaved:       monthlyCost,
    estimatedYearlyCostSaved:        yearlyCost,
    estimatedPaybackMonths:          payback,
    recommendedAgentIds,
  };
}

/**
 * Deterministic K2A scoring entry point (Phase 0).
 *
 * Pure: same inputs => identical output. No randomness, no Date, no locale.
 * Returns the numeric RoiResult + version stamp + traceability references.
 * Assumes inputs are pre-validated (call validateInputs first).
 */
export function scoreRoi(inputs: RoiInputs): RoiScored {
  const result = computeRoi(inputs);
  const trace: Trace = {
    estimatedTimeSavedHoursPerMonth: [ruleRef(`roi.savingsRate.${inputs.targetWorkflow}`), ruleRef('roi.formula.timeSaved')],
    estimatedMonthlyCostSaved:       [ruleRef('roi.formula.monthlyCost')],
    estimatedYearlyCostSaved:        [ruleRef('roi.formula.yearlyCost(x12)')],
    estimatedPaybackMonths:          [ruleRef('roi.formula.payback'), benchmarkRef('roi.benchmark.agentDefaultMonthlyUsd')],
    recommendedAgentIds:             [ruleRef(`roi.workflowToAgents.${inputs.targetWorkflow}`)],
  };
  return { ...stamp(ROI_RULESET_VERSION), result, trace };
}

/* ── ID helper (local, generic body — no diagnostic coupling) ── */

export function generateRoiId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
