/**
 * Compliance Findings engine (cahier §26.5, §26.9, §26.10).
 *
 * PURE. Turns Phase 4 GAPS into FINDINGS: a judgement, a risk level, an evidence
 * attribution block and a recommendation. Input is a frozen snapshot plus a
 * comparison result; there is no network, no Firestore and no clock.
 *
 * WHY IT SITS ON lib/determinism.ts RATHER THAN BESIDE IT. That module already
 * defines this project's non-negotiable scoring contract — pure, no I/O, every
 * number carrying a structured reason reference, every output version-stamped.
 * §26.9 asks for exactly that, so this engine reuses `ruleRef` and `stamp`
 * instead of inventing a second, subtly different discipline.
 *
 * NO MODEL ANYWHERE IN THIS FILE. Severity, score impact and recommendation text
 * are all rule-table lookups. A model may extract a signal at collection time
 * (§26.6 rule 2); it may never decide what that signal MEANS.
 *
 * Phase 6 owns report rendering. This engine produces the findings a report
 * displays, not the report.
 */

import { ruleRef, stamp, type ReasonRef, type DeterminismStamp } from './determinism';
import type { EvidenceSnapshot } from './enrichment-snapshot';
import type { EvidenceItem, Confidence } from './enrichment-evidence';
import type { ComparisonResult, Gap, GapKind } from './observed-vs-declared';

/** Bumped whenever the rule tables below change an output. */
export const FINDINGS_RULESET_VERSION = 'cf-rules-1';

/** Matches the project-wide vocabulary in src/types/firestore.ts. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export const FINDING_RULES = {
  SHADOW_AI_CONTRACTUAL: 'CF-001',
  SHADOW_AI_DEPLOYED:    'CF-002',
  SHADOW_AI_WEAK:        'CF-003',
  DECLARATION_UNVERIFIED:'CF-004',
  REGISTRY_INCOMPLETE:   'CF-005',
} as const;

/**
 * Evidence attribution attached to every finding (§26.7).
 *
 * Carries the captured excerpt and its hash, not merely a link: a URL proves
 * nothing once the page changes, and the page changes precisely when the finding
 * is disputed. `snapshotId` closes the reproducibility triple.
 */
export interface EvidenceAttribution {
  evidenceId:       string;
  snapshotId:       string;
  sourceUrl:        string;
  sourceType:       string;
  collector:        string;
  capturedAt:       string;
  capturedEvidence: string;
  evidenceHash:     string;
  confidence:       Confidence;
}

export interface Finding {
  findingId:   string;
  ruleId:      string;
  gapKind:     GapKind;
  subject:     string;
  /**
   * Links back to the observed subject and the registry entry the gap concerns.
   * Carried so a report can render finding → observed → declared without
   * re-deriving the association by matching display strings.
   */
  subjectKey:  string;
  systemId:    string;
  riskLevel:   RiskLevel;
  title:       string;
  /** Why this finding exists, in the customer's terms (§26.11). */
  explanation: string;
  /** What to do about it. Rule-derived, never generated. */
  recommendation: string;
  /** What proves it. Empty ONLY for absence-based findings. */
  evidence:    EvidenceAttribution[];
  /** Deterministic penalty. 0 when the gap is not score-eligible (§26.9). */
  scoreImpact: number;
  /** Every number above traces to these. */
  reasons:     ReasonRef[];
}

/**
 * Risk and penalty per rule.
 *
 * A vendor named in a DPA but absent from the registry is the most serious case:
 * the organisation has a CONTRACT with an AI processor it did not record, which
 * is a documented governance failure rather than an inference. A dependency in a
 * public repo is real but weaker evidence of production use. Marketing-only
 * signal carries no penalty at all — §26.9 forbids letting copywriting move a
 * number.
 */
