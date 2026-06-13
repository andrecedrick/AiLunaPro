/**
 * Audit Express PDF report builder (J15 P1 + visual upgrade). PURE + DETERMINISTIC:
 * identical { preview, extractSnapshot?, understanding?, createdAt } always
 * produces byte-identical PDF output (see pdf-doc.ts for the byte-level guards).
 *
 * Visuals are vector-only (rectangles/lines/text) and placed by fixed functions
 * of the inputs — no images, no randomness, no time — so determinism holds.
 *
 * Traceability: every scored figure carries [n] markers that link to a
 * stable-ordered "Sources & reasons" appendix; each appendix entry shows a plain
 * human label plus the raw rule/benchmark id in monospace.
 *
 * Privacy: renders only non-PII fields. Extract identity free-text is NOT shown.
 */

import { PdfBuilder } from './pdf/pdf-doc';
import { drawReadinessBar, drawKpiTiles, drawBarChart, drawOpportunityMatrix, drawSchematic } from './pdf/pdf-charts';
import { coverPage, conceptBox } from './pdf/pdf-whitepaper';
import type { Trace } from './determinism';
import type { AuditExpressPreview } from './audit-express-preview';
import type { ExtractSnapshot } from './audit-express-extract';
import type { Understanding } from './audit-express-understanding';

export const PDF_DISCLAIMER =
  'Preparation support, NOT a certification, attestation, or legal advice.';

export interface AuditPdfInput {
  createdAt:        string;
  preview:          AuditExpressPreview;
  extractSnapshot?: ExtractSnapshot;
  understanding?:   Understanding;
  /** Optional metadata title (deterministic header input; does not change scores). */
  title?:           string;
}

