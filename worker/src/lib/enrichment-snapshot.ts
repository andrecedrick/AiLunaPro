/**
 * Audit Enrichment — snapshot model + coverage (cahier §26.6, §26.12).
 *
 * PURE. The snapshot is the seam between collection and scoring:
 *
 *   collection (network I/O, may use model-assisted extraction)
 *        ↓  freeze
 *   EvidenceSnapshot  ← immutable
 *        ↓
 *   scoring (pure rules only, never reads the live web)
 *
 * This is the same seam the audit engine already uses — audit-express-extract-fetch.ts
 * performs I/O, audit-express-extract.ts is pure — extended rather than crossed.
 *
 * REPRODUCIBILITY (§26.6 rule 3): a report is reproducible from the triple
 * (snapshotId, engineVersion, rulesetVersion). The snapshot supplies the first;
 * lib/determinism.ts already stamps the other two.
 *
 * COVERAGE IS PART OF THE SNAPSHOT, NOT A LOG LINE (§26.12). A customer reading
 * "no undeclared AI systems found" cannot otherwise distinguish a clean result
 * from a collector that was blocked. An incomplete audit presented as complete is
 * the failure the engagement existed to prevent, so what was NOT read travels
 * with the evidence and reaches the report.
 */

import {
  normaliseEvidence, hashEvidence, orderEvidence,
  type EvidenceItem, type SourceType, type Collector,
} from './enrichment-evidence';

/** Bump when the stored shape changes in a way older readers cannot parse. */
export const SNAPSHOT_SCHEMA_VERSION = 1;

/**
 * Per-source outcome. `not_attempted` and `blocked` are distinct on purpose:
 * "we did not look" and "we looked and were refused" are different statements to
 * put in front of a customer.
 */
export const COVERAGE_STATES = ['succeeded', 'partial', 'unavailable', 'blocked', 'not_attempted'] as const;
export type CoverageState = (typeof COVERAGE_STATES)[number];

export const isCoverageState = (v: unknown): v is CoverageState =>
  typeof v === 'string' && (COVERAGE_STATES as readonly string[]).includes(v);

export interface CoverageEntry {
  sourceType: SourceType;
  collector:  Collector;
  state:      CoverageState;
  /** Short, non-PII reason. Shown to the customer, so no stack traces, no tokens. */
  reason:     string;
  attemptedAt: string;
}

export interface EvidenceSnapshot {
  snapshotId:    string;
  orgId:         string;
  /** Domain asserted by the customer. Verification is NOT required (§26.15). */
  subjectDomain: string;
  /** Which audit surface requested it: 'audit_express' | 'full_audit' | 'diagnostic'. */
  surface:       string;
  createdAt:     string;
  schemaVersion: number;
  /** Version string per collector, so a claim traces to the code that made it. */
  collectorVersions: Record<string, string>;
  evidence:      EvidenceItem[];
  coverage:      CoverageEntry[];
  /** Evidence discarded by the cap, reported rather than hidden. */
  droppedCount:  number;
  /** SHA-256 over the canonical evidence set — integrity of the frozen input. */
  digest:        string;
}

const clip = (v: unknown, n: number): string => (typeof v === 'string' ? v : '').slice(0, n);

/**
 * Canonical serialisation of the evidence set, used for the digest.
 *
 * Deliberately excludes createdAt and snapshotId: the digest answers "is this the
 * same evidence?", not "is this the same run". Two collections of an unchanged
 * website therefore produce the same digest, which is what makes snapshot-to-
 * snapshot comparison meaningful.
 */
export function canonicalEvidenceString(items: readonly EvidenceItem[]): string {
  return orderEvidence(items)
    .map(e => [e.sourceType, e.signalType, e.observedValue, e.sourceUrl, e.evidenceHash, e.confidence].join('|'))
    .join('\n');
}

export const snapshotDigest = (items: readonly EvidenceItem[]): Promise<string> =>
  hashEvidence(canonicalEvidenceString(items));

export interface BuildSnapshotInput {
  snapshotId:    string;
  orgId:         string;
  subjectDomain: string;
  surface:       string;
  createdAt:     string;
  collectorVersions: Record<string, string>;
  evidence:      readonly EvidenceItem[];
  coverage:      readonly CoverageEntry[];
}

/** Freeze a collection run into an immutable, ordered, digested snapshot. */
export async function buildSnapshot(input: BuildSnapshotInput): Promise<EvidenceSnapshot> {
  const { kept, dropped } = normaliseEvidence(input.evidence);
  return {
    snapshotId:    clip(input.snapshotId, 64),
    orgId:         clip(input.orgId, 64),
    subjectDomain: clip(input.subjectDomain, 253).toLowerCase(),
    surface:       clip(input.surface, 32),
    createdAt:     clip(input.createdAt, 40),
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    collectorVersions: input.collectorVersions,
    evidence:      kept,
    // Coverage ordered too, so the report renders sources in a stable order.
    coverage: [...input.coverage].sort((a, b) =>
      a.sourceType.localeCompare(b.sourceType) || a.collector.localeCompare(b.collector)),
    droppedCount: dropped,
    digest: await snapshotDigest(kept),
  };
}

export interface CoverageSummary {
  total:        number;
  succeeded:    number;
  partial:      number;
  unavailable:  number;
  blocked:      number;
  notAttempted: number;
  /** True when every attempted source succeeded and nothing was dropped. */
  complete:     boolean;
  /** Sources the report must name as missing (§26.12). */
  missing:      CoverageEntry[];
}

/**
 * Summarise coverage for the report.
 *
 * `complete` is deliberately strict: a partial read, a block, or evidence dropped
 * by the cap all make an audit incomplete. Anything less strict lets a degraded
 * run be presented as a clean one.
 */
export function summariseCoverage(snapshot: EvidenceSnapshot): CoverageSummary {
  const by = (s: CoverageState) => snapshot.coverage.filter(c => c.state === s);
  const missing = snapshot.coverage.filter(c => c.state !== 'succeeded');
  return {
    total:        snapshot.coverage.length,
    succeeded:    by('succeeded').length,
    partial:      by('partial').length,
    unavailable:  by('unavailable').length,
    blocked:      by('blocked').length,
    notAttempted: by('not_attempted').length,
    complete:     missing.length === 0 && snapshot.droppedCount === 0,
    missing,
  };
}

/**
 * Re-verify a snapshot before scoring reads it.
 *
 * A snapshot whose digest no longer matches its evidence has been altered since
 * it was frozen, and scoring it would produce a number nobody can reproduce.
 * Cheap to check, and the whole reproducibility claim rests on it.
 */
export async function verifySnapshotIntegrity(snapshot: EvidenceSnapshot): Promise<boolean> {
  return (await snapshotDigest(snapshot.evidence)) === snapshot.digest;
}

/** The triple a report is reproducible from (§26.6). */
export interface ReproducibilityRef {
  snapshotId:     string;
  engineVersion:  string;
  rulesetVersion: string;
}

export const reproducibilityRef = (
  snapshot: EvidenceSnapshot, engineVersion: string, rulesetVersion: string,
): ReproducibilityRef => ({ snapshotId: snapshot.snapshotId, engineVersion, rulesetVersion });
