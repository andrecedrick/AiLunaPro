import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Phase 7 — end-to-end certification of the Audit Enrichment Engine.
 *
 * Phases 1-6 each proved their own layer against hand-built inputs. What was
 * never proven is that the layers fit together: that a byte fetched by a
 * collector survives extraction, hashing, freezing, storage, reload, comparison,
 * judgement, assembly and rendering, and still arrives on a page attached to the
 * URL it came from.
 *
 * So NOTHING here is hand-constructed downstream of the collectors. Both
 * collectors run for real against a faked HTTP layer, and every later stage
 * consumes only what the previous stage actually produced:
 *
 *   Apify + Agent-Reach -> Evidence -> Snapshot -> stored -> reloaded
 *     -> Observed vs Declared -> Findings -> Report view -> PDF
 *
 * The failure cases matter as much as the happy path. An audit that looks clean
 * because a collector was blocked is worse than no audit at all (§26.12).
 */

const state = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>() }));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => state.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, d: Record<string, unknown>) => { state.docs.set(p, { ...d }); }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string }>)[0];
    return [...state.docs.entries()]
      .filter(([p]) => p.startsWith(`${parent}/${from.collectionId}/`))
      .map(([name, fields]) => ({ name, fields }));
  }),
}));

import { ApifyCollector } from '../../worker/src/lib/apify-collector';
import { AgentReachCollector } from '../../worker/src/lib/agent-reach-collector';
import { runEnrichment } from '../../worker/src/lib/enrichment-pipeline';
import { loadEnrichmentReport } from '../../worker/src/lib/enrichment-report';
import { hashEvidence } from '../../worker/src/lib/enrichment-evidence';
import { verifySnapshotIntegrity } from '../../worker/src/lib/enrichment-snapshot';
import { buildReportPdf } from '../../worker/src/lib/report-pdf';
import { buildAuditExpressPdf } from '../../worker/src/lib/audit-express-pdf';
import { computeAuditResult } from '../../worker/src/lib/audit-scoring';
import { computePreview } from '../../worker/src/lib/audit-express-preview';

const NOW = new Date('2026-08-02T09:00:00.000Z');
const ORG = 'orgA';
const DOMAIN = 'acme.example';
const SNAPSHOT_PATH = (id: string) => `organizations/${ORG}/enrichment_snapshots/${id}`;

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

/* ── The faked outside world ────────────────────────────────────────── */

/** A DPA naming a processor the customer never registered. Shadow AI, contractual. */
const DPA_PAGE = {
  url: `https://${DOMAIN}/dpa`,
  text: 'Annex III - Sub-processors. Anthropic PBC processes support conversation data on our behalf.',
};
/** A public repo pulling an AI dependency. Weaker evidence, still a deployment signal. */
const REPO_DOC = {
  url: 'https://github.com/acme/support-svc',
  text: 'requirements.txt: fastapi, langchain, openai==1.30.0',
};

/**
 * Route by host, the way the real thing does: Apify and the Agent-Reach bridge
 * are separate services, and a single queued-response mock would silently let one
 * collector consume the other's reply.
 */
function mockWorld(opts: { linkedInStatus?: number } = {}) {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.includes('apify.com')) return new Response(JSON.stringify([DPA_PAGE]), { status: 201 });

    if (url.includes('bridge.example')) {
      const body = init?.body ? JSON.parse(String(init.body)) as { platform?: string } : {};
      // LinkedIn refuses anonymous reads. That has to reach the report.
      if (body.platform === 'linkedin') {
        return new Response(JSON.stringify({ error: 'login required' }), { status: opts.linkedInStatus ?? 403 });
      }
      if (body.platform === 'github') return new Response(JSON.stringify({ items: [REPO_DOC] }), { status: 200 });
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    }
    throw new Error(`unexpected host: ${url}`);
  }) as typeof fetch;
}

const collectors = () => [
  new ApifyCollector({ token: 'apify-tok', actors: { dpa: 'apify/website-content-crawler' } }),
  new AgentReachCollector({ url: 'https://bridge.example', token: 'bridge-tok' }),
];

