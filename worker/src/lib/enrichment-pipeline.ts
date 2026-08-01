/**
 * Audit Enrichment — snapshot ingestion pipeline (cahier §26.6).
 *
 *   collectors → observations + coverage → evidence items → snapshot → stored
 *
 * The pipeline is the last stage that may touch the network, and it does so only
 * through the collectors it is given. It performs NO scoring, produces NO
 * findings and makes NO recommendations — Phases 4 and 5 own those. Its single
 * responsibility is to freeze a collection run into a durable, verifiable
 * snapshot.
 *
 * Collectors run CONCURRENTLY and are individually trapped: one failing layer
 * must not deprive the audit of the layers that worked. Every collector's
 * coverage is merged in either way, so a crashed collector shows up as coverage
 * rather than as absence (§26.12).
 */

import { buildEvidenceItem, type EvidenceItem, type SourceType } from './enrichment-evidence';
import {
  buildSnapshot, summariseCoverage,
  type EvidenceSnapshot, type CoverageEntry, type CoverageSummary,
} from './enrichment-snapshot';
import { coverageEntry, safeReason, type EnrichmentCollector, type CollectorRequest } from './enrichment-collector';
import { saveSnapshot, newSnapshotId } from './enrichment-store';

/** Per-surface collection depth (cahier §26.15 D1). */
export const SURFACE_BUDGET_MS: Record<string, number> = {
  // Audit Express is the fast, cost-controlled tier: core evidence only.
  audit_express: 30_000,
  full_audit:    180_000,
  diagnostic:    120_000,
};

/**
 * Sources attempted per surface (§26.15 D1).
 *
 * Audit Express gets the legal and website core — the highest-evidence-density
 * surfaces — because it must stay fast. The deeper tiers add the rest.
 */
export const SURFACE_SOURCES: Record<string, readonly SourceType[]> = {
  audit_express: ['website', 'privacy_policy', 'terms', 'dpa', 'processor_list'],
  full_audit: [
    'website', 'subdomain', 'privacy_policy', 'terms', 'dpa', 'legal_page',
    'ai_policy', 'processor_list', 'documentation', 'blog', 'rss',
    'github', 'youtube', 'linkedin', 'instagram', 'facebook',
    'social', 'video', 'presentation', 'repository',
  ],
  diagnostic: [
    'website', 'privacy_policy', 'terms', 'dpa', 'processor_list',
    'ai_policy', 'documentation', 'blog', 'github', 'linkedin',
  ],
};

export interface RunEnrichmentInput {
  saJson:        string;
  orgId:         string;
  /** Domain asserted by the customer; not verified (§26.15). */
  subjectDomain: string;
  surface:       string;
  collectors:    readonly EnrichmentCollector[];
  /** Injected so a run stamps one consistent time across every collector. */
  now:           Date;
  /** Overrides for tests and for surfaces not in the table. */
  sourceTypes?:  readonly SourceType[];
  budgetMs?:     number;
}

export interface RunEnrichmentResult {
  snapshot: EvidenceSnapshot;
  coverage: CoverageSummary;
  /** Observations discarded because they carried no usable evidence. */
  rejected: number;
  stored:   boolean;
  /** Set when persistence failed. The snapshot is still returned. */
  storeError?: string;
}

/**
 * Run every collector, freeze the result, store it.
 *
 * Storage failure does NOT discard the snapshot: the collection already cost
 * money and the caller may still want to inspect what was found. It is reported
 * as `stored: false` with a reason rather than swallowed.
 */
export async function runEnrichment(input: RunEnrichmentInput): Promise<RunEnrichmentResult> {
  const startedAt = input.now.toISOString();
  const sourceTypes = input.sourceTypes ?? SURFACE_SOURCES[input.surface] ?? SURFACE_SOURCES.audit_express;
  const budgetMs = input.budgetMs ?? SURFACE_BUDGET_MS[input.surface] ?? SURFACE_BUDGET_MS.audit_express;

  const req: CollectorRequest = {
    orgId: input.orgId, subjectDomain: input.subjectDomain, surface: input.surface,
    sourceTypes, budgetMs, startedAt,
  };

  // Concurrent, individually trapped: one failing collector must not deprive the
  // audit of the others.
  const outcomes = await Promise.all(input.collectors.map(async c => {
    try {
      return await c.collect(req);
    } catch (err) {
      return {
        collector: c.id, version: c.version, observations: [],
        // A collector that threw still owes a coverage row per source it was
        // asked for, otherwise the failure is invisible in the report.
        coverage: sourceTypes.map(st => coverageEntry(st, c.id, 'unavailable', startedAt, safeReason(err))),
      };
    }
  }));

  const collectorVersions: Record<string, string> = {};
  const coverage: CoverageEntry[] = [];
  const evidence: EvidenceItem[] = [];
  let rejected = 0;

  for (const outcome of outcomes) {
    collectorVersions[outcome.collector] = outcome.version;
    coverage.push(...outcome.coverage);
    for (const obs of outcome.observations) {
      const item = await buildEvidenceItem(obs, startedAt);
      // Null means the observation carried no usable excerpt. Counted, not hidden:
      // a finding without evidence is not a finding (§26.7).
      if (item) evidence.push(item); else rejected++;
    }
  }

  const snapshot = await buildSnapshot({
    snapshotId: newSnapshotId(),
    orgId: input.orgId,
    subjectDomain: input.subjectDomain,
    surface: input.surface,
    createdAt: startedAt,
    collectorVersions,
    evidence,
    coverage,
  });

  let stored = true;
  let storeError: string | undefined;
  try {
    await saveSnapshot(input.saJson, snapshot);
  } catch (err) {
    stored = false;
    storeError = safeReason(err);
    console.error('[enrichment] snapshot store failed:', storeError);
  }

  console.log(
    `[enrichment] org=${input.orgId} surface=${input.surface} snapshot=${snapshot.snapshotId} ` +
    `evidence=${snapshot.evidence.length} rejected=${rejected} dropped=${snapshot.droppedCount} ` +
    `sources=${coverage.length} stored=${stored}`,
  );

  return { snapshot, coverage: summariseCoverage(snapshot), rejected, stored, storeError };
}
