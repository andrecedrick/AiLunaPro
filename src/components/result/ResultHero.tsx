import type { AuditResult, RiskLevel, MaturityLevel } from '../../types/scoring';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
  critical: 'Critical risk',
};

const RISK_BADGE_STYLE: Record<RiskLevel, { bg: string; fg: string }> = {
  low: { bg: 'var(--green-bg)', fg: 'var(--green-text)' },
  medium: { bg: 'var(--amber-bg)', fg: 'var(--amber-text)' },
  high: { bg: 'var(--red-bg)', fg: 'var(--red-text)' },
  critical: { bg: 'var(--critical-bg)', fg: 'var(--critical-text)' },
};

const MATURITY_LABEL: Record<MaturityLevel, string> = {
  1: 'Initial',
  2: 'Developing',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimized',
};

interface Props {
  result: AuditResult;
}

export function ResultHero({ result }: Props) {
  const { globalScore, riskLevel, riskBumped, maturityLevel, maturitySelfAssessed, findingsBySeverity, recommendations } = result;
  const totalFindings =
    findingsBySeverity.critical + findingsBySeverity.high + findingsBySeverity.medium + findingsBySeverity.low;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 28,
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 28,
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Score panel — gradient */}
      <div
        style={{
          background: 'var(--brand-gradient)',
          borderRadius: 16,
          padding: '24px 12px',
          color: '#fff',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow-glow)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.85, fontWeight: 600 }}>
          Overall score
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 64, lineHeight: 1, marginTop: 6 }}>
          {globalScore}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>out of 100</div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Risk row */}
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}
          >
            Risk classification
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: RISK_BADGE_STYLE[riskLevel].bg,
                color: RISK_BADGE_STYLE[riskLevel].fg,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.3,
                fontFamily: 'var(--font-heading)',
              }}
            >
              {RISK_LABEL[riskLevel]}
            </span>
            {riskBumped && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--amber-text)',
                  background: 'var(--amber-bg)',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
                title="Risk level bumped due to industry / data sensitivity / scope"
              >
                ↑ Contextual bump
              </span>
            )}
          </div>
        </div>

        {/* Maturity stepper */}
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Maturity — Level {maturityLevel} ({MATURITY_LABEL[maturityLevel]})</span>
            {maturitySelfAssessed !== null && maturitySelfAssessed !== maturityLevel && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>
                Self-assessed: Level {maturitySelfAssessed}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {([1, 2, 3, 4, 5] as MaturityLevel[]).map(level => {
              const reached = level <= maturityLevel;
              const selfMark = level === maturitySelfAssessed;
              return (
                <div key={level} style={{ flex: 1, position: 'relative' }}>
                  <div
                    style={{
                      height: 8,
                      background: reached ? 'var(--brand-gradient)' : 'var(--bar-track)',
                      borderRadius: 4,
                      transition: 'background 0.3s ease',
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      color: reached ? 'var(--violet-text)' : 'var(--text-muted)',
                      marginTop: 6,
                      textAlign: 'center',
                      fontWeight: reached ? 600 : 500,
                    }}
                  >
                    L{level}
                  </div>
                  {selfMark && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'var(--surface)',
                        border: '2px solid var(--amber-text)',
                      }}
                      title="Self-assessed maturity"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stat row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            paddingTop: 4,
          }}
        >
          <Stat label="Critical" value={findingsBySeverity.critical} color="var(--critical-text)" />
          <Stat label="High" value={findingsBySeverity.high} color="var(--red-text)" />
          <Stat label="Medium" value={findingsBySeverity.medium} color="var(--amber-text)" />
          <Stat label="Actions" value={recommendations.length} color="var(--violet-text)" />
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{totalFindings}</strong> findings were
          identified across <strong style={{ color: 'var(--text-secondary)' }}>{recommendations.length}</strong>{' '}
          recommended actions. The roadmap below sequences them by impact.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 12px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
