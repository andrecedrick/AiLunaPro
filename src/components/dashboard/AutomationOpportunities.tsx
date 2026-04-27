import { mockAutomation } from '../../data/mockDashboard';
import { Badge, effortVariant } from '../ui/Badge';

export function AutomationOpportunities() {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            Automation Opportunities
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            8 identified · Powered by Luna AI
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--violet-text)',
            cursor: 'pointer',
            background: 'var(--brand-tint-bg)',
            borderRadius: 20,
            padding: '4px 12px',
          }}
        >
          View all
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {mockAutomation.map(item => (
          <div
            key={item.id}
            style={{
              background: 'var(--surface-2)',
              borderRadius: 14,
              padding: '16px 14px',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'box-shadow 0.15s',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--brand-soft-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              {item.icon}
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
              {item.title}
            </div>

            <Badge variant={effortVariant(item.effort)} />

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-text)', marginTop: 'auto' }}>
              {item.saving}
            </div>

            <button
              type="button"
              style={{
                background: 'transparent',
                border: '1.5px solid var(--violet-text)',
                color: 'var(--violet-text)',
                borderRadius: 8,
                padding: '5px 0',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'var(--font-body)',
                opacity: 0.85,
              }}
            >
              Explore →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
