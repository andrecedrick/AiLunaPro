/**
 * Client-side Diagnostic preview scorer — A1 Change 2a (value-first).
 *
 * Mirrors the worker's authoritative `computeScore`
 * (worker/src/lib/diagnostic-shared.ts) on the SAME question data so a visitor
 * sees their normalized score + maturity bucket BEFORE the email gate. The
 * server stays authoritative on submit; this only computes a preview.
 *
 * Strict parity with the worker is locked by
 * tests/unit/diagnostic-score-parity.test.ts (asserts equality over every
 * weighted-answer combination), so the previewed number is identical to the
 * saved one.
 */

import { DIAGNOSTIC_QUESTIONS } from '../../data/diagnostic-questions';
import type { Bucket } from '../../types/diagnostic';

// Bucket cutoffs — MUST stay in lockstep with worker/src/lib/diagnostic-shared.ts.
export const BUCKET_LOW_MAX = 39;
export const BUCKET_MEDIUM_MAX = 69;

export interface DiagnosticPreview {
  score:  number; // 0–100 normalized
  bucket: Bucket;
}

/**
 * Compute the normalized score (0–100) + bucket from in-progress answers.
 * Weight-0 questions (routing-only) are excluded, exactly like the worker.
 */
export function computeDiagnosticPreview(answers: Record<string, string>): DiagnosticPreview {
  let raw = 0;
  let maxRaw = 0;
  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (q.weight <= 0) continue;
    const opt = q.options.find(o => o.value === answers[q.id]);
    if (opt) raw += opt.score * q.weight;
    maxRaw += Math.max(...q.options.map(o => o.score)) * q.weight;
  }
  const score = maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;
  const bucket: Bucket =
    score <= BUCKET_LOW_MAX ? 'low' : score <= BUCKET_MEDIUM_MAX ? 'medium' : 'high';
  return { score, bucket };
}
