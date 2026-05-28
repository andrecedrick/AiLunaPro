/**
 * Disclaimer — J9 Phase A.
 *
 * Mandatory advisory disclaimer rendered at the bottom of any
 * regulatory-adjacent surface (audit result, report detail, share view).
 * AiLunaPro provides informational guidance only — never legal advice or a
 * compliance certification. Static, static, static.
 */

import type { CSSProperties } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import type { UserProfile } from '../../lib/preferences';

/** Per-profile tone hint appended after the core disclaimer sentence.
 *  Never replaces the legal-not-advice + no-certification core copy. */
const PROFILE_HINT: Record<UserProfile, string> = {
  enterprise:
    'Use this as a structured starting point for your AI compliance programme; pair with internal audit, counsel, and your QMS.',
  entrepreneur:
    'Use this as a founding-stage checklist: prioritise critical findings first; revisit before each fundraise or customer review.',
  individual:
    'Use this as a personal AI-usage guide; recommendations help you self-assess responsible AI practices.',
};

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  const { userProfile } = usePreferences();
  const style: CSSProperties = {
    marginTop: compact ? 14 : 24,
    padding: compact ? '10px 14px' : '14px 18px',
    background: 'var(--surface-2, var(--surface))',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.55,
  };
  return (
    <div role="note" aria-label="Informational guidance disclaimer" style={style}>
      <strong style={{ color: 'var(--text-secondary)' }}>
        Informational guidance — not legal advice.
      </strong>{' '}
      AiLunaPro audits, findings, and recommendations are informational only and do
      not constitute legal or regulatory advice, nor a certification of compliance
      with the EU AI Act, GDPR, NIST AI RMF, ISO/IEC 42001, or any other regulation.
      Consult qualified counsel for your specific obligations.
      <div style={{ marginTop: 6, fontStyle: 'italic', opacity: 0.85 }}>
        {PROFILE_HINT[userProfile]}
      </div>
    </div>
  );
}
