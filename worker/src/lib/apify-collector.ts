/**
 * Apify collector (cahier §26.3, §26.12).
 *
 * Implements EnrichmentCollector. Runs one actor per requested source type,
 * converts dataset items to observations via the pure apify-signals.ts, and
 * returns a coverage row for EVERY requested source — succeeded or not.
 *
 * ACTOR IDS ARE OPERATOR CONFIGURATION, NOT PRODUCT CONSTANTS. Apify's actor
 * catalogue is a third-party marketplace: ids are renamed, deprecated and
 * replaced independently of this codebase. Hard-coding a guessed id would produce
 * a source that silently collects nothing. Only actors this project has verified
 * are defaulted; everything else must be configured, and an unconfigured source
 * is reported as `not_attempted` with a reason rather than quietly skipped.
 *
 * Never throws. A collector that crashes would take the audit with it; a
 * collector that fails reports coverage.
 */

import {
  runActorSync, APIFY_SYNC_MAX_SECONDS, type ApifyResult,
} from './apify-client';
import { mapDataset, type ApifyItem } from './apify-signals';
import {
  classifyFailure, coverageEntry, seedCoverage, makeDeadline, safeReason,
  type EnrichmentCollector, type CollectorRequest, type CollectorOutcome,
} from './enrichment-collector';
import { SOURCE_TYPES, type RawObservation, type SourceType } from './enrichment-evidence';
import type { CoverageEntry } from './enrichment-snapshot';

export const APIFY_COLLECTOR_VERSION = '1.0.0';

/** Dataset items pulled per source. Bounds both cost and worker memory. */
const MAX_ITEMS_PER_SOURCE = 50;
/** Floor below which starting another actor is pointless. */
const MIN_SOURCE_BUDGET_MS = 5000;
/**
 * Actor runs in flight at once.
 *
 * Each slot is a billable Apify run, so this is the blast radius of one customer
 * request. Five covers the whole Audit Express source list in a single wave;
 * deeper surfaces queue through the same slots rather than fanning out without
 * limit.
 */
export const MAX_CONCURRENT_SOURCES = 5;

/**
 * Actors verified as existing on the Apify marketplace at time of writing.
 *
 * `apify/website-content-crawler` is the only one defaulted, because it is the
 * only one this project has confirmed. Every other source type is intentionally
 * absent and must be supplied through APIFY_ACTORS.
 */
export const DEFAULT_ACTORS: Partial<Record<SourceType, string>> = {
  website:        'apify/website-content-crawler',
  subdomain:      'apify/website-content-crawler',
  privacy_policy: 'apify/website-content-crawler',
  terms:          'apify/website-content-crawler',
  dpa:            'apify/website-content-crawler',
  legal_page:     'apify/website-content-crawler',
  ai_policy:      'apify/website-content-crawler',
  processor_list: 'apify/website-content-crawler',
  documentation:  'apify/website-content-crawler',
  blog:           'apify/website-content-crawler',
};

export interface ApifyConfig {
  token:     string;
  actors:    Partial<Record<SourceType, string>>;
  memoryMb?: number;
}

/**
 * Parse the APIFY_ACTORS override.
 *
 * Shape: {"linkedin":"some/actor","youtube":"other/actor"}. Unknown source types
 * are ignored rather than rejected, so a config written for a future source type
 * cannot break today's audit.
 */
export function parseActorConfig(raw: string | undefined): Partial<Record<SourceType, string>> {
  if (!raw) return {};
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  const out: Partial<Record<SourceType, string>> = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof v !== 'string' || !v.trim()) continue;
    if ((SOURCE_TYPES as readonly string[]).includes(k)) out[k as SourceType] = v.trim();
  }
  return out;
}

/**
 * Config overrides defaults, so an operator can replace a retired actor without
 * a deploy.
 *
 * PRODUCTION REQUIRES ALL THREE VARIABLES. `DEFAULT_ACTORS` is explicitly
 * partial and `memoryMb` is unbounded when unset, so an incomplete configuration
 * means some source types silently have no collector while others run at
 * whatever Apify defaults to — and the platform pays for it. That is the same
 * silent-fallback shape as the plan products, which cost two days of live
 * debugging (§27.4c). In production, absence is fatal: this returns null, the
 * route answers NO_COLLECTOR_CONFIGURED, and nothing reaches the provider.
 *
 * Outside production the defaults stand, so a dev environment needs one token.
 */
