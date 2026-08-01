/**
 * Enrichment client — reads the stored evidence view for a workspace.
 *
 * READ ONLY from the SPA's point of view: the panel renders a frozen snapshot
 * assembled by the worker. No scoring, matching or interpretation happens in the
 * browser, because a number computed twice in two languages eventually disagrees
 * with itself, and this one has to be reproducible (§26.6).
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type Confidence = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CoverageState =
  | 'succeeded' | 'partial' | 'rate_limited' | 'unavailable' | 'blocked' | 'not_attempted';

export interface EvidenceAttribution {
  evidenceId:       string;
  snapshotId:       string;
  sourceUrl:        string;
  sourceType:       string;
  collector:        string;
  capturedAt:       string;
  capturedEvidence: string;
  evidenceHash:     string;
  confidence:       Confidence;
}

export interface Finding {
  findingId:      string;
  ruleId:         string;
  gapKind:        string;
  subject:        string;
  subjectKey:     string;
  systemId:       string;
  riskLevel:      RiskLevel;
  title:          string;
  explanation:    string;
  recommendation: string;
  evidence:       EvidenceAttribution[];
  scoreImpact:    number;
}

export interface ObservedSystem {
  key:               string;
  name:              string;
  confidence:        Confidence;
  deployed:          boolean;
  signalTypes:       string[];
  evidenceIds:       string[];
  declared:          boolean;
  declaredSystemIds: string[];
}

export interface DeclaredSystem {
  systemId:    string;
  name:        string;
  vendor:      string;
  riskLevel:   string;
  status:      string;
  department:  string;
  observed:    boolean;
  unmatchable: boolean;
}

export interface CoverageEntry {
  sourceType:  string;
  collector:   string;
  state:       CoverageState;
  reason:      string;
  attemptedAt: string;
}

export interface EnrichmentReportView {
  viewVersion:   string;
  snapshotId:    string;
  subjectDomain: string;
  surface:       string;
  createdAt:     string;
  schemaVersion: number;
  digest:        string;
  integrityVerified: boolean;
  collectorVersions: Record<string, string>;
  determinism: {
    engineVersion:            string;
    comparisonEngineVersion:  string;
    comparisonRulesetVersion: string;
    findingsRulesetVersion:   string;
  };
  observedSystems: ObservedSystem[];
  declaredSystems: DeclaredSystem[];
  gaps: Array<{
    gapKind: string; ruleId: string; subjectKey: string; subject: string;
    confidence: Confidence | null; scoreEligible: boolean; evidenceIds: string[]; systemId: string;
  }>;
  findings: Finding[];
  coverage: {
    summary: {
      total: number; succeeded: number; partial: number; rateLimited: number;
      unavailable: number; blocked: number; notAttempted: number;
      complete: boolean; missing: CoverageEntry[];
    };
    entries: CoverageEntry[];
  };
  droppedCount: number;
  totals: {
    observedSubjects: number; declaredSystems: number; undeclared: number;
    undeclaredScorable: number; unverified: number; registryIncomplete: number;
  };
  totalImpact:  number;
  impactCapped: boolean;
  counts:       Record<string, number>;
}

export interface SnapshotSummary {
  snapshotId: string; subjectDomain: string; surface: string;
  createdAt: string; evidenceCount: number; digest: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken();
  if (!token) throw new Error('AUTH_REQUIRED');
  return { Authorization: `Bearer ${token}` };
}

/** Read the assembled view for one snapshot. */
export async function fetchEnrichmentReport(orgId: string, snapshotId: string): Promise<EnrichmentReportView> {
  const res = await fetch(
    `${WORKER_BASE}/api/enrichment/report?orgId=${encodeURIComponent(orgId)}&snapshotId=${encodeURIComponent(snapshotId)}`,
    { headers: await authHeaders() },
  );
  if (!res.ok) {
    // The code is preserved so the caller can distinguish "no evidence yet" from
    // "this evidence was altered" — they mean very different things to a user.
    const body = await res.json().catch(() => ({})) as { code?: string };
    throw new Error(body.code ?? `HTTP_${res.status}`);
  }
  return res.json() as Promise<EnrichmentReportView>;
}

/** Recent snapshots for the workspace, newest first. */
export async function listEnrichmentSnapshots(orgId: string, limit = 20): Promise<SnapshotSummary[]> {
  const res = await fetch(
    `${WORKER_BASE}/api/enrichment/snapshots?orgId=${encodeURIComponent(orgId)}&limit=${limit}`,
    { headers: await authHeaders() },
  );
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const body = await res.json() as { snapshots?: SnapshotSummary[] };
  return body.snapshots ?? [];
}
