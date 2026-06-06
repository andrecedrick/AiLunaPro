import type { CSSProperties } from 'react';

/** Shared "3 free PDF exports used" modal (J16.1). Token cost is fixed at 10. */
export function PdfLimitModal({ open, busy, onUseTokens, onBuyTokens, onCancel, actionLabel = 'Use tokens & download' }: {
  open: boolean;
  busy: boolean;
  onUseTokens: () => void;
  onBuyTokens: () => void;
  onCancel: () => void;
  actionLabel?: string;
}) {
  if (!open) return null;
  const btn = (variant: 'primary' | 'ghost'): CSSProperties => ({
    padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
    border: variant === 'ghost' ? '1.5px solid var(--border-strong)' : 'none',
    background: variant === 'ghost' ? 'transparent' : 'var(--brand-gradient, var(--violet))',
    color: variant === 'ghost' ? 'var(--text-secondary)' : '#fff',
  });
  return (
    <div role="dialog" aria-modal="true" aria-label="PDF export limit"
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(15,23,42,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ maxWidth: 440, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: '0 12px 40px rgba(0,0,0,0.22)', padding: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          You’ve used your 3 free PDF exports
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 18px' }}>
          Downloading more PDFs requires tokens (10 tokens per export).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" style={btn('primary')} disabled={busy} onClick={onUseTokens}>
            {busy ? '…' : actionLabel}
          </button>
          <button type="button" style={btn('ghost')} onClick={onBuyTokens}>Upgrade or buy tokens</button>
          <button type="button" style={btn('ghost')} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
