import { describe, it, expect } from 'vitest';

/**
 * Phase 5 — Compliance Findings engine.
 *
 * These tests pin the properties a compliance report is worthless without:
 * a finding names its rule, carries the evidence that proves it, classifies risk
 * from a table rather than a judgement call, and produces the same output twice.
 */

import {
  buildFindings, selectRule, makeFindingId,
  FINDING_RULES, FINDINGS_RULESET_VERSION, MAX_TOTAL_IMPACT,
} from '../../worker/src/lib/compliance-findings';
import { buildEvidenceItem, type RawObservation, type EvidenceItem } from '../../worker/src/lib/enrichment-evidence';
import { buildSnapshot, type EvidenceSnapshot } from '../../worker/src/lib/enrichment-snapshot';
import { compareObservedVsDeclared, type Gap } from '../../worker/src/lib/observed-vs-declared';
import { buildDeclaredInventory, toDeclaredSystem } from '../../worker/src/lib/enrichment-declared';
import { ENGINE_VERSION } from '../../worker/src/lib/determinism';

const AT = '2026-08-02T09:00:00.000Z';

const obs = (o: Partial<RawObservation> = {}): RawObservation => ({
  sourceUrl: 'https://acme.example/dpa', sourceType: 'dpa', collector: 'apify',
  collectorRunId: 'run-1', capturedEvidence: 'Sub-processor: OpenAI, L.L.C.',
  signalType: 'ai_processor_named', observedValue: 'OpenAI', ...o,
});

const snapshotOf = async (observations: RawObservation[]): Promise<EvidenceSnapshot> => buildSnapshot({
  snapshotId: 'snap_1', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
  createdAt: AT, collectorVersions: { apify: '1.0.0' },
  evidence: await Promise.all(observations.map(async o => (await buildEvidenceItem(o, AT))!)),
  coverage: [],
});

const inventoryOf = (entries: Array<[string, Record<string, unknown>]>) =>
  buildDeclaredInventory(entries.map(([id, f]) =>
    toDeclaredSystem(id, { name: '', vendor: '', status: 'active', riskLevel: 'limited', department: 'IT', ...f })));

/** The whole Phase 4 → Phase 5 path, which is how the engine is actually used. */
const assess = async (observations: RawObservation[], entries: Array<[string, Record<string, unknown>]> = []) => {
  const snapshot = await snapshotOf(observations);
  return { snapshot, result: buildFindings(snapshot, compareObservedVsDeclared(snapshot, inventoryOf(entries))) };
};

describe('risk classification', () => {
  it('a contracted processor missing from the registry is HIGH risk and scores', async () => {
    const { result } = await assess([obs({ observedValue: 'Anthropic' })]);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      ruleId: FINDING_RULES.SHADOW_AI_CONTRACTUAL,
      riskLevel: 'high', scoreImpact: 15, subject: 'Anthropic',
    });
    expect(result.totalImpact).toBe(15);
  });

  it('a dependency-only observation is HIGH risk but scores lower than a contract', async () => {
    const { result } = await assess([obs({
      signalType: 'ai_repo_dependency', sourceType: 'github',
      sourceUrl: 'https://github.com/acme/app', capturedEvidence: 'openai==1.2.0', observedValue: 'OpenAI',
    })]);
    expect(result.findings[0]).toMatchObject({ ruleId: FINDING_RULES.SHADOW_AI_DEPLOYED, riskLevel: 'high', scoreImpact: 12 });
  });

  it('a declared system with no public evidence is LOW risk and never scores', async () => {
    // Most internal AI leaves no public trace. Marking a customer down for that
    // would penalise them for being private, not for being non-compliant.
    const { result } = await assess([], [['s1', { name: 'Internal model', vendor: 'internal' }]]);
    expect(result.findings[0]).toMatchObject({
      ruleId: FINDING_RULES.DECLARATION_UNVERIFIED, riskLevel: 'low', scoreImpact: 0,
    });
    expect(result.totalImpact).toBe(0);
  });

  it('an unidentifiable registry entry is MEDIUM risk and still does not score', async () => {
    // Risk and score are separate axes: this is a real deficiency, surfaced
    // prominently, but Phase 4 owns the single score gate.
    const { result } = await assess([], [['bad', { name: '', vendor: '' }]]);
    expect(result.findings[0]).toMatchObject({
      ruleId: FINDING_RULES.REGISTRY_INCOMPLETE, riskLevel: 'medium', scoreImpact: 0,
    });
  });

  it('selectRule sends a non-score-eligible observed gap to the zero-impact rule', () => {
    // Unreachable through the current signal tables by design; this pins the
    // guarantee so a future weaker signal cannot silently start scoring.
    const weak: Gap = {
      gapKind: 'undeclared_system', ruleId: 'OVD-001', subjectKey: 'someai', subject: 'SomeAI',
      confidence: 'low', scoreEligible: false, evidenceIds: [], systemId: '',
    };
    expect(selectRule(weak, [])).toBe(FINDING_RULES.SHADOW_AI_WEAK);
  });
});

