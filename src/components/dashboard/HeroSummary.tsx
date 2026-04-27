/* ── Radial Score Gauge ─────────────────────────────────────── */
function RadialScore({ score }: { score: number }) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--track-bg)"
          strokeWidth={12}
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#glow)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 32,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

/* ── Hero card wrapper ─────────────────────────────────────── */
function HeroCard({ children, glow = false, style }: { children: React.ReactNode; glow?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--card-radius)',
        boxShadow: glow ? 'var(--card-shadow-glow)' : 'var(--card-shadow)',
        border: '1px solid var(--border)',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'background 0.2s ease, border-color 0.2s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── HeroSummary ───────────────────────────────────────────── */
export function HeroSummary() {
  const score = 73;
  const maturity = 60;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
      {/* 1 — Score card */}
      <HeroCard glow style={{ alignItems: 'center', padding: '24px 20px' }}>
        <RadialScore score={score} />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-primary)',
            }}
          >
            Compliance Score
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            +8 points vs last quarter
          </div>
          <div
            style={{
              marginTop: 10,
              display: 'inline-block',
              background: 'var(--brand-soft-bg)',
              color: 'var(--violet-text)',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 20,
              padding: '3px 12px',
            }}
          >
            ↑ Improving
          </div>
        </div>
      </HeroCard>

      {/* 2 — Risk level */}
      <HeroCard>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Current Risk Level
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 34,
            color: '#F59E0B',
            lineHeight: 1,
          }}
        >
          MEDIUM
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
          {['low', 'medium', 'high', 'critical'].map(level => (
            <div
              key={level}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background:
                  level === 'low' ? '#10B981' :
                  level === 'medium' ? '#F59E0B' :
                  'var(--bar-track)',
                opacity: level === 'high' || level === 'critical' ? 0.55 : 1,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          11 findings · 3 critical actions
        </div>
        <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 500, marginTop: 'auto' }}>
          ⚠ 2 items need attention
        </div>
      </HeroCard>

      {/* 3 — Maturity level */}
      <HeroCard>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          AI Maturity Level
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 34,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {maturity}<span style={{ fontSize: 18, fontWeight: 400 }}>%</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Level 3 of 5 — Defined
        </div>
        <div
          style={{
            height: 8,
            background: 'var(--bar-track)',
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${maturity}%`,
              background: 'var(--brand-gradient)',
              borderRadius: 4,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: 'var(--text-muted)',
            marginTop: 4,
          }}
        >
          <span>Initial</span>
          <span>Managed</span>
          <span>Defined</span>
          <span>Advanced</span>
          <span>Optimal</span>
        </div>
      </HeroCard>

      {/* 4 — Next step CTA */}
      <HeroCard>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Recommended Next Step
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            marginTop: 4,
          }}
        >
          Complete HR Screening Tool Audit
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          This audit is 60% complete. Finishing it will boost your compliance score by an estimated +7 points.
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <button
            type="button"
            style={{
              background: 'var(--brand-gradient)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 18px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'var(--font-body)',
            }}
          >
            Continue Audit →
          </button>
        </div>
      </HeroCard>
    </div>
  );
}
