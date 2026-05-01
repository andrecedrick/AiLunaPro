import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createReportFromDraft,
  loadExports,
  loadReports,
  saveExports,
  saveReports,
} from '../lib/reports/storage';
import {
  fsCreateReport,
  fsDeleteReport,
  fsListAllExports,
  fsListReports,
  fsRecordExport,
} from '../lib/reports/firestoreReportsService';
import type { AuditDraft } from '../types/audit';
import type { ExportEvent, ExportKind, Report } from '../types/report';
import type { AuditResult } from '../types/scoring';
import { resolveLayer } from '../lib/featureFlags';
import { useAuth } from './AuthContext';

// ─── Feature flag ─────────────────────────────────────────────────────────────

const LAYER = resolveLayer('reports');

// ─── Context shape ────────────────────────────────────────────────────────────

export type ReportsLoadStatus = 'loading' | 'loaded' | 'error';

interface ReportsContextValue {
  reports: Report[];
  exportEvents: ExportEvent[];
  /** 'loading' only in firebase mode while initial fetch is in flight. */
  status: ReportsLoadStatus;
  /** Create a new published report from a draft + computed result. Returns the new id. */
  createReport: (draft: AuditDraft, result: AuditResult) => string;
  /** Permanently remove a report and all its export events. */
  deleteReport: (reportId: string) => void;
  /** Append a typed export event for a report. */
  recordExport: (
    reportId: string,
    kind: ExportKind,
    meta?: Record<string, string>,
  ) => ExportEvent;
  /** Lookup helpers. */
  getReport: (reportId: string) => Report | undefined;
  getExportsForReport: (reportId: string) => ExportEvent[];
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ReportsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const orgId = session?.orgId ?? null;
  const uid   = session?.userId ?? null;

  const [reports, setReports] = useState<Report[]>(() =>
    LAYER === 'mock' ? loadReports() : [],
  );
  const [exportEvents, setExportEvents] = useState<ExportEvent[]>(() =>
    LAYER === 'mock' ? loadExports() : [],
  );
  const [status, setStatus] = useState<ReportsLoadStatus>(
    LAYER === 'mock' ? 'loaded' : 'loading',
  );

  // ── Firebase: load reports + exports on mount ─────────────────────────────

  useEffect(() => {
    if (LAYER === 'mock') return;
    if (!orgId) return;

    let cancelled = false;
    setStatus('loading');

    fsListReports(orgId)
      .then(async loadedReports => {
        if (cancelled) return;
        const ids = loadedReports.map(r => r.id);
        const loadedExports = await fsListAllExports(orgId, ids);
        if (cancelled) return;
        setReports(loadedReports);
        setExportEvents(loadedExports);
        setStatus('loaded');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, [orgId]);

  // ── Mock: mirror to localStorage on every change ──────────────────────────

  useEffect(() => {
    if (LAYER === 'mock') saveReports(reports);
  }, [reports]);

  useEffect(() => {
    if (LAYER === 'mock') saveExports(exportEvents);
  }, [exportEvents]);

  // ── CRUD — mock path ───────────────────────────────────────────────────────

  const createReportMock = useCallback(
    (draft: AuditDraft, result: AuditResult): string => {
      const report = createReportFromDraft(draft, result);
      setReports(prev => [report, ...prev]);
      return report.id;
    },
    [],
  );

  const deleteReportMock = useCallback((reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    setExportEvents(prev => prev.filter(e => e.reportId !== reportId));
  }, []);

  const recordExportMock = useCallback(
    (reportId: string, kind: ExportKind, meta?: Record<string, string>): ExportEvent => {
      const event: ExportEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        reportId,
        kind,
        createdAt: new Date().toISOString(),
        meta,
      };
      setExportEvents(prev => [event, ...prev]);
      return event;
    },
    [],
  );

  // ── CRUD — firebase path ───────────────────────────────────────────────────

  const createReportFirebase = useCallback(
    (draft: AuditDraft, result: AuditResult): string => {
      const report = createReportFromDraft(draft, result);
      // Optimistic local update
      setReports(prev => [report, ...prev]);
      // Async persist — full snapshot included
      if (orgId && uid) {
        fsCreateReport(orgId, uid, report).catch(err =>
          console.error('[ReportsContext] fsCreateReport failed:', err),
        );
      }
      return report.id;
    },
    [orgId, uid],
  );

  const deleteReportFirebase = useCallback(
    (reportId: string) => {
      // Optimistic local update
      setReports(prev => prev.filter(r => r.id !== reportId));
      setExportEvents(prev => prev.filter(e => e.reportId !== reportId));
      // Async batch delete (report doc + exports subcollection)
      if (orgId) {
        fsDeleteReport(orgId, reportId).catch(err =>
          console.error('[ReportsContext] fsDeleteReport failed:', err),
        );
      }
    },
    [orgId],
  );

  const recordExportFirebase = useCallback(
    (reportId: string, kind: ExportKind, meta?: Record<string, string>): ExportEvent => {
      const event: ExportEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        reportId,
        kind,
        createdAt: new Date().toISOString(),
        meta,
      };
      // Optimistic local update
      setExportEvents(prev => [event, ...prev]);
      // Async persist to exports subcollection
      if (orgId) {
        fsRecordExport(orgId, reportId, event).catch(err =>
          console.error('[ReportsContext] fsRecordExport failed:', err),
        );
      }
      return event;
    },
    [orgId],
  );

  // ── Bind correct implementation ────────────────────────────────────────────

  const createReport  = LAYER === 'firebase' ? createReportFirebase  : createReportMock;
  const deleteReport  = LAYER === 'firebase' ? deleteReportFirebase  : deleteReportMock;
  const recordExport  = LAYER === 'firebase' ? recordExportFirebase  : recordExportMock;

  // ── Lookup helpers ─────────────────────────────────────────────────────────

  const getReport = useCallback(
    (reportId: string) => reports.find(r => r.id === reportId),
    [reports],
  );

  const getExportsForReport = useCallback(
    (reportId: string) => exportEvents.filter(e => e.reportId === reportId),
    [exportEvents],
  );

  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo<ReportsContextValue>(
    () => ({
      reports,
      exportEvents,
      status,
      createReport,
      deleteReport,
      recordExport,
      getReport,
      getExportsForReport,
    }),
    [reports, exportEvents, status, createReport, deleteReport, recordExport, getReport, getExportsForReport],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports(): ReportsContextValue {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used inside ReportsProvider');
  return ctx;
}