const RULE_TABLE: Record<string, { risk: RiskLevel; impact: number; title: string; explanation: string; recommendation: string }> = {
  [FINDING_RULES.SHADOW_AI_CONTRACTUAL]: {
    risk: 'high', impact: 15,
    title: 'AI processor under contract is missing from the AI registry',
    explanation: 'This provider is named in your published data-processing or sub-processor documentation, '
      + 'but no matching entry exists in your AI registry. A contracted AI processor that is not recorded '
      + 'cannot be risk-assessed, assigned an owner, or covered by your EU AI Act obligations.',
    recommendation: 'Add this provider to the AI registry with its purpose, owning department, data categories '
      + 'and risk classification, then confirm the contractual documentation matches the registered entry.',
  },
  [FINDING_RULES.SHADOW_AI_DEPLOYED]: {
    risk: 'high', impact: 12,
    title: 'AI system in use is missing from the AI registry',
    explanation: 'Public evidence shows this AI provider is deployed in your estate, but no matching entry '
      + 'exists in your AI registry. Undeclared systems are the definition of Shadow AI: they sit outside '
      + 'governance, oversight and incident response.',
    recommendation: 'Confirm whether this system is in use, then register it with its purpose, owner, data '
      + 'categories and risk classification — or document why the observed signal does not represent a deployment.',
  },
  // UNREACHABLE WITH THE CURRENT TABLES, AND DELIBERATELY KEPT. Phase 4 only
  // groups vendor-bearing signals (script, processor, dependency), all of which
  // are deployment signals at medium or high confidence, so no gap reaches here
  // today. It is the standing guarantee that IF a weaker signal is ever admitted
  // as vendor-bearing, it lands on a zero-impact rule instead of silently
  // scoring. Exercised directly in the unit tests, not through the pipeline.
  [FINDING_RULES.SHADOW_AI_WEAK]: {
    risk: 'low', impact: 0,
    title: 'Possible AI provider referenced publicly but not registered',
    explanation: 'This provider is referenced in your public material, but the evidence is not strong enough '
      + 'to establish deployment. It is reported for review and does not affect your compliance score.',
    recommendation: 'Review the cited source and confirm whether this reflects an actual deployment. '
      + 'If it does, add it to the AI registry; if it is marketing language only, no action is required.',
  },
  [FINDING_RULES.DECLARATION_UNVERIFIED]: {
    risk: 'low', impact: 0,
    title: 'Registered system with no public evidence',
    explanation: 'This system is recorded in your AI registry but no public evidence of it was observed. '
      + 'This is expected for internal systems and is not a deficiency — it is listed so the registry can be '
      + 'reviewed for accuracy.',
    recommendation: 'Confirm the entry is still accurate and current. Archive it if the system is no longer in use.',
  },
  // Risk and score are SEPARATE axes. This is a real governance deficiency, so it
  // is classified medium and shown prominently — but Phase 4 marks the gap
  // non-score-eligible, and a single gate is worth more than a second opinion.
  // Impact 5 here would be dead weight that reads as if it applied.
  [FINDING_RULES.REGISTRY_INCOMPLETE]: {
    risk: 'medium', impact: 0,
    title: 'AI registry entry cannot be verified',
    explanation: 'This registry entry records neither a usable system name nor a provider, so it cannot be '
      + 'checked against observed evidence. An entry that cannot be identified cannot demonstrate compliance.',
    recommendation: 'Complete the entry with the system name and the provider so it can be reconciled against '
      + 'observed evidence.',
  },
};

/**
 * Which rule a gap resolves to.
 *
 * Contractual evidence outranks deployment evidence, which outranks weak
 * evidence. The distinction matters because it is the difference between "you
 * signed a contract you did not record" and "your website mentions a tool".
 */
export function selectRule(gap: Gap, evidence: readonly EvidenceItem[]): string {
  if (gap.gapKind === 'unverified_declaration') return FINDING_RULES.DECLARATION_UNVERIFIED;
  if (gap.gapKind === 'registry_incomplete')    return FINDING_RULES.REGISTRY_INCOMPLETE;

  if (!gap.scoreEligible) return FINDING_RULES.SHADOW_AI_WEAK;
  const contractual = evidence.some(e => e.signalType === 'ai_processor_named');
  return contractual ? FINDING_RULES.SHADOW_AI_CONTRACTUAL : FINDING_RULES.SHADOW_AI_DEPLOYED;
}

/**
 * Deterministic finding id.
 *
 * Derived from the rule, the subject and the snapshot, never from a clock or a
 * random value — so re-running the engine over the same snapshot produces the
 * same ids and a report can be regenerated without its references shifting.
 */
