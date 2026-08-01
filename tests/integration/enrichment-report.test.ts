import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Phase 6 — report integration.
 *
 * The engines were already proven in Phases 1-5. What these tests pin is that the
 * results actually REACH a user, on every surface, with the traceability the
 * specification requires: a finding must always arrive carrying its evidence, the
 * observed subject, the declared entry, the gap, the risk and the recommendation.
 *
 * They also pin the two things that would quietly destroy the feature's value:
 * altered evidence must never render, and a snapshot must never be accepted from
 * a request body.
 */

const state = vi.hoisted(() => ({
  docs:  new Map<string, Record<string, unknown>>(),
  uid:   'u1',
  reads: [] as string[],
}));

vi.mock('../../worker/src/middleware/auth', () => ({
  verifyIdToken: vi.fn(async (bearer?: string) => (bearer ? state.uid : null)),
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => { state.reads.push(p); return state.docs.get(p) ?? null; }),
  firestoreSet: vi.fn(async (_sa: string, p: string, d: Record<string, unknown>) => { state.docs.set(p, { ...d }); }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string }>)[0];
    return [...state.docs.entries()]
      .filter(([p]) => p.startsWith(`${parent}/${from.collectionId}/`))
      .map(([name, fields]) => ({ name, fields }));
  }),
}));

import enrichmentRoutes from '../../worker/src/routes/enrichment';
import { buildEnrichmentReport, loadEnrichmentReport } from '../../worker/src/lib/enrichment-report';
import { buildEvidenceItem, type RawObservation } from '../../worker/src/lib/enrichment-evidence';
import { buildSnapshot, type EvidenceSnapshot } from '../../worker/src/lib/enrichment-snapshot';
import { buildDeclaredInventory, toDeclaredSystem } from '../../worker/src/lib/enrichment-declared';
import { saveSnapshot } from '../../worker/src/lib/enrichment-store';
import { buildReportPdf } from '../../worker/src/lib/report-pdf';
import { buildAuditExpressPdf } from '../../worker/src/lib/audit-express-pdf';
import { computeAuditResult } from '../../worker/src/lib/audit-scoring';
import { computePreview } from '../../worker/src/lib/audit-express-preview';

const AT = '2026-08-02T09:00:00.000Z';
const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}', FIREBASE_PROJECT_ID: 'p' } as unknown as Record<string, unknown>;
const AUTH = { Authorization: 'Bearer t' };

const obs = (o: Partial<RawObservation> = {}): RawObservation => ({
  sourceUrl: 'https://acme.example/dpa', sourceType: 'dpa', collector: 'apify',
  collectorRunId: 'run-1', capturedEvidence: 'Sub-processor: Anthropic PBC',
  signalType: 'ai_processor_named', observedValue: 'Anthropic', ...o,
});

const makeSnapshot = async (
  surface = 'full_audit', observations: RawObservation[] = [obs()], snapshotId = 'snap_1',
): Promise<EvidenceSnapshot> => buildSnapshot({
  snapshotId, orgId: 'orgA', subjectDomain: 'acme.example', surface,
  createdAt: AT, collectorVersions: { apify: '1.0.0' },
  evidence: await Promise.all(observations.map(async o => (await buildEvidenceItem(o, AT))!)),
  coverage: [
    { sourceType: 'dpa', collector: 'apify', state: 'succeeded', reason: '', attemptedAt: AT },
    { sourceType: 'linkedin', collector: 'agent_reach', state: 'blocked', reason: 'login required', attemptedAt: AT },
    // A source nobody even tried. It has to reach the page, or a partial audit
    // reads as a complete one.
    { sourceType: 'github', collector: 'agent_reach', state: 'not_attempted', reason: 'not configured', attemptedAt: AT },
  ],
});

const registry = (id: string, f: Record<string, unknown>) =>
  state.docs.set(`organizations/orgA/registry/${id}`, {
    id, organizationId: 'orgA', name: '', vendor: '', department: 'IT',
    riskLevel: 'limited', status: 'active', ...f,
  });

const inventory = (entries: Array<[string, Record<string, unknown>]> = []) =>
  buildDeclaredInventory(entries.map(([id, f]) =>
    toDeclaredSystem(id, { name: '', vendor: '', status: 'active', riskLevel: 'limited', department: 'IT', ...f })));

