/**
 * Enrichment report assembly (cahier §26.10, §26.11, §26.12).
 *
 * ONE place turns a stored snapshot into everything a report shows — the API,
 * the SPA panel and the PDF all render this same view. A second assembly path
 * would eventually disagree with the first, and a compliance report that
 * contradicts its own PDF is worse than no report.
 *
 * READ PATH ONLY. Nothing here collects: the snapshot is loaded, its integrity
 * re-checked, and the Phase 4/5 engines run over the frozen evidence. No live
 * web, no dynamic scoring, no hidden calculation — the whole view is a pure
 * function of (snapshot, registry) plus the engine versions that produced it.
 *
 * TRANSPARENCY IS THE POINT (§26.11). Every finding carries its rule id, its
 * evidence with hashes, the observed subject, the declared entry it was compared
 * against, its risk and its recommendation. A number the customer cannot trace
 * is a number they cannot act on or contest.
 */

import { loadSnapshot } from './enrichment-store';
import { summariseCoverage, verifySnapshotIntegrity, type EvidenceSnapshot, type CoverageEntry, type CoverageSummary } from './enrichment-snapshot';
import { hashEvidence, type EvidenceItem, type Confidence, type SignalType } from './enrichment-evidence';
import { loadDeclaredInventory, normaliseVendorKey, type DeclaredInventory } from './enrichment-declared';
import { compareObservedVsDeclared, OVD_ENGINE_VERSION, OVD_RULESET_VERSION, type ComparisonResult, type Gap } from './observed-vs-declared';
import { isGenericSubject } from './enrichment-signals';
import { buildFindings, FINDINGS_RULESET_VERSION, type Finding } from './compliance-findings';
import { ENGINE_VERSION } from './determinism';

/** Bumped when the assembled view's shape changes. */
export const ENRICHMENT_VIEW_VERSION = 'enrichment-view-1';

/** One system seen in the evidence, with what proves it. */
export interface ObservedSystemView {
  key:          string;
  name:         string;
  confidence:   Confidence;
  /** True when at least one supporting signal indicates actual deployment. */
  deployed:     boolean;
  signalTypes:  SignalType[];
  evidenceIds:  string[];
  /** Whether a registry entry was found for it. */
  declared:     boolean;
  /** Registry entries it matched, when it matched any. */
  declaredSystemIds: string[];
}

/** One registry entry, with whether the evidence corroborated it. */
export interface DeclaredSystemView {
  systemId:    string;
  name:        string;
  vendor:      string;
  riskLevel:   string;
  status:      string;
  department:  string;
  observed:    boolean;
  /** True when the entry carries neither a usable name nor a vendor. */
  unmatchable: boolean;
}

export interface EnrichmentReportView {
  viewVersion:   string;
  snapshotId:    string;
  subjectDomain: string;
  surface:       string;
  createdAt:     string;
  schemaVersion: number;
  digest:        string;
  /**
   * Whether the snapshot still hashes to its recorded digest.
   *
   * Surfaced rather than enforced here: the caller decides what to do about a
   * failed check, but a report must never present altered evidence as intact.
   */
  integrityVerified: boolean;
  collectorVersions: Record<string, string>;

  /** Every version a reader needs to reproduce this exact output (§26.6). */
  determinism: {
    engineVersion:             string;
    comparisonEngineVersion:   string;
    comparisonRulesetVersion:  string;
    findingsRulesetVersion:    string;
  };

  observedSystems: ObservedSystemView[];
  declaredSystems: DeclaredSystemView[];
  gaps:            Gap[];
  findings:        Finding[];

  /** What was and was not readable. Named, never silently omitted (§26.12). */
  coverage: {
    summary: CoverageSummary;
    entries: CoverageEntry[];
  };
  /** Evidence discarded by the snapshot cap, reported rather than hidden. */
  droppedCount: number;

  totals:       ComparisonResult['totals'];
  totalImpact:  number;
  impactCapped: boolean;
  counts:       Record<string, number>;
}

/** Signals that name a system. Mirrors what Phase 4 groups on. */
const VENDOR_BEARING: readonly SignalType[] = ['ai_vendor_script', 'ai_processor_named', 'ai_repo_dependency'];
const CONFIDENCE_RANK: Record<Confidence, number> = { high: 0, medium: 1, low: 2 };
const DEPLOYMENT_SIGNALS: readonly SignalType[] = ['ai_vendor_script', 'ai_processor_named', 'ai_repo_dependency', 'ai_feature_doc'];

/**
 * The observed inventory, as the customer sees it.
 *
 * Re-derived from the same evidence and the same grouping rule Phase 4 uses, so
 * "Observed Systems" in the report is exactly the population the gaps were
 * computed from — not a similar-looking list assembled a second way.
 */
