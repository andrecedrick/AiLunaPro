/**
 * Determinism Foundation — Phase 0 (cahier v2.4 §0.4 / §3quater / §7quater).
 *
 * Single deterministic scoring contract shared by K1A (Diagnostic) and K2A (ROI).
 *
 * Principles (NON-NEGOTIABLE):
 *   - Scoring is rule-based and PURE: same normalized input => identical output.
 *   - No randomness, no Date/time, no locale, no I/O inside scoring.
 *   - Every produced number/risk/range carries a structured reason reference
 *     (a rule id and/or a benchmark key) — never a free-form unsourced number.
 *   - Every scored output is stamped with engineVersion + rulesetVersion so a
 *     result is reproducible and historically stable when rules later change.
 *
 * This module contains ONLY pure helpers and constants. It must never import
 * persistence, network, auth, billing, or analytics code.
 */

/**
 * Engine version — the determinism framework itself (envelope shape, stamping,
 * traceability contract). Bump ONLY when the contract shape changes.
 */
export const ENGINE_VERSION = '1.0.0';

/** A reason reference attached to a produced value. */
export type ReasonRefKind = 'rule' | 'benchmark';

export interface ReasonRef {
  /** 'rule' = a scoring rule id; 'benchmark' = a reference constant/key. */
  kind: ReasonRefKind;
  /** Stable identifier, e.g. 'roi.savingsRate.invoicing' or 'roi.benchmark.agentDefaultMonthlyUsd'. */
  ref: string;
}

/** Version stamp applied to every scored output. */
export interface DeterminismStamp {
  /** Determinism framework version (this module). */
  engineVersion: string;
  /** Module-specific ruleset version (diagnostic ruleset, roi ruleset, ...). */
  rulesetVersion: string;
}

/**
 * Traceability map: field name -> the reason references that justify it.
 * Additive metadata; it never alters the numeric result fields themselves.
 */
export type Trace = Record<string, ReasonRef[]>;

/** Convenience constructors (pure). */
export const ruleRef = (ref: string): ReasonRef => ({ kind: 'rule', ref });
export const benchmarkRef = (ref: string): ReasonRef => ({ kind: 'benchmark', ref });

/**
 * Build a determinism stamp. Pure; no side effects.
 * engineVersion is fixed by this module; rulesetVersion is module-supplied.
 */
export function stamp(rulesetVersion: string): DeterminismStamp {
  return { engineVersion: ENGINE_VERSION, rulesetVersion };
}

/**
 * Canonicalize a plain string-keyed answers object into a NEW object with keys
 * sorted in a stable (ascending) order. This defines part of "same input":
 * two answer sets that differ only by key insertion order are the same input.
 * Pure — returns a new object, does not mutate the argument.
 */
export function canonicalizeAnswers(answers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(answers).sort()) {
    out[key] = answers[key];
  }
  return out;
}

/**
 * Stable, deterministic stringify with sorted object keys at every depth.
 * Used by tests (and any caller) to derive a stable replay key from an input
 * or output. Contains no timestamps and no randomness.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(src).sort()) {
      out[key] = sortDeep(src[key]);
    }
    return out;
  }
  return value;
}
