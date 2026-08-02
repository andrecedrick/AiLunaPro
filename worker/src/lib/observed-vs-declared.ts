/**
 * Observed vs Declared engine (cahier §26.5, §26.9).
 *
 * PURE. No network, no Firestore, no clock. Input is a frozen snapshot plus the
 * declared inventory; output is a set of GAPS. Same inputs always yield the same
 * gaps in the same order — that is what makes an audit reproducible from
 * (snapshotId, engineVersion, rulesetVersion).
 *
 * SCOPE: this phase stops at the GAP. It does not produce compliance findings,
 * risk classifications or recommendations — those are Phase 5. A gap is a factual
 * statement ("this vendor was observed and is not in the registry"); a finding is
 * a judgement about it.
 *
 * Every gap carries a ruleId. §26.9 forbids unsourced numbers, and the same
 * discipline is applied to conclusions: a gap that cannot name the rule that
 * produced it has no place in a compliance report.
 */

import type { EvidenceSnapshot } from './enrichment-snapshot';
import type { EvidenceItem, Confidence, SignalType } from './enrichment-evidence';
import { normaliseVendorKey, type DeclaredInventory, type DeclaredSystem } from './enrichment-declared';
import { isGenericSubject } from './enrichment-signals';

/** Bumped when the comparison logic changes in a way that alters output. */
export const OVD_ENGINE_VERSION = 'ovd-1.0.0';
/** Bumped when the rule table below changes. */
export const OVD_RULESET_VERSION = 'ovd-rules-1';

export const GAP_KINDS = [
  'undeclared_system',      // observed, not in the registry — Shadow AI
  'unverified_declaration', // declared, no public evidence — informational only
  'registry_incomplete',    // entry cannot be compared (no vendor, no usable name)
] as const;
export type GapKind = (typeof GAP_KINDS)[number];

export const RULES = {
  UNDECLARED_VENDOR:      'OVD-001',
  UNVERIFIED_DECLARATION: 'OVD-002',
  REGISTRY_INCOMPLETE:    'OVD-003',
} as const;

/**
 * Signal types that can establish a system is actually IN USE.
 *
 * A marketing claim cannot. "AI-powered analytics" on a landing page is
 * copywriting far more often than it is a deployed system, and §26.9 requires a
 * threshold gating what may affect a score. Marketing-only evidence still
 * produces a gap — it is reported — but the gap is not score-eligible.
 */
const DEPLOYMENT_SIGNALS: readonly SignalType[] = [
  'ai_vendor_script', 'ai_processor_named', 'ai_repo_dependency', 'ai_feature_doc',
];

const CONFIDENCE_RANK: Record<Confidence, number> = { high: 0, medium: 1, low: 2 };

export interface Gap {
  gapKind:    GapKind;
  ruleId:     string;
  /** Normalised match key the gap is about. */
  subjectKey: string;
  /** Human-readable subject: vendor name, or the declared system's name. */
  subject:    string;
  /**
   * Strongest confidence among the supporting evidence. Absent for gaps that are
   * about the ABSENCE of evidence (unverified_declaration, registry_incomplete).
   */
  confidence: Confidence | null;
  /**
   * Whether this gap may influence a score (§26.9). False when the only support
   * is marketing copy, or when the gap is informational by nature.
   */
  scoreEligible: boolean;
  /** Evidence ids supporting the gap. Empty for absence-based gaps. */
  evidenceIds: string[];
  /** Registry entry this gap concerns, when it concerns one. */
  systemId:   string;
}

export interface ComparisonResult {
  snapshotId:     string;
  engineVersion:  string;
  rulesetVersion: string;
  gaps:           Gap[];
  /** Counts, so a caller need not re-scan the gap list. */
  totals: {
    observedSubjects:   number;
    declaredSystems:    number;
    undeclared:         number;
    undeclaredScorable: number;
    unverified:         number;
    registryIncomplete: number;
  };
}

/** Observed subject: one normalised vendor/system with its supporting evidence. */
interface ObservedSubject {
  key:         string;
  label:       string;
  evidence:    EvidenceItem[];
  confidence:  Confidence;
  deployed:    boolean;
}

/**
 * Group evidence by the thing it is about.
 *
 * Keyed on the normalised observed value so "OpenAI", "ChatGPT" and
 * "OpenAI, L.L.C." collapse to one subject rather than three gaps about the same
 * vendor. Only vendor-bearing signals participate: an `automated_decision`
 * observation is about a practice, not a nameable system, and has no registry
 * counterpart to be missing from.
 */