const registry = (id: string, f: Record<string, unknown>) =>
  state.docs.set(`organizations/${ORG}/registry/${id}`, {
    id, organizationId: ORG, name: '', vendor: '', department: 'IT',
    riskLevel: 'limited', status: 'active', ...f,
  });

/** One real collection run. Nothing downstream is hand-built. */
const collect = (surface = 'full_audit') => runEnrichment({
  saJson: '{}', orgId: ORG, subjectDomain: DOMAIN, surface,
  collectors: collectors(), now: NOW,
  sourceTypes: ['dpa', 'github', 'linkedin'],
});

beforeEach(() => { state.docs.clear(); vi.clearAllMocks(); mockWorld(); });

/* ── 1 · Collection -> evidence ─────────────────────────────────────── */

describe('Apify and Agent-Reach into evidence', () => {
  it('turns two live collector reads into attributed evidence', async () => {
    const run = await collect();
    const bySource = new Map(run.snapshot.evidence.map(e => [e.sourceType, e]));

    expect(bySource.get('dpa')).toMatchObject({
      collector: 'apify', signalType: 'ai_processor_named',
      observedValue: 'Anthropic', sourceUrl: `https://${DOMAIN}/dpa`, confidence: 'high',
    });
    expect(run.snapshot.evidence.some(e =>
      e.collector === 'agent_reach' && e.signalType === 'ai_repo_dependency')).toBe(true);
    // Every item carries the run that produced it — a claim must trace to code.
    for (const e of run.snapshot.evidence) expect(e.collectorRunId).toBeTruthy();
    expect(run.snapshot.collectorVersions).toMatchObject({ apify: '1.0.0', agent_reach: '1.0.0' });
  });

  it('captures the excerpt, not just the URL, and hashes what it captured', async () => {
    const run = await collect();
    const dpa = run.snapshot.evidence.find(e => e.sourceType === 'dpa')!;
    expect(dpa.capturedEvidence).toContain('Anthropic PBC');
    expect(dpa.evidenceHash).toBe(await hashEvidence(dpa.capturedEvidence));
  });

  it('a blocked platform reaches coverage instead of vanishing', async () => {
    const run = await collect();
    const linkedin = run.snapshot.coverage.find(c => c.sourceType === 'linkedin')!;
    expect(linkedin).toMatchObject({ collector: 'agent_reach', state: 'blocked' });
    expect(run.coverage.complete).toBe(false);
  });
});

/* ── 2 · Snapshot -> storage -> reload ──────────────────────────────── */

describe('snapshot integrity across storage', () => {
  it('stores and reloads without altering the evidence', async () => {
    const run = await collect();
    expect(run.stored).toBe(true);
    expect(await verifySnapshotIntegrity(run.snapshot)).toBe(true);

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.view.integrityVerified).toBe(true);
    expect(loaded.view.digest).toBe(run.snapshot.digest);
  });

  it('REFUSES a snapshot whose metadata was altered after freezing', async () => {
    const run = await collect();
    const stored = state.docs.get(SNAPSHOT_PATH(run.snapshot.snapshotId))!;
    stored.evidenceJson = (stored.evidenceJson as string).replace('"observedValue":"Anthropic"', '"observedValue":"OpenAI"');

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    expect(loaded).toEqual({ ok: false, reason: 'INTEGRITY_FAILED' });
  });

  it('REFUSES a snapshot whose quoted excerpt was altered', async () => {
    // The digest covers the evidence hash, not the excerpt text. A report that
    // quotes the excerpt beside that hash has to check the text itself.
    const run = await collect();
    const stored = state.docs.get(SNAPSHOT_PATH(run.snapshot.snapshotId))!;
    stored.evidenceJson = (stored.evidenceJson as string).replace('Anthropic PBC processes', 'Nobody processes');

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    expect(loaded).toEqual({ ok: false, reason: 'INTEGRITY_FAILED' });
  });
});

/* ── 3 · Observed vs Declared -> findings ───────────────────────────── */

