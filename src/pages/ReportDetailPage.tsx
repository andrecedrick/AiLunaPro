import { useMemo, useState } from 'react';
import { useReports } from '../context/ReportsContext';
import { useRoute } from '../context/RouteContext';
import { useAuth } from '../context/AuthContext';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';
import { downloadReport, renameReport, ReportApiError } from '../lib/reports/reportApiClient';
import { PdfLimitModal } from '../components/auditExpress/PdfLimitModal';
import { ReportHeader } from '../components/reports/ReportHeader';
import { ExportHistory } from '../components/reports/ExportHistory';
import { Button } from '../components/ui/Button';
import { ResultHero } from '../components/result/ResultHero';
import { AudioExplanation } from '../components/result/AudioExplanation';
import { SectionScores } from '../components/result/SectionScores';
import { FindingsList } from '../components/result/FindingsList';
import { RecommendationsList } from '../components/result/RecommendationsList';
import { Roadmap } from '../components/result/Roadmap';
import { ActionPlan } from '../components/result/ActionPlan';
import { Disclaimer } from '../components/result/Disclaimer';
import { auditSections } from '../data/mockAuditQuestions';

export function ReportDetailPage() {
  const { route, navigate } = useRoute();
  const { getReport, getExportsForReport, deleteReport, status } = useReports();
  const { session } = useAuth();
  const orgId = session?.orgId ?? '';

  const reportId = route.name === 'reports/detail' ? route.reportId : '';
  const report = getReport(reportId);

  const result = useMemo(
    () => (report ? computeAuditResult(report.answersSnapshot) : null),
    [report],
  );

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [savingTitle, setSavingTitle] = useState(false);

  if (status === 'loading') {
    return (
      <p style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        Loading report…
      </p>
    );
  }

  if (!report || !result) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 22,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Report not found
        </h2>
        <p style={{ margin: '8px 0 18px', fontSize: 14, color: 'var(--text-muted)' }}>
          This report no longer exists or has been deleted.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate({ name: 'reports' })}>
          ← Back to reports
        </Button>
      </div>
    );
  }

  const events = getExportsForReport(report.id);
  const weakestSection = auditSections.find(s => s.key === report.weakestSection);
  const displayReport = titleOverride ? { ...report, title: titleOverride } : report;

  const onDownload = async (useTokens = false) => {
    setPdfBusy(true); setPdfError(null);
    try { await downloadReport(orgId, report.id, useTokens); setLimitOpen(false); }
    catch (e) {
      const code = e instanceof ReportApiError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') setLimitOpen(true);
      else if (code === 'TOKENS_INSUFFICIENT') { setLimitOpen(false); setPdfError('Not enough tokens to export. Buy tokens to continue.'); }
      else setPdfError('Download failed. Please try again.');
    } finally { setPdfBusy(false); }
  };
  const onRename = async () => {
    setSavingTitle(true); setPdfError(null);
    try { setTitleOverride(await renameReport(orgId, report.id, draft.trim())); setEditing(false); }
    catch (e) { setPdfError(e instanceof ReportApiError && e.code === 'FORBIDDEN' ? 'Only owners or admins can rename reports.' : 'Could not rename. Please try again.'); }
    finally { setSavingTitle(false); }
  };

  return (
    <div>
      {editing && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <input value={draft} maxLength={80} autoFocus onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void onRename(); if (e.key === 'Escape') setEditing(false); }}
            aria-label="Report title"
            style={{ flex: '1 1 320px', minWidth: 0, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 700 }} />
          <Button variant="primary" size="md" onClick={onRename} disabled={savingTitle}>{savingTitle ? '…' : 'Save title'}</Button>
          <Button variant="ghost" size="md" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      )}
      {pdfError && (
        <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-text)', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginBottom: 12 }}>{pdfError}</div>
      )}
      <ReportHeader report={displayReport} result={result} />

      {/* Primary actions — placed at the top (by the header) so the premium PDF
          export + rename are immediately visible, not buried in the footer. */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0 4px' }} className="report-primary-actions">
        <Button variant="primary" size="md" disabled={pdfBusy} onClick={() => onDownload(false)}>
          {pdfBusy ? 'Preparing…' : '⬇ Download PDF'}
        </Button>
        <Button variant="secondary" size="md" onClick={() => { setDraft(displayReport.title); setEditing(true); }}>
          Rename
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 20,
          alignItems: 'flex-start',
        }}
        className="report-grid"
      >
        {/* Main column — reused result components, fed from snapshot */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <ResultHero result={result} />
          <AudioExplanation result={result} />
          <SectionScores result={result} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              marginBottom: 20,
            }}
          >
            <FindingsList result={result} />
            <RecommendationsList result={result} />
          </div>
          <ActionPlan result={result} />
          <Roadmap result={result} />

          {/* J9: mandatory advisory disclaimer. */}
          <Disclaimer />

          {/* Footer actions */}
          <div
            className="report-footer-actions"
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 4,
              flexWrap: 'wrap',
            }}
          >
            <Button variant="secondary" size="md" onClick={() => navigate({ name: 'reports' })}>
              ← Back to reports
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate({ name: 'audit/assistance' })}
            >
              Open assistance plan
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                if (confirm('Delete this report? This cannot be undone.')) {
                  deleteReport(report.id);
                  navigate({ name: 'reports' });
                }
              }}
              style={{ color: 'var(--red-text)', borderColor: 'var(--border-strong)' }}
            >
              Delete report
            </Button>
          </div>
        </div>

        {/* Aside */}
        <aside
          className="report-aside"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'sticky',
            top: 92,
            alignSelf: 'flex-start',
          }}
        >
          <Metadata report={displayReport} weakestSectionTitle={weakestSection?.title} />
          <ExportHistory events={events} />
        </aside>
      </div>

      <PdfLimitModal
        open={limitOpen}
        busy={pdfBusy}
        onUseTokens={() => onDownload(true)}
        onBuyTokens={() => { setLimitOpen(false); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => setLimitOpen(false)}
      />
    </div>
  );
}

function Metadata({
  report,
  weakestSectionTitle,
}: {
  report: import('../types/report').Report;
  weakestSectionTitle?: string;
}) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 18,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--text-primary)',
        }}
      >
        Metadata
      </h3>

      <Row label="Report ID">
        <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
          {report.id}
        </code>
      </Row>
      <Row label="Source draft">
        <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
          {report.draftId}
        </code>
      </Row>
      <Row label="Status">
        <span
          style={{
            display: 'inline-flex',
            background: 'var(--green-bg)',
            color: 'var(--green-text)',
            padding: '2px 10px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          {report.status}
        </span>
      </Row>
      {weakestSectionTitle && (
        <Row label="Weakest section">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {weakestSectionTitle}
          </span>
        </Row>
      )}
      <Row label="Frameworks">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['EU AI Act', 'GDPR', 'ISO 42001', 'NIST AI RMF'].map(f => (
            <span
              key={f}
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </Row>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '6px 0',
        borderBottom: '1px dashed var(--border)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
    </div>
  );
}
