import { Badge } from '../ui/Badge';
import type { AuditResult, Effort, Impact } from '../../types/scoring';

const IMPACT_BG: Record<Impact, string> = {
  critical: 'var(--critical-bg)',
  high: 'var(--red-bg)',
  medium: 'var(--amber-bg)',
  low: 'var(--neutral-bg)',
};

const IMPACT_FG: Record<Impact, string> = {
  critical: 'var(--critical-text)',
  high: 'var(--red-text)',
  medium: 'var(--amber-text)',
  low: 'var(--neutral-text)',
};

const IMPACT_LABEL: Record<Impact, string> = {
  critical: 'Critical impact',
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
};

interface Props {
  result: AuditResult;
}

export function RecommendationsList({ result }: Props) {
  // Order by impact, then by timeframe
  const ordered = [...result.recommendations].sort((a, b) => {
    const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const ai = impactOrder[a.impact] ?? 0;
    const bi = impactOrder[b.impact] ?? 0;
    if (ai !== bi) return bi - ai;
    return a.timeframeDays - b.timeframeDays;
  });

  // Build reverse index: rec.id → finding ids that reference it
  const reverseIndex: Record<string, string[]> = {};
  for (const f of result.findings) {
    for (const rid of f.recommendationIds) {
      reverseIndex[rid] = reverseIndex[rid] ?? [];
      reverseIndex[rid].push(f.id);
    }
  }

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Recommendations
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {ordered.length} actions
        </span>
      </div>

      {ordered.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          No actionable recommendations at this time.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ordered.map(r => {
            const linkedFindings = reverseIndex[r.id] ?? [];
            return (
              <div
                key={r.id}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {r.title}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      letterSpacing: 0.3,
                    }}
                  >
                    {r.id}
                  </span>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {r.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Badge variant={effortVariant(r.effort)} />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      background: IMPACT_BG[r.impact],
                      color: IMPACT_FG[r.impact],
                    }}
                  >
                    {IMPACT_LABEL[r.impact]}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--violet-text)',
                      background: 'var(--brand-tint-bg)',
                      padding: '2px 10px',
                      borderRadius: 20,
                    }}
                  >
                    {r.timeframeDays}d
                  </span>
                  {linkedFindings.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      addresses {linkedFindings.length} finding{linkedFindings.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function effortVariant(e: Effort) {
  return `effort-${e}` as 'effort-low' | 'effort-medium' | 'effort-high';
}
