import { Badge } from '../ui/Badge';
import type { AuditResult, Severity } from '../../types/scoring';
import { RegulatoryRefs } from './RegulatoryRefs';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

interface Props {
  result: AuditResult;
}

export function FindingsList({ result }: Props) {
  const F = useLocale().results.findings;
  const sevLabel = (s: Severity): string =>
    ({ critical: F.severityCritical, high: F.severityHigh, medium: F.severityMedium, low: F.severityLow })[s];

  if (result.findings.length === 0) {
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
        <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {F.title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          {F.empty}
        </p>
      </section>
    );
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
          {F.title}
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {format(F.total, { n: result.findings.length })}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SEVERITY_ORDER.map(sev => {
          const items = result.findings.filter(f => f.severity === sev);
          if (items.length === 0) return null;
          return (
            <div key={sev}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Badge variant={sev}>
                  {format(F.severityCount, { label: sevLabel(sev), count: items.length })}
                </Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(f => (
                  <div
                    key={f.id}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 4,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {f.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                          letterSpacing: 0.3,
                        }}
                      >
                        {f.id} · {f.sectionKey}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {f.description}
                    </p>
                    {f.recommendationIds.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: 'var(--violet-text)',
                          fontWeight: 600,
                        }}
                      >
                        {format(F.recommendationLink, { count: f.recommendationIds.length, plural: f.recommendationIds.length === 1 ? '' : 's' })}
                      </div>
                    )}
                    <RegulatoryRefs refs={f.regulatoryRefs} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
