import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SectionTitle } from './SectionTitle';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import type { AuditResult, Effort, Impact } from '../../types/scoring';
import { getTopActions } from '../../lib/scoring/assistance';

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

export function PriorityActions({ result }: { result: AuditResult }) {
  const top = getTopActions(result, 3);
  const T = useLocale();

  // For each top rec, count how many findings it addresses.
  const reverseIndex: Record<string, number> = {};
  for (const f of result.findings) {
    for (const rid of f.recommendationIds) {
      reverseIndex[rid] = (reverseIndex[rid] ?? 0) + 1;
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
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <SectionTitle eyebrow={T.assistancePage.priorities.eyebrow} title={T.assistancePage.priorities.title} />

      <p
        style={{
          margin: '0 0 18px',
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        {format(T.assistancePage.priorities.intro, { count: result.recommendations.length })}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {top.map((rec, idx) => {
          const findingCount = reverseIndex[rec.id] ?? 0;
          const isFirst = idx === 0;
          return (
            <div
              key={rec.id}
              style={{
                background: isFirst ? 'var(--brand-soft-bg)' : 'var(--surface-2)',
                border: `1.5px solid ${isFirst ? 'var(--violet)' : 'var(--border)'}`,
                borderRadius: 14,
                padding: 18,
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                {/* Rank circle */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isFirst ? 'var(--brand-gradient)' : 'var(--surface)',
                    color: isFirst ? '#fff' : 'var(--violet-text)',
                    border: isFirst ? 'none' : '1.5px solid var(--violet)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
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
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: -0.2,
                      }}
                    >
                      {rec.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {rec.id}
                    </span>
                  </div>

                  {rec.whyItMatters && (
                    <p
                      style={{
                        margin: '0 0 8px',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55,
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>{T.assistancePage.priorities.whyItMattersLabel}</strong>
                      {rec.whyItMatters}
                    </p>
                  )}

                  {rec.expectedOutcome && (
                    <p
                      style={{
                        margin: '0 0 10px',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55,
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>{T.assistancePage.priorities.expectedOutcomeLabel}</strong>
                      {rec.expectedOutcome}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 10,
                    }}
                  >
                    <Badge variant={effortVariant(rec.effort)} />
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        background: IMPACT_BG[rec.impact],
                        color: IMPACT_FG[rec.impact],
                      }}
                    >
                      {format(T.assistancePage.priorities.impactBadge, { impact: rec.impact })}
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
                      {format(T.assistancePage.priorities.timeframeDays, { days: rec.timeframeDays })}
                    </span>
                    {findingCount > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {format(
                          findingCount === 1
                            ? T.assistancePage.priorities.closesFindingsOne
                            : T.assistancePage.priorities.closesFindingsOther,
                          { count: findingCount },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isFirst && (
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  {/* Behavior not yet implemented — disabled to avoid a dead
                      control misleading users. Wiring planned post-J2. */}
                  <span title={T.assistancePage.priorities.startWithThisTooltip} style={{ display: 'inline-flex' }}>
                    <Button variant="primary" size="sm" disabled>
                      {T.assistancePage.priorities.startWithThis}
                    </Button>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      alignSelf: 'center',
                    }}
                  >
                    {T.assistancePage.priorities.mostLeverage}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function effortVariant(e: Effort) {
  return `effort-${e}` as 'effort-low' | 'effort-medium' | 'effort-high';
}
