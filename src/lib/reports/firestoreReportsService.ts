/**
 * Reports — Firestore service (Phase F.3).
 *
 * Collections:
 *   /organizations/{orgId}/reports/{reportId}
 *   /organizations/{orgId}/reports/{reportId}/exports/{exportId}
 *
 * Consumed only by ReportsContext when resolveLayer('reports') === 'firebase'.
 * Nothing in the UI tree imports this file directly.
 *
 * Snapshot contract:
 *   createReport persists the full Report object (including answersSnapshot).
 *   The detail view always reads from this snapshot — never from the live draft.
 *   Export events are stored in a subcollection and stay separate from report content.
 *
 * Write strategy:
 *   - createReport:  single setDoc (report doc with full snapshot)
 *   - deleteReport:  batch — report doc + all exports subcollection docs
 *   - recordExport:  single setDoc on exports subcollection
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firestore';
import type { Report, ExportEvent } from '../../types/report';

// ─── Path helpers ─────────────────────────────────────────────────────────────

function reportsCol(orgId: string) {
  return collection(db, 'organizations', orgId, 'reports');
}

function reportDoc(orgId: string, reportId: string) {
  return doc(db, 'organizations', orgId, 'reports', reportId);
}

function exportsCol(orgId: string, reportId: string) {
  return collection(db, 'organizations', orgId, 'reports', reportId, 'exports');
}

function exportDoc(orgId: string, reportId: string, exportId: string) {
  return doc(db, 'organizations', orgId, 'reports', reportId, 'exports', exportId);
}

// ─── Firestore document shapes ────────────────────────────────────────────────

/**
 * FsReportDoc = Report fields + organizationId (required by rules) + createdBy.
 * answersSnapshot is persisted as-is — snapshot stability guaranteed by design.
 */
interface FsReportDoc extends Report {
  organizationId: string;
  createdBy: string;
}

/** FsExportDoc = ExportEvent fields (reportId already present on ExportEvent). */
type FsExportDoc = ExportEvent;

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Load all reports for an org, ordered by createdAt descending.
 */
export async function fsListReports(orgId: string): Promise<Report[]> {
  const q = query(reportsCol(orgId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    // Strip Firestore-only fields before returning typed Report
    const { organizationId: _o, createdBy: _c, ...report } = d.data() as FsReportDoc;
    return report as Report;
  });
}

/**
 * Load all export events for a list of report IDs.
 * Fires one getDocs per report (N+1 acceptable for small report lists).
 */
export async function fsListAllExports(
  orgId: string,
  reportIds: string[],
): Promise<ExportEvent[]> {
  if (reportIds.length === 0) return [];
  // allSettled, NOT Promise.all: one failed per-report export read must not
  // reject the whole batch and wipe the entire export history. Keep the
  // successful reports' exports and warn on the rest.
  const settled = await Promise.allSettled(
    reportIds.map(async reportId => {
      const q = query(exportsCol(orgId, reportId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FsExportDoc);
    }),
  );
  const out: ExportEvent[] = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      out.push(...r.value);
    } else {
      console.warn('[fsListAllExports] export read failed for report, skipped:', reportIds[i], r.reason);
    }
  });
  return out;
}

/**
 * Persist a new report with full snapshot.
 * organizationId added for Firestore rule validation.
 */
export async function fsCreateReport(
  orgId: string,
  uid: string,
  report: Report,
): Promise<void> {
  const fsReport: FsReportDoc = {
    ...report,
    organizationId: orgId,
    createdBy: uid,
  };
  await setDoc(reportDoc(orgId, report.id), fsReport);
}

/**
 * Delete a report and all its exports subcollection docs atomically.
 * Firestore does not auto-delete subcollections — manual cleanup required.
 */
export async function fsDeleteReport(orgId: string, reportId: string): Promise<void> {
  const exSnap = await getDocs(exportsCol(orgId, reportId));
  const batch = writeBatch(db);
  exSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(reportDoc(orgId, reportId));
  await batch.commit();
}

/**
 * Record a typed export event in the report's exports subcollection.
 */
export async function fsRecordExport(
  orgId: string,
  reportId: string,
  event: ExportEvent,
): Promise<void> {
  await setDoc(exportDoc(orgId, reportId, event.id), event as FsExportDoc);
}
