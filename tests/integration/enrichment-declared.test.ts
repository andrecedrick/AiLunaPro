import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Phase 4 — loading the DECLARED half from the AI Registry.
 *
 * Cahier §26.15 D2: the registry is the primary structured declaration source,
 * and free text must never affect the comparison. These tests pin both, plus the
 * end-to-end path from a stored snapshot to a gap set.
 */

const state = vi.hoisted(() => ({
  docs:    new Map<string, Record<string, unknown>>(),
  queries: [] as Array<{ collectionId: string; parent: string }>,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, p: string) => state.docs.get(p) ?? null),
  firestoreSet: vi.fn(async (_sa: string, p: string, d: Record<string, unknown>) => { state.docs.set(p, { ...d }); }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    const from = (sq.from as Array<{ collectionId: string }>)[0];
    state.queries.push({ collectionId: from.collectionId, parent });
    return [...state.docs.entries()]
      .filter(([p]) => p.startsWith(`${parent}/${from.collectionId}/`))
      .map(([name, fields]) => ({ name, fields }));
  }),
}));

import { loadDeclaredInventory } from '../../worker/src/lib/enrichment-declared';
import { compareObservedVsDeclared } from '../../worker/src/lib/observed-vs-declared';
import { buildEvidenceItem, type RawObservation } from '../../worker/src/lib/enrichment-evidence';
import { buildSnapshot, verifySnapshotIntegrity } from '../../worker/src/lib/enrichment-snapshot';
import { saveSnapshot, loadSnapshot } from '../../worker/src/lib/enrichment-store';

const AT = '2026-08-02T09:00:00.000Z';

const registryEntry = (id: string, f: Record<string, unknown>) =>
  state.docs.set(`organizations/orgA/registry/${id}`, {
    id, organizationId: 'orgA', name: '', vendor: '', department: 'IT',
    riskLevel: 'limited', status: 'active', ...f,
  });

const obs = (o: Partial<RawObservation> = {}): RawObservation => ({
  sourceUrl: 'https://acme.example/dpa', sourceType: 'dpa', collector: 'apify',
  collectorRunId: 'run-1', capturedEvidence: 'Sub-processor: OpenAI, L.L.C.',
  signalType: 'ai_processor_named', observedValue: 'OpenAI', ...o,
});

const snapWith = async (values: string[]) => buildSnapshot({
  snapshotId: 'snap_1', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
  createdAt: AT, collectorVersions: { apify: '1.0.0' },
  evidence: await Promise.all(values.map(async (v, i) =>
    (await buildEvidenceItem(obs({ observedValue: v, sourceUrl: `https://acme.example/p${i}` }), AT))!)),
  coverage: [],
});

beforeEach(() => { state.docs.clear(); state.queries.length = 0; vi.clearAllMocks(); });

describe('loading the declared inventory', () => {
  it('reads the org-scoped registry collection', async () => {
    registryEntry('s1', { name: 'Support bot', vendor: 'OpenAI' });
    const inv = await loadDeclaredInventory('{}', 'orgA');
    expect(state.queries[0]).toEqual({ collectionId: 'registry', parent: 'organizations/orgA' });
    expect(inv.systems).toHaveLength(1);
    expect(inv.systems[0]).toMatchObject({ name: 'Support bot', vendor: 'OpenAI', vendorKey: 'openai' });
  });

  it('EXCLUDES archived entries — a retired system is not a current declaration', async () => {
    registryEntry('live', { vendor: 'OpenAI', status: 'active' });
    registryEntry('gone', { vendor: 'Cohere', status: 'archived' });
    const inv = await loadDeclaredInventory('{}', 'orgA');
    expect(inv.systems.map(s => s.systemId)).toEqual(['live']);
  });

  it('an archived declaration cannot mask a live undeclared system', async () => {
    registryEntry('gone', { vendor: 'OpenAI', status: 'archived' });
    const inv = await loadDeclaredInventory('{}', 'orgA');
    const res = compareObservedVsDeclared(await snapWith(['OpenAI']), inv);
    expect(res.totals.undeclared).toBe(1);
  });

  it('ignores free-text purpose entirely (D2)', async () => {
    // A prose declaration must never suppress a Shadow AI gap.
    registryEntry('s1', { name: '', vendor: '', purpose: 'We use OpenAI for customer support' });
    const inv = await loadDeclaredInventory('{}', 'orgA');
    const res = compareObservedVsDeclared(await snapWith(['OpenAI']), inv);
    expect(res.totals.undeclared).toBe(1);
    expect(res.totals.registryIncomplete).toBe(1);
  });

  it('is empty for an org with no registry', async () => {
    const inv = await loadDeclaredInventory('{}', 'orgEmpty');
    expect(inv.systems).toEqual([]);
    expect(inv.index.size).toBe(0);
  });

  it('tolerates a malformed entry without throwing', async () => {
    registryEntry('bad', { name: 42, vendor: null, status: 7 });
    const inv = await loadDeclaredInventory('{}', 'orgA');
    expect(inv.systems).toHaveLength(1);
    expect(inv.unmatchable).toHaveLength(1);
  });
});

describe('end to end — stored snapshot vs registry', () => {
  it('loads a snapshot from storage and compares it against the registry', async () => {
    registryEntry('s1', { name: 'Support bot', vendor: 'OpenAI' });
    await saveSnapshot('{}', await snapWith(['OpenAI', 'Anthropic']));

    const stored = await loadSnapshot('{}', 'orgA', 'snap_1');
    // Scoring must never read altered evidence.
    expect(await verifySnapshotIntegrity(stored!)).toBe(true);

    const res = compareObservedVsDeclared(stored!, await loadDeclaredInventory('{}', 'orgA'));
    expect(res.totals.undeclared).toBe(1);
    expect(res.gaps.find(g => g.gapKind === 'undeclared_system')!.subject).toBe('Anthropic');
    expect(res.snapshotId).toBe('snap_1');
  });

  it('the comparison depends only on the snapshot, never on the live web', async () => {
    registryEntry('s1', { vendor: 'OpenAI' });
    await saveSnapshot('{}', await snapWith(['OpenAI', 'Cohere']));
    const stored = await loadSnapshot('{}', 'orgA', 'snap_1');
    const inv = await loadDeclaredInventory('{}', 'orgA');

    // Re-running against the SAME stored snapshot must give the same answer,
    // which is the reproducibility guarantee in §26.6.
    const a = compareObservedVsDeclared(stored!, inv);
    const b = compareObservedVsDeclared(stored!, inv);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('a full picture: undeclared, unverified and incomplete together', async () => {
    registryEntry('declared_ok',  { name: 'Bot', vendor: 'OpenAI' });
    registryEntry('never_seen',   { name: 'Internal model', vendor: 'internal' });
    registryEntry('unmatchable',  { name: '', vendor: '' });
    await saveSnapshot('{}', await snapWith(['OpenAI', 'Anthropic']));

    const stored = await loadSnapshot('{}', 'orgA', 'snap_1');
    const res = compareObservedVsDeclared(stored!, await loadDeclaredInventory('{}', 'orgA'));

    expect(res.totals).toMatchObject({
      observedSubjects: 2,
      declaredSystems: 3,
      undeclared: 1,          // Anthropic
      unverified: 1,          // internal model
      registryIncomplete: 1,  // the empty entry
    });
    // Still no findings, risks or recommendations — that is Phase 5.
    expect(res).not.toHaveProperty('findings');
  });
});
