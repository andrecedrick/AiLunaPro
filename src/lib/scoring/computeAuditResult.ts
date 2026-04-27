/**
 * Orchestrator: AuditAnswers → AuditResult.
 * Pure function, no I/O. Phase 4: UI-side mock scoring only.
 */

import type { AuditAnswers, SectionKey } from '../../types/audit';
import { auditSections } from '../../data/mockAuditQuestions';
import type {
  AuditResult,
  ContextFlags,
  MaturityLevel,
  RiskLevel,
  RoadmapBucket,
  Recommendation,
  SectionScore,
  SectionStatus,
  Severity,
  Timeframe,
} from '../../types/scoring';
import { SECTION_WEIGHTS, scoreSection } from './rules';
import { generateFindings } from './findings';
import { getRecommendations, RECOMMENDATIONS } from './recommendations';

/* ── Context flags ────────────────────────────────────────── */

const HIGH_RISK_INDUSTRIES = new Set(['health', 'finance', 'public']);
const SENSITIVE_DATA_TYPES = new Set(['pii', 'health', 'biometric', 'children']);

function deriveContext(answers: AuditAnswers): ContextFlags {
  const industry = answers['profile.industry'];
  const types = answers['data.types'];
  const scope = answers['tools.scope'];

  return {
    highRiskIndustry:
      typeof industry === 'string' && HIGH_RISK_INDUSTRIES.has(industry),
    sensitiveData:
      Array.isArray(types) && types.some(t => SENSITIVE_DATA_TYPES.has(t)),
    customerFacing:
      typeof scope === 'string' && (scope === 'customer' || scope === 'critical'),
    missionCritical: typeof scope === 'string' && scope === 'critical',
  };
}

/* ── Risk classification ─────────────────────────────────── */

const RISK_ORDER: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

function baseRiskFromScore(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'high';
  return 'critical';
}

function applyRiskBump(base: RiskLevel, ctx: ContextFlags, score: number): {
  level: RiskLevel;
  bumped: boolean;
} {
  const flagCount =
    (ctx.highRiskIndustry ? 1 : 0) +
    (ctx.sensitiveData ? 1 : 0) +
    (ctx.customerFacing ? 1 : 0) +
    (ctx.missionCritical ? 1 : 0);

  // Two or more risk flags AND we're not already at the bottom of a band → bump up
  // Bottom-of-band = within 5 points of the upper threshold.
  const inUpperBand =
    (base === 'low' && score < 85) ||
    (base === 'medium' && score < 65) ||
    (base === 'high' && score < 45) ||
    base === 'critical';

  if (flagCount >= 2 && inUpperBand && base !== 'critical') {
    const idx = RISK_ORDER.indexOf(base);
    return { level: RISK_ORDER[idx + 1], bumped: true };
  }
  return { level: base, bumped: false };
}

/* ── Maturity ────────────────────────────────────────────── */

function maturityFromScore(score: number): MaturityLevel {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

function readSelfMaturity(answers: AuditAnswers): MaturityLevel | null {
  const v = answers['train.maturity'];
  if (typeof v !== 'string') return null;
  const n = parseInt(v, 10);
  if (n >= 1 && n <= 5) return n as MaturityLevel;
  return null;
}

/* ── Section status ──────────────────────────────────────── */

function sectionStatus(score: number): SectionStatus {
  if (score >= 70) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
}

/* ── Roadmap bucketing ───────────────────────────────────── */

const IMPACT_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function buildRoadmap(recs: Recommendation[]): RoadmapBucket[] {
  const buckets: { days: Timeframe; label: string; description: string }[] = [
    { days: 30, label: '30 days', description: 'Quick wins — high-leverage changes you can ship this month.' },
    { days: 60, label: '60 days', description: 'Mid-term — capability building and cross-team alignment.' },
    { days: 90, label: '90 days', description: 'Strategic — frameworks, tooling and structural change.' },
  ];

  return buckets.map(b => {
    const items = recs
      .filter(r => r.timeframeDays === b.days)
      .sort((a, b2) => IMPACT_ORDER[b2.impact] - IMPACT_ORDER[a.impact])
      .slice(0, 5);
    return { ...b, items };
  });
}

/* ── Public entry point ──────────────────────────────────── */

export function computeAuditResult(answers: AuditAnswers): AuditResult {
  const ctx = deriveContext(answers);

  /* Section scores */
  const sectionScores: SectionScore[] = auditSections.map(section => {
    const qids = section.questions.map(q => q.id);
    const score = scoreSection(qids, answers);
    const weight = SECTION_WEIGHTS[section.key as SectionKey] ?? 0;
    return {
      key: section.key,
      title: section.title,
      score,
      weight,
      status: sectionStatus(score),
      contribution: Math.round(score * weight),
    };
  });

  /* Global score = weighted average */
  const globalScore = Math.round(
    sectionScores.reduce((sum, s) => sum + s.score * s.weight, 0),
  );

  /* Risk classification with contextual bump */
  const baseRisk = baseRiskFromScore(globalScore);
  const { level: riskLevel, bumped: riskBumped } = applyRiskBump(baseRisk, ctx, globalScore);

  /* Maturity */
  const maturityLevel = maturityFromScore(globalScore);
  const maturitySelfAssessed = readSelfMaturity(answers);

  /* Findings */
  const findings = generateFindings(answers, ctx);

  /* Findings count by severity */
  const findingsBySeverity: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const f of findings) findingsBySeverity[f.severity]++;

  /* Recommendations: union of all recommendation ids referenced by findings,
     fall back to a baseline set if no findings (perfect audit). */
  const recIds = new Set<string>();
  for (const f of findings) {
    for (const id of f.recommendationIds) recIds.add(id);
  }
  let recommendations = getRecommendations([...recIds]);
  if (recommendations.length === 0) {
    // No findings — surface a small "next-level" list to demonstrate roadmap.
    recommendations = RECOMMENDATIONS.filter(r => r.impact === 'medium').slice(0, 3);
  }

  /* Roadmap */
  const roadmap = buildRoadmap(recommendations);

  return {
    globalScore,
    riskLevel,
    riskBumped,
    maturityLevel,
    maturitySelfAssessed,
    sectionScores,
    findings,
    recommendations,
    roadmap,
    contextFlags: ctx,
    findingsBySeverity,
    computedAt: new Date().toISOString(),
  };
}
