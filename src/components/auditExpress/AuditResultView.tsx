import type { CSSProperties } from 'react';
import { formatHoursRange, formatMoneyRange, formatPaybackRange, indicativeRange } from '../../lib/result/narrative';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

/** Shared, non-PII result rendering for Audit Express (Run page + Detail page). */

const READINESS_MEANING: Record<string, string> = {
  low: 'You’re early with AI. The fastest win is automating one repetitive task your team still does entirely by hand.',
  medium: 'You’ve started with AI but the gains aren’t systematic yet. Your biggest lever is automating the repetitive work below.',
  high: 'You’re using AI well. The next gains come from scaling what works and tightening oversight so it stays dependable.',
};

export interface RoiResult {
  estimatedTimeSavedHoursPerMonth: number;
  estimatedMonthlyCostSaved: number;
  estimatedYearlyCostSaved: number;
  estimatedPaybackMonths: number | null;
}
export interface AuditPreview {
  engineVersion: string;
  k1a: { normalizedScore: number; bucket: string; recommendedAgentIds?: string[] };
  k2a: { result: RoiResult };
}
export interface AuditUnderstanding {
  businessProfile: { businessType: string; audience: string; confidence: string; offers: { tag: string }[] };
  automationHeadline?: string;
  automationOpportunities: { id: string; title: string; impact: string; effort: string }[];
}

const usd = (n: number) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');

const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', padding: 22, marginTop: 14 };
const h2: CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text-primary)' };

export function AuditResultView({ preview, understanding, onSeeAgents, onRunFullAudit }: {
  preview: AuditPreview;
  understanding: AuditUnderstanding | null;
  onSeeAgents?: () => void;
  onRunFullAudit?: () => void;
}) {
  const T = useLocale();
  const R = T.audit.express.result;
  const C = T.audit.express.cta;
  // Defensive: never assume a fully-shaped server response. Missing fields render
  // a graceful fallback instead of crashing the page (global ErrorBoundary).
  const r = preview?.k2a?.result;
  const bp = understanding?.businessProfile;
  const offers = bp?.offers ?? [];
  const opportunities = understanding?.automationOpportunities ?? [];
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const bucket = (preview?.k1a?.bucket ?? 'medium').toLowerCase();
  const yearHrs = indicativeRange(num(r?.estimatedTimeSavedHoursPerMonth) * 12);
  const yearUsd = indicativeRange(num(r?.estimatedYearlyCostSaved));

  const label: CSSProperties = { fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '14px 0 5px' };
  const rangeRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 14 };

  return (
    <>
      <div style={card}>
        <h2 style={{ ...h2, margin: '0 0 4px' }}>{format(R.snapshotHeading, { bucket: preview?.k1a?.bucket ?? 'n/a', score: num(preview?.k1a?.normalizedScore) })}</h2>

        <div style={label}>{R.whatThisMeans}</div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{READINESS_MEANING[bucket] ?? READINESS_MEANING.medium}</p>

        {r ? (
          <>
            <div style={label}>{R.opportunityLabel}</div>
            <div style={rangeRow}><span style={{ color: 'var(--text-secondary)' }}>{R.timeBack}</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{format(R.timeBackValue, { range: formatHoursRange(num(r.estimatedTimeSavedHoursPerMonth)), low: Math.round(yearHrs.low), high: Math.round(yearHrs.high) })}</span></div>
            <div style={rangeRow}><span style={{ color: 'var(--text-secondary)' }}>{R.costImpact}</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{format(R.costImpactValue, { range: formatMoneyRange(num(r.estimatedMonthlyCostSaved)), low: usd(yearUsd.low), high: usd(yearUsd.high) })}</span></div>
            {formatPaybackRange(r.estimatedPaybackMonths) && <div style={rangeRow}><span style={{ color: 'var(--text-secondary)' }}>{R.payback}</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatPaybackRange(r.estimatedPaybackMonths)}</span></div>}

            <div style={label}>{R.howSavingLabel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {[R.flowRepetitive, R.flowAssisted, R.flowSameWork].map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'var(--surface-2, var(--surface))', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>{s}</span>
                  <span aria-hidden style={{ color: 'var(--text-muted)' }}>→</span>
                </span>
              ))}
              <span style={{ background: 'var(--brand-tint-bg)', border: '1px solid var(--violet)', color: 'var(--text-primary)', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>{R.flowHoursBack}</span>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10 }}>{R.roiUnavailable}</p>
        )}

        <div style={label}>{R.whatToDoFirst}</div>
        <ol style={{ margin: '0 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <li>{R.step1}</li>
          <li>{R.step2}</li>
          <li>{R.step3}</li>
        </ol>
        {(onSeeAgents || onRunFullAudit) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {onSeeAgents && <button type="button" onClick={onSeeAgents} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient, var(--violet))', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{C.seeAgents}</button>}
            {onRunFullAudit && <button type="button" onClick={onRunFullAudit} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{C.runFullAudit}</button>}
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Estimates from your inputs · indicative only · not a guarantee.</p>
      </div>

      {bp && (
        <div style={card}>
          <h2 style={{ ...h2, margin: '0 0 10px' }}>{R.businessHeading}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <div><strong>{R.businessType}</strong> {(bp.businessType ?? R.businessUnknown).replace(/_/g, ' ')} · <strong>{R.businessAudience}</strong> {bp.audience ?? R.businessUnknown} · {format(R.businessConfidence, { confidence: bp.confidence ?? 'low' })}</div>
            {offers.length > 0 && <div style={{ marginTop: 6 }}>{format(R.offers, { list: offers.map(o => o.tag).join(', ') })}</div>}
          </div>
          {opportunities.length > 0 && (
            <>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, margin: '14px 0 6px' }}>{R.automationHeading}</h3>
              {understanding?.automationHeadline && <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 6 }}>{understanding.automationHeadline}</div>}
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {opportunities.map(o => (
                  <li key={o.id} style={{ fontSize: 13.5, margin: '5px 0', color: 'var(--text-secondary)' }}>{format(R.opportunityItem, { title: o.title, impact: o.impact, effort: o.effort })}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
