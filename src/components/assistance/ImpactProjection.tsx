import { SectionTitle } from './SectionTitle';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import type { Dict } from '../../lib/locale/i18n/en';
import type { AuditResult } from '../../types/scoring';
import { estimateScoreLift, getTopActions } from '../../lib/scoring/assistance';

/**
 * Qualitative outcome chips, each with a directional reasoning.
 */
function qualitativeOutcomes(result: AuditResult, t: Dict['assistancePage']) {
  const o = t.impact.outcomes;
  const ctx = result.contextFlags;
  const out: { title: string; sub: string; tone: 'good' | 'better' | 'best' }[] = [];

  // Audit / regulator readiness
  if (result.findings.some(f => f.severity === 'critical' || f.severity === 'high')) {
    out.push({
      title: o.auditReadinessTitle,
      sub: o.auditReadinessHigh,
      tone: 'best',
    });
  } else {
    out.push({
      title: o.auditReadinessTitle,
      sub: o.auditReadinessSteady,
      tone: 'better',
    });
  }

  // Incident risk
  if (ctx.sensitiveData || ctx.missionCritical) {
    out.push({
      title: o.incidentExposureTitle,
      sub: o.incidentExposureHigh,
      tone: 'best',
    });
  } else {
    out.push({
      title: o.incidentExposureTitle,
      sub: o.incidentExposureSteady,
      tone: 'better',
    });
  }

  // Customer trust
  if (ctx.customerFacing) {
    out.push({
      title: o.customerTrustTitle,
      sub: o.customerTrustHigh,
      tone: 'best',
    });
  } else {
    out.push({
      title: o.internalVelocityTitle,
      sub: o.internalVelocitySteady,
      tone: 'better',
    });
  }

  return out;
}

const TONE_STYLE = {
  good: { bg: 'var(--neutral-bg)', fg: 'var(--neutral-text)' },
  better: { bg: 'var(--blue-bg)', fg: 'var(--blue-text)' },
  best: { bg: 'var(--green-bg)', fg: 'var(--green-text)' },
} as const;

export function ImpactProjection({ result }: { result: AuditResult }) {
  const T = useLocale();
  const top = getTopActions(result, 3);
  const { projectedScore, delta } = estimateScoreLift(result, top);
  const outcomes = qualitativeOutcomes(result, T.assistancePage);
  const willImprove = delta > 0;

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <SectionTitle eyebrow={T.assistancePage.impact.eyebrow} title={T.assistancePage.impact.title} />

      {/* Score lift card */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--brand-soft-bg) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '20px 22px',
          marginBottom: 18,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 20,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}
          >
            {T.assistancePage.impact.ifTop3}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            {format(T.assistancePage.impact.scoreLift, {
              currentScore: result.globalScore,
              projectedScore,
            })}
          </p>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 18px',
            textAlign: 'center',
            minWidth: 130,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            {T.assistancePage.impact.projectedLabel}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 36,
              color: 'var(--violet-text)',
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            {projectedScore}
          </div>
          <div
            style={{
              fontSize: 12,
              color: willImprove ? 'var(--green-text)' : 'var(--text-muted)',
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            {willImprove
              ? format(T.assistancePage.impact.deltaPts, { delta })
              : T.assistancePage.impact.noChange}
          </div>
        </div>
      </div>

      {/* Qualitative outcomes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {outcomes.map(o => (
          <div
            key={o.title}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                background: TONE_STYLE[o.tone].bg,
                color: TONE_STYLE[o.tone].fg,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 999,
                marginBottom: 8,
              }}
            >
              {o.tone === 'best'
                ? T.assistancePage.impact.toneHighLift
                : o.tone === 'better'
                ? T.assistancePage.impact.toneSteadyGain
                : T.assistancePage.impact.toneHoldTheLine}
            </span>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}
            >
              {o.title}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {o.sub}
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          margin: '14px 0 0',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}
      >
        {T.assistancePage.impact.disclaimer}
      </p>
    </section>
  );
}
