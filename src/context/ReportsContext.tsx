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
import type { AuditDraft } from '../types/audit';
import type { ExportEvent, ExportKind, Report } from '../types/report';
import type { AuditResult } from '../types/scoring';

interface ReportsContextValue {
  reports: Report[];
  exportEvents: ExportEvent[];
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

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(() => loadReports());
  const [exportEvents, setExportEvents] = useState<ExportEvent[]>(() => loadExports());

  /* Mirror to localStorage. */
  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  useEffect(() => {
    saveExports(exportEvents);
  }, [exportEvents]);

  const createReport = useCallback(
    (draft: AuditDraft, result: AuditResult): string => {
      const report = createReportFromDraft(draft, result);
      setReports(prev => [report, ...prev]);
      return report.id;
    },
    [],
  );

  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    setExportEvents(prev => prev.filter(e => e.reportId !== reportId));
  }, []);

  const recordExport = useCallback(
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

  const getReport = useCallback(
    (reportId: string) => reports.find(r => r.id === reportId),
    [reports],
  );

  const getExportsForReport = useCallback(
    (reportId: string) => exportEvents.filter(e => e.reportId === reportId),
    [exportEvents],
  );

  const value = useMemo<ReportsContextValue>(
    () => ({
      reports,
      exportEvents,
      createReport,
      deleteReport,
      recordExport,
      getReport,
      getExportsForReport,
    }),
    [reports, exportEvents, createReport, deleteReport, recordExport, getReport, getExportsForReport],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports(): ReportsContextValue {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used inside ReportsProvider');
  return ctx;
}
