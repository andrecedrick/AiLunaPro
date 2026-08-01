import { describe, it, expect } from 'vitest';
import {
  hashEvidence, makeEvidenceId, buildEvidenceItem, orderEvidence, normaliseEvidence,
  SIGNAL_CONFIDENCE, SIGNAL_TYPES, EXCERPT_MAX, MAX_EVIDENCE_ITEMS,
  type EvidenceItem, type RawObservation,
} from '../../worker/src/lib/enrichment-evidence';
import {
  buildSnapshot, snapshotDigest, canonicalEvidenceString, summariseCoverage,
  verifySnapshotIntegrity, reproducibilityRef, SNAPSHOT_SCHEMA_VERSION,
  type CoverageEntry,
} from '../../worker/src/lib/enrichment-snapshot';

/**
 * Audit Enrichment Phase 1 — evidence, hashing, snapshot, coverage.
 *
 * The properties under test are the ones the whole engine rests on: a finding is
 * worthless without held evidence, a snapshot must serialise identically given the
 * same observations, and an incomplete audit must be impossible to present as a
 * complete one.
 */

const AT = '2026-08-02T09:00:00.000Z';

const obs = (o: Partial<RawObservation> = {}): RawObservation => ({
  sourceUrl: 'https://acme.example/privacy',
  sourceType: 'privacy_policy',
  collector: 'in_worker',
  collectorRunId: 'run-1',
  capturedEvidence: 'We use OpenAI to process support requests.',
  signalType: 'ai_processor_named',
  observedValue: 'OpenAI',
  ...o,
});

const item = async (o: Partial<RawObservation> = {}) => (await buildEvidenceItem(obs(o), AT))!;

const coverage = (over: Partial<CoverageEntry> = {}): CoverageEntry => ({
  sourceType: 'website', collector: 'apify', state: 'succeeded',
  reason: '', attemptedAt: AT, ...over,
});

