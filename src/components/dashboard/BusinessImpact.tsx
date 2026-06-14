import { EmptyState } from './EmptyState';
import { useLocale } from '../../context/LocaleContext';

/**
 * Business Impact — measured outcomes from the compliance programme.
 *
 * No persisted impact-metrics source exists yet (risk reduction, governance
 * score deltas, time saved require historical tracking we don't store). Showing
 * fabricated numbers would mislead — honest empty-state until real metrics land.
 */
export function BusinessImpact() {
  const D = useLocale().dashboard.businessImpact;
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
