import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Audit Enrichment Phase 1 — snapshot persistence.
 *
 * The property that matters: what comes back out must be byte-identical to what
 * went in, because the digest check (§26.6) is worthless if storage mutates the
 * evidence on the way through. A snapshot that fails integrity after a round trip
 * cannot be scored.
 */

const state = vi.hoisted(() => ({
  docs:    new Map<string, Record<string, unknown>>(),
  queries: [] as Array<{ select?: unknown; limit?: number }>,
}));

vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => {
    state.docs.set(path, { ...data });
  }),
  firestoreRunQuery: vi.fn(async (_sa: string, sq: Record<string, unknown>, parent: string) => {
    state.queries.push({ select: sq.select, limit: sq.limit as number });
    return [...state.docs.entries()]
      .filter(([p]) => p.startsWith(`${parent}/enrichment_snapshots/`))
      .map(([name, fields]) => ({ name, fields }));
  }),
}));

import { saveSnapshot, loadSnapshot, listSnapshots, newSnapshotId } from '../../worker/src/lib/enrichment-store';
import { buildSnapshot, verifySnapshotIntegrity, type CoverageEntry } from '../../worker/src/lib/enrichment-snapshot';
import { buildEvidenceItem, type RawObservation } from '../../worker/src/lib/enrichment-evidence';

const AT = '2026-08-02T09:00:00.000Z';
const obs = (o: Partial<RawObservation> = {}): RawObservation => ({
  sourceUrl: 'https://acme.example/dpa', sourceType: 'dpa', collector: 'apify',
  collectorRunId: 'run-7', capturedEvidence: 'Sub-processor: OpenAI, L.L.C.',
  signalType: 'ai_processor_named', observedValue: 'OpenAI', ...o,
});
const cov: CoverageEntry = { sourceType: 'website', collector: 'apify', state: 'succeeded', reason: '', attemptedAt: AT };

const makeSnapshot = async (orgId = 'orgA', snapshotId = 'snap_1') => buildSnapshot({
  snapshotId, orgId, subjectDomain: 'acme.example', surface: 'full_audit', createdAt: AT,
  collectorVersions: { apify: '1.0.0', agent_reach: '0.3.1' },
  evidence: [
    (await buildEvidenceItem(obs(), AT))!,
    (await buildEvidenceItem(obs({ sourceUrl: 'https://acme.example/', sourceType: 'website', signalType: 'ai_vendor_script', observedValue: 'Intercom', capturedEvidence: '<script src="intercom.js">' }), AT))!,
  ],
  coverage: [cov, { sourceType: 'linkedin', collector: 'agent_reach', state: 'blocked', reason: 'rate limited', attemptedAt: AT }],
});

beforeEach(() => { state.docs.clear(); state.queries.length = 0; vi.clearAllMocks(); });

describe('snapshot ids', () => {
  it('are unique per run — two collections are distinct events', () => {
    expect(newSnapshotId()).not.toBe(newSnapshotId());
    expect(newSnapshotId()).toMatch(/^snap_[A-Za-z0-9_-]+$/);
  });
});

describe('round trip', () => {
  it('survives storage byte-identically and still verifies', async () => {
    const snap = await makeSnapshot();
    await saveSnapshot('{}', snap);
    const back = await loadSnapshot('{}', 'orgA', 'snap_1');
    expect(back).toEqual(snap);
    // The whole reproducibility claim rests on this holding after a round trip.
    expect(await verifySnapshotIntegrity(back!)).toBe(true);
  });

  it('preserves coverage, including the blocked source', async () => {
    await saveSnapshot('{}', await makeSnapshot());
    const back = await loadSnapshot('{}', 'orgA', 'snap_1');
    expect(back!.coverage.find(c => c.sourceType === 'linkedin')).toMatchObject({
      state: 'blocked', reason: 'rate limited',
    });
  });

  it('preserves collector versions, so a claim traces to the code that made it', async () => {
    await saveSnapshot('{}', await makeSnapshot());
    const back = await loadSnapshot('{}', 'orgA', 'snap_1');
    expect(back!.collectorVersions).toEqual({ apify: '1.0.0', agent_reach: '0.3.1' });
  });

  it('is stored under the org path — isolation is structural', async () => {
    await saveSnapshot('{}', await makeSnapshot('orgB', 'snap_9'));
    expect([...state.docs.keys()]).toEqual(['organizations/orgB/enrichment_snapshots/snap_9']);
  });

  it('returns null for a missing snapshot rather than throwing', async () => {
    expect(await loadSnapshot('{}', 'orgA', 'nope')).toBeNull();
  });

  it('survives a corrupted evidence blob without throwing', async () => {
    await saveSnapshot('{}', await makeSnapshot());
    const path = 'organizations/orgA/enrichment_snapshots/snap_1';
    state.docs.set(path, { ...state.docs.get(path)!, evidenceJson: 'not json' });
    const back = await loadSnapshot('{}', 'orgA', 'snap_1');
    expect(back!.evidence).toEqual([]);
    // And it must FAIL integrity, so nothing scores a snapshot it could not read.
    expect(await verifySnapshotIntegrity(back!)).toBe(false);
  });
});

describe('listing', () => {
  it('projects a summary and never drags evidence back', async () => {
    await saveSnapshot('{}', await makeSnapshot('orgA', 'snap_1'));
    const list = await listSnapshots('{}', 'orgA');
    expect(list[0]).toMatchObject({ snapshotId: 'snap_1', subjectDomain: 'acme.example', evidenceCount: 2 });
    expect(list[0]).not.toHaveProperty('evidence');
    // The projection is the point: listing must not pay for every stored excerpt.
    const fields = (state.queries[0].select as { fields: Array<{ fieldPath: string }> }).fields.map(f => f.fieldPath);
    expect(fields).not.toContain('evidenceJson');
    expect(fields).toContain('evidenceCount');
  });

  it('returns newest first', async () => {
    const a = await makeSnapshot('orgA', 'snap_old');
    await saveSnapshot('{}', { ...a, createdAt: '2026-01-01T00:00:00.000Z' });
    const b = await makeSnapshot('orgA', 'snap_new');
    await saveSnapshot('{}', { ...b, createdAt: '2026-08-02T00:00:00.000Z' });
    expect((await listSnapshots('{}', 'orgA')).map(s => s.snapshotId)).toEqual(['snap_new', 'snap_old']);
  });

  it('returns an empty list for an org with no snapshots', async () => {
    expect(await listSnapshots('{}', 'orgEmpty')).toEqual([]);
  });
});