describe('gap and Shadow AI detection on collected evidence', () => {
  it('detects the contracted processor the registry never recorded', async () => {
    const run = await collect();
    registry('s1', { name: 'Support bot', vendor: 'OpenAI' });

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const shadow = loaded.view.findings.find(f => f.subject === 'Anthropic')!;
    expect(shadow).toMatchObject({ ruleId: 'CF-001', riskLevel: 'high', gapKind: 'undeclared_system' });
    expect(shadow.scoreImpact).toBe(15);
    // The chain holds: the finding names evidence that names the page it came from.
    expect(shadow.evidence[0].sourceUrl).toBe(`https://${DOMAIN}/dpa`);
  });

  it('does NOT accuse the customer over a vendor they did declare', async () => {
    const run = await collect();
    registry('s1', { vendor: 'Claude' });   // alias of Anthropic
    registry('s2', { vendor: 'ChatGPT' });  // alias of OpenAI

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');
    expect(loaded.view.findings.filter(f => f.gapKind === 'undeclared_system')).toEqual([]);
    expect(loaded.view.totalImpact).toBe(0);
  });

  it('NEVER accuses the customer of failing to declare a category', async () => {
    // The repo read matches a library the detector recognises without
    // recognising a vendor, so the observation is labelled "AI/ML dependency".
    // That is a category, not a system: nobody can add it to a registry, and a
    // finding demanding it would be unactionable and wrong.
    const run = await collect();
    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');

    expect(loaded.view.findings.map(f => f.subject)).not.toContain('AI/ML dependency');
    expect(loaded.view.observedSystems.map(o => o.name)).not.toContain('AI/ML dependency');
    // Still retained as evidence — it was genuinely observed.
    expect(run.snapshot.evidence.some(e => e.observedValue === 'AI/ML dependency')).toBe(true);
  });

  it('reports an unverifiable registry entry without scoring it', async () => {
    const run = await collect();
    registry('broken', { name: '', vendor: '' });

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');
    const incomplete = loaded.view.findings.find(f => f.ruleId === 'CF-005')!;
    expect(incomplete).toMatchObject({ riskLevel: 'medium', scoreImpact: 0 });
  });

  it('every finding arrives with a recommendation and a rule id', async () => {
    const run = await collect();
    registry('s1', { vendor: 'internal-model' });

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');
    expect(loaded.view.findings.length).toBeGreaterThan(0);
    for (const f of loaded.view.findings) {
      expect(f.ruleId).toMatch(/^CF-\d{3}$/);
      expect(f.recommendation.length).toBeGreaterThan(40);
      expect(f.riskLevel).toMatch(/^(critical|high|medium|low)$/);
    }
  });
});

/* ── 4 · Determinism of the whole chain ─────────────────────────────── */

