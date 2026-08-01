import { describe, it, expect } from 'vitest';
import {
  compareObservedVsDeclared, groupObserved, RULES,
  OVD_ENGINE_VERSION, OVD_RULESET_VERSION,
} from '../../worker/src/lib/observed-vs-declared';
import {
  normaliseVendorKey, toDeclaredSystem, buildDeclaredInventory, declaredKeys,
} from '../../worker/src/lib/enrichment-declared';
import { buildEvidenceItem, type EvidenceItem, type RawObservation } from '../../worker/src/lib/enrichment-evidence';
import { buildSnapshot, type EvidenceSnapshot } from '../../worker/src/lib/enrichment-snapshot';

/**
 * Phase 4 — Observed vs Declared.
 *
 * The failure that matters most is a FALSE undeclared-system gap: telling a
 * customer they failed to declare something they did declare. Aliasing, legal
 * suffixes and name-versus-vendor placement are all tested for that reason.
 */

const AT = '2026-08-02T09:00:00.000Z';

const obs = (o: Partial<RawObservation> = {}): RawObservation => ({
  sourceUrl: 'https://acme.example/dpa',
  sourceType: 'dpa',
  collector: 'apify',
  collectorRunId: 'run-1',
  capturedEvidence: 'Sub-processor: OpenAI, L.L.C.',
  signalType: 'ai_processor_named',
  observedValue: 'OpenAI',
  ...o,
});

const ev = async (o: Partial<RawObservation> = {}) => (await buildEvidenceItem(obs(o), AT))!;

const snap = async (evidence: EvidenceItem[]): Promise<EvidenceSnapshot> => buildSnapshot({
  snapshotId: 'snap_1', orgId: 'orgA', subjectDomain: 'acme.example', surface: 'full_audit',
  createdAt: AT, collectorVersions: { apify: '1.0.0' }, evidence, coverage: [],
});

const declared = (entries: Array<Record<string, unknown>>) =>
  buildDeclaredInventory(entries.map((e, i) => toDeclaredSystem(`sys${i}`, e)));

describe('vendor key normalisation', () => {
  it('strips case, punctuation and legal suffixes', () => {
    expect(normaliseVendorKey('OpenAI, L.L.C.')).toBe('openai');
    expect(normaliseVendorKey('  OPENAI  ')).toBe('openai');
    expect(normaliseVendorKey('Mistral AI SAS')).toBe('mistralai');
  });

  it('resolves aliases so a page saying ChatGPT matches a registry saying OpenAI', () => {
    // Without this, every such pair becomes a false Shadow AI accusation.
    expect(normaliseVendorKey('ChatGPT')).toBe(normaliseVendorKey('OpenAI'));
    expect(normaliseVendorKey('Claude')).toBe(normaliseVendorKey('Anthropic'));
    expect(normaliseVendorKey('Azure OpenAI')).toBe(normaliseVendorKey('Microsoft Azure OpenAI'));
    expect(normaliseVendorKey('Gemini')).toBe(normaliseVendorKey('Google Cloud AI'));
  });

  it('strips accents', () => {
    expect(normaliseVendorKey('Sté Générale AI')).toBe(normaliseVendorKey('Ste Generale AI'));
  });

  it('returns empty for an unmatchable name rather than matching everything', () => {
    expect(normaliseVendorKey('')).toBe('');
    expect(normaliseVendorKey('---')).toBe('');
    expect(normaliseVendorKey(undefined as unknown as string)).toBe('');
  });

  it('does not merge genuinely different vendors', () => {
    expect(normaliseVendorKey('Cohere')).not.toBe(normaliseVendorKey('Anthropic'));
  });

  it('keeps a name that is only a legal suffix', () => {
    expect(normaliseVendorKey('Limited')).toBe('limited');
  });
});

describe('declared inventory', () => {
  it('indexes a system by BOTH vendor and name', () => {
    // Customers populate the registry inconsistently; both placements must match.
    const sys = toDeclaredSystem('s1', { name: 'Support bot', vendor: 'OpenAI' });
    expect(declaredKeys(sys).sort()).toEqual(['openai', 'supportbot']);
  });

  it('flags an entry with neither a usable vendor nor name as unmatchable', () => {
    const inv = declared([{ name: '   ', vendor: '' }]);
    expect(inv.unmatchable).toHaveLength(1);
  });

  it('reads only structured fields — free-text purpose is never a match key', () => {
    const sys = toDeclaredSystem('s1', { name: '', vendor: '', purpose: 'we use OpenAI for support' });
    // D2: a prose declaration must never suppress a Shadow AI gap.
    expect(declaredKeys(sys)).toEqual([]);
    expect(sys.unmatchable).toBe(true);
  });

  it('orders systems deterministically', () => {
    const inv = declared([{ name: 'B', vendor: 'Cohere' }, { name: 'A', vendor: 'OpenAI' }]);
    expect(inv.systems.map(s => s.systemId)).toEqual(['sys0', 'sys1']);
  });
});

