/**
 * Shared design atoms for the public tool pages (Quote, ROI, Diagnostic) — U4
 * design-system normalization. Single source of truth for the field / input /
 * button / section styles those chromeless CampaignChrome pages used to each
 * duplicate inline. Values are the canonical (pre-existing) ones, so adopting
 * these is visually byte-identical — it only removes the duplication (drift).
 *
 * Pure presentation: no i18n lookups, no API calls, no validation logic (callers
 * pass plain strings + an optional error). The required marker is the universal
 * "*". Do not add behavior here.
 */

import type { CSSProperties, ReactNode } from 'react';

export function fieldsetStyle(): CSSProperties {
  return { border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', background: 'var(--surface)', margin: '0 0 18px' };
}
export function legendStyle(): CSSProperties {
  return { padding: '0 8px', fontSize: 13, fontWeight: 700, color: 'var(--violet-text)', textTransform: 'uppercase', letterSpacing: 0.5 };
}
export function inputStyle(): CSSProperties {
  return { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-primary)', boxSizing: 'border-box', fontFamily: 'inherit' };
}
export function primaryBtnStyle(): CSSProperties {
  return { padding: '13px 32px', borderRadius: 12, border: 'none', background: 'var(--violet)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 22px rgba(124,58,237,0.25)' };
}
export function secondaryBtnStyle(): CSSProperties {
  return { padding: '13px 24px', borderRadius: 12, border: '1px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' };
}
export function sectionTitleStyle(): CSSProperties {
  return { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 };
}
export function listStyle(): CSSProperties {
  return { margin: 0, paddingLeft: 20, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 };
}

/** Labelled form field with an optional required marker + error line. */
export function Field({ label, required, error, children }: { label: ReactNode; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--red-text)' }}>*</span>}
      </label>
      {children}
      {error && <div style={{ color: 'var(--red-text)', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

/** Compact stat: small uppercase label over a bold tabular value. */
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}