export function buildApifyConfig(env: {
  APIFY_TOKEN?: string; APIFY_ACTORS?: string; APIFY_MEMORY_MB?: string; APP_ENV?: string;
}): ApifyConfig | null {
  const token = (env.APIFY_TOKEN ?? '').trim();
  if (!token) return null;

  const production = (env.APP_ENV ?? '').trim().toLowerCase() === 'production';
  const overrides  = parseActorConfig(env.APIFY_ACTORS);
  const memory     = Number.parseInt(env.APIFY_MEMORY_MB ?? '', 10);
  const memoryOk   = Number.isFinite(memory) && memory > 0;

  if (production && (Object.keys(overrides).length === 0 || !memoryOk)) return null;

  return {
    token,
    actors: { ...DEFAULT_ACTORS, ...overrides },
    memoryMb: memoryOk ? memory : undefined,
  };
}

/**
 * Where a source type is looked for on a domain.
 *
 * Legal surfaces get explicit path hints because a generic crawl often never
 * reaches /dpa or /sub-processors — and those pages carry the highest-value
 * evidence there is (§26.3).
 */
const PATH_HINTS: Partial<Record<SourceType, string[]>> = {
  privacy_policy: ['/privacy', '/privacy-policy', '/legal/privacy'],
  terms:          ['/terms', '/terms-of-service', '/legal/terms'],
  dpa:            ['/dpa', '/data-processing-agreement', '/legal/dpa'],
  processor_list: ['/subprocessors', '/sub-processors', '/legal/subprocessors'],
  ai_policy:      ['/ai-policy', '/responsible-ai', '/ai'],
  legal_page:     ['/legal'],
  documentation:  ['/docs', '/documentation'],
  blog:           ['/blog', '/news'],
};

/**
 * Which engine `apify/website-content-crawler` should use.
 *
 * MEASURED, NOT GUESSED (P2.2, run MPaEGDc56yvhbbWO6). The browser engine needs
 * ~1.9 GB and more than 28 s to fetch a handful of pages: it crawled 1 of 7
 * discovered URLs before the Audit Express deadline cut it off, after two
 * earlier configurations died at a 1 GB ceiling with exitCode 137.
 *
 * Audit Express is defined as the fast, cost-controlled tier (§26.15 D1), and a
 * headless browser is incompatible with that. It collects privacy policies,
 * terms, DPAs and processor lists — server-rendered documents where a browser
 * buys nothing. `cheerio` fetches over HTTP and parses HTML: seconds to start,
 * a fraction of the memory.
 *
 * The deeper tiers keep the browser, where JS-rendered content can matter.
 */
export function crawlerTypeFor(surface: string): 'cheerio' | 'playwright:adaptive' {
  return surface === 'audit_express' ? 'cheerio' : 'playwright:adaptive';
}

/** Deterministic actor input for a source type. */
export function buildActorInput(sourceType: SourceType, domain: string, surface = 'audit_express'): Record<string, unknown> {
  const root = `https://${domain}`;
  const hints = PATH_HINTS[sourceType];
  const startUrls = hints ? hints.map(p => ({ url: `${root}${p}` })) : [{ url: root }];
  return {
    startUrls,
    crawlerType: crawlerTypeFor(surface),
    maxCrawlPages: sourceType === 'website' || sourceType === 'subdomain' ? 20 : 5,
    // Same-domain only: this is the customer's own estate, never a link out to
    // someone else's site.
    maxCrawlDepth: sourceType === 'website' ? 2 : 1,
    saveMarkdown: true,
    saveHtml: false,
  };
}

/** HTTP result → coverage row, with truncation reported as partial. */
function coverageFor(
  sourceType: SourceType, at: string, r: ApifyResult<unknown> & { truncated?: boolean }, itemCount: number,
): CoverageEntry {
  if (!r.ok) {
    return coverageEntry(sourceType, 'apify', classifyFailure(r.status, r.error ?? ''), at,
      r.error ?? `HTTP ${r.status}`);
  }
  if (r.truncated) {
    return coverageEntry(sourceType, 'apify', 'partial', at, 'response exceeded the size cap');
  }
  if (itemCount === 0) {
    // Reached, read, nothing there. Distinct from "not attempted": the customer
    // learns the source was checked and was empty.
    return coverageEntry(sourceType, 'apify', 'succeeded', at, 'no content returned');
  }
  return coverageEntry(sourceType, 'apify', 'succeeded', at, '');
}

