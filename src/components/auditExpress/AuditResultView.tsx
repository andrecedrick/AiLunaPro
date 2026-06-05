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
  const r = preview.k2a.result;
  const u = understanding;
  return (
    <>
      <div style={card}>
        <h2 style={{ ...h2, margin: '0 0 12px' }}>ROI estimate (indicative)</h2>
        <Metric label="Estimated time saved" value={`${r.estimatedTimeSavedHoursPerMonth} hours/month  (~${r.estimatedTimeSavedHoursPerMonth * 12} hours/year)`} />
        <Metric label="Estimated cost saved" value={`≈ ${usd(r.estimatedMonthlyCostSaved)}/mo  (~${usd(r.estimatedYearlyCostSaved)}/yr)`} />
        {r.estimatedPaybackMonths != null && <Metric label="Estimated payback" value={`≈ ${r.estimatedPaybackMonths} months`} />}
        <Metric label="AI readiness (indicative)" value={`${preview.k1a.bucket} (${preview.k1a.normalizedScore}/100)`} />
      </div>

      {u && (
        <div style={card}>
          <h2 style={{ ...h2, margin: '0 0 10px' }}>What this business does</h2>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            <div><strong>Type:</strong> {u.businessProfile.businessType.replace(/_/g, ' ')} · <strong>Audience:</strong> {u.businessProfile.audience} · confidence {u.businessProfile.confidence}</div>
            {u.businessProfile.offers.length > 0 && <div style={{ marginTop: 6 }}>Offers: {u.businessProfile.offers.map(o => o.tag).join(', ')}</div>}
          </div>
          {u.automationOpportunities.length > 0 && (
            <>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, margin: '14px 0 6px' }}>Automation opportunities</h3>
              {u.automationHeadline && <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 6 }}>{u.automationHeadline}</div>}
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {u.automationOpportunities.map(o => (
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
