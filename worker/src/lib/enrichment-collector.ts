/**
 * Audit Enrichment — the collector contract (cahier §26.4).
 *
 * PURE. Types plus the helpers that turn a collector's outcome into coverage.
 *
 * One interface, many collectors: the in-worker fetcher, Apify (Phase 2) and
 * Agent-Reach (Phase 3) all satisfy it. That is deliberate — the pipeline must
 * not know which layer produced an observation beyond the `collector` tag on the
 * evidence, otherwise adding a source later means touching the pipeline.
 *
 * A collector's job ends at OBSERVATIONS. It never scores, never decides whether
 * something is a finding, and never writes to Firestore. Collection is I/O plus
 * extraction; everything after the snapshot is somebody else's phase.
 */

import type { RawObservation, SourceType, Collector } from './enrichment-evidence';
import type { CoverageEntry, CoverageState } from './enrichment-snapshot';

/** What a collector is asked to do. */
export interface CollectorRequest {
  orgId:         string;
  /** Domain asserted by the customer. Verification is not required (§26.15). */
  subjectDomain: string;
  /** Which audit surface asked: 'audit_express' | 'full_audit' | 'diagnostic'. */
  surface:       string;
  /** Surfaces this collector should attempt. */
  sourceTypes:   readonly SourceType[];
  /** Wall-clock ceiling for the whole collector, milliseconds. */
  budgetMs:      number;
  /** Captured once and passed down, so one run stamps one consistent time. */
  startedAt:     string;
}

/** What a collector returns. Observations are raw; the pipeline builds evidence. */
export interface CollectorOutcome {
  collector:    Collector;
  version:      string;
  observations: RawObservation[];
  coverage:     CoverageEntry[];
}

export interface EnrichmentCollector {
  readonly id: Collector;
  readonly version: string;
  /** Must never throw: a collector that fails reports coverage, it does not crash the audit. */
  collect(req: CollectorRequest): Promise<CollectorOutcome>;
}

/**
 * Classify a provider failure into a coverage state.
 *
 * The distinction that matters is retryable versus not: 429 and quota exhaustion
 * mean "come back later", 401/403 mean "you will never get in like this", 404 and
 * 5xx mean the source itself is the problem. Telling a customer a source is
 * blocked when it was merely busy misrepresents their own estate.
 */
export function classifyFailure(status: number, message = ''): CoverageState {
  if (status === 429) return 'rate_limited';
  if (status === 401 || status === 403) return 'blocked';
  if (status === 404 || status === 410) return 'unavailable';
  if (status >= 500) return 'unavailable';
  if (status === 408 || /timed?[ -]?out/i.test(message)) return 'partial';
  if (/quota|rate.?limit|too many/i.test(message)) return 'rate_limited';
  return 'unavailable';
}

/** Short, non-PII reason string. Shown to the customer, so no tokens, no stack traces. */
export function safeReason(raw: unknown, max = 140): string {
  const text = raw instanceof Error ? raw.message : typeof raw === 'string' ? raw : '';
  return text
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, '<email>')
    // Any long opaque run of token-ish characters is treated as a secret.
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, '<redacted>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function coverageEntry(
  sourceType: SourceType, collector: Collector, state: CoverageState,
  attemptedAt: string, reason: unknown = '',
): CoverageEntry {
  return { sourceType, collector, state, reason: safeReason(reason), attemptedAt };
}

/**
 * Coverage for every requested source, defaulting to `not_attempted`.
 *
 * This is the anti-silent-failure primitive (§26.12). A collector that returns
 * early — budget exhausted, credential missing, crash — still yields a coverage
 * row per requested source, so a source can never simply vanish from the report.
 * Absence of evidence and absence of a look are then distinguishable.
 */
export function seedCoverage(
  sourceTypes: readonly SourceType[], collector: Collector, attemptedAt: string, reason = 'not attempted',
): Map<SourceType, CoverageEntry> {
  const m = new Map<SourceType, CoverageEntry>();
  for (const st of sourceTypes) m.set(st, coverageEntry(st, collector, 'not_attempted', attemptedAt, reason));
  return m;
}

/** Deadline helper. Collectors check this rather than trusting a per-request timeout alone. */
export function makeDeadline(budgetMs: number, now: number): { expired: () => boolean; remaining: () => number } {
  const end = now + Math.max(0, budgetMs);
  return {
    expired: () => Date.now() >= end,
    remaining: () => Math.max(0, end - Date.now()),
  };
}