export class ApifyCollector implements EnrichmentCollector {
  readonly id = 'apify' as const;
  readonly version = APIFY_COLLECTOR_VERSION;

  constructor(private readonly config: ApifyConfig) {}

  async collect(req: CollectorRequest): Promise<CollectorOutcome> {
    const at = req.startedAt;
    const coverage = seedCoverage(req.sourceTypes, 'apify', at, 'not attempted');
    const observations: RawObservation[] = [];
    const deadline = makeDeadline(req.budgetMs, Date.now());

    if (!req.subjectDomain) {
      for (const st of req.sourceTypes) {
        coverage.set(st, coverageEntry(st, 'apify', 'not_attempted', at, 'no subject domain'));
      }
      return { collector: this.id, version: this.version, observations, coverage: [...coverage.values()] };
    }

    // Sources with no configured actor cost nothing and are settled up front, so
    // they never occupy a concurrency slot.
    const tasks: Array<{ sourceType: SourceType; actorId: string }> = [];
    for (const sourceType of req.sourceTypes) {
      const actorId = this.config.actors[sourceType];
      if (!actorId) {
        coverage.set(sourceType, coverageEntry(sourceType, 'apify', 'not_attempted', at,
          'no Apify actor configured for this source'));
        continue;
      }
      tasks.push({ sourceType, actorId });
    }

    /*
     * WHY CONCURRENT (P2.2). Sequential collection made the budget a queue: the
     * first source consumed the whole Audit Express allowance and the remaining
     * four reported 'collection budget exhausted' — an audit that only ever read
     * the homepage, while the legal surfaces that carry the compliance evidence
     * were never attempted. The sources are independent, so serialising them
     * bought nothing but latency.
     *
     * Bounded, not unlimited: each slot is a billable Apify run, and firing an
     * unbounded fan-out would turn one customer request into an unpredictable
     * number of simultaneous provider runs. The cap keeps the blast radius of a
     * single request equal to the number of sources it declared.
     */
    const perSource = new Map<SourceType, RawObservation[]>();
    let nextTask = 0;

    const worker = async (): Promise<void> => {
      for (;;) {
        const index = nextTask++;        // single-threaded event loop: safe
        if (index >= tasks.length) return;
        const { sourceType, actorId } = tasks[index];

        if (deadline.expired() || deadline.remaining() < MIN_SOURCE_BUDGET_MS) {
          // Budget exhausted is reported per remaining source, never as silence.
          coverage.set(sourceType, coverageEntry(sourceType, 'apify', 'not_attempted', at,
            'collection budget exhausted'));
          continue;
        }

        const remainingMs = deadline.remaining();
        const timeoutSeconds = Math.min(APIFY_SYNC_MAX_SECONDS, Math.max(1, Math.floor(remainingMs / 1000) - 2));

        let result: ApifyResult<ApifyItem[]> & { truncated?: boolean };
        try {
          result = await runActorSync<ApifyItem>(
            this.config.token, actorId, buildActorInput(sourceType, req.subjectDomain, req.surface),
            { timeoutSeconds, memoryMb: this.config.memoryMb, requestTimeoutMs: remainingMs },
          );
        } catch (err) {
          // Defensive: runActorSync already traps transport errors. A collector may
          // not throw, so an unexpected failure still becomes coverage. Inside a
          // worker this also stops one bad source from killing its siblings.
          coverage.set(sourceType, coverageEntry(sourceType, 'apify', 'unavailable', at, safeReason(err)));
          continue;
        }

        const items = (result.ok ? result.data ?? [] : []).slice(0, MAX_ITEMS_PER_SOURCE);
        coverage.set(sourceType, coverageFor(sourceType, at, result, items.length));
        if (!result.ok) continue;

        perSource.set(sourceType, mapDataset(items, { sourceType, collectorRunId: `apify:${actorId}` }));
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT_SOURCES, tasks.length) }, () => worker()),
    );

    // Observations follow the REQUESTED order, not the order runs happened to
    // finish. Evidence ids and the snapshot digest derive from this sequence, so
    // completion order must never leak into the artefact — the same domain must
    // produce the same snapshot whatever the network did that day (§26.6).
    for (const sourceType of req.sourceTypes) {
      const obs = perSource.get(sourceType);
      if (obs) observations.push(...obs);
    }

    return { collector: this.id, version: this.version, observations, coverage: [...coverage.values()] };
  }
}