export function buildObservedSystems(
  evidence: readonly EvidenceItem[], declared: DeclaredInventory,
): ObservedSystemView[] {
  const byKey = new Map<string, ObservedSystemView>();

  for (const e of evidence) {
    if (!VENDOR_BEARING.includes(e.signalType)) continue;
    // Same exclusion as the comparison engine, from the same table. If the two
    // ever diverged, "Observed systems" would list a subject that no gap
    // mentions, and the transparency chain would break at its first link.
    if (isGenericSubject(e.observedValue)) continue;
    const key = normaliseVendorKey(e.observedValue);
    if (!key) continue;

    let view = byKey.get(key);
    if (!view) {
      const matches = declared.index.get(key) ?? [];
      view = {
        key, name: e.observedValue, confidence: e.confidence, deployed: false,
        signalTypes: [], evidenceIds: [],
        declared: matches.length > 0,
        declaredSystemIds: matches.map(m => m.systemId).sort(),
      };
      byKey.set(key, view);
    }
    if (CONFIDENCE_RANK[e.confidence] < CONFIDENCE_RANK[view.confidence]) view.confidence = e.confidence;
    view.deployed = view.deployed || DEPLOYMENT_SIGNALS.includes(e.signalType);
    if (!view.signalTypes.includes(e.signalType)) view.signalTypes.push(e.signalType);
    view.evidenceIds.push(e.evidenceId);
  }

  for (const view of byKey.values()) {
    view.signalTypes.sort();
    view.evidenceIds.sort();
  }
  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** The declared inventory, annotated with whether the evidence corroborated it. */
export function buildDeclaredView(
  declared: DeclaredInventory, observedKeys: ReadonlySet<string>,
): DeclaredSystemView[] {
  return declared.systems.map(s => ({
    systemId: s.systemId, name: s.name, vendor: s.vendor,
    riskLevel: s.riskLevel, status: s.status, department: s.department,
    observed: Boolean((s.vendorKey && observedKeys.has(s.vendorKey)) || (s.nameKey && observedKeys.has(s.nameKey))),
    unmatchable: s.unmatchable,
  }));
}

/**
 * Assemble the view. Pure: same snapshot and registry always give the same page.
 *
 * `integrityVerified` is passed in rather than computed because hashing is async
 * and this function is the one every renderer shares; keeping it synchronous
 * means the PDF path cannot accidentally skip the check the API performed.
 */
export function buildEnrichmentReport(
  snapshot: EvidenceSnapshot, declared: DeclaredInventory, integrityVerified: boolean,
): EnrichmentReportView {
  const comparison = buildComparison(snapshot, declared);
  const assessment = buildFindings(snapshot, comparison);
  const observedSystems = buildObservedSystems(snapshot.evidence, declared);
  const observedKeys = new Set(observedSystems.map(o => o.key));

  return {
    viewVersion: ENRICHMENT_VIEW_VERSION,
    snapshotId:    snapshot.snapshotId,
    subjectDomain: snapshot.subjectDomain,
    surface:       snapshot.surface,
    createdAt:     snapshot.createdAt,
    schemaVersion: snapshot.schemaVersion,
    digest:        snapshot.digest,
    integrityVerified,
    collectorVersions: snapshot.collectorVersions,
    determinism: {
      engineVersion:            ENGINE_VERSION,
      comparisonEngineVersion:  OVD_ENGINE_VERSION,
      comparisonRulesetVersion: OVD_RULESET_VERSION,
      findingsRulesetVersion:   FINDINGS_RULESET_VERSION,
    },
    observedSystems,
    declaredSystems: buildDeclaredView(declared, observedKeys),
    gaps:     comparison.gaps,
    findings: assessment.findings,
    coverage: { summary: summariseCoverage(snapshot), entries: [...snapshot.coverage] },
    droppedCount: snapshot.droppedCount,
    totals:       comparison.totals,
    totalImpact:  assessment.totalImpact,
    impactCapped: assessment.impactCapped,
    counts:       assessment.counts,
  };
}

const buildComparison = (snapshot: EvidenceSnapshot, declared: DeclaredInventory): ComparisonResult =>
  compareObservedVsDeclared(snapshot, declared);

export type LoadFailure = 'NOT_FOUND' | 'INTEGRITY_FAILED';

/**
 * Re-hash every displayed excerpt against its recorded hash.
 *
 * The snapshot digest covers source, signal, subject, URL, confidence and the
 * evidence HASH — but not the excerpt text itself. That is correct for the
 * digest's purpose (answering "is this the same evidence set?"), and it leaves a
 * gap the moment a report QUOTES the excerpt next to its hash and invites the
 * reader to check it: an altered quotation carrying its original stale hash would
 * pass the digest check untouched.
 *
 * A hash printed beside text it does not actually verify is decorative. This
 * closes that at the point of display, where the claim is made.
 */
async function excerptsMatchTheirHashes(items: readonly EvidenceItem[]): Promise<boolean> {
  for (const item of items) {
    if ((await hashEvidence(item.capturedEvidence)) !== item.evidenceHash) return false;
  }
  return true;
}

/**
 * Load and assemble.
 *
 * A snapshot that no longer matches its digest is REFUSED, not annotated: the
 * evidence behind every finding has been altered since it was frozen, so the
 * findings are not reproducible and presenting them would misrepresent an audit.
 */
export async function loadEnrichmentReport(
  saJson: string, orgId: string, snapshotId: string,
): Promise<{ ok: true; view: EnrichmentReportView } | { ok: false; reason: LoadFailure }> {
  const snapshot = await loadSnapshot(saJson, orgId, snapshotId);
  if (!snapshot) return { ok: false, reason: 'NOT_FOUND' };

  const intact = await verifySnapshotIntegrity(snapshot)
    && await excerptsMatchTheirHashes(snapshot.evidence);
  if (!intact) return { ok: false, reason: 'INTEGRITY_FAILED' };

  const declared = await loadDeclaredInventory(saJson, orgId);
  return { ok: true, view: buildEnrichmentReport(snapshot, declared, intact) };
}
