/**
 * Shared panel styles — Phase J1.3.
 */
import type { CSSProperties } from 'react';

export const panelCard: CSSProperties = {
  background:    'var(--surface)',
  border:        '1px solid var(--border)',
  borderRadius:  14,
  padding:       24,
  marginBottom:  24,
};

export const panelTitle: CSSProperties = {
  fontSize:      14,
  fontWeight:    700,
  color:         'var(--text-primary)',
  margin:        '0 0 4px',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
};

export const panelSubtitle: CSSProperties = {
  fontSize:    13,
  color:       'var(--text-muted)',
  margin:      '0 0 18px',
};

export const fieldLabel: CSSProperties = {
  fontSize:   12,
  fontWeight: 600,
  color:      'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  display:    'block',
  marginBottom: 6,
};

export const input: CSSProperties = {
  width:        '100%',
  padding:      '8px 12px',
  borderRadius: 8,
  border:       '1px solid var(--border)',
  background:   'var(--surface)',
  color:        'var(--text-primary)',
  fontSize:     13,
  outline:      'none',
};

export const button = (primary = true): CSSProperties => ({
  padding:      '9px 18px',
  borderRadius: 8,
  border:       primary ? 'none' : '1px solid var(--border)',
  background:   primary ? 'var(--brand-gradient)' : 'transparent',
  color:        primary ? '#fff' : 'var(--text-muted)',
  fontWeight:   600,
  fontSize:     13,
  cursor:       'pointer',
});

export const pill = (variant: 'ok' | 'warn' | 'err' | 'muted'): CSSProperties => ({
  display:        'inline-flex',
  alignItems:     'center',
  gap:            6,
  padding:        '3px 10px',
  borderRadius:   999,
  fontSize:       11,
  fontWeight:     700,
  letterSpacing:  0.5,
  textTransform:  'uppercase',
  background:
    variant === 'ok'   ? 'var(--green-soft-bg)'
    : variant === 'warn' ? 'var(--yellow-soft-bg)'
    : variant === 'err'  ? 'var(--red-soft-bg)'
    : 'var(--surface-2)',
  color:
    variant === 'ok'   ? 'var(--green-text)'
    : variant === 'warn' ? 'var(--yellow-text)'
    : variant === 'err'  ? 'var(--red-text)'
    : 'var(--text-muted)',
});