beforeEach(() => {
  state.docs.clear(); state.reads.length = 0; state.uid = 'u1'; vi.clearAllMocks();
  state.docs.set('organizations/orgA/members/u1', { role: 'owner' });
  state.docs.set('organizations/orgA/members/member1', { role: 'member' });
});

/* ── The assembled view ─────────────────────────────────────────────── */

describe('assembled view', () => {
  it('carries observed, declared, gaps, findings and coverage together', async () => {
    const snapshot = await makeSnapshot();
    const view = buildEnrichmentReport(snapshot, inventory([['s1', { name: 'Support bot', vendor: 'OpenAI' }]]), true);

    expect(view.observedSystems).toHaveLength(1);
    expect(view.observedSystems[0]).toMatchObject({ name: 'Anthropic', declared: false, deployed: true });
    expect(view.declaredSystems).toHaveLength(1);
    expect(view.declaredSystems[0]).toMatchObject({ systemId: 's1', observed: false });
    expect(view.gaps.length).toBeGreaterThan(0);
    expect(view.findings.length).toBeGreaterThan(0);
    expect(view.coverage.entries).toHaveLength(3);
  });

  it('names what was NOT read instead of implying full coverage', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory(), true);
    expect(view.coverage.summary.complete).toBe(false);
    expect(view.coverage.summary.blocked).toBe(1);
    expect(view.coverage.entries.find(e => e.state === 'blocked')).toMatchObject({
      sourceType: 'linkedin', collector: 'agent_reach', reason: 'login required',
    });
  });

  it('stamps every version a reader needs to reproduce it', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory(), true);
    expect(view.determinism.engineVersion).toBeTruthy();
    expect(view.determinism.comparisonEngineVersion).toBe('ovd-1.0.0');
    expect(view.determinism.comparisonRulesetVersion).toBe('ovd-rules-1');
    expect(view.determinism.findingsRulesetVersion).toBe('cf-rules-1');
    expect(view.snapshotId).toBe('snap_1');
  });

  it('is byte-identical across repeated assemblies of the same inputs', async () => {
    const snapshot = await makeSnapshot();
    const inv = inventory([['s1', { vendor: 'OpenAI' }]]);
    expect(JSON.stringify(buildEnrichmentReport(snapshot, inv, true)))
      .toBe(JSON.stringify(buildEnrichmentReport(snapshot, inv, true)));
  });

  it('reports an observed system as declared when the registry matches it', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory([['s1', { vendor: 'Claude' }]]), true);
    // "Claude" declared vs "Anthropic" observed: the alias table must prevent a
    // false Shadow AI accusation from ever reaching the page.
    expect(view.observedSystems[0].declared).toBe(true);
    expect(view.observedSystems[0].declaredSystemIds).toEqual(['s1']);
    expect(view.findings.filter(f => f.gapKind === 'undeclared_system')).toEqual([]);
  });
});

/* ── Every finding arrives with its full chain ──────────────────────── */

describe('finding rendering contract', () => {
  it('every finding carries risk, rule, impact and a recommendation', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory([['s2', { vendor: 'internal' }]]), true);
    expect(view.findings.length).toBeGreaterThanOrEqual(2);
    for (const f of view.findings) {
      expect(f.riskLevel).toMatch(/^(critical|high|medium|low)$/);
      expect(f.ruleId).toMatch(/^CF-\d{3}$/);
      expect(typeof f.scoreImpact).toBe('number');
      expect(f.title.length).toBeGreaterThan(10);
      expect(f.explanation.length).toBeGreaterThan(40);
      expect(f.recommendation.length).toBeGreaterThan(40);
    }
  });

  it('links each finding to the observed subject and the declared entry it concerns', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory([['s2', { vendor: 'internal' }]]), true);

    const shadow = view.findings.find(f => f.gapKind === 'undeclared_system')!;
    expect(view.observedSystems.find(o => o.key === shadow.subjectKey)).toBeTruthy();

    const unverified = view.findings.find(f => f.gapKind === 'unverified_declaration')!;
    expect(view.declaredSystems.find(d => d.systemId === unverified.systemId)).toBeTruthy();
  });

  it('attributes evidence with every field the evidence rule requires', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory(), true);
    const [e] = view.findings.find(f => f.gapKind === 'undeclared_system')!.evidence;
    // Evidence ID, Snapshot ID, Source URL, Collector, Timestamp, Evidence Hash.
    expect(e.evidenceId).toBeTruthy();
    expect(e.snapshotId).toBe('snap_1');
    expect(e.sourceUrl).toBe('https://acme.example/dpa');
    expect(e.collector).toBe('apify');
    expect(e.capturedAt).toBe(AT);
    expect(e.evidenceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(e.capturedEvidence).toContain('Anthropic');
    expect(e.confidence).toBe('high');
  });
});

