import { EmptyState } from './EmptyState';

/**
 * Analytics — AI maturity score trend over time.
 *
 * A score trend requires persisted historical audit scores, which we don't
 * store yet (each audit recomputes from its snapshot). Showing a fabricated
 * trend line would be misleading — honest empty-state until enough real audit
 * history exists to chart.
 */
export function AnalyticsSection() {
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
          Score Trend
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          AI maturity score over time
        </div>
      </div>
      <EmptyState
        title="Trends appear after multiple audits"
        hint="Once you've submitted several audits in this workspace, your AI maturity score will be charted here from your real history."
      />
    </div>
  );
}
