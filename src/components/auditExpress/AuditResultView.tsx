import type { CSSProperties } from 'react';
import { formatHoursRange, formatMoneyRange, formatPaybackRange, indicativeRange } from '../../lib/result/narrative';

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
        <h2 style={{ ...h2, margin: '0 0 4px' }}>Your snapshot · AI readiness: {(preview?.k1a?.bucket ?? 'n/a')} ({num(preview?.k1a?.normalizedScore)}/100)</h2>

        <div style={label}>What this means</div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{READINESS_MEANING[bucket] ?? READINESS_MEANING.medium}</p>

        {r ? (
          <>
            <div style={label}>The opportunity — indicative ranges</div>
            <div style={rangeRow}><span style={{ color: 'var(--text-secondary)' }}>Time back</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatHoursRange(num(r.estimatedTimeSavedHoursPerMonth))} (≈ {Math.round(yearHrs.low)}–{Math.round(yearHrs.high)} h/yr)</span></div>
            <div style={rangeRow}><span style={{ color: 'var(--text-secondary)' }}>Cost impact</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatMoneyRange(num(r.estimatedMonthlyCostSaved))} (≈ {usd(yearUsd.low)}–{usd(yearUsd.high)}/yr)</span></div>
            {formatPaybackRange(r.estimatedPaybackMonths) && <div style={rangeRow}><span style={{ color: 'var(--text-secondary)' }}>Payback</span><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatPaybackRange(r.estimatedPaybackMonths)}</span></div>}

            <div style={label}>How the saving happens</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {['repetitive tasks', 'assisted / automated', 'same work, less manual time'].map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'var(--surface-2, var(--surface))', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>{s}</span>
                  <span aria-hidden style={{ color: 'var(--text-muted)' }}>→</span>
                </span>
              ))}
              <span style={{ background: 'var(--brand-tint-bg)', border: '1px solid var(--violet)', color: 'var(--text-primary)', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>hours back to higher-value work</span>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10 }}>ROI estimate unavailable for this audit.</p>
        )}

        <div style={label}>What to do first</div>
        <ol style={{ margin: '0 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <li>Pick <strong>one</strong> high-volume task (support replies, invoice entry, reporting).</li>
          <li>Pilot one assistant on it for ~2 weeks.</li>
          <li>Measure hours before/after — keep what pays back.</li>
        </ol>
        {(onSeeAgents || onRunFullAudit) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {onSeeAgents && <button type="button" onClick={onSeeAgents} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient, var(--violet))', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>See agents matched to your audit →</button>}
            {onRunFullAudit && <button type="button" onClick={onRunFullAudit} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Run a full audit</button>}
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Estimates from your inputs · indicative only · not a guarantee.</p>
      </div>

      {bp && (
        <div style={card}>
          <h2 style={{ ...h2, margin: '0 0 10px' }}>What this business does</h2>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <div><strong>Type:</strong> {(bp.businessType ?? 'unknown').replace(/_/g, ' ')} · <strong>Audience:</strong> {bp.audience ?? 'unknown'} · confidence {bp.confidence ?? 'low'}</div>
            {offers.length > 0 && <div style={{ marginTop: 6 }}>Offers: {offers.map(o => o.tag).join(', ')}</div>}
          </div>
          {opportunities.length > 0 && (
            <>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, margin: '14px 0 6px' }}>Automation opportunities</h3>
              {understanding?.automationHeadline && <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 6 }}>{understanding.automationHeadline}</div>}
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {opportunities.map(o => (
                  <li key={o.id} style={{ fontSize: 13.5, margin: '5px 0', color: 'var(--text-secondary)' }}>{o.title} — {o.impact} impact / {o.effort} effort</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
