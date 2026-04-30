import { Button } from '../ui/Button';
import { useRoute } from '../../context/RouteContext';
import type { Report } from '../../types/report';
import type { AuditResult, RiskLevel } from '../../types/scoring';
import { ExportBar } from './ExportBar';
import { formatDate, formatRiskLevel } from '@/utils/formatters';

const RISK_BADGE: Record<RiskLevel, { bg: string; fg: string }> = {
  low: { bg: 'var(--green-bg)', fg: 'var(--green-text)' },
  medium: { bg: 'var(--amber-bg)', fg: 'var(--amber-text)' },
  high: { bg: 'var(--red-bg)', fg: 'var(--red-text)' },
  critical: { bg: 'var(--critical-bg)', fg: 'var(--critical-text)' },
};

interface Props {
  report: Report;
  result: AuditResult;
}

export function ReportHeader({ report, result }: Props) {
  const { navigate } = useRoute();

  return (
    <div
      className="report-header"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Breadcrumb */}
      <div
        className="report-header-breadcrumb"
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 600,
          letterSpacing: 0.3,
          marginBottom: 6,
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ name: 'reports' })}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--violet-text)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 11,
            padding: 0,
            fontFamily: 'var(--font-body)',
          }}
        >
          Reports
        </button>
        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{report.id}</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 24,
              color: 'var(--text-primary)',
              letterSpacing: -0.4,
              lineHeight: 1.25,
            }}
          >
            {report.title}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--text-secondary)',
              }}
            >
              Score {report.scoreSnapshot}
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> / 100</span>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: RISK_BADGE[report.riskSnapshot].bg,
                color: RISK_BADGE[report.riskSnapshot].fg,
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {formatRiskLevel(report.riskSnapshot)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Generated {formatDate(report.createdAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ name: 'audit/assistance' })}
            >
              View action plan →
            </Button>
          </div>
        </div>

        <ExportBar report={report} result={result} />
      </div>
    </div>
  );
}
