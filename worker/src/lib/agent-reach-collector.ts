/**
 * Agent-Reach collector (cahier §26.3, §26.12).
 *
 * Implements EnrichmentCollector, the same contract Apify satisfies, so the
 * pipeline never learns which layer produced an observation beyond the
 * `collector` tag on the evidence.
 *
 * DIVISION OF LABOUR. Apify covers breadth across the customer's web estate.
 * Agent-Reach covers depth on the surfaces a web crawler reads poorly: public
 * repositories, video transcripts, feeds and social platforms. A conference talk
 * describing an ML pipeline is audit evidence a website crawl will never find.
 *
 * Runs only where a bridge is configured (see agent-reach-client.ts for why a
 * bridge is structurally necessary). Unconfigured sources report `not_attempted`
 * with a reason rather than vanishing.
 *
 * Never throws.
 */

import {
  collectFromBridge, type BridgeConfig, type AgentReachPlatform, type AgentReachDoc,
} from './agent-reach-client';
import { mapDocument } from './enrichment-signals';
import {
  classifyFailure, coverageEntry, seedCoverage, makeDeadline, safeReason,
  type EnrichmentCollector, type CollectorRequest, type CollectorOutcome,
} from './enrichment-collector';
import type { RawObservation, SourceType } from './enrichment-evidence';
import type { CoverageEntry } from './enrichment-snapshot';

export const AGENT_REACH_COLLECTOR_VERSION = '1.0.0';

/** Documents pulled per source. Transcripts are large; this bounds worker memory. */
const MAX_ITEMS_PER_SOURCE = 25;
/** Floor below which starting another platform read is pointless. */
const MIN_SOURCE_BUDGET_MS = 4000;

/**
 * Source type → Agent-Reach platform.
 *
 * A source type with no mapping is not something this collector can read, and is
 * reported as such.
 *
 * `blog` and `documentation` map to the `web` path (Jina Reader) even though
 * Apify also crawls them. That overlap is intentional and safe: the two
 * collectors reach a page by different routes — Apify renders JS, the Jina path
 * does not — so one may succeed where the other is blocked. Phase 2's
 * normaliseEvidence dedupes on evidenceId, so the same observation seen twice
 * counts once. The caller decides which collector is asked for which source; the
 * map only states what this one is CAPABLE of reading.
 *
 * The strictly page-only legal surfaces stay absent: `website`,
 * `privacy_policy`, `terms` and `dpa` are Apify's, and asking a reader API to
 * discover them adds cost without adding reach.
 */
export const PLATFORM_MAP: Partial<Record<SourceType, AgentReachPlatform>> = {
  github:           'github',
  repository:       'github',
  youtube:          'youtube',
  video:            'youtube',
  presentation:     'youtube',
  linkedin:         'linkedin',
  instagram:        'instagram',
  facebook:         'facebook',
  social:           'twitter',
  rss:              'rss',
  blog:             'web',
  documentation:    'web',
  media_reference:  'web',
};

/** Source types this collector claims. Used by callers to split work with Apify. */
export const AGENT_REACH_SOURCES: readonly SourceType[] =
  Object.keys(PLATFORM_MAP) as SourceType[];

/**
 * Longest text a document offers.
 *
 * `transcript` is preferred when longer because that is the whole point of the
 * video path: the spoken content of a talk carries the AI detail the page title
 * never does.
 */
export function docText(doc: AgentReachDoc): string {
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  return [s(doc.text), s(doc.transcript)].reduce((a, b) => (b.length > a.length ? b : a), '');
}

export const docUrl = (doc: AgentReachDoc): string => (typeof doc.url === 'string' ? doc.url : '');

function coverageFor(
  sourceType: SourceType, at: string,
  r: { ok: boolean; status: number; truncated: boolean; note: string; error?: string },
  itemCount: number,
): CoverageEntry {
  if (!r.ok) {
    return coverageEntry(sourceType, 'agent_reach', classifyFailure(r.status, r.error ?? ''), at,
      r.error ?? `HTTP ${r.status}`);
  }
  if (r.truncated) {
    return coverageEntry(sourceType, 'agent_reach', 'partial', at, r.note || 'response exceeded the size cap');
  }
  if (itemCount === 0) {
    // Read and empty is distinct from never looked: the customer learns the
    // platform was checked and had nothing.
    return coverageEntry(sourceType, 'agent_reach', 'succeeded', at, r.note || 'no content returned');
  }
  return coverageEntry(sourceType, 'agent_reach', 'succeeded', at, r.note);
}

export class AgentReachCollector implements EnrichmentCollector {
  readonly id = 'agent_reach' as const;
  readonly version = AGENT_REACH_COLLECTOR_VERSION;

  constructor(private readonly config: BridgeConfig) {}

  async collect(req: CollectorRequest): Promise<CollectorOutcome> {
    const at = req.startedAt;
    const coverage = seedCoverage(req.sourceTypes, 'agent_reach', at, 'not attempted');
    const observations: RawObservation[] = [];
    const deadline = makeDeadline(req.budgetMs, Date.now());

    if (!req.subjectDomain) {
      for (const st of req.sourceTypes) {
        coverage.set(st, coverageEntry(st, 'agent_reach', 'not_attempted', at, 'no subject domain'));
      }
      return { collector: this.id, version: this.version, observations, coverage: [...coverage.values()] };
    }

    for (const sourceType of req.sourceTypes) {
      const platform = PLATFORM_MAP[sourceType];
      if (!platform) {
        // Not a failure — this collector simply does not read page surfaces.
        coverage.set(sourceType, coverageEntry(sourceType, 'agent_reach', 'not_attempted', at,
          'source not handled by Agent-Reach'));
        continue;
      }
      if (deadline.expired() || deadline.remaining() < MIN_SOURCE_BUDGET_MS) {
        coverage.set(sourceType, coverageEntry(sourceType, 'agent_reach', 'not_attempted', at,
          'collection budget exhausted'));
        continue;
      }

      const timeoutMs = deadline.remaining();
      let result;
      try {
        result = await collectFromBridge(this.config, {
          platform, target: req.subjectDomain, maxItems: MAX_ITEMS_PER_SOURCE, timeoutMs,
        });
      } catch (err) {
        // Defensive: collectFromBridge already traps transport errors. A collector
        // may not throw, so anything unexpected still becomes coverage.
        coverage.set(sourceType, coverageEntry(sourceType, 'agent_reach', 'unavailable', at, safeReason(err)));
        continue;
      }

      const items = result.items.slice(0, MAX_ITEMS_PER_SOURCE);
      coverage.set(sourceType, coverageFor(sourceType, at, result, items.length));
      if (!result.ok) continue;

      for (const doc of items) {
        observations.push(...mapDocument({
          url: docUrl(doc), text: docText(doc),
          sourceType, collector: 'agent_reach',
          collectorRunId: `agent_reach:${platform}`,
        }));
      }
    }

    return { collector: this.id, version: this.version, observations, coverage: [...coverage.values()] };
  }
}
