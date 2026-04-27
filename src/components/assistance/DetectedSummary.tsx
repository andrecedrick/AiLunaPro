import { Badge } from '../ui/Badge';
import { SectionTitle } from './SectionTitle';
import type { AuditResult } from '../../types/scoring';
import { getDetectedSummary } from '../../lib/scoring/assistance';

const TONE_BADGE = {
  info: { bg: 'var(--blue-bg)', fg: 'var(--blue-text)' },
  warning: { bg: 'var(--amber-bg)', fg: 'var(--amber-text)' },
  success: { bg: 'var(--green-bg)', fg: 'var(--green-text)' },
} as const;

export function DetectedSummary({ result }: { result: AuditResult }) {
  const summary = getDetectedSummary(result);

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
      <SectionTitle eyebrow="01 · Diagnosis" title="What we detected" />

      <p
        style={{
          margin: '0 0 14px',
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        {summary.riskOneLiner}
      </p>

      {/* Context chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 18,
        }}
      >
        {summary.contextChips.map(c => (
          <span
            key={c.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.3,
              background: TONE_BADGE[c.tone].bg,
              color: TONE_BADGE[c.tone].fg,
            }}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Two-column factual breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16,
        }}
      >
        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            Top issues identified
          </div>
          {summary.topIssues.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              ✓ No issues to surface — the audit cleared every rule.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.topIssues.map((iss, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  <Badge variant={iss.severity}>{iss.severity}</Badge>
                  <span style={{ flex: 1 }}>{iss.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            Weakest area
          </div>
          {summary.weakestSection ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'var(--text-primary)',
                  }}
                >
                  {summary.weakestSection.title}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 18,
                    color:
                      summary.weakestSection.score >= 70
                        ? 'var(--green-text)'
                        : summary.weakestSection.score >= 50
                        ? 'var(--amber-text)'
                        : 'var(--red-text)',
                  }}
                >
                  {summary.weakestSection.score}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: 'var(--bar-track)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${summary.weakestSection.score}%`,
                    background: 'var(--brand-gradient)',
                    borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                Closing this section's gap is the highest-leverage move on your global score.
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              No weak area detected.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

