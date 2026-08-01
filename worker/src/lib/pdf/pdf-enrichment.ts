/**
 * Enrichment section of the PDF (cahier §26.10, §26.11, §26.12).
 *
 * Renders the transparency chain the specification requires, in order, for every
 * finding:
 *
 *   Finding -> Evidence -> Observed -> Declared -> Gap -> Risk -> Recommendation
 *
 * Pure and deterministic: the same view always produces the same bytes. Nothing
 * here computes a judgement — it prints what the Phase 4 and Phase 5 engines
 * decided, including their version stamps, so a reader can reproduce it.
 *
 * WHAT WAS NOT READ IS PRINTED TOO (§26.12). A compliance PDF that shows only
 * what was found reads as complete coverage; the coverage table exists so a
 * blocked or unattempted source is visible on the page, not just in a log.
 */

import type { PdfBuilder } from './pdf-doc';
import type { EnrichmentReportView } from '../enrichment-report';

/** ASCII-only labels: the PDF core fonts have no glyph for typographic dashes. */
const RISK_LABEL: Record<string, string> = {
  critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW',
};

const SURFACE_LABEL: Record<string, string> = {
  audit_express: 'Audit Express', full_audit: 'Full Audit', diagnostic: 'Diagnostic',
};

const COVERAGE_LABEL: Record<string, string> = {
  succeeded: 'Read', partial: 'Partially read', rate_limited: 'Rate limited',
  unavailable: 'Source unavailable', blocked: 'Blocked', not_attempted: 'Not analyzed',
};

const SIGNAL_LABEL: Record<string, string> = {
  ai_vendor_script:    'vendor script or tag',
  ai_processor_named:  'named in processor documentation',
  ai_repo_dependency:  'dependency in a public repository',
  ai_feature_doc:      'described in documentation',
  ai_policy_published: 'AI policy published',
  ai_marketing_claim:  'marketing claim',
  ai_job_posting:      'job posting',
  ai_media_mention:    'media mention',
  automated_decision:  'automated decision disclosure',
  transparency_gap:    'missing disclosure',
};

const GAP_LABEL: Record<string, string> = {
  undeclared_system:      'Observed but not declared',
  unverified_declaration: 'Declared but not observed',
  registry_incomplete:    'Registry entry cannot be compared',
};

const label = (map: Record<string, string>, key: string) => map[key] ?? key;

/** Evidence hashes are 64 hex chars; a PDF line needs a readable prefix. */
const shortHash = (h: string) => (h.length > 20 ? `${h.slice(0, 20)}...` : h);

export const ENRICHMENT_PDF_DISCLAIMER =
  'Evidence was collected from publicly accessible sources at the timestamp shown. '
  + 'Findings describe what was observed and what was declared; they are not a legal '
  + 'conclusion and not a certification.';

/**
 * Render the enrichment section.
 *
 * Takes the same assembled view the API and the SPA render, so the PDF cannot
 * drift from the screen.
 */
