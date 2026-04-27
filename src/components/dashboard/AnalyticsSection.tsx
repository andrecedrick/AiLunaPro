import { mockScoreTrend, mockAudits, mockPriorityActions } from '../../data/mockDashboard';
import { Badge, effortVariant } from '../ui/Badge';

/* ── Score Trend Chart ─────────────────────────────────────── */
function ScoreTrendChart() {
  const W = 500;
  const H = 180;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const data = mockScoreTrend;
  const minScore = 30;
  const maxScore = 100;

  const xStep = chartW / (data.length - 1);

  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + chartH - ((v - minScore) / (maxScore - minScore)) * chartH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.score)}`).join(' ');
  const areaPath =
    linePath +
    ` L${toX(data.length - 1)},${padT + chartH} L${toX(0)},${padT + chartH} Z`;

  const lastPoint = data[data.length - 1];
  const lx = toX(data.length - 1);
  const ly = toY(lastPoint.score);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Score Trend</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 10 months</div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--green-text)',
            background: 'var(--green-bg)',
            borderRadius: 20,
            padding: '3px 10px',
          }}
        >
          ↑ +31 pts (9 months)
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[40, 55, 70, 85, 100].map(v => (
          <g key={v}>
            <line
              x1={padL}
              y1={toY(v)}
              x2={W - padR}
              y2={toY(v)}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={toY(v) + 4}
              fontSize={9}
              fill="var(--text-muted)"
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => (
          <text
            key={d.month}
            x={toX(i)}
            y={H - 4}
            fontSize={9}
            fill="var(--text-muted)"
            textAnchor="middle"
          >
            {d.month}
          </text>
        ))}

        <circle cx={lx} cy={ly} r={5} fill="#7C3AED" />
        <circle cx={lx} cy={ly} r={9} fill="rgba(124,58,237,0.18)" />

        <rect x={lx - 20} y={ly - 26} width={40} height={18} rx={5} fill="var(--chart-tooltip-bg)" />
        <text x={lx} y={ly - 13} fontSize={10} fill="var(--chart-tooltip-fg)" textAnchor="middle" fontWeight="bold">
          {lastPoint.score}
        </text>
      </svg>
    </div>
  );
}

/* ── Audit Table ───────────────────────────────────────────── */
function AuditTable() {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Audits</div>
        <span style={{ fontSize: 11, color: 'var(--violet-text)', cursor: 'pointer', fontWeight: 600 }}>View all →</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Audit Name', 'Date', 'Score', 'Risk', 'Status'].map(h => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  paddingBottom: 8,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockAudits.map(audit => (
            <tr key={audit.id} style={{ cursor: 'pointer' }}>
              <td style={{ padding: '10px 0', borderBottom: '1px solid var(--row-border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{audit.name}</div>
              </td>
              <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--row-border)', fontSize: 11, color: 'var(--text-muted)' }}>
                {audit.date}
              </td>
              <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--row-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      background: 'var(--bar-track)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      maxWidth: 60,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${audit.score}%`,
                        background:
                          audit.score >= 75 ? '#10B981' :
                          audit.score >= 50 ? '#F59E0B' : '#EF4444',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {audit.score}
                  </span>
                </div>
              </td>
              <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--row-border)' }}>
                <Badge variant={audit.risk} />
              </td>
              <td style={{ padding: '10px 0', borderBottom: '1px solid var(--row-border)' }}>
                <Badge variant={audit.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Priority Actions ──────────────────────────────────────── */
function PriorityActions() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        Priority Actions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mockPriorityActions.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 14px',
              background: 'var(--surface-2)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Badge variant={effortVariant(item.effort)} />
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    background: 'var(--surface)',
                    borderRadius: 20,
                    padding: '2px 8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {item.badge}
                </span>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Luna AI Assistance card ──────────────────────────────── */
function AssistanceCard() {
  return (
    <div
      style={{
        marginTop: 20,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)',
        padding: '20px 20px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', bottom: -30, right: 30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            🤖
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>Luna AI Assistant</span>
        </div>
        <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5, margin: '0 0 14px' }}>
          Your HR Screening Tool has a high-risk finding on <strong>human oversight</strong>.
          I can generate a remediation plan in under 2 minutes.
        </p>
        <button
          type="button"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            backdropFilter: 'blur(4px)',
          }}
        >
          Generate Remediation Plan →
        </button>
      </div>
    </div>
  );
}

/* ── AnalyticsSection ─────────────────────────────────────── */
export function AnalyticsSection() {
  const sectionCard: React.CSSProperties = {
    background: 'var(--surface)',
    borderRadius: 'var(--card-radius)',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--border)',
    padding: '24px 28px',
    transition: 'background 0.2s ease, border-color 0.2s ease',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
      <div style={sectionCard}>
        <ScoreTrendChart />
        <AuditTable />
      </div>

      <div style={{ ...sectionCard, padding: '24px 22px' }}>
        <PriorityActions />
        <AssistanceCard />
      </div>
    </div>
  );
}
