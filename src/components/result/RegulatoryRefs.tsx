/**
 * RegulatoryRefs — J9 Phase A.
 *
 * Tiny inline chip line ("References: EU AI Act Art. 10 · NIST GOVERN-5 …")
 * rendered under a Finding or Recommendation when refs are present.
 * Static labels — informational only. See <Disclaimer />.
 */

import type { RegulatoryFramework, RegulatoryRef } from '../../types/scoring';

const FRAMEWORK_LABEL: Record<RegulatoryFramework, string> = {
  EU_AI_ACT:   'EU AI Act',
  GDPR:        'GDPR',
  NIST_AI_RMF: 'NIST AI RMF',
  ISO_42001:   'ISO/IEC 42001',
  OECD_AI:     'OECD AI Principles',
};

export function RegulatoryRefs({ refs }: { refs?: RegulatoryRef[] }) {
  if (!refs || refs.length === 0) return null;
  return (
    <div
      style={{
        marginTop: 10,
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontWeight: 700, marginRight: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        References
      </span>
      {refs.map((r, i) => (
        <span
          key={`${r.framework}-${r.ref}-${i}`}
          title={r.note}
          style={{
            display: 'inline-block',
            marginRight: 6,
            marginBottom: 4,
            padding: '2px 8px',
            background: 'var(--surface-2, var(--surface))',
            border: '1px solid var(--border)',
            borderRadius: 999,
            fontFamily: 'var(--font-body)',
          }}
        >
          <strong style={{ color: 'var(--text-secondary)' }}>{FRAMEWORK_LABEL[r.framework]}</strong>{' '}
          <span style={{ color: 'var(--text-primary)' }}>{r.ref}</span>
        </span>
      ))}
    </div>
  );
}
