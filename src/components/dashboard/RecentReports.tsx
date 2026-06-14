import { Badge } from '../ui/Badge';
import type { ReportStatus, RiskLevel } from '../../types/firestore';
import { useRoute } from '../../context/RouteContext';
import { useToast } from '../../hooks/useToast';
import { useReports } from '../../context/ReportsContext';
import { formatDate } from '../../utils/formatters';
import { EmptyState } from './EmptyState';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

function riskColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#7C2D12',
  };
  return map[risk];
}

function ReportCard({ report }: { report: { id: string; title: string; date: string; status: ReportStatus; score: number; risk: RiskLevel } }) {
  const { navigate } = useRoute();
  const { showToast } = useToast();

  const handleView = () => {
    if (report.id) navigate({ name: 'reports/detail', reportId: report.id });
    else showToast('Report not available yet.', 'info');
  };
  const handleShare = async () => {
    const link = `${window.location.origin}/#/reports/share/${report.id}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('Share link copied.', 'success');
    } catch {
      showToast('Could not copy link. Try again.', 'warning');
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        borderRadius: 14,
        padding: '16px 18px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {report.title}
        </div>
        <Badge variant={report.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{report.date}</span>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--text-muted)',
            display: 'inline-block',
            opacity: 0.4,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 13,
              color: riskColor(report.risk),
            }}
          >
            {report.score}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span>
        </div>
        <Badge variant={report.risk} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {[
          { label: 'Share',    svg: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></> },
        ].map(b => (
          <button
            key={b.label}
            type="button"
            onClick={() => void handleShare()}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1.5px solid var(--border-strong)',
              color: 'var(--text-secondary)',
              borderRadius: 8,
              padding: '6px 0',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {b.svg}
            </svg>
            {b.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleView}
          style={{
            background: 'var(--brand-gradient)',
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          View
        </button>
      </div>
    </div>
  );
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RecentReports() {
  const { navigate } = useRoute();
  const { showToast } = useToast();
  const { reports } = useReports();
  const D = useLocale().dashboard.recentReports;

  // Real reports for the active workspace, newest first, top 3 (4th grid cell
  // is the export card).
  const cards = [...reports]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 3)
    .map(r => ({
      id:     r.id,
      title:  r.title,
      date:   formatDate(r.createdAt, 'medium'),
      status: r.status,
      score:  r.scoreSnapshot,
      risk:   r.riskSnapshot,
    }));

  const handleViewAll = () => navigate({ name: 'reports' });

  const handleExport = (fmt: 'CSV' | 'JSON') => {
    if (reports.length === 0) {
      showToast('No reports to export yet.', 'info');
      return;
    }
    if (fmt === 'CSV') {
      const header = 'id,title,createdAt,status,score,risk\n';
      const rows = reports.map(r => `${r.id},${JSON.stringify(r.title)},${r.createdAt},${r.status},${r.scoreSnapshot},${r.riskSnapshot}`).join('\n');
      downloadBlob(header + rows, 'reports.csv', 'text/csv;charset=utf-8');
      showToast('CSV downloaded.', 'success');
    }
    if (fmt === 'JSON') {
      downloadBlob(JSON.stringify(reports, null, 2), 'reports.json', 'application/json');
      showToast('JSON downloaded.', 'success');
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border)',
        padding: '24px 28px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            {D.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {format(reports.length === 1 ? D.countOne : D.countOther, { n: reports.length })}
          </div>
        </div>
        <button
          type="button"
          onClick={handleViewAll}
          style={{
            fontSize: 11, fontWeight: 600, color: 'var(--violet-text)',
            cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, fontFamily: 'inherit',
          }}
        >
          {D.viewAll}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 260px', gap: 14 }}>
        {cards.length === 0 ? (
          <div style={{ gridColumn: '1 / 4' }}>
            <EmptyState
              title={D.empty.title}
              hint={D.empty.hint}
            />
          </div>
        ) : (
          cards.map(report => <ReportCard key={report.id} report={report} />)
        )}

        {/* Export options card */}
        <div
          style={{
            background: 'var(--brand-soft-bg)',
            borderRadius: 14,
            padding: '16px 18px',
            border: '1.5px dashed var(--violet-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Export Options
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Export your compliance data in multiple formats for stakeholders.
          </div>

          {(['CSV', 'JSON'] as const).map(fmt => {
            const tone =
              fmt === 'CSV' ? { bg: 'var(--green-bg)', fg: 'var(--green-text)' } :
                              { bg: 'var(--blue-bg)',  fg: 'var(--blue-text)' };
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => handleExport(fmt)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left' as const,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: tone.bg,
                    color: tone.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  {fmt[0]}
                </span>
                Export as {fmt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
