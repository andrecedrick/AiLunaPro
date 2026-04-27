import type { AuditResult, Effort, Impact, RoadmapBucket } from '../../types/scoring';

const IMPACT_DOT: Record<Impact, string> = {
  critical: 'var(--critical-text)',
  high: 'var(--red-text)',
  medium: 'var(--amber-text)',
  low: 'var(--neutral-text)',
};

const EFFORT_LABEL: Record<Effort, string> = {
  low: 'Low effort',
  medium: 'Medium effort',
  high: 'High effort',
};

interface Props {
  result: AuditResult;
}

export function Roadmap({ result }: Props) {
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
          30 / 60 / 90-day roadmap
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Sequenced by impact
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}
      >
        {result.roadmap.map(bucket => (
          <RoadmapColumn key={bucket.days} bucket={bucket} />
        ))}
      </div>
    </section>
  );
}

function RoadmapColumn({ bucket }: { bucket: RoadmapBucket }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 180,
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-block',
            background: 'var(--brand-gradient)',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.3,
            padding: '4px 12px',
            borderRadius: 999,
            marginBottom: 6,
          }}
        >
          {bucket.label}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {bucket.description}
        </p>
      </div>

      {bucket.items.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 8,
            padding: '12px 10px',
            textAlign: 'center',
          }}
        >
          No items in this bucket.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bucket.items.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: IMPACT_DOT[item.impact],
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      letterSpacing: 0.2,
                    }}
                  >
                    {EFFORT_LABEL[item.effort]} · {item.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
