/**
 * Deterministic, educational AI-context & governance copy for the Report PDF.
 *
 * Pure function of (answers, result) — no randomness, no dates, no I/O. The tone
 * is explanatory and INFORMATIONAL ONLY: general governance considerations, never
 * a legal classification or advice, and never a certification claim.
 */
import type { AuditAnswers, AuditResult } from './audit-scoring';

export interface ReportAiSection {
  heading: string;
  body: string;
  bullets: string[];
}

const INDUSTRY_LABEL: Record<string, string> = {
  health: 'healthcare', finance: 'finance', public: 'public sector',
  retail: 'retail', tech: 'technology', education: 'education',
};

function str(a: AuditAnswers, k: string): string { const v = a[k]; return typeof v === 'string' ? v : ''; }
function arr(a: AuditAnswers, k: string): string[] {
  const v = a[k];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function buildReportAiSections(answers: AuditAnswers, result: AuditResult): ReportAiSection[] {
  const ctx = result.contextFlags;
  const industry = str(answers, 'profile.industry');
  const industryLabel = INDUSTRY_LABEL[industry] || 'your sector';
  const scope = str(answers, 'tools.scope');
  const dataTypes = arr(answers, 'data.types');
  const sections: ReportAiSection[] = [];

  // 1 — AI usage context (descriptive; does not affect score)
  const ctxBullets: string[] = [`Reported sector: ${industryLabel}.`];
  if (scope) {
    const scopeLabel = scope === 'critical' ? 'a mission-critical' : scope === 'customer' ? 'a customer-facing' : `a ${scope}`;
    ctxBullets.push(`AI tools reportedly operate in ${scopeLabel} scope.`);
  }
  if (dataTypes.length) ctxBullets.push(`Data types in scope: ${dataTypes.join(', ')}.`);
  ctxBullets.push(`Overall readiness scored ${result.globalScore}/100 (maturity level ${result.maturityLevel} of 5).`);
  sections.push({
    heading: 'AI usage context',
    body: 'This section summarizes, for context only, how AI is reportedly used in your organization. It is descriptive and does not change your score.',
    bullets: ctxBullets,
  });

  // 2 — AI risk & governance considerations (derived from context flags)
  const govBullets: string[] = [];
  if (ctx.highRiskIndustry) govBullets.push('Operating in a higher-risk sector usually raises expectations around transparency, documentation, and human oversight.');
  if (ctx.sensitiveData) govBullets.push('Handling sensitive data points to data-protection basics (minimization, retention limits, access control) as a priority area.');
  if (ctx.customerFacing) govBullets.push('Customer-facing AI typically warrants clear user information and a route for people to question or seek review of automated outcomes.');
  if (ctx.missionCritical) govBullets.push('Mission-critical use suggests stronger testing, monitoring, and fallback procedures before and after deployment.');
  if (govBullets.length === 0) govBullets.push('No elevated-context flags were detected from your answers. Maintaining basic governance hygiene remains good practice.');
  sections.push({
    heading: 'AI risk & governance considerations',
    body: 'Educational guidance derived from your answers. These are general governance considerations, not a legal classification of your systems.',
    bullets: govBullets,
  });

  // 3 — Human oversight & accountability (static educational)
  sections.push({
    heading: 'Human oversight & accountability',
    body: 'Keeping a human meaningfully in the loop helps catch errors and unintended outcomes.',
    bullets: [
      'Define who is accountable for each AI-supported decision.',
      'Document where a person reviews, approves, or can override AI output.',
      'Keep an inventory of the AI tools in use and review it periodically.',
    ],
  });

  // 4 — Transparency & documentation (static educational)
  sections.push({
    heading: 'Transparency & documentation',
    body: 'Lightweight, consistent documentation makes future audits and improvements far easier.',
    bullets: [
      "Record each tool's purpose, the data it uses, and its known limitations.",
      'Tell users when they are interacting with, or affected by, AI where relevant.',
      'Track changes to models, prompts, or vendors over time.',
    ],
  });

  return sections;
}
