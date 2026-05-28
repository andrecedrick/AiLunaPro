import { Badge } from '../ui/Badge';
import type { AuditResult, Severity } from '../../types/scoring';
import { RegulatoryRefs } from './RegulatoryRefs';

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

interface Props {
  result: AuditResult;
}

export function FindingsList({ result }: Props) {
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
          Findings
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          ✓ No findings triggered. Keep building maturity through the recommendations on the right.
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
          Findings
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {result.findings.length} total
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
                  {SEVERITY_LABEL[sev]} ({items.length})
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
                        → {f.recommendationIds.length} recommendation
                        {f.recommendationIds.length === 1 ? '' : 's'}
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