describe('deterministic scoring', () => {
  it('two independent collection runs of an unchanged site score identically', async () => {
    const a = await collect();
    state.docs.clear();
    const b = await collect();

    // Different runs, same evidence: the digest must match, because it answers
    // "is this the same evidence?", not "is this the same run?".
    expect(b.snapshot.digest).toBe(a.snapshot.digest);
  });

  it('re-assembling the same stored snapshot gives byte-identical output', async () => {
    const run = await collect();
    registry('s1', { vendor: 'OpenAI' });

    const first = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    const second = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('carries the versions the result is reproducible from', async () => {
    const run = await collect();
    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');
    expect(loaded.view.determinism).toEqual({
      engineVersion: '1.0.0',
      comparisonEngineVersion: 'ovd-1.0.0',
      comparisonRulesetVersion: 'ovd-rules-1',
      findingsRulesetVersion: 'cf-rules-1',
    });
  });
});

/* ── 5 · Rendering: app view and both PDFs ──────────────────────────── */

const ANSWERS = {} as Parameters<typeof computeAuditResult>[0];
const decode = (b: Uint8Array) => new TextDecoder('latin1').decode(b);

describe('rendering the collected result', () => {
  it('the app view shows observed, declared, gaps, findings and coverage', async () => {
    const run = await collect();
    registry('s1', { name: 'Support bot', vendor: 'OpenAI' });

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');
    const v = loaded.view;

    expect(v.observedSystems.map(o => o.name).sort()).toEqual(['Anthropic', 'OpenAI']);
    expect(v.declaredSystems).toHaveLength(1);
    expect(v.gaps.length).toBeGreaterThan(0);
    expect(v.findings.length).toBeGreaterThan(0);
    expect(v.coverage.entries.some(e => e.state === 'blocked')).toBe(true);
    expect(v.subjectDomain).toBe(DOMAIN);
  });

  it('the compliance report PDF prints the finding, its source and its recommendation', async () => {
    const run = await collect();
    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');

    const text = decode(buildReportPdf({
      title: 'R', createdAt: NOW.toISOString(),
      result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: loaded.view,
    }));

    expect(text).toContain('CF-001');
    expect(text).toContain(run.snapshot.snapshotId);
    expect(text).toContain(`${DOMAIN}/dpa`);
    expect(text).toContain('Anthropic');
    expect(text).toContain('Recommendation');
    expect(text).toContain('Observed vs declared');
  });

  it('the PDF names the platform that blocked us', async () => {
    const run = await collect();
    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');

    const text = decode(buildReportPdf({
      title: 'R', createdAt: NOW.toISOString(),
      result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: loaded.view,
    }));
    expect(text).toContain('linkedin');
    expect(text).toContain('Blocked');
    expect(text).toContain('Coverage was incomplete');
  });

  it('the Audit Express PDF renders the same section', async () => {
    const run = await collect('audit_express');
    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');

    const preview = computePreview({ workflow: 'support' } as Parameters<typeof computePreview>[0]);
    const text = decode(buildAuditExpressPdf({ createdAt: NOW.toISOString(), preview, enrichment: loaded.view }));
    expect(text).toContain('CF-001');
    expect(text).toContain('Recommendation');
  });

  it('renders identical PDF bytes for the same stored snapshot', async () => {
    const run = await collect();
    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');

    const build = () => decode(buildReportPdf({
      title: 'R', createdAt: NOW.toISOString(),
      result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: loaded.view,
    }));
    expect(build()).toBe(build());
  });
});

/* ── 6 · Degraded runs must never look clean ────────────────────────── */

describe('failure visibility end to end', () => {
  it('a total collector outage produces a reported empty audit, not a passing one', async () => {
    globalThis.fetch = vi.fn(async () => new Response('gateway', { status: 502 })) as typeof fetch;

    const run = await collect();
    expect(run.snapshot.evidence).toHaveLength(0);
    expect(run.coverage.complete).toBe(false);
    expect(run.coverage.missing.length).toBe(run.snapshot.coverage.length);

    const loaded = await loadEnrichmentReport('{}', ORG, run.snapshot.snapshotId);
    if (!loaded.ok) throw new Error('expected a view');
    expect(loaded.view.findings).toEqual([]);
    expect(loaded.view.coverage.summary.complete).toBe(false);

    // "No findings" must never be presented as a clean bill of health.
    const text = decode(buildReportPdf({
      title: 'R', createdAt: NOW.toISOString(),
      result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: loaded.view,
    }));
    expect(text).toContain('Coverage was incomplete');
  });

  it('a rate-limited platform is distinguished from an unavailable one', async () => {
    mockWorld({ linkedInStatus: 429 });
    const run = await collect();
    expect(run.snapshot.coverage.find(c => c.sourceType === 'linkedin')!.state).toBe('rate_limited');
  });

  it('one collector failing does not deprive the audit of the other', async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('apify.com')) throw new Error('network down');
      return new Response(JSON.stringify({ items: [REPO_DOC] }), { status: 200 });
    }) as typeof fetch;

    const run = await collect();
    expect(run.snapshot.evidence.some(e => e.collector === 'agent_reach')).toBe(true);
    expect(run.snapshot.coverage.find(c => c.sourceType === 'dpa')!.state).not.toBe('succeeded');
  });
});
