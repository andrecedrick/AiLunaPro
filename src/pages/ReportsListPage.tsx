import { useReports } from '../context/ReportsContext';
import { useAudit } from '../context/AuditContext';
import { useRoute } from '../context/RouteContext';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';
import { Button } from '../components/ui/Button';
import { ReportsTable } from '../components/reports/ReportsTable';
import { EmptyReportsState } from '../components/reports/EmptyReportsState';

export function ReportsListPage() {
  const { reports, createReport, status } = useReports();
  const { draft } = useAudit();
  const { navigate } = useRoute();

  const draftHasContent =
    draft.status === 'draft' && Object.keys(draft.answers).length > 0;

  const handleGenerateFromDraft = () => {
    const result = computeAuditResult(draft.answers);
    const id = createReport(draft, result);
    navigate({ name: 'reports/detail', reportId: id });
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 28,
              color: 'var(--text-primary)',
              letterSpacing: -0.5,
            }}
          >
            Reports
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            Generated reports are snapshots of an audit at a point in time. Each one is exportable,
            shareable, and stays stable when you start a new audit.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {draftHasContent && (
            <Button variant="primary" size="lg" onClick={handleGenerateFromDraft}>
              + Generate from current draft
            </Button>
          )}
          <Button variant="secondary" size="lg" onClick={() => navigate({ name: 'audit/new' })}>
            Start a new audit
          </Button>
        </div>
      </div>

      {/* Body */}
      {status === 'loading' ? (
        <p style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading reports…
        </p>
      ) : status === 'error' ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px' }}>
            No reports loaded yet. This can happen if the workspace is new or if Firestore is unreachable.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="md" onClick={() => navigate({ name: 'audit/new' })}>
              Start a new audit
            </Button>
            <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <EmptyReportsState />
      ) : (
        <ReportsTable reports={reports} />
      )}

      {/* Hint about traceability */}
      {reports.length > 0 && (
        <p
          style={{
            margin: '14px 4px 0',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          Reports are stored locally for now. The detail view recomputes the full result from each
          report's answer snapshot — so historical reports stay accurate even after the scoring
          rules evolve.
        </p>
      )}
    </div>
  );
}
