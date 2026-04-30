/**
 * Score & risk formatters — Phase D4.
 * Replaces the local RISK_LABEL map duplicated across several components.
 *
 * The canonical `RiskLevel` lives in `@/types/scoring` (4 levels). The
 * Phase C scoring scaffold also emits a 5th label ('minimal') — we accept
 * it loosely so legacy callers keep working.
 */

import type { RiskLevel } from '@/types/scoring';

/** Display label for each canonical risk level + the legacy 'minimal' value. */
const RISK_LABEL: Record<string, string> = {
  critical: 'Critical risk',
  high:     'High risk',
  medium:   'Medium risk',
  low:      'Low risk',
  minimal:  'Minimal risk',
};

/** "78 / 100" — never returns "NaN / 100". */
export function formatScore(score: number, max = 100): string {
  if (!Number.isFinite(score)) return `0 / ${max}`;
  const clamped = Math.max(0, Math.min(max, Math.round(score)));
  return `${clamped} / ${max}`;
}

/** "High risk" — falls back to a sensible default for unexpected values. */
export function formatRiskLevel(level: RiskLevel | string): string {
  return RISK_LABEL[level] ?? 'Unknown risk';
}

export type { RiskLevel };