export function makeFindingId(ruleId: string, subjectKey: string, systemId: string, snapshotId: string): string {
  const key = [ruleId, subjectKey, systemId, snapshotId].join(' ');
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `find_${ruleId.toLowerCase().replace(/-/g, '')}_${h.toString(16).padStart(8, '0')}`;
}

/** Attribution block for one evidence item. */
function attribute(e: EvidenceItem, snapshotId: string): EvidenceAttribution {
  return {
    evidenceId: e.evidenceId, snapshotId,
    sourceUrl: e.sourceUrl, sourceType: e.sourceType, collector: e.collector,
    capturedAt: e.capturedAt, capturedEvidence: e.capturedEvidence,
    evidenceHash: e.evidenceHash, confidence: e.confidence,
  };
}

/**
 * Total penalty ceiling.
 *
 * Without it, an organisation with twenty undeclared systems reaches an
 * arbitrarily large penalty and the score stops being interpretable. The cap is
 * a rule like any other and carries its own reason reference when it binds.
 */
export const MAX_TOTAL_IMPACT = 60;

export interface ComplianceAssessment {
  snapshotId:  string;
  findings:    Finding[];
  /** Sum of finding impacts, capped. Consumed by the audit score in Phase 6. */
  totalImpact: number;
  /** True when MAX_TOTAL_IMPACT bound the total. */
  impactCapped: boolean;
  counts: Record<RiskLevel, number>;
  /** engineVersion + rulesetVersion, from the project determinism contract. */
  determinism: DeterminismStamp;
  /** Reason references justifying totalImpact. */
  reasons: ReasonRef[];
}

/**
 * Build findings from a comparison result.
 *
 * The caller MUST have verified snapshot integrity before comparing; this engine
 * trusts the snapshot it is handed, because re-hashing here would only move the
 * check rather than add one.
 */
export function buildFindings(
  snapshot: EvidenceSnapshot, comparison: ComparisonResult,
): ComplianceAssessment {
  const byId = new Map(snapshot.evidence.map(e => [e.evidenceId, e]));
  const findings: Finding[] = [];

  for (const gap of comparison.gaps) {
    const evidence = gap.evidenceIds
      .map(id => byId.get(id))
      .filter((e): e is EvidenceItem => Boolean(e));

    const ruleId = selectRule(gap, evidence);
    const rule = RULE_TABLE[ruleId];

    findings.push({
      findingId: makeFindingId(ruleId, gap.subjectKey, gap.systemId, snapshot.snapshotId),
      ruleId,
      gapKind: gap.gapKind,
      subject: gap.subject,
      subjectKey: gap.subjectKey,
      systemId: gap.systemId,
      riskLevel: rule.risk,
      title: rule.title,
      explanation: rule.explanation,
      recommendation: rule.recommendation,
      evidence: evidence.map(e => attribute(e, snapshot.snapshotId)),
      // Gating is enforced twice on purpose: the gap says whether it MAY score,
      // the rule table says how much. Neither alone can let marketing copy move
      // a number.
      scoreImpact: gap.scoreEligible ? rule.impact : 0,
      reasons: [ruleRef(`enrichment.${ruleId}`), ruleRef(`enrichment.gap.${gap.ruleId}`)],
    });
  }

  // Canonical ordering: risk first so the most serious lead the report, then
  // stable tie-breaks. Deterministic output is a hard requirement.
  const RISK_ORDER: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) =>
    RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] ||
    a.ruleId.localeCompare(b.ruleId) ||
    a.subject.localeCompare(b.subject) ||
    a.findingId.localeCompare(b.findingId));

  const rawImpact = findings.reduce((n, f) => n + f.scoreImpact, 0);
  const impactCapped = rawImpact > MAX_TOTAL_IMPACT;
  const totalImpact = impactCapped ? MAX_TOTAL_IMPACT : rawImpact;

  const counts: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.riskLevel]++;

  return {
    snapshotId: snapshot.snapshotId,
    findings,
    totalImpact,
    impactCapped,
    counts,
    determinism: stamp(FINDINGS_RULESET_VERSION),
    reasons: impactCapped
      ? [ruleRef('enrichment.impact.sum'), ruleRef('enrichment.impact.cap')]
      : [ruleRef('enrichment.impact.sum')],
  };
}
