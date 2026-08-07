import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * Concurrent source collection (P2.2 follow-up).
 *
 * THE BUG THIS FIXES. Sequential collection made the budget a queue: on the
 * first successful live run (snap_YVaTM56Wi-dQeSrLyY5YYg) the website source
 * consumed the whole 30-second Audit Express allowance and dpa, privacy_policy,
 * processor_list and terms all reported 'collection budget exhausted'. The audit
 * read the homepage and never attempted the legal surfaces that carry the
 * compliance evidence.
 *
 * The sources are independent, so serialising them bought nothing but latency.
 * These tests pin the properties that must survive the change: every source
 * still gets a coverage row, observation order stays deterministic, one failing
 * source cannot take down its siblings, and the fan-out stays bounded.
 */

const apify = vi.hoisted(() => ({
  inFlight: 0,
  maxInFlight: 0,
  calls: [] as string[],
  /** Per-source behaviour: delay in ms, and what to return. */
  behaviour: new Map<string, { delayMs?: number; ok?: boolean; throws?: boolean; items?: number }>(),
}));

vi.mock('../../worker/src/lib/apify-client', () => ({
  APIFY_SYNC_MAX_SECONDS: 300,
  runActorSync: vi.fn(async (_token: string, _actorId: string, input: { startUrls: Array<{ url: string }> }) => {
    // The source is identifiable from the start URL path hints.
    const url = input.startUrls[0]?.url ?? '';
    const key = apify.calls.length.toString();
    apify.calls.push(url);
    apify.inFlight += 1;
    apify.maxInFlight = Math.max(apify.maxInFlight, apify.inFlight);
    const b = apify.behaviour.get(url) ?? {};
    try {
      if (b.delayMs) await new Promise(r => setTimeout(r, b.delayMs));
      if (b.throws) throw new Error('transport exploded');
      const n = b.items ?? 1;
      return {
        ok: b.ok !== false,
        status: b.ok === false ? 500 : 200,
        // Text must carry a detectable signal: mapDataset yields OBSERVATIONS,
        // not raw pages, so filler text maps to nothing.
        data: Array.from({ length: n }, (_, i) => ({
          url: `${url}#${i}`, text: `Page ${key}. We use OpenAI to process support requests.`,
        })),
      };
    } finally {
      apify.inFlight -= 1;
    }
  }),
}));

import { ApifyCollector, MAX_CONCURRENT_SOURCES } from '../../worker/src/lib/apify-collector';
import type { SourceType } from '../../worker/src/lib/enrichment-evidence';

const ACTORS = {
  website: 'a/w', privacy_policy: 'a/p', terms: 'a/t', dpa: 'a/d', processor_list: 'a/pl',
} as Partial<Record<SourceType, string>>;

const SOURCES: SourceType[] = ['website', 'privacy_policy', 'terms', 'dpa', 'processor_list'];

const collect = (sourceTypes: SourceType[] = SOURCES, budgetMs = 30_000) =>
  new ApifyCollector({ token: 't', actors: ACTORS, memoryMb: 1024 }).collect({
    orgId: 'orgA', subjectDomain: 'example.com', surface: 'audit_express',
    sourceTypes, budgetMs, startedAt: '2026-08-07T21:29:04.700Z',
  });

const stateOf = (out: Awaited<ReturnType<typeof collect>>, st: string) =>
  out.coverage.find(c => c.sourceType === st)?.state;

beforeEach(() => {
  apify.inFlight = 0; apify.maxInFlight = 0; apify.calls = []; apify.behaviour.clear();
});

describe('sources run concurrently', () => {
  it('attempts every source instead of starving the later ones', async () => {
    /*
     * Reproduces the live failure. Budget 9 s, each source 3 s:
     *   sequential — run 1 ends at 3 s, run 2 at 6 s, then only 3 s remain,
     *                below MIN_SOURCE_BUDGET_MS, so three sources are starved;
     *   concurrent — all five start at once and finish together at 3 s.
     * The delays are real, so this test costs ~3 s. That is the price of a test
     * that actually fails when the fix is reverted.
     */
    for (const p of ['', '/privacy', '/terms', '/dpa', '/subprocessors']) {
      apify.behaviour.set(`https://example.com${p}`, { delayMs: 3_000 });
    }
    const out = await collect(SOURCES, 9_000);
    expect(apify.calls.length).toBe(5);
    expect(out.coverage.every(c => c.state !== 'not_attempted')).toBe(true);
  }, 20_000);

  it('actually overlaps — more than one run is in flight at once', async () => {
    for (const p of ['', '/privacy', '/terms', '/dpa', '/subprocessors']) {
      apify.behaviour.set(`https://example.com${p}`, { delayMs: 20 });
    }
    await collect();
    expect(apify.maxInFlight).toBeGreaterThan(1);
  });

  it('never exceeds the configured fan-out — each slot is a billable run', async () => {
    const many: SourceType[] = ['website', 'privacy_policy', 'terms', 'dpa', 'processor_list'];
    for (const p of ['', '/privacy', '/terms', '/dpa', '/subprocessors']) {
      apify.behaviour.set(`https://example.com${p}`, { delayMs: 15 });
    }
    await collect(many);
    expect(apify.maxInFlight).toBeLessThanOrEqual(MAX_CONCURRENT_SOURCES);
  });
});

