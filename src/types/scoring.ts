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
}

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