describe('evidence hashing', () => {
  it('is stable across calls — the same text always hashes the same', async () => {
    expect(await hashEvidence('acme uses OpenAI')).toBe(await hashEvidence('acme uses OpenAI'));
  });

  it('produces a 64-char hex SHA-256', async () => {
    expect(await hashEvidence('x')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when a single character changes', async () => {
    expect(await hashEvidence('OpenAI')).not.toBe(await hashEvidence('OpenAl'));
  });

  it('hashes empty text without throwing', async () => {
    expect(await hashEvidence('')).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('evidence ids are deterministic', () => {
  it('the same observation yields the same id', async () => {
    const a = await item(), b = await item();
    expect(a.evidenceId).toBe(b.evidenceId);
  });

  it('a different observed value yields a different id', async () => {
    const a = await item(), b = await item({ observedValue: 'Anthropic' });
    expect(a.evidenceId).not.toBe(b.evidenceId);
  });

  it('the same vendor found on a different page is a distinct observation', async () => {
    const a = await item(), b = await item({ sourceUrl: 'https://acme.example/dpa' });
    expect(a.evidenceId).not.toBe(b.evidenceId);
  });

  it('id embeds the evidence hash, so altered text cannot keep the id', () => {
    const id = makeEvidenceId({
      sourceUrl: 'u', sourceType: 'website', signalType: 'ai_vendor_script',
      observedValue: 'v', evidenceHash: 'abcdef123456789',
    });
    expect(id).toContain('abcdef123456');
  });
});

describe('building an evidence item', () => {
  it('derives confidence from the signal type, never from a caller', async () => {
    expect((await item({ signalType: 'ai_vendor_script' })).confidence).toBe('high');
    expect((await item({ signalType: 'ai_feature_doc' })).confidence).toBe('medium');
    expect((await item({ signalType: 'ai_marketing_claim' })).confidence).toBe('low');
  });

  it('every signal type has a rule-derived confidence — none may be model-assigned', () => {
    for (const s of SIGNAL_TYPES) expect(SIGNAL_CONFIDENCE[s]).toBeTruthy();
  });

  it('clips an oversized excerpt rather than storing an unbounded blob', async () => {
    const it2 = await item({ capturedEvidence: 'x'.repeat(EXCERPT_MAX + 500) });
    expect(it2.capturedEvidence).toHaveLength(EXCERPT_MAX);
    // The hash covers what was STORED, so verification of the stored item holds.
    expect(it2.evidenceHash).toBe(await hashEvidence('x'.repeat(EXCERPT_MAX)));
  });

  it('REJECTS an observation with no captured evidence — a URL alone is not evidence', async () => {
    expect(await buildEvidenceItem(obs({ capturedEvidence: '' }), AT)).toBeNull();
    expect(await buildEvidenceItem(obs({ capturedEvidence: '   ' }), AT)).toBeNull();
  });

  it('rejects a missing source url or observed value', async () => {
    expect(await buildEvidenceItem(obs({ sourceUrl: '' }), AT)).toBeNull();
    expect(await buildEvidenceItem(obs({ observedValue: '' }), AT)).toBeNull();
  });

  it('rejects unknown enums instead of storing them', async () => {
    expect(await buildEvidenceItem(obs({ sourceType: 'telepathy' as never }), AT)).toBeNull();
    expect(await buildEvidenceItem(obs({ collector: 'psychic' as never }), AT)).toBeNull();
    expect(await buildEvidenceItem(obs({ signalType: 'vibes' as never }), AT)).toBeNull();
  });
});

describe('normalisation', () => {
  it('dedupes the same observation seen by two collectors', async () => {
    const a = await item({ collector: 'apify' });
    const b = await item({ collector: 'agent_reach' });
    // Same source, signal and value: one observation, not two.
    const { kept } = normaliseEvidence([a, b]);
    expect(kept).toHaveLength(1);
  });

  it('caps the set and drops the WEAKEST evidence first', async () => {
    const strong: EvidenceItem[] = [];
    for (let i = 0; i < 5; i++) {
      strong.push(await item({ sourceUrl: `https://acme.example/high-${i}`, signalType: 'ai_vendor_script' }));
    }
    const weak: EvidenceItem[] = [];
    for (let i = 0; i < MAX_EVIDENCE_ITEMS; i++) {
      weak.push(await item({ sourceUrl: `https://acme.example/low-${i}`, signalType: 'ai_marketing_claim' }));
    }
    const { kept, dropped } = normaliseEvidence([...weak, ...strong]);
    expect(kept).toHaveLength(MAX_EVIDENCE_ITEMS);
    expect(dropped).toBe(5);
    // All five high-confidence items survived the cap.
    expect(kept.filter(k => k.confidence === 'high')).toHaveLength(5);
  });

  it('reports zero dropped when under the cap', async () => {
    expect(normaliseEvidence([await item()]).dropped).toBe(0);
  });
});

describe('ordering is canonical', () => {
  it('collector completion order cannot change the serialisation', async () => {
    const a = await item({ sourceUrl: 'https://acme.example/a', observedValue: 'Anthropic' });
    const b = await item({ sourceUrl: 'https://acme.example/b', observedValue: 'OpenAI' });
    const c = await item({ sourceType: 'github', signalType: 'ai_repo_dependency', observedValue: 'torch' });
    expect(canonicalEvidenceString(orderEvidence([a, b, c])))
      .toBe(canonicalEvidenceString(orderEvidence([c, b, a])));
  });
});

describe('snapshot', () => {
  const build = async (evidence: EvidenceItem[], cov: CoverageEntry[] = [coverage()]) =>
    buildSnapshot({
      snapshotId: 'snap_1', orgId: 'orgA', subjectDomain: 'ACME.example', surface: 'full_audit',
      createdAt: AT, collectorVersions: { apify: '1.0.0' }, evidence, coverage: cov,
    });

  it('freezes evidence, stamps the schema version and lowercases the domain', async () => {
    const snap = await build([await item()]);
    expect(snap.schemaVersion).toBe(SNAPSHOT_SCHEMA_VERSION);
    expect(snap.subjectDomain).toBe('acme.example');
    expect(snap.evidence).toHaveLength(1);
    expect(snap.digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('the digest depends on the evidence, NOT on when it was collected', async () => {
    const ev = [await item()];
    const a = await buildSnapshot({ snapshotId: 's1', orgId: 'o', subjectDomain: 'd', surface: 'full_audit', createdAt: AT, collectorVersions: {}, evidence: ev, coverage: [] });
    const b = await buildSnapshot({ snapshotId: 's2', orgId: 'o', subjectDomain: 'd', surface: 'full_audit', createdAt: '2027-01-01T00:00:00.000Z', collectorVersions: {}, evidence: ev, coverage: [] });
    // Two runs over an unchanged site produce the same digest — that is what makes
    // snapshot-to-snapshot comparison meaningful.
    expect(a.digest).toBe(b.digest);
  });

  it('the digest changes when the evidence changes', async () => {
    const a = await build([await item()]);
    const b = await build([await item({ observedValue: 'Anthropic' })]);
    expect(a.digest).not.toBe(b.digest);
  });

  it('verifies its own integrity, and detects tampering', async () => {
    const snap = await build([await item()]);
    expect(await verifySnapshotIntegrity(snap)).toBe(true);
    // Someone edits the frozen evidence after the fact.
    const tampered = { ...snap, evidence: [{ ...snap.evidence[0], observedValue: 'Anthropic' }] };
    expect(await verifySnapshotIntegrity(tampered)).toBe(false);
  });

  it('an empty collection still produces a valid snapshot', async () => {
    const snap = await build([]);
    expect(snap.evidence).toEqual([]);
    expect(await verifySnapshotIntegrity(snap)).toBe(true);
  });

  it('exposes the reproducibility triple', async () => {
    const snap = await build([await item()]);
    expect(reproducibilityRef(snap, 'engine-1.2', 'rules-3')).toEqual({
      snapshotId: 'snap_1', engineVersion: 'engine-1.2', rulesetVersion: 'rules-3',
    });
  });
});

describe('coverage — no silent failure', () => {
  const build = async (cov: CoverageEntry[], evidence: EvidenceItem[] = []) =>
    buildSnapshot({
      snapshotId: 'snap_1', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
      createdAt: AT, collectorVersions: {}, evidence, coverage: cov,
    });

  it('is complete only when every source succeeded', async () => {
    expect(summariseCoverage(await build([coverage(), coverage({ sourceType: 'github' })])).complete).toBe(true);
  });

  it('a BLOCKED source makes the audit incomplete and is named', async () => {
    const snap = await build([coverage(), coverage({ sourceType: 'linkedin', state: 'blocked', reason: 'rate limited' })]);
    const sum = summariseCoverage(snap);
    expect(sum.complete).toBe(false);
    expect(sum.blocked).toBe(1);
    expect(sum.missing.map(m => m.sourceType)).toEqual(['linkedin']);
  });

  it('distinguishes not_attempted from blocked — different statements to a customer', async () => {
    const sum = summariseCoverage(await build([
      coverage({ sourceType: 'instagram', state: 'not_attempted', reason: 'no credential' }),
      coverage({ sourceType: 'facebook', state: 'blocked', reason: 'refused' }),
    ]));
    expect(sum.notAttempted).toBe(1);
    expect(sum.blocked).toBe(1);
  });

  it('counts partial and unavailable as incomplete', async () => {
    expect(summariseCoverage(await build([coverage({ state: 'partial' })])).complete).toBe(false);
    expect(summariseCoverage(await build([coverage({ state: 'unavailable' })])).complete).toBe(false);
  });

  it('DROPPED evidence also makes the audit incomplete', async () => {
    // A capped run is not a clean run: findings were discarded.
    const many: EvidenceItem[] = [];
    for (let i = 0; i < MAX_EVIDENCE_ITEMS + 3; i++) {
      many.push(await item({ sourceUrl: `https://acme.example/p-${i}` }));
    }
    const snap = await build([coverage()], many);
    expect(snap.droppedCount).toBe(3);
    expect(summariseCoverage(snap).complete).toBe(false);
  });

  it('coverage is ordered so the report renders sources stably', async () => {
    const snap = await build([
      coverage({ sourceType: 'youtube' }), coverage({ sourceType: 'github' }), coverage({ sourceType: 'blog' }),
    ]);
    expect(snap.coverage.map(c => c.sourceType)).toEqual(['blog', 'github', 'youtube']);
  });
});
