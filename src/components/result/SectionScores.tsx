import type { AuditResult, SectionStatus } from '../../types/scoring';

const STATUS_COLOR: Record<SectionStatus, string> = {
  good: 'var(--green-text)',
  warning: 'var(--amber-text)',
  critical: 'var(--red-text)',
};

const STATUS_ICON: Record<SectionStatus, string> = {
  good: '✓',
  warning: '!',
  critical: '✕',
};

interface Props {
  result: AuditResult;
}

export function SectionScores({ result }: Props) {
  return (
    <section
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Section breakdown
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Weighted average → {result.globalScore} / 100
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {result.sectionScores.map(s => {
          const weightPct = Math.round(s.weight * 100);
          return (
            <div key={s.key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: STATUS_COLOR[s.status],
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  {STATUS_ICON[s.status]}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}
                >
                  {s.title}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                  weight {weightPct}%
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: STATUS_COLOR[s.status],
                    minWidth: 38,
                    textAlign: 'right',
                  }}
                >
                  {s.score}%
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: 'var(--bar-track)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${s.score}%`,
                    background: 'var(--brand-gradient)',
                    borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
