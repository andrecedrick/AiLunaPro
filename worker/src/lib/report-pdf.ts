/**
 * Deterministic premium Report PDF (main New-Audit flow).
 *
 * Pure: same { title, createdAt, result, answers } → byte-identical output.
 * Uses the audit's recomputed AuditResult (the engine's `computedAt` is NEVER
 * rendered, so a freshly recomputed result still yields identical bytes).
 *
 * Tone is informational and pedagogical — no certification, audit-opinion, or
 * legal claims. Built on the hand-rolled deterministic PDF primitives (no deps).
 */
import { PdfBuilder } from './pdf/pdf-doc';
import { drawReadinessBar, drawKpiTiles, drawBarChart } from './pdf/pdf-charts';
import type { AuditAnswers, AuditResult } from './audit-scoring';
import { buildReportAiSections } from './report-ai-sections';

export const REPORT_PDF_ENGINE = 'report-pdf-1.0.0';
export const REPORT_DISCLAIMER =
  'Preparation support for your AI governance work — informational only. Not a certification, audit opinion, or legal advice.';

export interface ReportPdfInput {
  title: string;
  createdAt: string;   // ISO; deterministic stamp (the report's createdAt)
  result: AuditResult; // from computeAuditResult(answersSnapshot)
  answers: AuditAnswers;
}

const RISK_LABEL: Record<string, string> = {
  low: 'Low risk', medium: 'Medium risk', high: 'High risk', critical: 'Critical risk',
};
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export function buildReportPdf(input: ReportPdfInput): Uint8Array {
  const { title, createdAt, result, answers } = input;
  const doc = new PdfBuilder();

  /* ── Cover ── */
  doc.coverHeader(title, `AI Compliance Report - Generated ${createdAt}`);
  drawReadinessBar(doc, result.globalScore, RISK_LABEL[result.riskLevel] ?? result.riskLevel);
  doc.spacer(6);
  drawKpiTiles(doc, [
    { value: String(result.findingsBySeverity.critical), label: 'Critical' },
    { value: String(result.findingsBySeverity.high), label: 'High' },
    { value: String(result.findingsBySeverity.medium), label: 'Medium' },
    { value: String(result.recommendations.length), label: 'Actions' },
  ]);
  doc.spacer(8);
  doc.callout(REPORT_DISCLAIMER, 'amber');

  /* ── Executive summary ── */
  doc.h2('Executive summary');
  doc.para(
    `This report is a point-in-time snapshot of your AI compliance posture. ` +
    `Overall score ${result.globalScore}/100 (${RISK_LABEL[result.riskLevel] ?? result.riskLevel}), ` +
    `maturity level ${result.maturityLevel} of 5. ` +
    `${result.findings.length} finding(s) were identified across ${result.recommendations.length} recommended action(s).`,
  );
  if (result.maturitySelfAssessed) {
    doc.muted(`Self-assessed maturity: level ${result.maturitySelfAssessed} of 5.`);
  }

  /* ── Section scores ── */
  if (result.sectionScores.length) {
    doc.h2('Section scores');
    drawBarChart(doc, result.sectionScores.map(s => ({
      label: trunc(s.title, 22), value: s.score, display: `${s.score}`,
    })));
  }

  /* ── Risk overview & findings ── */
  doc.h2('Risk overview & findings');
  if (result.findings.length === 0) {
    doc.muted('No findings were identified from the provided answers.');
  } else {
    const sorted = [...result.findings].sort(
      (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
    );
    for (const f of sorted) {
      doc.bullet(`[${f.severity.toUpperCase()}] ${f.title}`);
      if (f.description) doc.muted(f.description);
    }
  }

  /* ── Action plan / roadmap ── */
  doc.h2('Action plan & roadmap');
  const hasRoadmap = result.roadmap.some(b => b.items.length > 0);
  if (!hasRoadmap) {
    doc.muted('No prioritized actions were generated for this snapshot.');
  } else {
    for (const bucket of result.roadmap) {
      if (!bucket.items.length) continue;
      doc.para(`${bucket.label} - ${bucket.description}`);
      for (const it of bucket.items) {
        doc.bullet(`${it.title} (${it.impact} impact / ${it.effort} effort)`);
      }
    }
  }

  /* ── AI usage & governance (enriched, educational) ── */
  for (const sec of buildReportAiSections(answers, result)) {
    doc.h2(sec.heading);
    if (sec.body) doc.para(sec.body);
    for (const b of sec.bullets) doc.bullet(b);
  }
  doc.callout(
    'Framework references (EU AI Act, GDPR, ISO/IEC 42001, NIST AI RMF) are indicative and informational — not a legal classification or advice.',
    'tint',
  );

  return doc.serialize({ createdAt, footerVersion: `${REPORT_PDF_ENGINE} - ${createdAt}` });
}