describe('score gating', () => {
  it('a gap Phase 4 marked non-score-eligible contributes ZERO no matter its rule', () => {
    const snapshot = { snapshotId: 'snap_x', evidence: [] as EvidenceItem[] } as EvidenceSnapshot;
    const result = buildFindings(snapshot, {
      snapshotId: 'snap_x', engineVersion: 'ovd-1.0.0', rulesetVersion: 'ovd-rules-1',
      gaps: [{
        gapKind: 'undeclared_system', ruleId: 'OVD-001', subjectKey: 'openai', subject: 'OpenAI',
        confidence: 'low', scoreEligible: false, evidenceIds: [], systemId: '',
      }],
      totals: { observedSubjects: 1, declaredSystems: 0, undeclared: 1, undeclaredScorable: 0, unverified: 0, registryIncomplete: 0 },
    });
    expect(result.findings[0].scoreImpact).toBe(0);
    expect(result.totalImpact).toBe(0);
  });

  it('caps the total so a large estate stays interpretable', async () => {
    const many = Array.from({ length: 12 }, (_, i) => obs({
      observedValue: `Vendor${i}`, sourceUrl: `https://acme.example/dpa#${i}`,
      capturedEvidence: `Sub-processor: Vendor${i}`,
    }));
    const { result } = await assess(many);
    expect(result.findings).toHaveLength(12);            // all reported
    expect(result.totalImpact).toBe(MAX_TOTAL_IMPACT);   // but the penalty is bounded
    expect(result.impactCapped).toBe(true);
    expect(result.reasons.map(r => r.ref)).toContain('enrichment.impact.cap');
  });

  it('does not claim a cap that did not bind', async () => {
    const { result } = await assess([obs({ observedValue: 'Anthropic' })]);
    expect(result.impactCapped).toBe(false);
    expect(result.reasons.map(r => r.ref)).not.toContain('enrichment.impact.cap');
  });
});

