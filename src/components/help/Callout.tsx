import type { ReactNode } from 'react';

/**
 * Help callout box — info / note / warning. Theme-aware, reuses existing
 * tokens. Used to highlight key concepts (Audit vs Report, per-workspace scope).
 */
type Variant = 'info' | 'note' | 'warning';

const STYLES: Record<Variant, { bg: string; border: string; fg: string; icon: string }> = {
  info:    { bg: 'var(--brand-tint-bg)',  border: 'var(--violet)',      fg: 'var(--violet-text)', icon: 'ℹ️' },
  note:    { bg: 'var(--surface-2)',      border: 'var(--border-strong)', fg: 'var(--text-secondary)', icon: '💡' },
  warning: { bg: 'var(--yellow-soft-bg)', border: 'var(--yellow-text)', fg: 'var(--yellow-text)', icon: '⚠️' },
};

export function Callout({ variant = 'note', children }: { variant?: Variant; children: ReactNode }) {
  const s = STYLES[variant];
  return (
    <div
      role="note"
      style={{
        display:      'flex',
        gap:          10,
        alignItems:   'flex-start',
        background:   s.bg,
        borderLeft:   `3px solid ${s.border}`,
        borderRadius: 8,
        padding:      '10px 14px',
        margin:       '0 0 14px',
        fontSize:     13.5,
        lineHeight:   1.6,
        color:        'var(--text-secondary)',
      }}
    >
      <span aria-hidden style={{ flexShrink: 0, fontSize: 14 }}>{s.icon}</span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
