/**
 * Worker-side access to the main-audit scoring engine.
 *
 * To guarantee ZERO drift with the SPA (objective: same answers → same score on
 * screen and in the PDF), this RE-EXPORTS the exact same pure modules the SPA
 * uses — it does not copy them. The scoring subtree
 * (computeAuditResult + rules/findings/recommendations + question data + types)
 * is pure TypeScript with no DOM/React/Firebase imports, so it is safe to bundle
 * into the Worker runtime.
 *
 * If this cross-root import ever needs to be severed, port the six files into
 * worker/src/lib and add a parity test — but prefer the single source of truth.
 */
export { computeAuditResult } from '../../../src/lib/scoring/computeAuditResult';
export type {
  AuditResult,
  RiskLevel,
  MaturityLevel,
  Severity,
  Finding,
  Recommendation,
  RoadmapBucket,
  SectionScore,
  ContextFlags,
} from '../../../src/types/scoring';
export type { AuditAnswers } from '../../../src/types/audit';
export type { Report } from '../../../src/types/report';