/* ── Surfaces ───────────────────────────────────────────────────────── */

describe('surfaces', () => {
  for (const surface of ['audit_express', 'full_audit', 'diagnostic']) {
    it(`assembles a complete view for the ${surface} surface`, async () => {
      const view = buildEnrichmentReport(await makeSnapshot(surface), inventory(), true);
      expect(view.surface).toBe(surface);
      expect(view.findings.length).toBeGreaterThan(0);
      expect(view.findings[0].evidence.length).toBeGreaterThan(0);
    });
  }
});

/* ── HTTP ───────────────────────────────────────────────────────────── */

describe('GET /api/enrichment/report', () => {
  it('returns the assembled view to a member', async () => {
    await saveSnapshot('{}', await makeSnapshot());
    registry('s1', { vendor: 'OpenAI' });
    const res = await enrichmentRoutes.request('/api/enrichment/report?orgId=orgA&snapshotId=snap_1', { headers: AUTH }, ENV);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.snapshotId).toBe('snap_1');
    expect((body.findings as unknown[]).length).toBeGreaterThan(0);
    expect((body.observedSystems as unknown[]).length).toBe(1);
  });

  it('rejects an unauthenticated caller', async () => {
    const res = await enrichmentRoutes.request('/api/enrichment/report?orgId=orgA&snapshotId=snap_1', {}, ENV);
    expect(res.status).toBe(401);
  });

  it('rejects a caller who is not a member of the workspace', async () => {
    state.uid = 'outsider';
    await saveSnapshot('{}', await makeSnapshot());
    const res = await enrichmentRoutes.request('/api/enrichment/report?orgId=orgA&snapshotId=snap_1', { headers: AUTH }, ENV);
    expect(res.status).toBe(403);
  });

  it('404s an unknown snapshot', async () => {
    const res = await enrichmentRoutes.request('/api/enrichment/report?orgId=orgA&snapshotId=nope', { headers: AUTH }, ENV);
    expect(res.status).toBe(404);
  });

  it('REFUSES a snapshot whose evidence no longer matches its digest', async () => {
    // The whole reproducibility claim rests on this: altered evidence must never
    // be rendered as an audit finding.
    await saveSnapshot('{}', await makeSnapshot());
    const stored = state.docs.get('organizations/orgA/enrichment_snapshots/snap_1')!;
    // The excerpt a reader is shown, altered while keeping its original hash —
    // exactly the tampering a digest over metadata alone does not catch.
    stored.evidenceJson = (stored.evidenceJson as string).replace('Sub-processor: Anthropic PBC', 'Sub-processor: none');

    const res = await enrichmentRoutes.request('/api/enrichment/report?orgId=orgA&snapshotId=snap_1', { headers: AUTH }, ENV);
    expect(res.status).toBe(409);
    expect((await res.json() as { code: string }).code).toBe('INTEGRITY_FAILED');
  });

  it('400s without a snapshot id', async () => {
    const res = await enrichmentRoutes.request('/api/enrichment/report?orgId=orgA', { headers: AUTH }, ENV);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/enrichment/snapshots', () => {
  it('lists the workspace snapshots without their evidence', async () => {
    await saveSnapshot('{}', await makeSnapshot('full_audit', [obs()], 'snap_1'));
    const res = await enrichmentRoutes.request('/api/enrichment/snapshots?orgId=orgA', { headers: AUTH }, ENV);
    expect(res.status).toBe(200);
    const { snapshots } = await res.json() as { snapshots: Array<Record<string, unknown>> };
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].snapshotId).toBe('snap_1');
    expect(snapshots[0]).not.toHaveProperty('evidenceJson');
  });
});

