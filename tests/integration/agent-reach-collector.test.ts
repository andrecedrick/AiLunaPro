import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Phase 3 — Agent-Reach collector over the operator-hosted bridge.
 *
 * Agent-Reach is a Python CLI and cannot run inside a V8 isolate, so the
 * integration is an HTTP contract. These tests pin that contract and, more
 * importantly, pin the failure behaviour: a platform that refuses us must show up
 * in coverage, never as an audit that looks clean (§26.12).
 */

const state = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>() }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => state.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, d: Record<string, unknown>) => { state.docs.set(p, { ...d }); }),
  firestoreRunQuery: vi.fn(async () => []),
}));

import {
  AgentReachCollector, AGENT_REACH_COLLECTOR_VERSION, PLATFORM_MAP,
  AGENT_REACH_SOURCES, docText, docUrl,
} from '../../worker/src/lib/agent-reach-collector';
import { buildBridgeConfig } from '../../worker/src/lib/agent-reach-client';
import { runEnrichment } from '../../worker/src/lib/enrichment-pipeline';
import { verifySnapshotIntegrity } from '../../worker/src/lib/enrichment-snapshot';
import { ApifyCollector } from '../../worker/src/lib/apify-collector';
import type { CollectorRequest } from '../../worker/src/lib/enrichment-collector';
import type { SourceType } from '../../worker/src/lib/enrichment-evidence';

const NOW = new Date('2026-08-02T09:00:00.000Z');
const CFG = { url: 'https://bridge.example', token: 'tok' };
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
beforeEach(() => { state.docs.clear(); vi.clearAllMocks(); });

let lastBody: Record<string, unknown> | null = null;

function mockBridge(responses: Array<{ status: number; body: unknown }>) {
  let i = 0;
  lastBody = null;
  globalThis.fetch = vi.fn(async (_u: RequestInfo | URL, init?: RequestInit) => {
    lastBody = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : null;
    const r = responses[Math.min(i++, responses.length - 1)];
    return new Response(typeof r.body === 'string' ? r.body : JSON.stringify(r.body), { status: r.status });
  }) as typeof fetch;
}

const req = (sourceTypes: SourceType[], budgetMs = 60_000): CollectorRequest => ({
  orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
  sourceTypes, budgetMs, startedAt: NOW.toISOString(),
});

const REPO = { url: 'https://github.com/acme/svc', text: 'requirements.txt: torch, transformers, langchain' };
const TALK = { url: 'https://youtube.com/watch?v=1', title: 'Our stack', transcript: 'We run everything through OpenAI models in production.' };

describe('bridge configuration', () => {
  it('is null without a url or token, so the collector is never constructed blind', () => {
    expect(buildBridgeConfig({})).toBeNull();
    expect(buildBridgeConfig({ AGENT_REACH_URL: 'https://b.example' })).toBeNull();
    expect(buildBridgeConfig({ AGENT_REACH_TOKEN: 't' })).toBeNull();
  });

  it('REFUSES a plaintext bridge — it carries credentials and customer evidence', () => {
    expect(buildBridgeConfig({ AGENT_REACH_URL: 'http://b.example', AGENT_REACH_TOKEN: 't' })).toBeNull();
  });

  it('accepts https and strips a trailing slash', () => {
    expect(buildBridgeConfig({ AGENT_REACH_URL: 'https://b.example/', AGENT_REACH_TOKEN: 't' }))
      .toEqual({ url: 'https://b.example', token: 't' });
  });
});

describe('platform mapping', () => {
  it('claims the depth surfaces and leaves page surfaces to Apify', () => {
    expect(PLATFORM_MAP.github).toBe('github');
    expect(PLATFORM_MAP.youtube).toBe('youtube');
    expect(PLATFORM_MAP.linkedin).toBe('linkedin');
    // Two collectors crawling the same pages would double the cost to produce
    // one deduplicated observation.
    expect(PLATFORM_MAP.website).toBeUndefined();
    expect(PLATFORM_MAP.privacy_policy).toBeUndefined();
    expect(PLATFORM_MAP.dpa).toBeUndefined();
  });

  it('exposes the sources it claims', () => {
    expect(AGENT_REACH_SOURCES).toContain('github');
    expect(AGENT_REACH_SOURCES).not.toContain('website');
  });

  it('covers every source this phase requires', () => {
    for (const s of ['github', 'youtube', 'rss', 'blog', 'documentation',
      'linkedin', 'instagram', 'facebook', 'social', 'video', 'presentation'] as SourceType[]) {
      expect(PLATFORM_MAP[s]).toBeTruthy();
    }
  });

  it('reads blogs and documentation through the web path', () => {
    // Overlaps Apify by design: different routes to the same page, and Phase 2's
    // dedup means the same observation seen twice counts once.
    expect(PLATFORM_MAP.blog).toBe('web');
    expect(PLATFORM_MAP.documentation).toBe('web');
  });
});

