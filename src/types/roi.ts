/**
 * Frontend ROI Calculator types — Phase K2A.
 * Mirror of worker/src/lib/roi-shared.ts.
 */

import type { Workflow } from '../data/roi-config';
import type { Trace } from './diagnostic';

export interface RoiInputs {
  teamSize:                       number;
  monthlyHoursOnRepetitiveWork:   number;
  averageHourlyCost:              number;
  targetWorkflow:                 Workflow;
}

export interface RoiResult {
  estimatedTimeSavedHoursPerMonth: number;
  estimatedMonthlyCostSaved:       number;
  estimatedYearlyCostSaved:        number;
  estimatedPaybackMonths:          number | null;
  recommendedAgentIds:             string[];
}

export interface RoiResponse {
  id:     string;
  result: RoiResult;
  // Phase 0 determinism metadata (additive; present from engine v1).
  engineVersion?:  string;
  rulesetVersion?: string;
  trace?:          Trace;
}