describe('POST /api/enrichment/run', () => {
  it('refuses a member — collection costs money at the provider', async () => {
    state.uid = 'member1';
    const res = await enrichmentRoutes.request('/api/enrichment/run', {
      method: 'POST', headers: { ...AUTH, 'content-type': 'application/json' },
      body: JSON.stringify({ orgId: 'orgA', subjectDomain: 'acme.example' }),
    }, ENV);
    expect(res.status).toBe(403);
  });

  it('rejects a value that is not a domain', async () => {
    const res = await enrichmentRoutes.request('/api/enrichment/run', {
      method: 'POST', headers: { ...AUTH, 'content-type': 'application/json' },
      body: JSON.stringify({ orgId: 'orgA', subjectDomain: 'not a domain' }),
    }, ENV);
    expect(res.status).toBe(400);
    expect((await res.json() as { code: string }).code).toBe('DOMAIN_REQUIRED');
  });

  it('refuses rather than recording an empty run when no collector is configured', async () => {
    const res = await enrichmentRoutes.request('/api/enrichment/run', {
      method: 'POST', headers: { ...AUTH, 'content-type': 'application/json' },
      body: JSON.stringify({ orgId: 'orgA', subjectDomain: 'acme.example' }),
    }, ENV);
    expect(res.status).toBe(503);
    expect((await res.json() as { code: string }).code).toBe('NO_COLLECTOR_CONFIGURED');
  });
});

/* ── Storage round trip ─────────────────────────────────────────────── */

describe('loading from storage', () => {
  it('assembles from the stored snapshot and the stored registry', async () => {
    await saveSnapshot('{}', await makeSnapshot());
    registry('s1', { name: 'Support bot', vendor: 'OpenAI' });
    const loaded = await loadEnrichmentReport('{}', 'orgA', 'snap_1');
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.view.integrityVerified).toBe(true);
    expect(loaded.view.declaredSystems).toHaveLength(1);
    expect(loaded.view.findings.some(f => f.gapKind === 'undeclared_system')).toBe(true);
  });
});

/* ── PDF ────────────────────────────────────────────────────────────── */

const ANSWERS = {} as Parameters<typeof computeAuditResult>[0];
const decode = (b: Uint8Array) => new TextDecoder('latin1').decode(b);

describe('PDF integration', () => {
  it('prints the finding, its rule, its evidence and its recommendation', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory(), true);
    const text = decode(buildReportPdf({
      title: 'R', createdAt: AT, result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: view,
    }));

    expect(text).toContain('CF-001');                       // rule id
    expect(text).toContain('snap_1');                       // snapshot id
    expect(text).toContain('acme.example/dpa');             // source url
    expect(text).toContain('Anthropic');                    // subject + evidence
    expect(text).toContain('Recommendation');               // recommendation heading
    expect(text).toContain('Observed vs declared');         // the comparison chain
    expect(text).toContain('Not analyzed');                 // coverage vocabulary
  });

  it('prints what was NOT read, so a degraded run cannot read as a clean one', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory(), true);
    const text = decode(buildReportPdf({
      title: 'R', createdAt: AT, result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: view,
    }));
    expect(text).toContain('Blocked');
    expect(text).toContain('Coverage was incomplete');
  });

  it('omits the section entirely when no snapshot is attached', () => {
    const text = decode(buildReportPdf({
      title: 'R', createdAt: AT, result: computeAuditResult(ANSWERS), answers: ANSWERS,
    }));
    expect(text).not.toContain('CF-001');
    expect(text).not.toContain('AI systems observed in public sources');
  });

  it('renders the same section in the Audit Express PDF', async () => {
    const view = buildEnrichmentReport(await makeSnapshot('audit_express'), inventory(), true);
    const preview = computePreview({ workflow: 'support' } as Parameters<typeof computePreview>[0]);
    const text = decode(buildAuditExpressPdf({ createdAt: AT, preview, enrichment: view }));
    expect(text).toContain('CF-001');
    expect(text).toContain('snap_1');
    expect(text).toContain('Recommendation');
  });

  it('produces identical bytes for identical inputs', async () => {
    const view = buildEnrichmentReport(await makeSnapshot(), inventory(), true);
    const build = () => buildReportPdf({
      title: 'R', createdAt: AT, result: computeAuditResult(ANSWERS), answers: ANSWERS, enrichment: view,
    });
    expect(decode(build())).toBe(decode(build()));
  });
});