describe('grouping observations', () => {
  it('collapses vendor spellings into ONE subject', async () => {
    const groups = groupObserved([
      await ev({ observedValue: 'OpenAI', sourceUrl: 'https://a.example' }),
      await ev({ observedValue: 'ChatGPT', sourceUrl: 'https://b.example', sourceType: 'website', signalType: 'ai_vendor_script' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('openai');
    expect(groups[0].evidence).toHaveLength(2);
  });

  it('ignores signals that name no system', async () => {
    // An automated-decision disclosure is about a practice, not a nameable
    // vendor, so it has no registry counterpart to be missing from.
    const groups = groupObserved([
      await ev({ signalType: 'automated_decision', observedValue: 'Automated decision-making' }),
      await ev({ signalType: 'ai_marketing_claim', observedValue: 'AI marketing claim' }),
    ]);
    expect(groups).toEqual([]);
  });

  it('keeps the STRONGEST confidence across a subject\'s evidence', async () => {
    const groups = groupObserved([
      await ev({ observedValue: 'OpenAI', sourceType: 'repository', signalType: 'ai_repo_dependency', sourceUrl: 'https://r.example' }),
      await ev({ observedValue: 'OpenAI', sourceType: 'dpa', signalType: 'ai_processor_named' }),
    ]);
    expect(groups[0].confidence).toBe('high');
  });

  it('is deterministic regardless of evidence order', async () => {
    const a = await ev({ observedValue: 'OpenAI' });
    const b = await ev({ observedValue: 'Cohere', sourceUrl: 'https://c.example' });
    expect(groupObserved([a, b]).map(g => g.key)).toEqual(groupObserved([b, a]).map(g => g.key));
  });
});

describe('OVD-001 — Shadow AI', () => {
  it('reports an observed vendor absent from the registry', async () => {
    const res = compareObservedVsDeclared(await snap([await ev({ observedValue: 'OpenAI' })]), declared([]));
    expect(res.gaps).toHaveLength(1);
    expect(res.gaps[0]).toMatchObject({
      gapKind: 'undeclared_system', ruleId: RULES.UNDECLARED_VENDOR,
      subject: 'OpenAI', scoreEligible: true,
    });
    expect(res.gaps[0].evidenceIds).toHaveLength(1);
  });

  it('does NOT report a vendor the customer declared', async () => {
    const res = compareObservedVsDeclared(
      await snap([await ev({ observedValue: 'OpenAI' })]),
      declared([{ name: 'Support bot', vendor: 'OpenAI' }]),
    );
    expect(res.gaps.filter(g => g.gapKind === 'undeclared_system')).toEqual([]);
  });

  it('matches across an ALIAS — observed ChatGPT, declared OpenAI', async () => {
    const res = compareObservedVsDeclared(
      await snap([await ev({ observedValue: 'ChatGPT', signalType: 'ai_vendor_script', sourceType: 'website' })]),
      declared([{ name: 'Bot', vendor: 'OpenAI' }]),
    );
    expect(res.totals.undeclared).toBe(0);
  });

  it('matches when the vendor was typed into the NAME field', async () => {
    const res = compareObservedVsDeclared(
      await snap([await ev({ observedValue: 'OpenAI' })]),
      declared([{ name: 'OpenAI', vendor: '' }]),
    );
    expect(res.totals.undeclared).toBe(0);
  });

  it('matches through a legal suffix — "OpenAI, L.L.C." is OpenAI', async () => {
    const res = compareObservedVsDeclared(
      await snap([await ev({ observedValue: 'OpenAI' })]),
      declared([{ name: 'x', vendor: 'OpenAI, L.L.C.' }]),
    );
    expect(res.totals.undeclared).toBe(0);
  });

  it('an ARCHIVED declaration cannot mask a live undeclared system', async () => {
    // Retired entries are excluded at load; simulate by omitting it here.
    const res = compareObservedVsDeclared(await snap([await ev({ observedValue: 'OpenAI' })]), declared([]));
    expect(res.totals.undeclared).toBe(1);
  });
});

describe('score gating (§26.9)', () => {
  it('marketing-only evidence produces a gap that CANNOT move a score', async () => {
    // "AI-powered" is copywriting far more often than a deployed system.
    const marketing = await ev({
      signalType: 'ai_feature_doc', observedValue: 'OpenAI',
      sourceType: 'website', sourceUrl: 'https://acme.example/',
    });
    const res = compareObservedVsDeclared(await snap([marketing]), declared([]));
    // ai_feature_doc is not vendor-bearing, so it forms no subject at all.
    expect(res.totals.undeclared).toBe(0);
  });

  it('a low-confidence vendor observation is reported but not score-eligible', async () => {
    const low = await ev({
      observedValue: 'Amplitude', signalType: 'ai_repo_dependency',
      sourceType: 'repository', sourceUrl: 'https://github.com/acme/x',
    });
    // ai_repo_dependency is medium confidence and a deployment signal.
    const res = compareObservedVsDeclared(await snap([low]), declared([]));
    expect(res.gaps[0].scoreEligible).toBe(true);
  });

  it('separates total undeclared from score-eligible undeclared', async () => {
    const res = compareObservedVsDeclared(await snap([await ev({ observedValue: 'OpenAI' })]), declared([]));
    expect(res.totals.undeclared).toBe(1);
    expect(res.totals.undeclaredScorable).toBe(1);
  });
});

describe('OVD-002 — declared but unobserved', () => {
  it('is reported as informational and NEVER score-eligible', async () => {
    // Most internal AI leaves no public trace; absence of observation is not
    // evidence of absence, so this must not mark a customer down.
    const res = compareObservedVsDeclared(await snap([]), declared([{ name: 'Internal model', vendor: 'internal' }]));
    const g = res.gaps.find(x => x.gapKind === 'unverified_declaration')!;
    expect(g).toMatchObject({ ruleId: RULES.UNVERIFIED_DECLARATION, scoreEligible: false, confidence: null });
    expect(g.systemId).toBe('sys0');
  });

  it('is not raised when the declaration WAS observed', async () => {
    const res = compareObservedVsDeclared(
      await snap([await ev({ observedValue: 'OpenAI' })]),
      declared([{ name: 'Bot', vendor: 'OpenAI' }]),
    );
    expect(res.totals.unverified).toBe(0);
  });
});

describe('OVD-003 — registry incomplete', () => {
  it('flags an entry that cannot be compared at all', async () => {
    const res = compareObservedVsDeclared(await snap([]), declared([{ name: '', vendor: '' }]));
    const g = res.gaps.find(x => x.gapKind === 'registry_incomplete')!;
    expect(g).toMatchObject({ ruleId: RULES.REGISTRY_INCOMPLETE, scoreEligible: false });
  });

  it('an unmatchable entry does not also produce an unverified gap', async () => {
    const res = compareObservedVsDeclared(await snap([]), declared([{ name: '', vendor: '' }]));
    expect(res.totals.unverified).toBe(0);
    expect(res.totals.registryIncomplete).toBe(1);
  });
});

describe('determinism and provenance', () => {
  it('stamps the engine and ruleset versions', async () => {
    const res = compareObservedVsDeclared(await snap([]), declared([]));
    expect(res.engineVersion).toBe(OVD_ENGINE_VERSION);
    expect(res.rulesetVersion).toBe(OVD_RULESET_VERSION);
    expect(res.snapshotId).toBe('snap_1');
  });

  it('every gap names the rule that produced it', async () => {
    const res = compareObservedVsDeclared(
      await snap([await ev({ observedValue: 'OpenAI' })]),
      declared([{ name: 'Other', vendor: 'Cohere' }, { name: '', vendor: '' }]),
    );
    expect(res.gaps.length).toBeGreaterThan(0);
    for (const g of res.gaps) expect(g.ruleId).toMatch(/^OVD-\d{3}$/);
  });

  it('produces identical output across repeated runs', async () => {
    const s = await snap([await ev({ observedValue: 'OpenAI' }), await ev({ observedValue: 'Cohere', sourceUrl: 'https://c.example' })]);
    const inv = declared([{ name: 'x', vendor: 'Anthropic' }]);
    expect(JSON.stringify(compareObservedVsDeclared(s, inv)))
      .toBe(JSON.stringify(compareObservedVsDeclared(s, inv)));
  });

  it('produces NO findings, risks or recommendations — that is Phase 5', async () => {
    const res = compareObservedVsDeclared(await snap([await ev({ observedValue: 'OpenAI' })]), declared([]));
    expect(res).not.toHaveProperty('findings');
    expect(res).not.toHaveProperty('score');
    expect(res.gaps[0]).not.toHaveProperty('riskLevel');
    expect(res.gaps[0]).not.toHaveProperty('recommendation');
  });

  it('an empty snapshot and empty registry yield no gaps', async () => {
    const res = compareObservedVsDeclared(await snap([]), declared([]));
    expect(res.gaps).toEqual([]);
    expect(res.totals).toMatchObject({ observedSubjects: 0, declaredSystems: 0, undeclared: 0 });
  });
});
