import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Phase 2 — Apify collector + snapshot ingestion pipeline.
 *
 * The properties under test are the failure properties. Collection is a
 * best-effort activity against third-party platforms; what must never happen is
 * an audit that looks clean because a collector was blocked (§26.12).
 */

const state = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>() }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => state.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, d: Record<string, unknown>) => { state.docs.set(p, { ...d }); }),
  firestoreRunQuery: vi.fn(async () => []),
}));

import { ApifyCollector, APIFY_COLLECTOR_VERSION } from '../../worker/src/lib/apify-collector';
import { runEnrichment, SURFACE_SOURCES, SURFACE_BUDGET_MS } from '../../worker/src/lib/enrichment-pipeline';
import { verifySnapshotIntegrity } from '../../worker/src/lib/enrichment-snapshot';
import type { EnrichmentCollector, CollectorRequest } from '../../worker/src/lib/enrichment-collector';
import type { SourceType } from '../../worker/src/lib/enrichment-evidence';

const NOW = new Date('2026-08-02T09:00:00.000Z');
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
beforeEach(() => { state.docs.clear(); vi.clearAllMocks(); });

/** Fake Apify: one queued response per actor call. */
function mockApify(responses: Array<{ status: number; body: unknown }>) {
  let i = 0;
  globalThis.fetch = vi.fn(async () => {
    const r = responses[Math.min(i++, responses.length - 1)];
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as typeof fetch;
}

const collectorFor = (actors: Partial<Record<SourceType, string>>) =>
  new ApifyCollector({ token: 'tok', actors });

const req = (sourceTypes: SourceType[], budgetMs = 60_000): CollectorRequest => ({
  orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
  sourceTypes, budgetMs, startedAt: NOW.toISOString(),
});

const PAGE = { url: 'https://acme.example/dpa', text: 'Sub-processor: OpenAI, L.L.C. and Anthropic PBC.' };

describe('Apify collector — success', () => {
  it('collects observations and marks the source succeeded', async () => {
    mockApify([{ status: 201, body: [PAGE] }]);
    const out = await collectorFor({ dpa: 'apify/website-content-crawler' }).collect(req(['dpa']));
    expect(out.collector).toBe('apify');
    expect(out.version).toBe(APIFY_COLLECTOR_VERSION);
    expect(out.observations.map(o => o.observedValue)).toContain('OpenAI');
    expect(out.coverage).toHaveLength(1);
    expect(out.coverage[0]).toMatchObject({ sourceType: 'dpa', state: 'succeeded' });
  });

  it('an empty dataset is SUCCEEDED with a reason, not a failure', async () => {
    // Reached, read, nothing there — the customer learns it was checked.
    mockApify([{ status: 200, body: [] }]);
    const out = await collectorFor({ website: 'a/b' }).collect(req(['website']));
    expect(out.coverage[0]).toMatchObject({ state: 'succeeded', reason: 'no content returned' });
    expect(out.observations).toEqual([]);
  });
});

describe('Apify collector — no silent failure', () => {
  it('an UNCONFIGURED source is reported, never skipped', async () => {
    mockApify([{ status: 200, body: [] }]);
    const out = await collectorFor({}).collect(req(['linkedin', 'instagram']));
    expect(out.coverage.map(c => c.sourceType).sort()).toEqual(['instagram', 'linkedin']);
    for (const c of out.coverage) {
      expect(c.state).toBe('not_attempted');
      expect(c.reason).toContain('no Apify actor configured');
    }
  });

  it('maps 429 to rate_limited and 403 to blocked', async () => {
    mockApify([{ status: 429, body: { error: { type: 'rate-limit', message: 'too many requests' } } }]);
    expect((await collectorFor({ website: 'a/b' }).collect(req(['website']))).coverage[0].state).toBe('rate_limited');

    mockApify([{ status: 403, body: { error: { type: 'forbidden', message: 'nope' } } }]);
    expect((await collectorFor({ website: 'a/b' }).collect(req(['website']))).coverage[0].state).toBe('blocked');
  });

  it('a transport failure becomes coverage, not a thrown audit', async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error('connection reset'); }) as typeof fetch;
    const out = await collectorFor({ website: 'a/b' }).collect(req(['website']));
    expect(out.coverage[0].state).toBe('unavailable');
    expect(out.observations).toEqual([]);
  });

  it('a non-array dataset fails rather than collecting nothing quietly', async () => {
    mockApify([{ status: 200, body: { unexpected: true } }]);
    const out = await collectorFor({ website: 'a/b' }).collect(req(['website']));
    expect(out.coverage[0].state).not.toBe('succeeded');
  });

  it('an exhausted budget reports every remaining source', async () => {
    mockApify([{ status: 200, body: [PAGE] }]);
    const out = await collectorFor({ website: 'a/b', dpa: 'a/b', terms: 'a/b' })
      .collect(req(['website', 'dpa', 'terms'], 0));
    expect(out.coverage).toHaveLength(3);
    for (const c of out.coverage) {
      expect(c.state).toBe('not_attempted');
      expect(c.reason).toContain('budget');
    }
  });

  it('a missing subject domain reports every source rather than crawling nothing', async () => {
    mockApify([{ status: 200, body: [] }]);
    const out = await collectorFor({ website: 'a/b' })
      .collect({ ...req(['website']), subjectDomain: '' });
    expect(out.coverage[0]).toMatchObject({ state: 'not_attempted', reason: 'no subject domain' });
  });

  it('one failing source does not stop the others', async () => {
    let call = 0;
    globalThis.fetch = vi.fn(async () => {
      call++;
      return call === 1
        ? new Response('{"error":{"message":"boom"}}', { status: 500 })
        : new Response(JSON.stringify([PAGE]), { status: 200 });
    }) as typeof fetch;

    const out = await collectorFor({ website: 'a/b', dpa: 'a/b' }).collect(req(['website', 'dpa']));
    const states = Object.fromEntries(out.coverage.map(c => [c.sourceType, c.state]));
    expect(states.website).toBe('unavailable');
    expect(states.dpa).toBe('succeeded');
    expect(out.observations.length).toBeGreaterThan(0);
  });
});

