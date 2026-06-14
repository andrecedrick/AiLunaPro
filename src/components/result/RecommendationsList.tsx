import { Badge } from '../ui/Badge';
import type { AuditResult, Effort, Impact } from '../../types/scoring';
import { RegulatoryRefs } from './RegulatoryRefs';
import { usePreferences } from '../../context/PreferencesContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import type { UserProfile } from '../../lib/preferences';

/** J9 Phase B-lite: one external resource link per profile (static).
 *  Informational, opens in a new tab. Never affects scoring or findings. */
const PROFILE_RESOURCE: Record<UserProfile, { label: string; href: string; note: string }> = {
  enterprise: {
    label: 'ISO/IEC 42001 — AI management systems',
    href:  'https://www.iso.org/standard/81230.html',
    note:  'Suggested management-system reference for enterprise AI programmes.',
  },
  entrepreneur: {
    label: 'NIST AI Risk Management Framework (Playbook)',
    href:  'https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook',
    note:  'Practical, lightweight playbook to apply NIST AI RMF in a startup context.',
  },
  individual: {
    label: 'OECD AI Principles',
    href:  'https://oecd.ai/en/ai-principles',
    note:  'High-level responsible-AI principles useful for personal AI usage.',
  },
};

const IMPACT_BG: Record<Impact, string> = {
  critical: 'var(--critical-bg)',
  high: 'var(--red-bg)',
  medium: 'var(--amber-bg)',
  low: 'var(--neutral-bg)',
};

const IMPACT_FG: Record<Impact, string> = {
  critical: 'var(--critical-text)',
  high: 'var(--red-text)',
  medium: 'var(--amber-text)',
  low: 'var(--neutral-text)',
};

interface Props {
  result: AuditResult;
}

export function RecommendationsList({ result }: Props) {
  const { userProfile } = usePreferences();
  const R = useLocale().results.recommendations;
  const impactLabel = (k: Impact): string =>
    ({ critical: R.impactCritical, high: R.impactHigh, medium: R.impactMedium, low: R.impactLow })[k];
  const resource = PROFILE_RESOURCE[userProfile];

  // Order by impact, then by timeframe
  const ordered = [...result.recommendations].sort((a, b) => {
    const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const ai = impactOrder[a.impact] ?? 0;
    const bi = impactOrder[b.impact] ?? 0;
    if (ai !== bi) return bi - ai;
    return a.timeframeDays - b.timeframeDays;
  });

  // Build reverse index: rec.id → finding ids that reference it
  const reverseIndex: Record<string, string[]> = {};
  for (const f of result.findings) {
    for (const rid of f.recommendationIds) {
      reverseIndex[rid] = reverseIndex[rid] ?? [];
      reverseIndex[rid].push(f.id);
    }
  }

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {R.title}
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {format(R.actionsCount, { n: ordered.length })}
        </span>
      </div>

      {/* Profile-specific external starter resource. Informational, static. */}
      <div
        style={{
          marginBottom: 14,
          padding: '10px 12px',
          background: 'var(--surface-2, var(--surface))',
          border: '1px dashed var(--border)',
          borderRadius: 10,
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>{R.starterResource}</strong> ·{' '}
        <a
          href={resource.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--violet-text)', fontWeight: 600 }}
        >
          {resource.label} ↗
        </a>
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          {resource.note}
        </div>
      </div>

      {ordered.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          {R.empty}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ordered.map(r => {
            const linkedFindings = reverseIndex[r.id] ?? [];
            return (
              <div
                key={r.id}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {r.title}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      letterSpacing: 0.3,
                    }}
                  >
                    {r.id}
                  </span>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {r.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Badge variant={effortVariant(r.effort)} />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      background: IMPACT_BG[r.impact],
                      color: IMPACT_FG[r.impact],
                    }}
                  >
                    {impactLabel(r.impact)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--violet-text)',
                      background: 'var(--brand-tint-bg)',
                      padding: '2px 10px',
                      borderRadius: 20,
                    }}
                  >
                    {format(R.timeframeDays, { n: r.timeframeDays })}
                  </span>
                  {linkedFindings.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {format(R.addressesFindings, { count: linkedFindings.length, plural: linkedFindings.length === 1 ? '' : 's' })}
                    </span>
                  )}
                </div>
                <RegulatoryRefs refs={r.regulatoryRefs} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function effortVariant(e: Effort) {
  return `effort-${e}` as 'effort-low' | 'effort-medium' | 'effort-high';
}