/** Unique, stable-ordered ref ids from a Trace. id = `${kind}:${ref}`. */
function traceRefIds(trace: Trace | undefined): string[] {
  const ids: string[] = [];
  if (!trace) return ids;
  for (const key of Object.keys(trace)) {
    for (const r of trace[key]) {
      const id = `${r.kind}:${r.ref}`;
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

const ruleId = (ruleRef: string): string => `rule:${ruleRef}`;

function moneyUsd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/* ── Human-friendly labels for rule/benchmark ids (prefix match + fallback) ── */
const SOURCE_LABELS: Array<[string, string]> = [
  ['diagnostic.normalizedScore', 'Readiness score — weighted sum of answers'],
  ['diagnostic.maxRawScore', 'Maximum possible raw score'],
  ['diagnostic.bucket.cutoffs', 'Readiness band cutoffs (low / medium / high)'],
  ['diagnostic.recommendations', 'Recommended starting agents for this readiness band'],
  ['roi.savingsRate', 'Assumed savings rate for the chosen workflow'],
  ['roi.formula.timeSaved', 'Time-saved estimate formula'],
  ['roi.formula.monthlyCost', 'Monthly cost-saved formula'],
  ['roi.formula.yearlyCost', 'Yearly cost-saved (monthly x 12)'],
  ['roi.formula.payback', 'Payback-period formula'],
  ['roi.benchmark.agentDefaultMonthlyUsd', 'Default agent monthly price'],
  ['roi.workflowToAgents', 'Workflow-to-agents mapping'],
  ['extract.crawl', 'Deterministic public-page selection during analysis'],
  ['extract.identity', 'Site identity from public meta tags'],
  ['extract.privacy', 'Personal data scrubbed from captured text'],
  ['extract.detections', 'Technology detections (signature set)'],
  ['understanding.businessType', 'Business type inferred from public signals'],
  ['understanding.audience', 'Audience inferred from public signals'],
  ['understanding.shadowAi', 'Shadow-AI governance signal'],
  ['understanding.opportunity', 'Automation opportunity selection rule'],
  ['understanding.deeperAudit', 'Indicative EU AI Act band reasoning'],
];

/** Derive a readable label from a raw id (strip params/version, de-camel). */
function deriveLabel(ref: string): string {
  const core = ref.split(/[(@]/)[0].replace(/[._]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return core.charAt(0).toUpperCase() + core.slice(1);
}

/** Plain label for an appendix id (`${kind}:${ref}`). */
function humanLabel(ref: string): string {
  for (const [prefix, label] of SOURCE_LABELS) if (ref.startsWith(prefix)) return label;
  return deriveLabel(ref);
}

export function buildAuditExpressPdf(input: AuditPdfInput): Uint8Array {
  const { preview, extractSnapshot: ex, understanding: un, createdAt } = input;
  const doc = new PdfBuilder();
  void input.title; // title is metadata only; the cover uses a fixed report name

  // ── 1 · Cover page (dedicated, premium) ──
  coverPage(doc, {
    title: 'AI Readiness & Opportunity Report',
    subtitle: 'A fast, strategic snapshot of where your business stands with AI - and the value of acting.',
    metaRows: [
      ['REPORT', 'Audit Express'],
      ['DATE', createdAt],
      ['ENGINE', `${preview.engineVersion} - deterministic, no AI-generated text`],
    ],
  });

  // ── Version & integrity (boxed, monospace stamp) ──
  const stamp: Array<[string, string]> = [
    ['Engine', preview.engineVersion],
    ['Diagnostic ruleset', preview.k1a.rulesetVersion],
    ['ROI ruleset', preview.k2a.rulesetVersion],
  ];
  if (un) stamp.push(['Understanding', un.understandingRulesetVersion]);
  if (ex) {
    stamp.push(['Extractor', ex.extractorVersion]);
    stamp.push(['Model', ex.modelId]);
    stamp.push(['Inputs hash', ex.inputsHash]);
    if (ex.canonicalUrl) stamp.push(['Analyzed URL', ex.canonicalUrl]);
  }
  stamp.push(['Created at', createdAt]);
  doc.monoStamp('Version & integrity', stamp);

  // ── Disclaimer (amber callout, text unchanged) ──
  doc.callout(`${PDF_DISCLAIMER} Indicative estimates only; not a legal classification.`, 'amber');

  // ── 2 · Executive summary (where you stand, the cost of waiting, the gain) ──
  const k1 = preview.k1a; const roi = preview.k2a.result;
  doc.h2('Executive summary');
  doc.para(
    `Your AI readiness scores ${k1.normalizedScore}/100 (${k1.bucket}). ` +
    `The opportunity is concrete: an estimated ${roi.estimatedTimeSavedHoursPerMonth} hours and ${moneyUsd(roi.estimatedMonthlyCostSaved)} a month are currently spent on repetitive work that AI can take on. ` +
    `Left unchanged, that cost recurs every single month; acted on, those hours return to higher-value work` +
    (roi.estimatedPaybackMonths !== null ? `, with an estimated payback of about ${roi.estimatedPaybackMonths} month(s)` : '') + `. ` +
    `This snapshot shows exactly where to start - and how AiLuna gets you there faster.`,
  );
  conceptBox(doc, 'AI readiness',
    'AI readiness is how prepared your business is to get value from AI safely and systematically. A higher score means faster, lower-risk gains - and less work done by hand.');

  // ── How it works (4-step schematic) ──
  doc.h2('How it works');
  drawSchematic(doc, ['Inputs (your taps)', 'Capture public signals', 'Rule-based scoring', 'Prioritized action plan']);

  // ── Readiness (K1A-lite) with progress bar ──
  doc.h2('Readiness (indicative)');
  const k1Refs = traceRefIds(preview.k1a.trace);
  drawReadinessBar(doc, preview.k1a.normalizedScore, preview.k1a.bucket);
  doc.row('Readiness band', preview.k1a.bucket, k1Refs);
  if (preview.k1a.partial) doc.muted('Derived from a short preview (a subset of factors), not the full diagnostic.');
  if (preview.k1a.recommendedAgentIds.length) {
    doc.bullet(`Suggested starting points: ${preview.k1a.recommendedAgentIds.join(', ')}`, []);
  }

  // ── ROI estimate (K2A-lite): KPI tiles + same-unit bar chart ──
  doc.h2('ROI estimate (indicative, USD)');
  const r = preview.k2a.result;
  const k2Refs = traceRefIds(preview.k2a.trace);
  drawKpiTiles(doc, [
    { value: `${r.estimatedTimeSavedHoursPerMonth} h`, label: 'Time saved / month' },
    { value: r.estimatedPaybackMonths === null ? 'n/a' : `${r.estimatedPaybackMonths} mo`, label: 'Estimated payback' },
  ]);
  drawBarChart(doc, [
    { label: 'Monthly cost saved', value: r.estimatedMonthlyCostSaved, display: moneyUsd(r.estimatedMonthlyCostSaved) },
    { label: 'Yearly cost saved', value: r.estimatedYearlyCostSaved, display: moneyUsd(r.estimatedYearlyCostSaved) },
  ]);
  doc.row('Basis', 'rule-based ROI engine', k2Refs);

  // ── Site understanding (optional) ──
  if (un) {
    doc.h2('Site understanding');
    const unRefs = traceRefIds(un.trace);
    doc.row('Business type', un.businessProfile.businessType, unRefs);
    doc.row('Audience', un.businessProfile.audience, []);
    if (un.businessProfile.offers.length) doc.bullet(`Offers: ${un.businessProfile.offers.map(o => o.tag).join(', ')}`, []);

    if (un.shadowAiFlags.length) {
      doc.h2('Shadow AI flags');
      for (const f of un.shadowAiFlags) doc.bullet(`(${f.severity}) ${f.rationale}`, [ruleId(f.ruleRef)]);
    }
    if (un.automationOpportunities.length) {
      doc.h2('Automation opportunities (impact vs effort)');
      doc.muted(un.automationHeadline);
      const pts = un.automationOpportunities.slice(0, 5);
      drawOpportunityMatrix(doc, pts.map(o => ({ impact: o.impact, effort: o.effort, label: o.title })));
      for (let i = 0; i < pts.length; i++) {
        doc.bullet(`${i + 1}. ${pts[i].title} — ${pts[i].impact} impact / ${pts[i].effort} effort`, [ruleId(pts[i].ruleRef)]);
      }
    }
    doc.h2('Deeper audit (indicative)');
    doc.row('EU AI Act level (indicative)', un.deeperAudit.euAiActLevelIndicative, []);
    if (un.deeperAudit.euAiActRationale) doc.para(un.deeperAudit.euAiActRationale);
    if (un.deeperAudit.quickWins.length) {
      doc.muted('Quick wins:');
      for (const q of un.deeperAudit.quickWins) doc.bullet(q.text, [ruleId(q.ruleRef)]);
    }
  }

  // ── Extract details (optional) ──
  if (ex) {
    doc.h2('Pages scanned');
    for (const p of ex.pages) {
      const extra = p.skippedReason ? ` (skipped: ${p.skippedReason})` : p.truncated ? ' (truncated)' : '';
      doc.row(p.url, `${p.status}${extra}`, []);
    }
    if (ex.detections.length) {
      doc.h2('Detections');
      const byCat: Record<string, string[]> = {};
      for (const d of ex.detections) (byCat[d.category] ||= []).push(d.label);
      for (const cat of Object.keys(byCat).sort()) {
        doc.bullet(`${cat}: ${byCat[cat].sort().join(', ')}`, traceRefIds(ex.trace).slice(0, 1));
      }
    }
  }

  // ── How AiLuna can help (conversion-focused) ──
  doc.h2('How AiLuna can help you improve');
  doc.para('You can capture these gains faster, and with less risk, using AiLuna. The agents below are matched to your readiness band and the workflow you selected - each one targets the repetitive work behind the numbers above.');
  doc.muted('What happens next - three steps:');
  if (preview.k1a.recommendedAgentIds.length) doc.bullet(`Match. Start with the agents matched to you: ${preview.k1a.recommendedAgentIds.join(', ')}.`);
  doc.bullet('Act. Pilot one agent on a single high-volume task for about two weeks.');
  doc.bullet('Prove. Measure the hours saved, then run a full audit for the complete compliance picture.');
  doc.callout('Your next step: open your matched agents, or run a full audit for a deeper plan. In the app, both are one click away.', 'tint');

  // ── Conclusion ──
  doc.h2('Conclusion');
  doc.para(`At ${preview.k1a.normalizedScore}/100, the path to value is clear and quick. Every month of delay is recurring cost; every pilot is a compounding gain. Start with one task, prove the saving, and build from there - you do not have to do it alone.`);
  doc.callout(`${PDF_DISCLAIMER} Indicative estimates only; not a legal classification.`, 'amber');

  // ── Appendix: Sources & reasons (human label + raw id) ──
  doc.h2('Sources & reasons');
  doc.muted('Each [n] above links here. References are the rules/benchmarks behind every figure.');
  doc.spacer(4);
  for (const id of doc.orderedRefIds()) {
    const sep = id.indexOf(':');
    const kind = id.slice(0, sep);
    const ref = id.slice(sep + 1);
    doc.appendixEntry(id, humanLabel(ref));
    doc.monoNote(`[${kind}] ${ref}`);
  }

  const footerVersion = `AiLunaPro - engine ${preview.engineVersion}${ex ? ` - inputs ${ex.inputsHash.slice(0, 12)}` : ''}`;
  return doc.serialize({ createdAt, footerVersion });
}
