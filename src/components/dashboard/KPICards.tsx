import { mockKPIs } from '../../data/mockDashboard';

function KPIIcon({ id, color }: { id: string; color: string }) {
  const s: React.CSSProperties = { width: 22, height: 22, color };
  switch (id) {
    case 'audit':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'finding':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case 'tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'automation':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    default:
      return null;
  }
}

export function KPICards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
      {mockKPIs.map(kpi => {
        // 18% alpha tinted bg for the icon, derived from each KPI's color
        const iconBg = `${kpi.color}1F`;
        return (
          <div
            key={kpi.id}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--card-radius)',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border)',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KPIIcon id={kpi.icon} color={kpi.color} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: kpi.trend >= 0 ? 'var(--green-text)' : 'var(--red-text)',
                  background: kpi.trend >= 0 ? 'var(--green-bg)' : 'var(--red-bg)',
                  borderRadius: 20,
                  padding: '2px 9px',
                }}
              >
                {kpi.trend >= 0 ? '↑' : '↓'} {kpi.trendLabel}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 38,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {kpi.label}
              </div>
            </div>

            <div style={{ height: 3, background: 'var(--bar-track)', borderRadius: 2 }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (kpi.value / 20) * 100)}%`,
                  background: kpi.color,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