describe('evidence attribution', () => {
  it('every finding carries the full attribution block required by §26.7', async () => {
    const { snapshot, result } = await assess([obs({ observedValue: 'Anthropic' })]);
    const [attribution] = result.findings[0].evidence;
    const source = snapshot.evidence[0];

    expect(attribution).toEqual({
      evidenceId:       source.evidenceId,
      snapshotId:       'snap_1',
      sourceUrl:        'https://acme.example/dpa',
      sourceType:       'dpa',
      collector:        'apify',
      capturedAt:       AT,
      capturedEvidence: 'Sub-processor: OpenAI, L.L.C.',
      evidenceHash:     source.evidenceHash,
      confidence:       'high',
    });
    // The hash must be the snapshot's, not a re-derivation: a finding has to be
    // checkable against the frozen evidence it cites.
    expect(attribution.evidenceHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('attributes every supporting item when a vendor was seen more than once', async () => {
    const { result } = await assess([
      obs({ observedValue: 'Anthropic', sourceUrl: 'https://acme.example/dpa' }),
      obs({ observedValue: 'Anthropic', sourceUrl: 'https://acme.example/subprocessors',
        sourceType: 'processor_list', capturedEvidence: 'Anthropic PBC processes support data' }),
    ]);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].evidence.map(e => e.sourceUrl).sort())
      .toEqual(['https://acme.example/dpa', 'https://acme.example/subprocessors']);
  });

  it('absence-based findings carry no evidence and claim none', async () => {
    const { result } = await assess([], [['s1', { vendor: 'internal' }]]);
    expect(result.findings[0].evidence).toEqual([]);
  });

  it('ignores an evidence id that is not in the snapshot rather than inventing one', () => {
    // A dangling reference must never become a fabricated citation.
    const snapshot = { snapshotId: 'snap_x', evidence: [] as EvidenceItem[] } as EvidenceSnapshot;
    const result = buildFindings(snapshot, {
      snapshotId: 'snap_x', engineVersion: 'ovd-1.0.0', rulesetVersion: 'ovd-rules-1',
      gaps: [{
        gapKind: 'undeclared_system', ruleId: 'OVD-001', subjectKey: 'openai', subject: 'OpenAI',
        confidence: 'high', scoreEligible: true, evidenceIds: ['ev_missing'], systemId: '',
      }],
      totals: { observedSubjects: 1, declaredSystems: 0, undeclared: 1, undeclaredScorable: 1, unverified: 0, registryIncomplete: 0 },
    });
    expect(result.findings[0].evidence).toEqual([]);
    // With no contractual evidence to read, it falls to the deployment rule.
    expect(result.findings[0].ruleId).toBe(FINDING_RULES.SHADOW_AI_DEPLOYED);
  });
});

describe('recommendations and explanation', () => {
  it('every finding states why it exists and what to do, in English', async () => {
    const { result } = await assess(
      [obs({ observedValue: 'Anthropic' })],
      [['s1', { vendor: 'internal' }], ['bad', { name: '', vendor: '' }]]);
    expect(result.findings).toHaveLength(3);
    for (const f of result.findings) {
      expect(f.title.length).toBeGreaterThan(10);
      expect(f.explanation.length).toBeGreaterThan(40);
      expect(f.recommendation.length).toBeGreaterThan(40);
      expect(f.reasons.length).toBeGreaterThan(0);
    }
  });

  it('the recommendation is fixed by rule, not composed per finding', async () => {
    const a = await assess([obs({ observedValue: 'Anthropic' })]);
    const b = await assess([obs({ observedValue: 'Cohere', capturedEvidence: 'Sub-processor: Cohere Inc.' })]);
    expect(a.result.findings[0].recommendation).toBe(b.result.findings[0].recommendation);
  });
});

describe('determinism', () => {
  it('same snapshot, same comparison, byte-identical output', async () => {
    const snapshot = await snapshotOf([obs({ observedValue: 'Anthropic' }), obs({ observedValue: 'Cohere' })]);
    const comparison = compareObservedVsDeclared(snapshot, inventoryOf([['s1', { vendor: 'OpenAI' }]]));
    expect(JSON.stringify(buildFindings(snapshot, comparison)))
      .toBe(JSON.stringify(buildFindings(snapshot, comparison)));
  });

  it('finding ids are derived from the snapshot, not from a clock', async () => {
    const one = await assess([obs({ observedValue: 'Anthropic' })]);
    const two = await assess([obs({ observedValue: 'Anthropic' })]);
    expect(one.result.findings[0].findingId).toBe(two.result.findings[0].findingId);
    expect(one.result.findings[0].findingId).toMatch(/^find_cf00\d_[0-9a-f]{8}$/);
  });

  it('a different snapshot yields different finding ids for the same subject', () => {
    const a = makeFindingId('CF-001', 'openai', '', 'snap_1');
    const b = makeFindingId('CF-001', 'openai', '', 'snap_2');
    expect(a).not.toBe(b);
  });

  it('orders findings by risk so the most serious lead the report', async () => {
    const { result } = await assess(
      [obs({ observedValue: 'Anthropic' })],
      [['s1', { vendor: 'internal' }], ['bad', { name: '', vendor: '' }]]);
    expect(result.findings.map(f => f.riskLevel)).toEqual(['high', 'medium', 'low']);
  });

  it('stamps the shared engine version and its own ruleset version', async () => {
    const { result } = await assess([obs({ observedValue: 'Anthropic' })]);
    expect(result.determinism).toEqual({
      engineVersion: ENGINE_VERSION, rulesetVersion: FINDINGS_RULESET_VERSION,
    });
  });

  it('counts findings by risk level', async () => {
    const { result } = await assess(
      [obs({ observedValue: 'Anthropic' }), obs({ observedValue: 'Cohere' })],
      [['s1', { vendor: 'internal' }]]);
    expect(result.counts).toEqual({ critical: 0, high: 2, medium: 0, low: 1 });
    expect(result.snapshotId).toBe('snap_1');
  });
});

describe('the guarantee the whole engine exists for', () => {
  it('a declared vendor produces no Shadow AI finding, however it was written', async () => {
    // "OpenAI, L.L.C." observed against "ChatGPT" declared must not become an
    // accusation that the customer failed to declare something they declared.
    const { result } = await assess([obs({ observedValue: 'OpenAI, L.L.C.' })], [['s1', { vendor: 'ChatGPT' }]]);
    expect(result.findings.filter(f => f.gapKind === 'undeclared_system')).toEqual([]);
    expect(result.totalImpact).toBe(0);
  });

  it('a free-text purpose cannot suppress a Shadow AI finding (D2)', async () => {
    const { result } = await assess(
      [obs({ observedValue: 'Anthropic' })],
      [['s1', { name: '', vendor: '', purpose: 'We use Anthropic for support' }]]);
    expect(result.findings.some(f => f.ruleId === FINDING_RULES.SHADOW_AI_CONTRACTUAL)).toBe(true);
  });

  it('produces nothing at all when the registry matches reality', async () => {
    const { result } = await assess([obs({ observedValue: 'OpenAI' })], [['s1', { vendor: 'OpenAI' }]]);
    expect(result.findings).toEqual([]);
    expect(result.totalImpact).toBe(0);
    expect(result.counts).toEqual({ critical: 0, high: 0, medium: 0, low: 0 });
  });
});
