/**
 * Dashboard empty-state — honest placeholder where no persisted real data
 * source exists yet (e.g. score trends, business-impact metrics). Replaces
 * fabricated illustrative numbers. No fake values, ever.
 */
export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '28px 24px',
        background:     'var(--surface-2)',
        border:         '1px dashed var(--border-strong)',
        borderRadius:   12,
        gap:            6,
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 420 }}>{hint}</div>
    </div>
  );
}