describe('document text', () => {
  it('prefers a transcript when it is longer — the point of the video path', () => {
    expect(docText({ text: 'short title', transcript: 'a much longer spoken transcript body' }))
      .toBe('a much longer spoken transcript body');
  });

  it('falls back to text and tolerates junk', () => {
    expect(docText({ text: 'body' })).toBe('body');
    expect(docText({})).toBe('');
    expect(docUrl({ url: 42 })).toBe('');
  });
});

describe('collection — success', () => {
  it('reads a repository and detects an ML dependency', async () => {
    mockBridge([{ status: 200, body: { items: [REPO] } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['github']));
    expect(out.collector).toBe('agent_reach');
    expect(out.version).toBe(AGENT_REACH_COLLECTOR_VERSION);
    expect(out.observations.some(o => o.signalType === 'ai_repo_dependency')).toBe(true);
    expect(out.coverage[0]).toMatchObject({ sourceType: 'github', state: 'succeeded' });
  });

  it('detects a vendor named in a VIDEO TRANSCRIPT', async () => {
    // Evidence a website crawl will never find.
    mockBridge([{ status: 200, body: { items: [TALK] } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['youtube']));
    expect(out.observations.map(o => o.observedValue)).toContain('OpenAI');
    expect(out.observations[0].sourceUrl).toBe('https://youtube.com/watch?v=1');
  });

  it('sends the documented contract to the bridge', async () => {
    mockBridge([{ status: 200, body: { items: [] } }]);
    await new AgentReachCollector(CFG).collect(req(['linkedin']));
    expect(lastBody).toMatchObject({ platform: 'linkedin', target: 'acme.example' });
    expect(typeof lastBody!.maxItems).toBe('number');
  });

  it('tags every observation with the agent_reach collector and its platform run id', async () => {
    mockBridge([{ status: 200, body: { items: [REPO] } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['github']));
    expect(out.observations[0]).toMatchObject({ collector: 'agent_reach', collectorRunId: 'agent_reach:github' });
  });

  it('an empty read is SUCCEEDED with a reason, not a failure', async () => {
    mockBridge([{ status: 200, body: { items: [] } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['rss']));
    expect(out.coverage[0]).toMatchObject({ state: 'succeeded', reason: 'no content returned' });
  });

  it('surfaces a bridge note into coverage', async () => {
    mockBridge([{ status: 200, body: { items: [REPO], note: 'cookie expiring soon' } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['github']));
    expect(out.coverage[0].reason).toBe('cookie expiring soon');
  });
});

describe('collection — no silent failure', () => {
  it('a source Agent-Reach does not handle is reported, not skipped', async () => {
    mockBridge([{ status: 200, body: { items: [] } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['website', 'dpa']));
    expect(out.coverage).toHaveLength(2);
    for (const c of out.coverage) {
      expect(c.state).toBe('not_attempted');
      expect(c.reason).toContain('not handled by Agent-Reach');
    }
  });

  it('a rate-limited platform is distinguished from a blocked one', async () => {
    mockBridge([{ status: 429, body: { error: 'too many requests' } }]);
    expect((await new AgentReachCollector(CFG).collect(req(['linkedin']))).coverage[0].state).toBe('rate_limited');

    mockBridge([{ status: 403, body: { error: 'login required' } }]);
    expect((await new AgentReachCollector(CFG).collect(req(['instagram']))).coverage[0].state).toBe('blocked');
  });

  it('an EXPIRED CREDENTIAL shows as blocked, not as an empty platform', async () => {
    // The reliability risk recorded in §26.13: a stale cookie must never look
    // like "this company has no LinkedIn presence".
    mockBridge([{ status: 401, body: { error: 'linkedin session expired' } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['linkedin']));
    expect(out.coverage[0].state).toBe('blocked');
    expect(out.coverage[0].reason).toContain('expired');
    expect(out.observations).toEqual([]);
  });

  it('a bridge that is down becomes coverage, not a thrown audit', async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error('ECONNREFUSED'); }) as typeof fetch;
    const out = await new AgentReachCollector(CFG).collect(req(['github']));
    expect(out.coverage[0].state).toBe('unavailable');
  });

  it('a malformed 200 FAILS rather than reporting an empty platform', async () => {
    mockBridge([{ status: 200, body: { unexpected: true } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['github']));
    expect(out.coverage[0].state).not.toBe('succeeded');
    expect(out.coverage[0].reason).toContain('no items array');
  });

  it('unparseable JSON fails cleanly', async () => {
    mockBridge([{ status: 200, body: 'not json at all' }]);
    expect((await new AgentReachCollector(CFG).collect(req(['github']))).coverage[0].state)
      .not.toBe('succeeded');
  });

  it('a truncated reply is partial, never a complete read', async () => {
    mockBridge([{ status: 200, body: { items: [REPO], truncated: true } }]);
    expect((await new AgentReachCollector(CFG).collect(req(['github']))).coverage[0].state).toBe('partial');
  });

  it('an exhausted budget reports every remaining source', async () => {
    mockBridge([{ status: 200, body: { items: [REPO] } }]);
    const out = await new AgentReachCollector(CFG).collect(req(['github', 'youtube', 'linkedin'], 0));
    expect(out.coverage).toHaveLength(3);
    for (const c of out.coverage) expect(c.reason).toContain('budget');
  });

  it('a missing subject domain reports every source', async () => {
    mockBridge([{ status: 200, body: { items: [] } }]);
    const out = await new AgentReachCollector(CFG).collect({ ...req(['github']), subjectDomain: '' });
    expect(out.coverage[0]).toMatchObject({ state: 'not_attempted', reason: 'no subject domain' });
  });

  it('one failing platform does not stop the next', async () => {
    let call = 0;
    globalThis.fetch = vi.fn(async () => {
      call++;
      return call === 1
        ? new Response('{"error":"blocked"}', { status: 403 })
        : new Response(JSON.stringify({ items: [REPO] }), { status: 200 });
    }) as typeof fetch;
    const out = await new AgentReachCollector(CFG).collect(req(['linkedin', 'github']));
    const states = Object.fromEntries(out.coverage.map(c => [c.sourceType, c.state]));
    expect(states.linkedin).toBe('blocked');
    expect(states.github).toBe('succeeded');
    expect(out.observations.length).toBeGreaterThan(0);
  });
});

describe('pipeline — both collectors together', () => {
  it('merges Apify and Agent-Reach evidence into ONE verifiable snapshot', async () => {
    // Apify answers the page surface, the bridge answers the repository.
    globalThis.fetch = vi.fn(async (u: RequestInfo | URL) => {
      const url = String(u);
      if (url.includes('bridge.example')) {
        return new Response(JSON.stringify({ items: [REPO] }), { status: 200 });
      }
      return new Response(JSON.stringify([{ url: 'https://acme.example/dpa', text: 'Sub-processor: OpenAI, L.L.C.' }]), { status: 200 });
    }) as typeof fetch;

    const res = await runEnrichment({
      saJson: '{}', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
      collectors: [
        new ApifyCollector({ token: 't', actors: { dpa: 'apify/website-content-crawler' } }),
        new AgentReachCollector(CFG),
      ],
      now: NOW, sourceTypes: ['dpa', 'github'], budgetMs: 60_000,
    });

    expect(res.stored).toBe(true);
    expect(await verifySnapshotIntegrity(res.snapshot)).toBe(true);
    const collectors = new Set(res.snapshot.evidence.map(e => e.collector));
    expect(collectors.has('apify')).toBe(true);
    expect(collectors.has('agent_reach')).toBe(true);
    expect(res.snapshot.collectorVersions.agent_reach).toBe(AGENT_REACH_COLLECTOR_VERSION);
  });

  it('produces NO findings and NO scores — collection only', async () => {
    mockBridge([{ status: 200, body: { items: [REPO] } }]);
    const res = await runEnrichment({
      saJson: '{}', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
      collectors: [new AgentReachCollector(CFG)], now: NOW, sourceTypes: ['github'], budgetMs: 60_000,
    });
    expect(res.snapshot).not.toHaveProperty('findings');
    expect(res.snapshot).not.toHaveProperty('score');
  });

  it('a blocked social platform makes the whole audit INCOMPLETE', async () => {
    mockBridge([{ status: 403, body: { error: 'blocked' } }]);
    const res = await runEnrichment({
      saJson: '{}', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
      collectors: [new AgentReachCollector(CFG)], now: NOW, sourceTypes: ['linkedin'], budgetMs: 60_000,
    });
    expect(res.coverage.complete).toBe(false);
    expect(res.coverage.blocked).toBe(1);
    expect(res.coverage.missing.map(m => m.sourceType)).toEqual(['linkedin']);
  });

  it('is deterministic — identical runs yield the same digest', async () => {
    mockBridge([{ status: 200, body: { items: [REPO] } }]);
    const run = () => runEnrichment({
      saJson: '{}', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
      collectors: [new AgentReachCollector(CFG)], now: NOW, sourceTypes: ['github'], budgetMs: 60_000,
    });
    const a = await run();
    mockBridge([{ status: 200, body: { items: [REPO] } }]);
    const b = await run();
    expect(a.snapshot.digest).toBe(b.snapshot.digest);
    expect(a.snapshot.snapshotId).not.toBe(b.snapshot.snapshotId);
  });
});
