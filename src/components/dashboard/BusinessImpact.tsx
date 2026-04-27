import { mockBusinessImpact } from '../../data/mockDashboard';

export function BusinessImpact() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border)',
        padding: '24px 28px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Business Impact
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Measured outcomes from your compliance programme
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {mockBusinessImpact.map(item => (
          <div
            key={item.id}
            style={{
              background: 'var(--surface-2)',
              borderRadius: 14,
              padding: '18px 16px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 32,
                height: 4,
                borderRadius: 2,
                background: item.color,
                marginBottom: 4,
              }}
            />
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 32,
                color: item.color,
                lineHeight: 1,
              }}
            >
              {item.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
