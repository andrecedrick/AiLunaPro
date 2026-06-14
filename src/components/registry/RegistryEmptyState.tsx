import { Button } from '../ui/Button';
import { useLocale } from '../../context/LocaleContext';

interface Props {
  variant: 'no-items' | 'no-matches';
  onAdd: () => void;
  onClearFilters: () => void;
}

export function RegistryEmptyState({ variant, onAdd, onClearFilters }: Props) {
  const T = useLocale();
  const isNoItems = variant === 'no-items';
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--card-radius)',
        padding: '40px 28px',
        textAlign: 'center',
        boxShadow: 'var(--card-shadow)',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--brand-tint-bg)',
          color: 'var(--violet-text)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
        aria-hidden
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text-primary)',
          letterSpacing: -0.2,
        }}
      >
        {isNoItems ? T.registry.empty.noItems.title : T.registry.empty.noMatches.title}
      </h3>
      <p
        style={{
          margin: '6px auto 18px',
          fontSize: 13,
          color: 'var(--text-muted)',
          maxWidth: 460,
          lineHeight: 1.6,
        }}
      >
        {isNoItems
          ? T.registry.empty.noItems.body
          : T.registry.empty.noMatches.body}
      </p>
      {isNoItems ? (
        <Button variant="primary" size="md" onClick={onAdd}>
          {T.registry.empty.noItems.action}
        </Button>
      ) : (
        <Button variant="secondary" size="md" onClick={onClearFilters}>
          {T.registry.empty.noMatches.action}
        </Button>
      )}
    </div>
  );
}
