/**
 * Diagnostic Express types — Phase K1A.
 * Phase 0 adds determinism metadata (engineVersion/rulesetVersion/trace).
 */

export type Bucket = 'low' | 'medium' | 'high';

/** A reason reference attached to a produced value (mirror of worker determinism). */
export interface ReasonRef {
  kind: 'rule' | 'benchmark';
  ref:  string;
}

/** Field name -> reason references justifying it. */
export type Trace = Record<string, ReasonRef[]>;

export interface DiagnosticResult {
  id:                  string;
  score:               number;       // 0–100
  bucket:              Bucket;
  recommendedAgentIds: string[];     // 3 agent slugs
  // Phase 0 determinism metadata (additive; present from engine v1).
  engineVersion?:      string;
  rulesetVersion?:     string;
  trace?:              Trace;
}
