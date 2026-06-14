/**
 * ActionPlan — J9 Phase D.
 *
 * Read-only Prioritized Action Plan derived from AuditResult. Three buckets:
 *   - Critical    "Strongly advised before production deployment"
 *   - Important   "Short-term — address in current quarter"
 *   - Improvement "Best practice — schedule for maturity"
 *
 * GUARDRAILS (locked):
 *   - No "compliance certified", no "passed audit", no "deploy-ready" claims.
 *   - Profile preference affects INTRO TONE ONLY — never the bucket assignment,
 *     sort order, or content of recommendations.
 *   - Hard display cap = 8 per bucket + "+N more" tail (deterministic; UI only).
 *   - No persistence, no editing actions, no scoring change.
 */

import type { AuditResult, Recommendation, RegulatoryRef } from '../../types/scoring';
import { buildActionPlan } from '../../lib/scoring/actionPlan';
import { usePreferences } from '../../context/PreferencesContext';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import type { UserProfile } from '../../lib/preferences';

const MAX_VISIBLE = 8;

const FRAMEWORK_LABEL: Record<RegulatoryRef['framework'], string> = {
  EU_AI_ACT:   'EU AI Act',
  GDPR:        'GDPR',
  NIST_AI_RMF: 'NIST AI RMF',
  ISO_42001:   'ISO/IEC 42001',
  OECD_AI:     'OECD AI',
};

const PROFILE_INTRO: Record<UserProfile, string> = {
  enterprise:
    'A structured, priority-ordered view of what to address first. Use it as input to your AI compliance programme and quarterly planning.',
  entrepreneur:
    'What to fix first, in plain English. Focus on the Critical band before shipping to customers; revisit before each fundraise.',
  individual:
    'A simple, priority-ordered list of actions. Start with the Critical band and work your way down at your own pace.',
};

interface BandConfig {
  key: 'critical' | 'important' | 'improvement';
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
}

const BANDS: BandConfig[] = [
  {
    key: 'critical',
    title: 'Critical',
    subtitle: 'Strongly advised before production deployment.',
    accent: 'var(--red-text)',
    bg: 'var(--red-soft-bg, rgba(220, 38, 38, 0.08))',
  },
  {
    key: 'important',
    title: 'Important',
    subtitle: 'Short-term — address in the current quarter.',
    accent: 'var(--amber-text, var(--yellow-text))',
    bg: 'var(--amber-soft-bg, rgba(245, 158, 11, 0.10))',
  },
  {
    key: 'improvement',
    title: 'Improvement',
    subtitle: 'Best practice — schedule for maturity.',
    accent: 'var(--violet-text)',
    bg: 'var(--brand-soft-bg)',
  },
];

function RefChip({ r }: { r: RegulatoryRef }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 7px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        background: 'var(--surface-2, var(--surface))',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        marginRight: 4,
        marginBottom: 4,
        whiteSpace: 'nowrap',
      }}
      title={r.note ?? ''}
    >
      <strong style={{ color: 'var(--text-primary)' }}>{FRAMEWORK_LABEL[r.framework]}</strong>
      <span>{r.ref}</span>
    </span>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        background: 'var(--surface-2, var(--surface))',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
    >
      {label}: {value}
    </span>
  );
}

function RecRow({ r }: { r: Recommendation }) {
  const A = useLocale().results.actionPlan;
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <h4
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            flex: 1,
            minWidth: 200,
          }}
        >
          {r.title}
        </h4>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <MetricPill label={A.impactPill} value={r.impact} />
          <MetricPill label={A.effortPill} value={r.effort} />
        </div>
      </div>

      {r.whyItMatters && (
        <p style={{ margin: '4px 0 6px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic' }}>
          {r.whyItMatters}
        </p>
      )}

      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        {r.description}
      </p>

      {r.expectedOutcome && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{A.expectedOutcome}</strong> {r.expectedOutcome}
        </p>
      )}

      {r.regulatoryRefs && r.regulatoryRefs.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' }}>
          {r.regulatoryRefs.map((ref, i) => (
            <RefChip key={i} r={ref} />
          ))}
        </div>
      )}
    </div>
  );
}

function Band({ band, items }: { band: BandConfig; items: Recommendation[] }) {
  const A = useLocale().results.actionPlan;
  const total = items.length;
  const visible = items.slice(0, MAX_VISIBLE);
  const rest = total - visible.length;
  // critical subtitle ("Strongly advised before production deployment.") is an
  // advisory hedge — kept English, deferred with the regulatory batch.
  const title = band.key === 'critical' ? A.bandCriticalTitle : band.key === 'important' ? A.bandImportantTitle : A.bandImprovementTitle;
  const subtitle = band.key === 'important' ? A.bandImportantSubtitle : band.key === 'improvement' ? A.bandImprovementSubtitle : band.subtitle;

  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          padding: '12px 16px',
          background: band.bg,
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: band.accent,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {format(A.itemCount, { n: total, plural: total === 1 ? '' : 's' })}
        </div>
      </div>

      {total === 0 ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--card-radius)',
            padding: 14,
            fontSize: 13,
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          {A.bandEmpty}
        </div>
      ) : (
        <>
          {visible.map(r => (
            <RecRow key={r.id} r={r} />
          ))}
          {rest > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
              {format(A.moreNotShown, { n: rest })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ActionPlan({ result }: { result: AuditResult }) {
  const { userProfile } = usePreferences();
  const A = useLocale().results.actionPlan;
  const plan = buildActionPlan(result);

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: -0.3,
          }}
        >
          {A.title}
        </h2>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          {PROFILE_INTRO[userProfile]}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {A.roadmapNote}
        </p>
      </div>

      {BANDS.map(b => (
        <Band key={b.key} band={b} items={plan[b.key]} />
      ))}
    </section>
  );
}
