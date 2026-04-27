/**
 * Assistance layer — pure derivations from an AuditResult.
 * Adds zero new state; reads only what `computeAuditResult()` already returned.
 */

import type {
  AuditResult,
  Finding,
  Recommendation,
  RecommendationCategory,
  RiskLevel,
  Severity,
} from '../../types/scoring';
import { auditSections } from '../../data/mockAuditQuestions';
import { SECTION_WEIGHTS } from './rules';

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const IMPACT_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/* ── Top priority actions ────────────────────────────────── */

/**
 * Returns the top N recommendations to act on first, ranked by:
 *   impact × Σ severity-weight of findings each rec addresses.
 * Falls back to plain impact ranking when no findings reference a rec.
 */
export function getTopActions(result: AuditResult, n = 3): Recommendation[] {
  const reverseIndex = buildFindingIndex(result.findings);
  const ranked = [...result.recommendations]
    .map(rec => {
      const linked = reverseIndex[rec.id] ?? [];
      const sevWeight = linked.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
      // Base score: impact × (1 + severity coverage). Recs that fix nothing still score by impact.
      const score = IMPACT_WEIGHT[rec.impact] * (1 + sevWeight);
      return { rec, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(x => x.rec);
  return ranked;
}

/* ── Category splits ─────────────────────────────────────── */

export function getByCategory(
  result: AuditResult,
  category: RecommendationCategory,
): Recommendation[] {
  return result.recommendations.filter(r => r.category === category);
}

/* ── Score-lift projection ───────────────────────────────── */

/**
 * Projects the global score if the given recommendations were completed.
 * Approach: for each rec, find linked findings → find affected sections →
 * restore lost section points proportional to the number of questions those
 * findings touched. Bounded at 100.
 *
 * This is a directional simulation, not a guarantee; the UI labels it as such.
 */
export function estimateScoreLift(result: AuditResult, recs: Recommendation[]): {
  projectedScore: number;
  delta: number;
} {
  const reverseIndex = buildFindingIndex(result.findings);
  // Track lift per section as a 0..1 multiplier of the section's current deficit.
  const sectionLift: Record<string, number> = {};

  for (const rec of recs) {
    const linkedFindings = reverseIndex[rec.id] ?? [];
    for (const f of linkedFindings) {
      const sectionKey = f.sectionKey;
      const section = auditSections.find(s => s.key === sectionKey);
      if (!section) continue;
      const totalQ = section.questions.length;
      if (totalQ === 0) continue;
      // Each finding touches `relatedQuestions.length` questions of the section.
      const touchedFraction = Math.min(1, f.relatedQuestions.length / totalQ);
      // Severity-weighted lift fraction of the deficit it can recover.
      const sevFactor = SEVERITY_WEIGHT[f.severity] / 4; // 0.25 .. 1
      const lift = touchedFraction * sevFactor;
      sectionLift[sectionKey] = Math.min(
        1,
        (sectionLift[sectionKey] ?? 0) + lift,
      );
    }
  }

  // Apply lifts to each section's deficit (100 - currentScore), weighted by section weight.
  let projected = 0;
  for (const s of result.sectionScores) {
    const liftFraction = sectionLift[s.key] ?? 0;
    const deficit = 100 - s.score;
    const newScore = Math.min(100, s.score + deficit * liftFraction);
    projected += newScore * (SECTION_WEIGHTS[s.key] ?? s.weight);
  }
  const projectedScore = Math.min(100, Math.round(projected));
  return { projectedScore, delta: projectedScore - result.globalScore };
}

/* ── Why-it-matters narrative ────────────────────────────── */

/**
 * Returns 2–4 short paragraphs based on context flags + risk level + weakest section.
 * Pure code, hand-curated text, no LLM.
 */
export function getWhyItMattersNarrative(result: AuditResult): string[] {
  const out: string[] = [];
  const ctx = result.contextFlags;
  const weakest = [...result.sectionScores].sort((a, b) => a.score - b.score)[0];

  // Paragraph 1: regulatory framing tied to context
  if (ctx.highRiskIndustry || ctx.sensitiveData) {
    out.push(
      'You operate in a context that regulators already treat as high-stakes. The EU AI Act, GDPR, and sector-specific rules (HIPAA-equivalents, financial-services frameworks) all apply additional duties when AI processes sensitive data or makes consequential decisions about people.',
    );
  } else if (ctx.customerFacing) {
    out.push(
      'Your AI is customer-facing, which means transparency obligations apply (EU AI Act Article 50, consumer protection rules) and the reputational stakes are higher than for internal tools.',
    );
  } else {
    out.push(
      'Even for internal AI use, recognised frameworks (ISO/IEC 42001, NIST AI RMF) increasingly act as a baseline for vendor due diligence and enterprise deals.',
    );
  }

  // Paragraph 2: risk-of-inaction tied to risk level
  if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
    out.push(
      'At your current risk band, the cost of inaction is asymmetric. A single incident — a model leaking data, an unfair decision, an outage with no runbook — is materially more expensive than the fixes recommended below.',
    );
  } else if (result.riskLevel === 'medium') {
    out.push(
      'You are in a defensible middle band. The risk now is plateauing: organisations that stop here typically slip backwards as their AI footprint grows. Closing the medium-severity gaps locks in the current posture.',
    );
  } else {
    out.push(
      'You already have meaningful posture. The risk is regression as your AI footprint scales. Ongoing investment is mostly maintenance, documentation, and gradual deepening.',
    );
  }

  // Paragraph 3: weakest section call-out
  if (weakest && weakest.score < 70) {
    out.push(
      `Your weakest area is **${weakest.title}** (${weakest.score}%). Strengthening it directly increases the global score, but more importantly it removes the path of least resistance for an incident.`,
    );
  }

  // Paragraph 4: customer / commercial framing
  if (ctx.customerFacing || ctx.missionCritical) {
    out.push(
      'Enterprise buyers and regulated customers increasingly ask for AI governance evidence in security questionnaires. Many of the items in your action plan double as commercial enablers, not just compliance work.',
    );
  }

  return out;
}

/* ── Next step prescription ──────────────────────────────── */

export interface NextStep {
  headline: string;
  rationale: string;
  primaryRecId?: string;
  ctas: { label: string; kind: 'save' | 'remind' | 'export' | 'browse' }[];
}

export function getNextStep(result: AuditResult): NextStep {
  // Critical finding present → address that specific one within 7 days
  const critical = result.findings.find(f => f.severity === 'critical');
  if (critical) {
    const recId = critical.recommendationIds[0];
    const rec = result.recommendations.find(r => r.id === recId);
    return {
      headline: 'Address the critical finding within the next 7 days',
      rationale: `"${critical.title}" is the single highest-priority gap. ${rec ? rec.expectedOutcome ?? rec.description : 'It is the most material item in your action plan.'}`,
      primaryRecId: rec?.id,
      ctas: [
        { label: '✓ Save this action plan', kind: 'save' },
        { label: '⏰ Set 7-day reminder', kind: 'remind' },
        { label: '⬇ Export plan', kind: 'export' },
      ],
    };
  }

  // High risk → tackle top quick wins
  if (result.riskLevel === 'high') {
    const quickWins = result.roadmap.find(b => b.days === 30)?.items ?? [];
    const first = quickWins[0];
    return {
      headline: 'Start with the 30-day quick wins',
      rationale: first
        ? `Begin with "${first.title}". Quick wins compound: each closed item reduces the load on the next, and most can ship without budget approval.`
        : 'High-risk posture responds quickly to a small number of targeted actions. Pick three quick wins from the roadmap and own them this month.',
      primaryRecId: first?.id,
      ctas: [
        { label: '✓ Save this action plan', kind: 'save' },
        { label: '⏰ Set 30-day reminder', kind: 'remind' },
        { label: '⬇ Export plan', kind: 'export' },
      ],
    };
  }

  // Medium risk → solidify governance foundations
  if (result.riskLevel === 'medium') {
    return {
      headline: 'Solidify your governance foundations',
      rationale:
        'You are past the initial scramble. The next compounding move is to formalise what you do informally — a written policy, a recognised framework, documented escalation. This is what makes audits and enterprise deals routine.',
      ctas: [
        { label: '✓ Save this action plan', kind: 'save' },
        { label: '⏰ Set 60-day reminder', kind: 'remind' },
        { label: '⬇ Export plan', kind: 'export' },
      ],
    };
  }

  // Low risk → maintenance posture
  return {
    headline: 'Move from compliant to optimised',
    rationale:
      'Your posture is strong. The leverage now is documentation and continuous improvement — model cards, training refreshes, and integrating AI scenarios into your incident-response rehearsals.',
    ctas: [
      { label: '✓ Save this action plan', kind: 'save' },
      { label: '⏰ Set quarterly check-in', kind: 'remind' },
      { label: '⬇ Export plan', kind: 'export' },
    ],
  };
}

/* ── Detected summary helpers ────────────────────────────── */

export interface DetectedSummary {
  riskOneLiner: string;
  topIssues: { title: string; severity: Severity }[];
  contextChips: { label: string; tone: 'info' | 'warning' | 'success' }[];
  weakestSection: { title: string; score: number } | null;
}

const RISK_ONE_LINER: Record<RiskLevel, string> = {
  low: 'You are in good shape — focus shifts to maintenance and continuous improvement.',
  medium: 'You have a defensible baseline, but with material gaps that are worth closing soon.',
  high: 'You have several gaps that materially raise your exposure. Prioritise the actions below.',
  critical: 'You have one or more critical gaps. The highest-priority items should be addressed within days, not weeks.',
};

export function getDetectedSummary(result: AuditResult): DetectedSummary {
  const ordered = [...result.findings].sort(
    (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity],
  );
  const topIssues = ordered.slice(0, 3).map(f => ({ title: f.title, severity: f.severity }));

  const ctx = result.contextFlags;
  const chips: DetectedSummary['contextChips'] = [];
  if (ctx.highRiskIndustry) chips.push({ label: 'High-risk industry', tone: 'warning' });
  if (ctx.sensitiveData) chips.push({ label: 'Sensitive data in scope', tone: 'warning' });
  if (ctx.customerFacing) chips.push({ label: 'Customer-facing AI', tone: 'info' });
  if (ctx.missionCritical) chips.push({ label: 'Mission-critical scope', tone: 'warning' });
  if (chips.length === 0) chips.push({ label: 'Standard risk profile', tone: 'success' });

  const weakest = [...result.sectionScores].sort((a, b) => a.score - b.score)[0] ?? null;

  return {
    riskOneLiner: RISK_ONE_LINER[result.riskLevel],
    topIssues,
    contextChips: chips,
    weakestSection: weakest ? { title: weakest.title, score: weakest.score } : null,
  };
}

/* ── Internals ───────────────────────────────────────────── */

function buildFindingIndex(findings: Finding[]): Record<string, Finding[]> {
  const idx: Record<string, Finding[]> = {};
  for (const f of findings) {
    for (const rid of f.recommendationIds) {
      idx[rid] = idx[rid] ?? [];
      idx[rid].push(f);
    }
  }
  return idx;
}
