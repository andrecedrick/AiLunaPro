/**
 * Audit Express — deterministic, no-PII preview compute (Phase 3, §3bis).
 *
 * PURE compute only. No I/O, no persistence, no PII, no randomness, no Date,
 * no locale. Reuses the Phase 0 determinism-backed engines (scoreDiagnostic,
 * scoreRoi) verbatim so the preview shares a SINGLE source of determinism.
 *
 * The public preview collects a small set of TAP answers (controlled enums) —
 * never email/name/phone/company. This module maps those taps onto the full
 * engine inputs using documented, deterministic preview defaults, then returns
 * stamped + traced K1A-lite and K2A-lite outputs.
 *
 * This module imports NO storage/auth/network code. The route that wraps it is
 * compute-only and persists nothing.
 */

import {
  scoreDiagnostic,
  DIAGNOSTIC_RULESET_VERSION,
  type Bucket,
} from './diagnostic-shared';
import {
  scoreRoi,
  ROI_RULESET_VERSION,
  type RoiResult,
} from './roi-shared';
import { WORKFLOW_VALUES, type Workflow } from '../data/roi-config';
import { ENGINE_VERSION, type Trace } from './determinism';

/** Fixed disclaimer rendered with every preview. Negative framing only. */
export const PREVIEW_DISCLAIMER =
  'Preparation support — not a certification, attestation, or legal advice.';

/* ── Tap answer enums (controlled; no free text → no accidental PII) ── */

export const HOURS_BUCKETS = ['low', 'medium', 'high'] as const;
export const COST_BUCKETS = ['low', 'medium', 'high'] as const;
export const AI_USAGE_VALUES = ['none', 'individual', 'team', 'structured'] as const;
export const SHADOW_AI_VALUES = ['no_visibility', 'partial_visibility', 'mostly_visible', 'full_inventory'] as const;

export type HoursBucket = typeof HOURS_BUCKETS[number];
export type CostBucket = typeof COST_BUCKETS[number];
export type AiUsage = typeof AI_USAGE_VALUES[number];
export type ShadowAi = typeof SHADOW_AI_VALUES[number];

export interface PreviewTaps {
  workflow:        Workflow;
  monthlyHours:    HoursBucket;
  hourlyCost:      CostBucket;
  aiUsage:         AiUsage;
  shadowAi:        ShadowAi;
}

/* ── Deterministic bucket → numeric mappings (fixed midpoints) ── */
const HOURS_MAP: Record<HoursBucket, number> = { low: 20, medium: 80, high: 160 };
const COST_MAP: Record<CostBucket, number> = { low: 25, medium: 45, high: 75 };

/**
 * Preview neutral baseline for diagnostic questions NOT asked in the short tap
 * flow. Each is the score-1 ("basic"/"partial") option of its question — a
 * fixed, documented baseline so the preview is not biased to the lowest score.
 * implementation_priority has weight 0 (never affects the score); fixed default.
 * If the canonical question set changes these option values, scoreDiagnostic's
 * own validation will reject and the determinism tests will fail (intended).
 */
const DIAGNOSTIC_PREVIEW_DEFAULTS: Record<string, string> = {
  process_automation:      'basic',
  data_readiness:          'partial',
  compliance_awareness:    'basic',
  business_impact:         'qualitative',
  team_skills:             'basic',
  implementation_priority: 'save_time',
};

/* ── Output shape (no PII fields) ── */

export interface K1aLite {
  rulesetVersion:      string;
  normalizedScore:     number; // 0-100, indicative
  bucket:              Bucket;  // low | medium | high (indicative readiness)
  recommendedAgentIds: string[];
  /** True: derived from a short preview (a subset of factors), not the full diagnostic. */
  partial:             boolean;
  trace:               Trace;
}

export interface K2aLite {
  rulesetVersion: string;
  result:         RoiResult;
  trace:          Trace;
}

export interface AuditExpressPreview {
  engineVersion: string;
  disclaimer:    string;
  k1a:           K1aLite;
  k2a:           K2aLite;
}

/** Type guard / validation for incoming taps. Returns an error string or null. */
export function validateTaps(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'taps must be an object';
  const t = input as Record<string, unknown>;
  if (!(WORKFLOW_VALUES as readonly string[]).includes(t.workflow as string)) {
    return `workflow must be one of: ${WORKFLOW_VALUES.join(', ')}`;
  }
  if (!(HOURS_BUCKETS as readonly string[]).includes(t.monthlyHours as string)) {
    return `monthlyHours must be one of: ${HOURS_BUCKETS.join(', ')}`;
  }
  if (!(COST_BUCKETS as readonly string[]).includes(t.hourlyCost as string)) {
    return `hourlyCost must be one of: ${COST_BUCKETS.join(', ')}`;
  }
  if (!(AI_USAGE_VALUES as readonly string[]).includes(t.aiUsage as string)) {
    return `aiUsage must be one of: ${AI_USAGE_VALUES.join(', ')}`;
  }
  if (!(SHADOW_AI_VALUES as readonly string[]).includes(t.shadowAi as string)) {
    return `shadowAi must be one of: ${SHADOW_AI_VALUES.join(', ')}`;
  }
  return null;
}

/**
 * Compute the deterministic preview. PURE: same taps => identical payload.
 * Assumes taps are pre-validated (call validateTaps first).
 */
export function computePreview(taps: PreviewTaps): AuditExpressPreview {
  // K2A-lite — ROI via the Phase 0 engine. teamSize is ignored by the formula.
  const roi = scoreRoi({
    teamSize:                     1,
    monthlyHoursOnRepetitiveWork: HOURS_MAP[taps.monthlyHours],
    averageHourlyCost:            COST_MAP[taps.hourlyCost],
    targetWorkflow:               taps.workflow,
  });

  // K1A-lite — diagnostic via the Phase 0 engine. Two tap answers are real;
  // the remaining questions use the documented preview baseline above.
  const answers: Record<string, string> = {
    ai_usage:  taps.aiUsage,
    shadow_ai: taps.shadowAi,
    ...DIAGNOSTIC_PREVIEW_DEFAULTS,
  };
  const diag = scoreDiagnostic(answers);

  return {
    engineVersion: ENGINE_VERSION,
    disclaimer:    PREVIEW_DISCLAIMER,
    k1a: {
      rulesetVersion:      DIAGNOSTIC_RULESET_VERSION,
      normalizedScore:     diag.normalizedScore,
      bucket:              diag.bucket,
      recommendedAgentIds: diag.recommendedAgentIds,
      partial:             true,
      trace:               diag.trace,
    },
    k2a: {
      rulesetVersion: ROI_RULESET_VERSION,
      result:         roi.result,
      trace:          roi.trace,
    },
  };
}
