/**
 * Audit history — Phase J3 #3.
 *
 * Read-only list of SUBMITTED audits for the active workspace. Surfaces audits
 * that were submitted but never turned into a report (they persist in Firestore
 * via fsSubmitAudit — this view confirms no data loss). Each row can be turned
 * into a report snapshot on demand.
 *
 * Scoped per workspace (like Reports). Firebase layer only; mock shows empty.
 */
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useReports } from '../context/ReportsContext';
import { useRoute } from '../context/RouteContext';
import { useToast } from '../hooks/useToast';
import { resolveLayer } from '../lib/featureFlags';
import { fsListAudits } from '../lib/audit/firestoreAuditService';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';
import { formatDate } from '../utils/formatters';
import type { AuditDraft } from '../types/audit';
import type { AuditResult } from '../types/scoring';

interface Row {
  draft:  AuditDraft;
  result: AuditResult;
}

export function AuditHistoryPage() {
  const { session } = useAuth();
  const { createReport } = useReports();
  const { navigate } = useRoute();
  const { showToast } = useToast();
  const T = useLocale();

  const orgId = session?.orgId ?? '';
  const isFirebase = resolveLayer('audit') === 'firebase';

  const [rows, setRows]       = useState<Row[]>([]);
  const [status, setStatus]   = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!isFirebase || !orgId) { setRows([]); setStatus('loaded'); return; }
    let cancelled = false;
    setStatus('loading');
    fsListAudits(orgId)
      .then(audits => {
        if (cancelled) return;
        const submitted = audits
          .filter(a => a.status === 'submitted')
          .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''));
        setRows(submitted.map(draft => ({ draft, result: computeAuditResult(draft.answers) })));
        setStatus('loaded');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [orgId, isFirebase]);

  const handleGenerate = (row: Row) => {
    const id = createReport(row.draft, row.result);
    showToast(T.auditHistory.toast.reportGenerated, 'success');
    navigate({ name: 'reports/detail', reportId: id });
  };

  const content = useMemo(() => {
    if (status === 'loading') return <Muted>{T.auditHistory.states.loading}</Muted>;
    if (status === 'error')   return <Muted>{T.auditHistory.states.error}</Muted>;
    if (rows.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{T.auditHistory.empty.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            {T.auditHistory.empty.description}
          </div>
          <button type="button" onClick={() => navigate({ name: 'audit/new' })} style={btnPrimary}>{T.auditHistory.empty.startAudit}</button>
        </div>
      );
    }
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {[T.auditHistory.columns.submitted, T.auditHistory.columns.score, T.auditHistory.columns.risk, T.auditHistory.columns.findings, ''].map((h, i) => (
                <th key={i} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.draft.id}>
                <td style={td}>{formatDate(row.draft.submittedAt || row.draft.updatedAt, 'datetime')}</td>
                <td style={td}><strong>{row.result.globalScore}</strong><span style={{ color: 'var(--text-muted)' }}>{T.auditHistory.row.scoreOutOf}</span></td>
                <td style={td}>{row.result.riskLevel}</td>
                <td style={td}>{row.result.findings.length}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button type="button" onClick={() => handleGenerate(row)} style={btnGhost}>{T.auditHistory.row.generateReport}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, rows]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>{T.auditHistory.header.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.55 }}>
        {T.auditHistory.header.subtitle}
      </p>
      {content}
    </div>
  );
}

const Muted = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>{children}</div>
);
const th: React.CSSProperties = { textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 700 };
const td: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' };
const btnGhost: React.CSSProperties = { padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const btnPrimary: React.CSSProperties = { marginTop: 16, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' };
