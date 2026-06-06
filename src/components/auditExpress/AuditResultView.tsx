import type { CSSProperties } from 'react';

/** Shared, non-PII result rendering for Audit Express (Run page + Detail page). */

export interface RoiResult {
  estimatedTimeSavedHoursPerMonth: number;
  estimatedMonthlyCostSaved: number;
  estimatedYearlyCostSaved: number;
  estimatedPaybackMonths: number | null;
}
export interface AuditPreview {
  engineVersion: string;
  k1a: { normalizedScore: number; bucket: string };
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>{value}</span>
    </div>
  );
}

export function AuditResultView({ preview, understanding }: { preview: AuditPreview; understanding: AuditUnderstanding | null }) {
  // Defensive: never assume a fully-shaped server response. Missing fields render
  // a graceful fallback instead of crashing the page (global ErrorBoundary).
  const r = preview?.k2a?.result;
  const bp = understanding?.businessProfile;
  const offers = bp?.offers ?? [];
  const opportunities = understanding?.automationOpportunities ?? [];
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

  return (
    <>
      <div style={card}>
        <h2 style={{ ...h2, margin: '0 0 12px' }}>ROI estimate (indicative)</h2>
        {r ? (
          <>
            <Metric label="Estimated time saved" value={`${num(r.estimatedTimeSavedHoursPerMonth)} hours/month  (~${num(r.estimatedTimeSavedHoursPerMonth) * 12} hours/year)`} />
            <Metric label="Estimated cost saved" value={`≈ ${usd(num(r.estimatedMonthlyCostSaved))}/mo  (~${usd(num(r.estimatedYearlyCostSaved))}/yr)`} />
            {r.estimatedPaybackMonths != null && <Metric label="Estimated payback" value={`≈ ${num(r.estimatedPaybackMonths)} months`} />}
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>ROI estimate unavailable for this audit.</p>
        )}
        {preview?.k1a && <Metric label="AI readiness (indicative)" value={`${preview.k1a.bucket ?? 'n/a'} (${num(preview.k1a.normalizedScore)}/100)`} />}
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
