/**
 * RecommendPanel — Phase K3A.
 *
 * Collapsible card on AgentsPage. Six optional profile inputs +
 * Recommend button (disabled until any field set) + Clear button
 * (visible when results present).
 *
 * Source of truth for results lives in AgentsPage; this panel raises
 * onResults / onClear callbacks. No PreferencesContext coupling.
 */

import { useMemo, useState } from 'react';
import { recommendAgents, friendlyRecommendError } from '../../lib/recommendation/recommendClient';
import type {
  CompanySize,
  Maturity,
  MinPlan,
  RecommendProfile,
  RecommendationResult,
  Workflow,
} from '../../types/recommendation';

const WORKFLOWS: { value: Workflow; label: string }[] = [
  { value: 'support',    label: 'Customer support' },
  { value: 'sales',      label: 'Sales and lead follow-up' },
  { value: 'finance',    label: 'Finance and invoicing' },
  { value: 'documents',  label: 'Documents and contracts' },
  { value: 'reporting',  label: 'Reporting and dashboards' },
  { value: 'admin',      label: 'Administrative work' },
  { value: 'compliance', label: 'Compliance and governance' },
  { value: 'marketing',  label: 'Marketing and content' },
  { value: 'hr',         label: 'HR and people operations' },
];

interface Props {
  orgId:                string;
  hasResults:           boolean;
  onResults:            (r: RecommendationResult, profileSummary: RecommendProfile) => void;
  onClear:              () => void;
}

export function RecommendPanel({ orgId, hasResults, onResults, onClear }: Props) {
  const [open, setOpen] = useState(true);

  const [industry, setIndustry]                 = useState('');
  const [companySize, setCompanySize]           = useState<CompanySize | ''>('');
  const [targetWorkflow, setTargetWorkflow]     = useState<Workflow | ''>('');
  const [subscriptionPlan, setSubscriptionPlan] = useState<MinPlan | ''>('');
  const [currentMaturity, setCurrentMaturity]   = useState<Maturity | ''>('');
  const [integrationsRaw, setIntegrationsRaw]   = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const integrationsList = useMemo(() => {
    return integrationsRaw
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 10);
  }, [integrationsRaw]);

  const hasAnyField = useMemo(
    () =>
      industry.trim().length > 0 ||
      companySize !== '' ||
      targetWorkflow !== '' ||
      subscriptionPlan !== '' ||
      currentMaturity !== '' ||
      integrationsList.length > 0,
    [industry, companySize, targetWorkflow, subscriptionPlan, currentMaturity, integrationsList],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAnyField) return;
    setSubmitting(true);
    setError(null);
    try {
      const { auth } = await import('../../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const profile: RecommendProfile = {};
      if (industry.trim())     profile.industry         = industry.trim().toLowerCase();
      if (companySize)         profile.companySize      = companySize;
      if (targetWorkflow)      profile.targetWorkflow   = targetWorkflow;
      if (subscriptionPlan)    profile.subscriptionPlan = subscriptionPlan;
      if (currentMaturity)     profile.currentMaturity  = currentMaturity;
      if (integrationsList.length > 0) profile.integrations = integrationsList;

      const result = await recommendAgents(orgId, profile, idToken);
      onResults(result, profile);
    } catch (err) {
      console.warn('[RecommendPanel] failed:', err);
      setError(friendlyRecommendError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    onClear();
    setError(null);
  };

  return (
    <div style={{
      background:     'var(--surface)',
      border:         '1px solid var(--border)',
      borderRadius:   14,
      marginBottom:   18,
      overflow:       'hidden',
    }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width:      '100%',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding:    '14px 18px',
          border:     'none',
          background: 'transparent',
          cursor:     'pointer',
          fontFamily: 'inherit',
          textAlign:  'left',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Personalize my recommendations
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Add a few preferences to rank agents that fit your context.
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
             style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <form onSubmit={handleSubmit} style={{ padding: '4px 18px 18px' }}>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap:                 12,
            marginBottom:        14,
          }}>
            <Field label="Industry">
              <input
                type="text" maxLength={40}
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. retail, saas, healthcare"
                style={inputStyle()}
              />
            </Field>
            <Field label="Company size">
              <select value={companySize} onChange={e => setCompanySize(e.target.value as CompanySize | '')} style={inputStyle()}>
                <option value="">—</option>
                <option value="solo">Solo</option>
                <option value="sme">SME</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </Field>
            <Field label="Target workflow">
              <select value={targetWorkflow} onChange={e => setTargetWorkflow(e.target.value as Workflow | '')} style={inputStyle()}>
                <option value="">—</option>
                {WORKFLOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </Field>
            <Field label="Subscription plan">
              <select value={subscriptionPlan} onChange={e => setSubscriptionPlan(e.target.value as MinPlan | '')} style={inputStyle()}>
                <option value="">—</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </Field>
            <Field label="Current AI maturity">
              <select value={currentMaturity} onChange={e => setCurrentMaturity(e.target.value as Maturity | '')} style={inputStyle()}>
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Integrations (comma-separated, max 10)">
              <input
                type="text"
                value={integrationsRaw}
                onChange={e => setIntegrationsRaw(e.target.value)}
                placeholder="e.g. hubspot, slack, email"
                style={inputStyle()}
              />
            </Field>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>
            Add at least one preference to personalize recommendations.
          </p>

          {error && (
            <div style={{
              marginBottom: 12, padding: '10px 12px', borderRadius: 8,
              background: 'var(--red-soft-bg)', color: 'var(--red-text)', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={!hasAnyField || submitting}
              style={{
                padding:      '10px 18px',
                borderRadius: 10,
                border:       'none',
                background:   (!hasAnyField || submitting) ? 'var(--surface-2)' : 'var(--violet)',
                color:        (!hasAnyField || submitting) ? 'var(--text-muted)' : '#fff',
                fontSize:     13,
                fontWeight:   700,
                cursor:       (!hasAnyField || submitting) ? 'not-allowed' : 'pointer',
                fontFamily:   'inherit',
              }}
            >
              {submitting ? 'Computing…' : 'Recommend agents'}
            </button>
            {hasResults && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding:      '10px 18px',
                  borderRadius: 10,
                  border:       '1px solid var(--border)',
                  background:   'transparent',
                  color:        'var(--text-secondary)',
                  fontSize:     13,
                  fontWeight:   600,
                  cursor:       'pointer',
                  fontFamily:   'inherit',
                }}
              >
                Clear recommendations
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Atoms ────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    padding:      '8px 10px',
    borderRadius: 8,
    border:       '1px solid var(--border)',
    background:   'var(--surface-2)',
    color:        'var(--text-primary)',
    fontSize:     13,
    fontFamily:   'inherit',
    outline:      'none',
    boxSizing:    'border-box',
    width:        '100%',
  };
}
