import { Badge } from '../ui/Badge';
import { useRoute } from '../../context/RouteContext';
import { useReports } from '../../context/ReportsContext';
import { formatDate } from '@/utils/formatters';
import type { Report } from '../../types/report';
import type { RiskLevel } from '../../types/scoring';

const RISK_TO_BADGE: Record<RiskLevel, 'low' | 'medium' | 'high' | 'critical'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

interface Props {
  reports: Report[];
}

export function ReportsTable({ reports }: Props) {
  const { navigate } = useRoute();
  const { deleteReport } = useReports();

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        overflow: 'hidden',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-body)',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--surface-2)' }}>
            <Th>Title</Th>
            <Th>Created</Th>
            <Th align="right">Score</Th>
            <Th>Risk</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr
              key={r.id}
              onClick={() => navigate({ name: 'reports/detail', reportId: r.id })}
              style={{
                cursor: 'pointer',
                borderTop: idx === 0 ? 'none' : '1px solid var(--row-border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Td>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {r.id}
                </div>
              </Td>
              <Td>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {formatDate(r.createdAt)}
                </span>
              </Td>
              <Td align="right">
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                  }}
                >
                  {r.scoreSnapshot}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span>
              </Td>
              <Td>
                <Badge variant={RISK_TO_BADGE[r.riskSnapshot]}>
                  {r.riskSnapshot}
                </Badge>
              </Td>
              <Td>
                <Badge variant={r.status === 'published' ? 'published' : r.status === 'draft' ? 'draft' : 'archived'} />
              </Td>
              <Td align="right">
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate({ name: 'reports/detail', reportId: r.id })}
                    style={btnStyle('primary')}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ name: 'reports/share', reportId: r.id })}
                    style={btnStyle('ghost')}
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this report? This cannot be undone.')) {
                        deleteReport(r.id);
                      }
                    }}
                    style={btnStyle('danger')}
                    aria-label="Delete report"
                    title="Delete report"
                  >
                    ✕
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Tiny table helpers ──────────────────────────────────── */

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '12px 16px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      style={{
        textAlign: align,
        padding: '14px 16px',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  );
}

function btnStyle(kind: 'primary' | 'ghost' | 'danger'): React.CSSProperties {
  const base: React.CSSProperties = {
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'opacity 0.15s',
  };
  if (kind === 'primary')
    return {
      ...base,
      background: 'var(--brand-tint-bg)',
      color: 'var(--violet-text)',
    };
  if (kind === 'danger')
    return {
      ...base,
      background: 'transparent',
      color: 'var(--red-text)',
      padding: '6px 10px',
    };
  return {
    ...base,
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-strong)',
  };
}
