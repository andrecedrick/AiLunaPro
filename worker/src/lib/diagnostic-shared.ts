/**
 * Diagnostic Express scoring + bucket mapping — Phase K1A.
 *
 * Server-side authoritative. Never trust client-submitted score/bucket.
 *
 * Score range:
 *   - 7 weighted questions × max 3 = 21 raw
 *   - Question 'implementation_priority' has weight 0 (used only for routing
 *     hints, never for score)
 *   - Normalized to 0–100
 *
 * Bucket cutoffs (proposed for K1A — confirm before launch):
 *   - low:    0–39
 *   - medium: 40–69
 *   - high:   70–100
 *
 * Recommended agents per bucket are static (D5=A, no K3 dependency).
 */

import { DIAGNOSTIC_QUESTIONS, type DiagnosticQuestion } from '../data/diagnostic-questions';
import {
  stamp,
  ruleRef,
  benchmarkRef,
  canonicalizeAnswers,
  type DeterminismStamp,
  type Trace,
} from './determinism';

export type Bucket = 'low' | 'medium' | 'high';

/**
 * Diagnostic ruleset version (cutoffs, weights, recommendation maps).
 * BUMP this whenever any scoring rule, cutoff, weight, or recommendation map
 * changes — so historical results stay attributable to the rules that produced them.
 */
export const DIAGNOSTIC_RULESET_VERSION = '1.0.0';

export interface DiagnosticScore {
  rawScore:        number;
  maxRawScore:     number;
  normalizedScore: number; // 0–100
  bucket:          Bucket;
}

/**
 * Deterministic, stamped + traced K1A scored output.
 * The numeric fields are unchanged; engineVersion/rulesetVersion/trace are
 * additive determinism metadata (§0.4). recommendedAgentIds is rule-derived.
 */
export interface DiagnosticScored extends DeterminismStamp {
  rawScore:            number;
  maxRawScore:         number;
  normalizedScore:     number; // 0–100
  bucket:              Bucket;
  recommendedAgentIds: string[];
  /** field name -> reason references (rule ids / benchmark keys). */
  trace:               Trace;
}

const BUCKET_LOW_MAX:    number = 39;
const BUCKET_MEDIUM_MAX: number = 69;

/** Map bucket → static recommended agent slugs (max 3 per bucket). */
const RECOMMENDATIONS: Record<Bucket, string[]> = {
  low:    ['admin-agent',      'audit-agent',     'support-agent'],
  medium: ['audit-agent',      'document-agent',  'reporting-agent'],
  high:   ['compliance-agent', 'reporting-agent', 'finance-agent'],
};

/**
 * Map implementation_priority option value → agent slug to include.
 * Applied as a prepend-and-dedupe override on the bucket default list.
 */
const PRIORITY_TO_AGENT: Record<string, string> = {
  improve_sales:     'sales-agent',
  support_customers: 'support-agent',
  compliance:        'compliance-agent',
  documents:         'document-agent',
  save_time:         'admin-agent',
};

/**
 * Validate answers shape: every required (weighted or weight-0) question
 * must be answered with a value that matches one of its options.
 * Returns null on success; otherwise a short error message.
 */
export function validateAnswers(answers: Record<string, unknown>): string | null {
  if (!answers || typeof answers !== 'object') return 'answers must be an object';
  for (const q of DIAGNOSTIC_QUESTIONS) {
    const v = answers[q.id];
    if (typeof v !== 'string' || v.length === 0) {
      return `Missing answer for ${q.id}`;
    }
    const optionMatch = q.options.find(o => o.value === v);
    if (!optionMatch) {
      return `Invalid answer for ${q.id}: ${v}`;
    }
  }
  return null;
}

/** Compute score + bucket. Assumes answers are pre-validated. */
export function computeScore(answers: Record<string, string>): DiagnosticScore {
  let raw    = 0;
  let maxRaw = 0;
  for (const q of DIAGNOSTIC_QUESTIONS as readonly DiagnosticQuestion[]) {
    if (q.weight <= 0) continue;
    const v   = answers[q.id];
    const opt = q.options.find(o => o.value === v);
    if (opt) raw += opt.score * q.weight;
    const maxOption = Math.max(...q.options.map(o => o.score));
    maxRaw += maxOption * q.weight;
  }
  const normalized = maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;
  let bucket: Bucket;
  if (normalized <= BUCKET_LOW_MAX)         bucket = 'low';
  else if (normalized <= BUCKET_MEDIUM_MAX) bucket = 'medium';
  else                                       bucket = 'high';
  return {
    rawScore:        raw,
    maxRawScore:     maxRaw,
    normalizedScore: normalized,
    bucket,
  };
}

