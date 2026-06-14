import { EmptyState } from './EmptyState';
import { useLocale } from '../../context/LocaleContext';

/**
 * Automation Opportunities — tailored AI automation suggestions.
 *
 * The per-org, audit-driven recommendation source is not wired to live data
 * yet. Rather than show fabricated suggestions, present an honest empty-state
 * pointing the user to run an audit (which drives real recommendations).
 */
export function AutomationOpportunities() {
  const D = useLocale().dashboard.automation;
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
          {D.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {D.subtitle}
        </div>
      </div>
      <EmptyState
        title={D.empty.title}
        hint={D.empty.hint}
      />
    </div>
  );
}
