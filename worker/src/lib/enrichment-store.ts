/**
 * Audit Enrichment — snapshot persistence (cahier §26.7).
 *
 * The ONLY I/O module in the enrichment core. enrichment-evidence.ts and
 * enrichment-snapshot.ts stay pure so the deterministic contract in
 * lib/determinism.ts is provable rather than asserted.
 *
 * Storage: `organizations/{orgId}/enrichment_snapshots/{snapshotId}`.
 * Org-scoped like every other tenant record, so isolation is structural — the
 * path itself carries the tenant, and no query can cross it.
 *
 * RETENTION: a snapshot must outlive the report that cites it. A finding whose
 * evidence has been deleted is an unsupported assertion, which is exactly what
 * §26.7 exists to prevent. No TTL is set here on purpose.
 */

import { firestoreGet, firestoreSet, firestoreRunQuery } from './firestoreAdmin';
import type { EvidenceSnapshot, CoverageEntry } from './enrichment-snapshot';
import type { EvidenceItem } from './enrichment-evidence';

const COLLECTION = (orgId: string) => `organizations/${orgId}/enrichment_snapshots`;

/** New snapshot id. Random, not content-derived: two runs are distinct events. */
export function newSnapshotId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return `snap_${btoa(String.fromCharCode(...b)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
}

/**
 * Firestore rejects nested arrays of maps in some client paths and the REST
 * encoder here handles them, but evidence and coverage are stored as JSON strings
 * regardless: they are an OPAQUE, IMMUTABLE blob to the database. Nothing queries
 * inside them, and serialising them whole guarantees the bytes that come back are
 * the bytes that went in — which is what the digest check verifies.
 */
export async function saveSnapshot(saJson: string, snapshot: EvidenceSnapshot): Promise<void> {
  await firestoreSet(saJson, `${COLLECTION(snapshot.orgId)}/${snapshot.snapshotId}`, {
    snapshotId:    snapshot.snapshotId,
    orgId:         snapshot.orgId,
    subjectDomain: snapshot.subjectDomain,
    surface:       snapshot.surface,
    createdAt:     snapshot.createdAt,
    schemaVersion: snapshot.schemaVersion,
    droppedCount:  snapshot.droppedCount,
    digest:        snapshot.digest,
    evidenceCount: snapshot.evidence.length,
    collectorVersions: JSON.stringify(snapshot.collectorVersions),
    evidenceJson:  JSON.stringify(snapshot.evidence),
    coverageJson:  JSON.stringify(snapshot.coverage),
  });
}

const s = (v: unknown): string => (typeof v === 'string' ? v : '');
const n = (v: unknown): number => (typeof v === 'number' ? v : 0);

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function toSnapshot(f: Record<string, unknown>): EvidenceSnapshot {
  return {
    snapshotId:    s(f.snapshotId),
    orgId:         s(f.orgId),
    subjectDomain: s(f.subjectDomain),
    surface:       s(f.surface),
    createdAt:     s(f.createdAt),
    schemaVersion: n(f.schemaVersion),
    collectorVersions: parseJson<Record<string, string>>(f.collectorVersions, {}),
    evidence:      parseJson<EvidenceItem[]>(f.evidenceJson, []),
    coverage:      parseJson<CoverageEntry[]>(f.coverageJson, []),
    droppedCount:  n(f.droppedCount),
    digest:        s(f.digest),
  };
}

/** Load one snapshot. Returns null when absent — never throws for a missing id. */
export async function loadSnapshot(saJson: string, orgId: string, snapshotId: string): Promise<EvidenceSnapshot | null> {
  const doc = await firestoreGet(saJson, `${COLLECTION(orgId)}/${snapshotId}`);
  return doc ? toSnapshot(doc as Record<string, unknown>) : null;
}

export interface SnapshotSummary {
  snapshotId: string; subjectDomain: string; surface: string;
  createdAt: string; evidenceCount: number; digest: string;
}

/**
 * Recent snapshots for an org, newest first, WITHOUT their evidence.
 *
 * The summary projection is the point: listing snapshots to pick one must not
 * drag every stored excerpt back through the worker. Evidence is fetched only by
 * loadSnapshot, for the one snapshot actually being scored or displayed.
 */
export async function listSnapshots(saJson: string, orgId: string, limit = 20): Promise<SnapshotSummary[]> {
  const rows = await firestoreRunQuery(saJson, {
    from:   [{ collectionId: 'enrichment_snapshots' }],
    select: { fields: [
      { fieldPath: 'snapshotId' }, { fieldPath: 'subjectDomain' }, { fieldPath: 'surface' },
      { fieldPath: 'createdAt' }, { fieldPath: 'evidenceCount' }, { fieldPath: 'digest' },
    ] },
    limit,
  }, `organizations/${orgId}`);

  return rows
    .map(r => {
      const f = r.fields as Record<string, unknown>;
      return {
        snapshotId: s(f.snapshotId) || (r.name.split('/').pop() ?? ''),
        subjectDomain: s(f.subjectDomain), surface: s(f.surface),
        createdAt: s(f.createdAt), evidenceCount: n(f.evidenceCount), digest: s(f.digest),
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}