export function recommendationsForBucket(bucket: Bucket): string[] {
  return [...RECOMMENDATIONS[bucket]];
}

/**
 * Compute final recommendedAgentIds for a submission.
 *
 * Rule (per K1A spec):
 *   1. Start from the bucket default list (max 3).
 *   2. If answers.implementation_priority maps to an agent that is not
 *      already in the list, prepend it.
 *   3. Deduplicate.
 *   4. Trim to max 3.
 *
 * implementation_priority itself has weight 0 and never affects score.
 */
/**
 * Deterministic K1A scoring entry point (Phase 0).
 *
 * Pure: same canonicalized answers => identical output. No randomness, no Date,
 * no locale. Returns numeric result + version stamp + traceability references.
 * Assumes answers are pre-validated (call validateAnswers first).
 */
export function scoreDiagnostic(answers: Record<string, string>): DiagnosticScored {
  const canonical = canonicalizeAnswers(answers);
  const score = computeScore(canonical);
  const recommendedAgentIds = recommendationsFor(score.bucket, canonical);
  const usedPriorityOverride =
    recommendedAgentIds.length > 0 &&
    !recommendationsForBucket(score.bucket).slice(0, 1).includes(recommendedAgentIds[0]);

  const trace: Trace = {
    normalizedScore: [ruleRef('diagnostic.normalizedScore.weightedSum'), benchmarkRef('diagnostic.maxRawScore')],
    bucket:          [ruleRef('diagnostic.bucket.cutoffs(low<=39,medium<=69,high<=100)')],
    recommendedAgentIds: usedPriorityOverride
      ? [ruleRef(`diagnostic.recommendations.${score.bucket}`), ruleRef('diagnostic.recommendations.priorityOverride')]
      : [ruleRef(`diagnostic.recommendations.${score.bucket}`)],
  };

  return {
    ...stamp(DIAGNOSTIC_RULESET_VERSION),
    rawScore:        score.rawScore,
    maxRawScore:     score.maxRawScore,
    normalizedScore: score.normalizedScore,
    bucket:          score.bucket,
    recommendedAgentIds,
    trace,
  };
}

export function recommendationsFor(bucket: Bucket, answers: Record<string, string>): string[] {
  const base = [...RECOMMENDATIONS[bucket]];
  const priorityValue = answers.implementation_priority;
  const priorityAgent = priorityValue ? PRIORITY_TO_AGENT[priorityValue] : undefined;
  let merged: string[];
  if (priorityAgent && !base.includes(priorityAgent)) {
    merged = [priorityAgent, ...base];
  } else {
    merged = base;
  }
  // Dedup preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of merged) {
    if (!seen.has(slug)) { seen.add(slug); out.push(slug); }
    if (out.length === 3) break;
  }
  return out;
}

/* ── Lead validation ──────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMPANY_MAX = 120;

export interface LeadInput {
  email?:       unknown;
  companyName?: unknown;
  consent?:     unknown;
}

export interface ValidatedLead {
  email:       string;
  companyName: string | null;
  consent:     true;
  consentAt:   string;
}

export function validateLead(lead: LeadInput): { ok: true; lead: ValidatedLead } | { ok: false; error: string } {
  if (!lead || typeof lead !== 'object') return { ok: false, error: 'lead is required' };
  if (typeof lead.email !== 'string' || !EMAIL_RE.test(lead.email)) {
    return { ok: false, error: 'Valid email is required' };
  }
  if (lead.consent !== true) {
    return { ok: false, error: 'Consent is required' };
  }
  let companyName: string | null = null;
  if (lead.companyName !== undefined && lead.companyName !== null) {
    if (typeof lead.companyName !== 'string') {
      return { ok: false, error: 'companyName must be a string or omitted' };
    }
    const trimmed = lead.companyName.trim();
    if (trimmed.length > COMPANY_MAX) {
      return { ok: false, error: `companyName too long (max ${COMPANY_MAX} chars)` };
    }
    companyName = trimmed.length > 0 ? trimmed : null;
  }
  return {
    ok:    true,
    lead:  {
      email:       (lead.email as string).trim().toLowerCase(),
      companyName,
      consent:     true,
      consentAt:   new Date().toISOString(),
    },
  };
}

/* ── ID + expiry helpers ──────────────────────────────────── */

const RETENTION_DAYS = 90;

export function generateDiagnosticId(): string {
  // 16 bytes random → URL-safe base64 (no padding)
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function expiresAtFromNow(now = Date.now()): string {
  return new Date(now + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
