/**
 * Scoring engine — type definitions.
 * Pure data shapes, no React. Phase 4: UI-side scoring only.
 */

import type { SectionKey, AuditAnswers } from './audit';

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Effort = 'low' | 'medium' | 'high';
export type Impact = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MaturityLevel = 1 | 2 | 3 | 4 | 5;
export type Timeframe = 30 | 60 | 90;
export type SectionStatus = 'good' | 'warning' | 'critical';

/** Per-section computed score. */
export interface SectionScore {
  key: SectionKey;
  title: string;
  /** 0–100, weighted-uniform within the section. */
  score: number;
  /** Section weight in the global score (e.g. 0.15 = 15%). */
  weight: number;
  /** Visual hint derived from score thresholds. */
  status: SectionStatus;
  /** Human-readable contribution to the global score, in points. */
  contribution: number;
}

/**
 * J9: optional regulatory / framework reference attached to a finding or
 * recommendation. STATIC reference only — informational, never a legal claim.
 * Frontend renders these as small "References:" chips beneath the item body.
 *
 * `framework`:
 *   - EU_AI_ACT   → Regulation (EU) 2024/1689 — article number in `ref`.
 *   - GDPR        → Regulation (EU) 2016/679.
 *   - NIST_AI_RMF → NIST AI Risk Management Framework function/subcategory.
 *   - ISO_42001   → ISO/IEC 42001 (AI management system) clause.
 *   - OECD_AI     → OECD AI Principles (advisory).
 */
export type RegulatoryFramework =
  | 'EU_AI_ACT'
  | 'GDPR'
  | 'NIST_AI_RMF'
  | 'ISO_42001'
  | 'OECD_AI';

export interface RegulatoryRef {
  framework: RegulatoryFramework;
  /** Short label, e.g. 'Art. 10' or 'GOVERN-1.1' or 'cl. 6.1.3'. */
  ref: string;
  /** Optional one-line scope hint. */
  note?: string;
}

/** A finding is a "thing the audit caught", with severity + context. */
export interface Finding {
  id: string;
  severity: Severity;
  sectionKey: SectionKey;
  title: string;
  description: string;
  /** Question ids that triggered this finding. */
  relatedQuestions: string[];
  /** Recommendation ids that address this finding. */
  recommendationIds: string[];
  /** J9: optional regulatory/framework references (advisory, not legal advice). */
  regulatoryRefs?: RegulatoryRef[];
}

/** Recommendation category for the assistance layer. */
export type RecommendationCategory = 'automate' | 'structure' | 'process' | 'train';

/** A recommendation is an actionable step. */
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  effort: Effort;
  impact: Impact;
  /** Default time horizon in days. */
  timeframeDays: Timeframe;
  /** Section the recommendation primarily addresses. */
  relatedSection: SectionKey;
  /** Operational category: how should this be carried out? */
  category: RecommendationCategory;
  /** One-line plain-English rationale used in the assistance layer. */
  whyItMatters?: string;
  /** Tangible outcome the user should expect once it's done. */
  expectedOutcome?: string;
  /** J9: optional regulatory/framework references (advisory, not legal advice). */
  regulatoryRefs?: RegulatoryRef[];
}

/** A roadmap bucket by time horizon. */
export interface RoadmapBucket {
  days: Timeframe;
  label: string;
  description: string;
  items: Recommendation[];
}

/** Context flags affect risk classification (not raw score). */
export interface ContextFlags {
  highRiskIndustry: boolean;
  sensitiveData: boolean;
  customerFacing: boolean;
  missionCritical: boolean;
}

/** Full computed result returned by `computeAuditResult()`. */
export interface AuditResult {
  /** 0–100, rounded. */
  globalScore: number;
  riskLevel: RiskLevel;
  /** Whether contextual flags caused a risk bump. */
  riskBumped: boolean;
  maturityLevel: MaturityLevel;
  /** Self-assessed maturity from `train.maturity` (1–5) or null if unanswered. */
  maturitySelfAssessed: MaturityLevel | null;
  sectionScores: SectionScore[];
  findings: Finding[];
  recommendations: Recommendation[];
  roadmap: RoadmapBucket[];
  contextFlags: ContextFlags;
  /** Counts derived from findings, for hero stats. */
  findingsBySeverity: Record<Severity, number>;
  computedAt: string;
}

/** A per-question scoring rule produces a 0–100 score from an answer. */
export type QuestionScorer = (answer: unknown) => number;

/** A finding rule: predicate returns true if the finding applies. */
export type FindingRule = (answers: AuditAnswers, ctx: ContextFlags) => Finding | null;
