import { EmptyState } from './EmptyState';

/**
 * Business Impact — measured outcomes from the compliance programme.
 *
 * No persisted impact-metrics source exists yet (risk reduction, governance
 * score deltas, time saved require historical tracking we don't store). Showing
 * fabricated numbers would mislead — honest empty-state until real metrics land.
 */
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
      <EmptyState
        title="Impact metrics appear as your programme matures"
        hint="Run audits over time to build a track record. Risk reduction, governance progress, and time saved will be computed from your real history — no estimates."
      />
    </div>
  );
}