export function groupObserved(evidence: readonly EvidenceItem[]): ObservedSubject[] {
  const VENDOR_BEARING: readonly SignalType[] = [
    'ai_vendor_script', 'ai_processor_named', 'ai_repo_dependency',
  ];
  const byKey = new Map<string, ObservedSubject>();

  for (const e of evidence) {
    if (!VENDOR_BEARING.includes(e.signalType)) continue;
    // A repo dependency is vendor-bearing, but the detector falls back to the
    // category "AI/ML dependency" when it recognises a library without
    // recognising its vendor. That is real evidence about a practice, not the
    // name of a system — turning it into a subject produced a HIGH-risk finding
    // accusing the customer of failing to declare "AI/ML dependency", which they
    // could never satisfy.
    if (isGenericSubject(e.observedValue)) continue;
    const key = normaliseVendorKey(e.observedValue);
    if (!key) continue;

    const existing = byKey.get(key);
    if (existing) {
      existing.evidence.push(e);
      if (CONFIDENCE_RANK[e.confidence] < CONFIDENCE_RANK[existing.confidence]) existing.confidence = e.confidence;
      existing.deployed = existing.deployed || DEPLOYMENT_SIGNALS.includes(e.signalType);
    } else {
      byKey.set(key, {
        key, label: e.observedValue, evidence: [e],
        confidence: e.confidence,
        deployed: DEPLOYMENT_SIGNALS.includes(e.signalType),
      });
    }
  }

  // Canonical order — the comparison must not depend on evidence ordering.
  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Did any observed subject correspond to this declared system? */
function matched(sys: DeclaredSystem, observedKeys: ReadonlySet<string>): boolean {
  return Boolean((sys.vendorKey && observedKeys.has(sys.vendorKey))
    || (sys.nameKey && observedKeys.has(sys.nameKey)));
}

/**
 * Compare a frozen snapshot against the declared inventory.
 *
 * The caller MUST have verified snapshot integrity first
 * (verifySnapshotIntegrity): comparing altered evidence would produce a
 * conclusion nobody can reproduce.
 */
export function compareObservedVsDeclared(
  snapshot: EvidenceSnapshot, declared: DeclaredInventory,
): ComparisonResult {
  const observed = groupObserved(snapshot.evidence);
  const observedKeys = new Set(observed.map(o => o.key));
  const gaps: Gap[] = [];

  // ── OVD-001 — observed but not declared. This is Shadow AI. ──
  for (const subject of observed) {
    if (declared.index.has(subject.key)) continue;
    gaps.push({
      gapKind: 'undeclared_system',
      ruleId: RULES.UNDECLARED_VENDOR,
      subjectKey: subject.key,
      subject: subject.label,
      confidence: subject.confidence,
      // Gated per §26.9: a vendor known only from marketing copy is reported but
      // does not move a score. Penalising a customer for their own copywriting
      // is a false positive with a real consequence.
      scoreEligible: subject.deployed && subject.confidence !== 'low',
      evidenceIds: subject.evidence.map(e => e.evidenceId).sort(),
      systemId: '',
    });
  }

  // ── OVD-002 — declared but no public evidence. INFORMATIONAL. ──
  // Not a failure and never score-eligible: most internal AI leaves no public
  // trace, so absence of observation is not evidence of absence. It is reported
  // so an auditor can ask, not so a customer can be marked down.
  for (const sys of declared.systems) {
    if (sys.unmatchable) continue;
    if (matched(sys, observedKeys)) continue;
    gaps.push({
      gapKind: 'unverified_declaration',
      ruleId: RULES.UNVERIFIED_DECLARATION,
      subjectKey: sys.vendorKey || sys.nameKey,
      subject: sys.vendor || sys.name,
      confidence: null,
      scoreEligible: false,
      evidenceIds: [],
      systemId: sys.systemId,
    });
  }

  // ── OVD-003 — registry entry that cannot be compared at all. ──
  for (const sys of declared.unmatchable) {
    gaps.push({
      gapKind: 'registry_incomplete',
      ruleId: RULES.REGISTRY_INCOMPLETE,
      subjectKey: '',
      subject: sys.name || sys.systemId,
      confidence: null,
      scoreEligible: false,
      evidenceIds: [],
      systemId: sys.systemId,
    });
  }

  // Canonical ordering: kind, then subject, then registry id. Deterministic
  // output is a hard requirement, not a convenience.
  gaps.sort((a, b) =>
    a.gapKind.localeCompare(b.gapKind) ||
    a.subjectKey.localeCompare(b.subjectKey) ||
    a.subject.localeCompare(b.subject) ||
    a.systemId.localeCompare(b.systemId));

  const undeclared = gaps.filter(g => g.gapKind === 'undeclared_system');
  return {
    snapshotId: snapshot.snapshotId,
    engineVersion: OVD_ENGINE_VERSION,
    rulesetVersion: OVD_RULESET_VERSION,
    gaps,
    totals: {
      observedSubjects:   observed.length,
      declaredSystems:    declared.systems.length,
      undeclared:         undeclared.length,
      undeclaredScorable: undeclared.filter(g => g.scoreEligible).length,
      unverified:         gaps.filter(g => g.gapKind === 'unverified_declaration').length,
      registryIncomplete: gaps.filter(g => g.gapKind === 'registry_incomplete').length,
    },
  };
}
