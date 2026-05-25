import { EmptyState } from './EmptyState';

/**
 * Automation Opportunities — tailored AI automation suggestions.
 *
 * The per-org, audit-driven recommendation source is not wired to live data
 * yet. Rather than show fabricated suggestions, present an honest empty-state
 * pointing the user to run an audit (which drives real recommendations).
 */
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
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Automation Opportunities
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Tailored to your AI usage
        </div>
      </div>
      <EmptyState
        title="Run an audit to get tailored opportunities"
        hint="Automation opportunities are derived from your audit answers and AI registry. Complete an audit and add your AI tools to see suggestions here."
      />
    </div>
  );
}
