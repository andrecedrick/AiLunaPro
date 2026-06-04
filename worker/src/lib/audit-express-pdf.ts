/**
 * Audit Express PDF report builder (J15 P1). PURE + DETERMINISTIC:
 * identical { preview, extractSnapshot?, understanding?, createdAt } always
 * produces byte-identical PDF output (see pdf-doc.ts for the byte-level guards).
 *
 * Traceability: every scored figure carries [n] markers that link to a
 * stable-ordered "Sources & reasons" appendix built from the engines' traces
 * (rule/benchmark ReasonRefs) and item-level ruleRefs.
 *
 * Privacy: renders only non-PII fields. Extract identity free-text
 * (title/description) is intentionally NOT rendered; only the canonical URL,
 * page list, and detections are shown.
 */

import { PdfBuilder } from './pdf/pdf-doc';
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

export function buildAuditExpressPdf(input: AuditPdfInput): Uint8Array {
  const { preview, extractSnapshot: ex, understanding: un, createdAt } = input;
  const doc = new PdfBuilder();

  // ── Header ──
  doc.h1('Audit Express - Readiness Snapshot');
  doc.muted(`Generated ${createdAt}`);
  doc.spacer(6);
  doc.callout(`${PDF_DISCLAIMER} Indicative estimates only; not a legal classification.`, 'amber');

  // ── Version & integrity ──
  doc.h2('Version & integrity');
  doc.kv('Engine version', preview.engineVersion);
  doc.kv('Diagnostic ruleset', preview.k1a.rulesetVersion);
  doc.kv('ROI ruleset', preview.k2a.rulesetVersion);
  doc.kv('Created at', createdAt);
  if (ex) {
    doc.kv('Extractor version', ex.extractorVersion);
    doc.kv('Extract ruleset', ex.rulesetVersion);
    doc.kv('Model', ex.modelId);
    doc.kv('Inputs hash', ex.inputsHash);
    if (ex.canonicalUrl) doc.kv('Analyzed URL', ex.canonicalUrl);
  }
  if (un) doc.kv('Understanding ruleset', un.understandingRulesetVersion);

  // ── Readiness (K1A-lite) ──
  doc.h2('Readiness (indicative)');
  const k1Refs = traceRefIds(preview.k1a.trace);
  doc.row('Readiness score (0-100)', String(preview.k1a.normalizedScore), k1Refs);
  doc.row('Readiness band', preview.k1a.bucket, []);
  if (preview.k1a.partial) doc.muted('Derived from a short preview (a subset of factors), not the full diagnostic.');
  if (preview.k1a.recommendedAgentIds.length) {
    doc.bullet(`Suggested starting points: ${preview.k1a.recommendedAgentIds.join(', ')}`, []);
  }

  // ── ROI estimate (K2A-lite) ──
  doc.h2('ROI estimate (indicative, USD)');
  const r = preview.k2a.result;
  const k2Refs = traceRefIds(preview.k2a.trace);
  doc.row('Time saved per month (hours)', String(r.estimatedTimeSavedHoursPerMonth), k2Refs);
  doc.row('Estimated monthly cost saved', moneyUsd(r.estimatedMonthlyCostSaved), []);
  doc.row('Estimated yearly cost saved', moneyUsd(r.estimatedYearlyCostSaved), []);
  doc.row('Estimated payback (months)', r.estimatedPaybackMonths === null ? 'n/a' : String(r.estimatedPaybackMonths), []);

  // ── Site understanding (optional) ──
  if (un) {
    doc.h2('Site understanding');
    const unRefs = traceRefIds(un.trace);
    doc.row('Business type', un.businessProfile.businessType, unRefs);
    doc.row('Audience', un.businessProfile.audience, []);
    if (un.businessProfile.offers.length) {
      doc.bullet(`Offers: ${un.businessProfile.offers.map(o => o.tag).join(', ')}`, []);
    }
    doc.row('Confidence', un.businessProfile.confidence, []);

    if (un.aiUsageSignals.length) {
      doc.h2('AI usage signals');
      for (const s of un.aiUsageSignals) doc.bullet(s.label, []);
    }
    if (un.shadowAiFlags.length) {
      doc.h2('Shadow AI flags');
      for (const f of un.shadowAiFlags) doc.bullet(`(${f.severity}) ${f.rationale}`, [ruleId(f.ruleRef)]);
    }
    if (un.automationOpportunities.length) {
      doc.h2('Automation opportunities');
      doc.muted(un.automationHeadline);
      for (const o of un.automationOpportunities) {
        doc.row(o.title, `${o.impact} impact / ${o.effort} effort`, [ruleId(o.ruleRef)]);
      }
    }
    doc.h2('Deeper audit (indicative)');
    doc.row('EU AI Act level (indicative)', un.deeperAudit.euAiActLevelIndicative, []);
    if (un.deeperAudit.euAiActRationale) doc.para(un.deeperAudit.euAiActRationale);
    if (un.deeperAudit.shadowAiSummary) doc.para(un.deeperAudit.shadowAiSummary);
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

  // ── Appendix: Sources & reasons ──
  doc.h2('Sources & reasons');
  doc.muted('Each [n] above links here. References are rule/benchmark identifiers behind every figure.');
  doc.spacer(4);
  for (const id of doc.orderedRefIds()) {
    const sep = id.indexOf(':');
    const kind = id.slice(0, sep);
    const ref = id.slice(sep + 1);
    doc.appendixEntry(id, `[${kind}] ${ref}`);
  }

  const footerVersion = `AiLunaPro - engine ${preview.engineVersion}${ex ? ` - inputs ${ex.inputsHash.slice(0, 12)}` : ''}`;
  return doc.serialize({ createdAt, footerVersion });
}