describe('the snapshot stays deterministic', () => {
  it('orders observations by REQUESTED source, not by completion', async () => {
    // Evidence ids and the snapshot digest derive from this sequence, so the
    // same domain must produce the same snapshot whatever the network did.
    apify.behaviour.set('https://example.com', { delayMs: 40 });          // website: slowest
    apify.behaviour.set('https://example.com/privacy', { delayMs: 1 });   // finishes first
    apify.behaviour.set('https://example.com/terms', { delayMs: 5 });
    apify.behaviour.set('https://example.com/dpa', { delayMs: 2 });
    apify.behaviour.set('https://example.com/subprocessors', { delayMs: 3 });

    const out = await collect();
    const order = out.observations.map(o => o.sourceType);
    const firstIndexOf = (st: string) => order.indexOf(st);

    expect(firstIndexOf('website')).toBeLessThan(firstIndexOf('privacy_policy'));
    expect(firstIndexOf('privacy_policy')).toBeLessThan(firstIndexOf('terms'));
    expect(firstIndexOf('terms')).toBeLessThan(firstIndexOf('dpa'));
    expect(firstIndexOf('dpa')).toBeLessThan(firstIndexOf('processor_list'));
  });

  it('produces the same observation order across repeated runs', async () => {
    apify.behaviour.set('https://example.com', { delayMs: 30 });
    apify.behaviour.set('https://example.com/privacy', { delayMs: 1 });
    const a = (await collect()).observations.map(o => o.sourceType);
    apify.calls = [];
    const b = (await collect()).observations.map(o => o.sourceType);
    expect(a).toEqual(b);
  });
});

describe('coverage reporting is preserved', () => {
  it('gives every source a row, whatever happened to it', async () => {
    const out = await collect();
    expect(out.coverage).toHaveLength(SOURCES.length);
    for (const st of SOURCES) expect(stateOf(out, st)).toBeDefined();
  });

  it('reports a source with no configured actor without spending a slot', async () => {
    const out = await new ApifyCollector({ token: 't', actors: { website: 'a/w' }, memoryMb: 1024 })
      .collect({
        orgId: 'orgA', subjectDomain: 'example.com', surface: 'audit_express',
        sourceTypes: SOURCES, budgetMs: 30_000, startedAt: '2026-08-07T21:29:04.700Z',
      });
    expect(apify.calls.length).toBe(1);                     // only the configured one ran
    expect(stateOf(out, 'terms')).toBe('not_attempted');
    expect(out.coverage.find(c => c.sourceType === 'terms')?.reason)
      .toContain('no Apify actor configured');
  });

  it('still reports budget exhaustion rather than silence', async () => {
    const out = await collect(SOURCES, 0);                  // no budget at all
    expect(apify.calls.length).toBe(0);
    expect(out.coverage.every(c => c.state === 'not_attempted')).toBe(true);
    expect(out.coverage.every(c => (c.reason ?? '').includes('budget exhausted'))).toBe(true);
  });

  it('reports a missing subject domain for every source', async () => {
    const out = await new ApifyCollector({ token: 't', actors: ACTORS, memoryMb: 1024 }).collect({
      orgId: 'orgA', subjectDomain: '', surface: 'audit_express',
      sourceTypes: SOURCES, budgetMs: 30_000, startedAt: '2026-08-07T21:29:04.700Z',
    });
    expect(apify.calls.length).toBe(0);
    expect(out.coverage.every(c => c.state === 'not_attempted')).toBe(true);
  });
});

describe('one bad source cannot take down its siblings', () => {
  it('isolates a throwing source and still collects the rest', async () => {
    apify.behaviour.set('https://example.com/privacy', { throws: true });
    const out = await collect();
    expect(stateOf(out, 'privacy_policy')).toBe('unavailable');
    expect(stateOf(out, 'website')).toBe('succeeded');
    expect(out.observations.length).toBeGreaterThan(0);
  });

  it('isolates a failed run and still collects the rest', async () => {
    apify.behaviour.set('https://example.com/terms', { ok: false });
    const out = await collect();
    expect(stateOf(out, 'terms')).not.toBe('succeeded');
    expect(stateOf(out, 'website')).toBe('succeeded');
  });

  it('never rejects — a collector must return coverage, not throw', async () => {
    for (const p of ['', '/privacy', '/terms', '/dpa', '/subprocessors']) {
      apify.behaviour.set(`https://example.com${p}`, { throws: true });
    }
    await expect(collect()).resolves.toBeDefined();
  });
});