export function enrichmentSection(doc: PdfBuilder, view: EnrichmentReportView): void {
  doc.pageBreak();
  doc.h2('AI systems observed in public sources');

  doc.paraKey(
    `This section compares what could be observed about ${view.subjectDomain} in public sources `
    + `against the systems recorded in your AI registry. `
    + `Every statement below is traceable to a stored piece of evidence; nothing was inferred at the time this document was produced.`,
  );

  /* ── Reproducibility stamp ─────────────────────────────────────── */
  doc.monoStamp('EVIDENCE SNAPSHOT', [
    ['SNAPSHOT ID', view.snapshotId],
    ['SUBJECT', view.subjectDomain],
    ['SURFACE', label(SURFACE_LABEL, view.surface)],
    ['CAPTURED AT', view.createdAt],
    ['FINGERPRINT', shortHash(view.digest)],
    ['INTEGRITY', view.integrityVerified ? 'Verified' : 'NOT VERIFIED'],
    ['ENGINE', `${view.determinism.engineVersion} / ${view.determinism.comparisonEngineVersion}`],
    ['RULESETS', `${view.determinism.comparisonRulesetVersion} / ${view.determinism.findingsRulesetVersion}`],
  ]);

  /* ── Coverage, including what was NOT read ─────────────────────── */
  doc.h3('What was analyzed');
  const cov = view.coverage.summary;
  if (cov.total === 0) {
    doc.muted('No source was attempted for this snapshot.');
  } else {
    doc.row(`Sources read successfully`, `${cov.succeeded} of ${cov.total}`);
    for (const entry of view.coverage.entries) {
      if (entry.state === 'succeeded') continue;
      const reason = entry.reason ? ` - ${entry.reason}` : '';
      doc.row(`${entry.sourceType} (${entry.collector})`, `${label(COVERAGE_LABEL, entry.state)}${reason}`);
    }
    if (!cov.complete) {
      doc.callout(
        'Coverage was incomplete. The sources listed above as unavailable, blocked, rate limited or not analyzed '
        + 'were not read, so this section cannot be treated as an exhaustive view of your AI usage.', 'amber');
    }
  }
  if (view.droppedCount > 0) {
    doc.muted(`${view.droppedCount} additional observation(s) were discarded because the snapshot reached its evidence limit.`);
  }

  /* ── Observed ──────────────────────────────────────────────────── */
  doc.h3('Observed systems');
  if (view.observedSystems.length === 0) {
    doc.muted('No AI system was identified in the sources that were read.');
  } else {
    for (const o of view.observedSystems) {
      doc.row(
        `${o.name} (${o.signalTypes.map(s => label(SIGNAL_LABEL, s)).join(', ')})`,
        `${o.confidence} confidence / ${o.declared ? 'declared' : 'NOT DECLARED'}`,
      );
    }
  }

  /* ── Declared ──────────────────────────────────────────────────── */
  doc.h3('Declared systems (AI registry)');
  if (view.declaredSystems.length === 0) {
    doc.muted('Your AI registry contains no active entry. Every system observed above is therefore undeclared.');
  } else {
    for (const d of view.declaredSystems) {
      const name = d.name || d.vendor || d.systemId;
      const vendor = d.vendor && d.vendor !== name ? ` - ${d.vendor}` : '';
      doc.row(`${name}${vendor}`, d.unmatchable ? 'cannot be compared' : d.observed ? 'corroborated' : 'no public evidence');
    }
  }

  /* ── Findings: the full chain, one block each ──────────────────── */
  doc.h3('Findings');
  if (view.findings.length === 0) {
    doc.para('No gap was found between the systems observed in public sources and the systems recorded in your AI registry.');
  } else {
    doc.muted(
      `${view.findings.length} finding(s). Compliance impact applied to your score: ${view.totalImpact} point(s)`
      + `${view.impactCapped ? ' (capped)' : ''}.`);
    for (const f of view.findings) {
      renderFinding(doc, f, view);
    }
  }

  doc.spacer(4);
  doc.callout(ENRICHMENT_PDF_DISCLAIMER, 'tint');
}

/** One finding, printed as the mandated chain so nothing is asserted unsupported. */
function renderFinding(doc: PdfBuilder, f: EnrichmentReportView['findings'][number], view: EnrichmentReportView): void {
  doc.spacer(6);
  doc.hr();
  doc.h3(`[${label(RISK_LABEL, f.riskLevel)}] ${f.title}`);
  doc.row('Rule', f.ruleId);
  doc.row('Subject', f.subject);
  doc.row('Compliance impact', f.scoreImpact > 0 ? `-${f.scoreImpact} point(s)` : 'none (reported only)');

  doc.para(f.explanation);

  // Evidence — the proof, with everything needed to re-check it.
  doc.h3('Evidence');
  if (f.evidence.length === 0) {
    doc.muted('This finding is based on the ABSENCE of an observation, so it cites no captured evidence.');
  } else {
    for (const e of f.evidence) {
      doc.bullet(`"${e.capturedEvidence}"`);
      doc.muted(`Source: ${e.sourceUrl}`);
      doc.muted(`Type: ${e.sourceType} | Collector: ${e.collector} | Confidence: ${e.confidence} | Captured: ${e.capturedAt}`);
      doc.muted(`Evidence ID: ${e.evidenceId} | Hash: ${shortHash(e.evidenceHash)} | Snapshot: ${e.snapshotId}`);
    }
  }

  // Observed -> Declared -> Gap, so the reasoning is visible rather than implied.
  const observed = view.observedSystems.find(o => o.key === f.subjectKey);
  doc.h3('Observed vs declared');
  doc.row('Observed',
    observed
      ? `${observed.name} - ${observed.signalTypes.map(s => label(SIGNAL_LABEL, s)).join(', ')}`
      : 'not observed in public sources');
  const declared = f.systemId ? view.declaredSystems.find(d => d.systemId === f.systemId) : undefined;
  doc.row('Declared',
    declared
      ? `${declared.name || declared.vendor || declared.systemId} (registry entry ${declared.systemId})`
      : 'no matching entry in the AI registry');
  doc.row('Gap', label(GAP_LABEL, f.gapKind));

  doc.h3('Recommendation');
  doc.para(f.recommendation);
}
