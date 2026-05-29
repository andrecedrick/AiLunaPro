/**
 * buildActionPlan — pure derivation over AuditResult into three priority
 * buckets (Critical / Important / Improvement). Deterministic, no I/O, no
 * scoring change, no persistence.
 *
 * Rules (locked):
 *   - critical:    referenced by a severity:'critical' finding OR impact:'critical'
 *   - important:   severity:'high' related OR impact:'high' (not already critical)
 *   - improvement: remainder
 * Within each bucket: sort by impact desc, then effort asc.
 * No truncation here — UI applies the display cap (8 + "+N more").
 */

import type { ActionPlan, AuditResult, Effort, Impact, Recommendation } from '../../types/scoring';

const IMPACT_ORDER: Record<Impact, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const EFFORT_ORDER: Record<Effort, number> = { low: 1, medium: 2, high: 3 };

function sortRecs(recs: Recommendation[]): Recommendation[] {
  return [...recs].sort((a, b) => {
    const di = IMPACT_ORDER[b.impact] - IMPACT_ORDER[a.impact];
    if (di !== 0) return di;
    return EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort];
  });
}

export function buildActionPlan(result: AuditResult): ActionPlan {
  // Index recommendations by id for O(1) lookup.
  const byId = new Map<string, Recommendation>();
  for (const r of result.recommendations) byId.set(r.id, r);

  // Recs referenced by findings of a given severity.
  const refsBySeverity = (sev: 'critical' | 'high'): Set<string> => {
    const ids = new Set<string>();
    for (const f of result.findings) {
      if (f.severity !== sev) continue;
      for (const id of f.recommendationIds) ids.add(id);
    }
    return ids;
  };

  const criticalRefs = refsBySeverity('critical');
  const highRefs     = refsBySeverity('high');

  const critical:    Recommendation[] = [];
  const important:   Recommendation[] = [];
  const improvement: Recommendation[] = [];
  const seen = new Set<string>();

  for (const r of result.recommendations) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);

    if (criticalRefs.has(r.id) || r.impact === 'critical') {
      critical.push(r);
    } else if (highRefs.has(r.id) || r.impact === 'high') {
      important.push(r);
    } else {
      improvement.push(r);
    }
  }

  return {
    critical:    sortRecs(critical),
    important:   sortRecs(important),
    improvement: sortRecs(improvement),
  };
}