describe('pipeline — ingestion', () => {
  const run = (collectors: EnrichmentCollector[], surface = 'full_audit', sourceTypes?: SourceType[]) =>
    runEnrichment({
      saJson: '{}', orgId: 'orgA', subjectDomain: 'acme.example', surface,
      collectors, now: NOW, sourceTypes, budgetMs: 60_000,
    });

  it('freezes collector output into a stored, verifiable snapshot', async () => {
    mockApify([{ status: 200, body: [PAGE] }]);
    const res = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);

    expect(res.stored).toBe(true);
    expect(res.snapshot.evidence.length).toBeGreaterThan(0);
    expect(await verifySnapshotIntegrity(res.snapshot)).toBe(true);
    expect(res.snapshot.collectorVersions.apify).toBe(APIFY_COLLECTOR_VERSION);
    expect([...state.docs.keys()][0]).toMatch(/^organizations\/orgA\/enrichment_snapshots\/snap_/);
  });

  it('produces NO findings and NO scores — collection only', async () => {
    mockApify([{ status: 200, body: [PAGE] }]);
    const res = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);
    // Phase 2 stops at evidence. Anything resembling a verdict belongs to later phases.
    expect(res.snapshot).not.toHaveProperty('findings');
    expect(res.snapshot).not.toHaveProperty('score');
    expect(res.snapshot.evidence[0]).not.toHaveProperty('finding');
  });

  it('records every evidence item with its full provenance', async () => {
    mockApify([{ status: 200, body: [PAGE] }]);
    const res = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);
    const e = res.snapshot.evidence[0];
    expect(e.sourceUrl).toBeTruthy();
    expect(e.capturedAt).toBe(NOW.toISOString());
    expect(e.collector).toBe('apify');
    expect(e.confidence).toBeTruthy();
    expect(e.capturedEvidence).toBeTruthy();
    expect(e.evidenceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(res.snapshot.snapshotId).toBeTruthy();
  });

  it('a COLLECTOR THAT THROWS becomes coverage, not a lost audit', async () => {
    const exploding: EnrichmentCollector = {
      id: 'apify', version: 'x',
      collect: async () => { throw new Error('collector exploded'); },
    };
    const res = await run([exploding], 'full_audit', ['website', 'dpa']);
    expect(res.snapshot.coverage).toHaveLength(2);
    for (const c of res.snapshot.coverage) expect(c.state).toBe('unavailable');
    expect(res.coverage.complete).toBe(false);
  });

  it('one collector failing does not deprive the audit of another', async () => {
    mockApify([{ status: 200, body: [PAGE] }]);
    const working = collectorFor({ dpa: 'a/b' });
    const broken: EnrichmentCollector = {
      id: 'agent_reach', version: 'y',
      collect: async () => { throw new Error('down'); },
    };
    const res = await run([working, broken], 'full_audit', ['dpa']);
    expect(res.snapshot.evidence.length).toBeGreaterThan(0);
    expect(res.snapshot.coverage.some(c => c.collector === 'agent_reach' && c.state === 'unavailable')).toBe(true);
  });

  it('coverage marks the audit INCOMPLETE when a source was blocked', async () => {
    mockApify([{ status: 403, body: { error: { message: 'no' } } }]);
    const res = await run([collectorFor({ linkedin: 'a/b' })], 'full_audit', ['linkedin']);
    expect(res.coverage.complete).toBe(false);
    expect(res.coverage.blocked).toBe(1);
    expect(res.coverage.missing.map(m => m.sourceType)).toEqual(['linkedin']);
  });

  it('counts observations rejected for carrying no usable evidence', async () => {
    // An item whose text yields a match but whose URL is missing cannot become
    // evidence; it is counted rather than hidden.
    mockApify([{ status: 200, body: [{ text: 'We use OpenAI' }, PAGE] }]);
    const res = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);
    expect(res.snapshot.evidence.length).toBeGreaterThan(0);
    expect(res.rejected).toBe(0);   // discarded before mapping, not after
  });

  it('a storage failure still returns the snapshot and says so', async () => {
    const { firestoreSet } = await import('../../worker/src/lib/firestoreAdmin');
    vi.mocked(firestoreSet).mockRejectedValueOnce(new Error('firestore down'));
    mockApify([{ status: 200, body: [PAGE] }]);
    const res = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);
    // The collection already cost money; discarding it would waste that silently.
    expect(res.stored).toBe(false);
    expect(res.storeError).toContain('firestore');
    expect(res.snapshot.evidence.length).toBeGreaterThan(0);
  });

  it('is deterministic — two identical runs yield the same digest', async () => {
    mockApify([{ status: 200, body: [PAGE] }]);
    const a = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);
    mockApify([{ status: 200, body: [PAGE] }]);
    const b = await run([collectorFor({ dpa: 'a/b' })], 'full_audit', ['dpa']);
    expect(a.snapshot.digest).toBe(b.snapshot.digest);
    // Different runs, same evidence: distinct ids, identical digest.
    expect(a.snapshot.snapshotId).not.toBe(b.snapshot.snapshotId);
  });
});

describe('surface depth (cahier §26.15 D1)', () => {
  it('Audit Express stays narrow and fast', async () => {
    expect(SURFACE_SOURCES.audit_express.length).toBeLessThan(SURFACE_SOURCES.full_audit.length);
    expect(SURFACE_BUDGET_MS.audit_express).toBeLessThan(SURFACE_BUDGET_MS.full_audit);
  });

  it('Full Audit covers the social surfaces', async () => {
    for (const s of ['linkedin', 'instagram', 'facebook', 'youtube', 'github']) {
      expect(SURFACE_SOURCES.full_audit).toContain(s);
    }
  });

  it('an unknown surface falls back to the cheapest tier rather than the widest', async () => {
    mockApify([{ status: 200, body: [] }]);
    const res = await runEnrichment({
      saJson: '{}', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'unknown_surface',
      collectors: [collectorFor({})], now: NOW,
    });
    expect(res.snapshot.coverage).toHaveLength(SURFACE_SOURCES.audit_express.length);
  });
});
