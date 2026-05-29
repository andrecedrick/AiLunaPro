/**
 * buildSpeechScript — J11 Audio Explanations.
 *
 * Deterministic spoken script (array of sentences for chunked utterance) built
 * ONLY from existing AuditResult aggregates + public recommendation titles.
 * No LLM, no dynamic generation, no PII (no names / emails / orgIds).
 *
 * The mandatory §9.22 disclaimer is ALWAYS the first sentence.
 */

import type { AuditResult, MaturityLevel, RiskLevel } from '../../types/scoring';

const RISK_SPOKEN: Record<RiskLevel, string> = {
  low: 'low risk',
  medium: 'medium risk',
  high: 'high risk',
  critical: 'critical risk',
};

const MATURITY_SPOKEN: Record<MaturityLevel, string> = {
  1: 'Initial',
  2: 'Developing',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimized',
};

const DISCLAIMER_SENTENCE =
  'Before we start: this is informational guidance only. It is not legal advice and not a compliance certification.';

export function buildSpeechScript(result: AuditResult): string[] {
  const s: string[] = [];

  // 1. Mandatory disclaimer — always first.
  s.push(DISCLAIMER_SENTENCE);

  // 2. Score + risk + maturity.
  s.push(
    `Your overall AI compliance score is ${result.globalScore} out of 100, classified as ${RISK_SPOKEN[result.riskLevel]}.`,
  );
  s.push(`Your maturity level is ${result.maturityLevel}, ${MATURITY_SPOKEN[result.maturityLevel]}.`);

  // 3. Findings by severity (counts only, no detail/PII).
  // Deterministic pacing connector "Next," — improves cadence, no meaning change.
  const f = result.findingsBySeverity;
  const total = f.critical + f.high + f.medium + f.low;
  if (total === 0) {
    s.push('Next, the findings. No findings were identified. Nice work.');
  } else {
    const parts: string[] = [];
    if (f.critical) parts.push(`${f.critical} critical`);
    if (f.high) parts.push(`${f.high} high`);
    if (f.medium) parts.push(`${f.medium} medium`);
    if (f.low) parts.push(`${f.low} low`);
    s.push(`Next, the findings. We identified ${total} finding${total === 1 ? '' : 's'}: ${parts.join(', ')}.`);
  }

  // 4. Top 3 recommendations (public titles + whyItMatters; no PII).
  const top = result.recommendations.slice(0, 3);
  if (top.length > 0) {
    s.push(`Now, your top ${top.length === 1 ? 'recommendation' : `${top.length} recommendations`}.`);
    top.forEach((r, i) => {
      const why = r.whyItMatters ? ` ${r.whyItMatters}` : '';
      s.push(`${i + 1}. ${r.title}.${why}`);
    });
  }

  // 5. Close.
  s.push('Finally, open the full report and the prioritized action plan for the complete details.');

  return s;
}
