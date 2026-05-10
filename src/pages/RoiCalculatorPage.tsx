/**
 * RoiCalculatorPage — Phase K2A.
 * Public unauth route: #/roi-calculator
 *
 * Single-page form: 4 inputs (teamSize, monthlyHoursOnRepetitiveWork,
 * averageHourlyCost, targetWorkflow), email + optional companyName +
 * GDPR consent + Turnstile. On submit: POST /api/public/roi-calculation,
 * render result with monthly/yearly savings, time saved, payback,
 * 2 recommended agent cards (affiliate URL), signup CTA.
 *
 * Chromeless layout. Renders before auth gate in App.tsx.
 *
 * teamSize is collected and persisted but does NOT affect the K2A formula.
 */

import { useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { WORKFLOW_LABELS, WORKFLOW_VALUES, type Workflow } from '../data/roi-config';
import { submitRoi, friendlyRoiError } from '../lib/roi/roiClient';
import type { RoiResult } from '../types/roi';
import { TurnstileWidget } from '../components/diagnostic/TurnstileWidget';

const AFFILIATE_URL = 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD';

interface FormErrors {
  general?:   string;
  teamSize?:  string;
  hours?:     string;
  cost?:      string;
  workflow?:  string;
  email?:     string;
  consent?:   string;
}

export function RoiCalculatorPage() {
  const { navigate } = useRoute();

  const [teamSize,    setTeamSize]    = useState<string>('');
  const [hours,       setHours]       = useState<string>('');
  const [cost,        setCost]        = useState<string>('50');
  const [workflow,    setWorkflow]    = useState<Workflow | ''>('');
  const [email,       setEmail]       = useState('');
  const [companyName, setCompany]     = useState('');
  const [consent,     setConsent]     = useState(false);
  const [turnstileToken, setTsToken]  = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [result,     setResult]     = useState<RoiResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: FormErrors = {};

    const teamSizeNum = Number(teamSize);
    if (!Number.isFinite(teamSizeNum) || !Number.isInteger(teamSizeNum) || teamSizeNum < 1 || teamSizeNum > 10000) {
      err.teamSize = 'Team size must be an integer between 1 and 10000.';
    }
    const hoursNum = Number(hours);
    if (!Number.isFinite(hoursNum) || hoursNum < 0 || hoursNum > 10000) {
      err.hours = 'Monthly hours must be a number between 0 and 10000.';
    }
    const costNum = Number(cost);
    if (!Number.isFinite(costNum) || costNum < 1 || costNum > 1000) {
      err.cost = 'Hourly cost must be a number between 1 and 1000 USD.';
    }
    if (!workflow || !(WORKFLOW_VALUES as readonly string[]).includes(workflow)) {
      err.workflow = 'Please select a workflow.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email   = 'Please enter a valid email address.';
    if (!consent)                                  err.consent = 'You must accept to receive your estimate.';
    if (turnstileToken === null)                   err.general = 'Captcha is loading — please wait.';

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      const r = await submitRoi({
        inputs: {
          teamSize:                     teamSizeNum,
          monthlyHoursOnRepetitiveWork: hoursNum,
          averageHourlyCost:            costNum,
          targetWorkflow:               workflow as Workflow,
        },
        lead: {
          email,
          companyName: companyName.trim() || undefined,
          consent: true,
        },
        turnstileToken: turnstileToken ?? undefined,
      });
      setResult(r.result);
      requestAnimationFrame(() => {
        const el = document.getElementById('roi-result');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (sErr) {
      console.error('[RoiCalculatorPage] submit failed:', sErr);
      setErrors({ general: friendlyRoiError(sErr) });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setTeamSize(''); setHours(''); setCost('50'); setWorkflow('');
    setEmail(''); setCompany(''); setConsent(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface-2)',
      padding: '40px 20px',
      fontFamily: 'inherit',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            AI ROI Calculator
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
            Estimate the time and money you can save with AiLunaPro AI agents.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
            Free · No account required · Takes about 1 minute · USD
          </p>
        </div>

        {result ? (
          <ResultView result={result} onReset={reset} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <fieldset style={fieldsetStyle()}>
              <legend style={legendStyle()}>Your team</legend>

              <Field label="Team size" required error={errors.teamSize}>
                <input
                  type="number" inputMode="numeric" min={1} max={10000}
                  value={teamSize} onChange={e => setTeamSize(e.target.value)}
                  placeholder="e.g. 10"
                  style={inputStyle()}
                />
              </Field>

              <Field
                label="Monthly hours your team spends on repetitive work"
                required
                error={errors.hours}
              >
                <input
                  type="number" inputMode="decimal" min={0} max={10000} step={1}
                  value={hours} onChange={e => setHours(e.target.value)}
                  placeholder="e.g. 80"
                  style={inputStyle()}
                />
              </Field>

              <Field label="Average hourly cost (USD)" required error={errors.cost}>
                <input
                  type="number" inputMode="decimal" min={1} max={1000} step={1}
                  value={cost} onChange={e => setCost(e.target.value)}
                  style={inputStyle()}
                />
              </Field>

              <Field label="Target workflow" required error={errors.workflow}>
                <select
                  value={workflow}
                  onChange={e => setWorkflow(e.target.value as Workflow | '')}
                  style={inputStyle()}
                >
                  <option value="">Select a workflow…</option>
                  {WORKFLOW_VALUES.map(w => (
                    <option key={w} value={w}>{WORKFLOW_LABELS[w]}</option>
                  ))}
                </select>
              </Field>
            </fieldset>

            {/* Lead capture */}
            <fieldset style={fieldsetStyle()}>
              <legend style={legendStyle()}>Where should we send your estimate?</legend>

              <Field label="Email" required error={errors.email}>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={inputStyle()}
                />
              </Field>

              <Field label={<>Company name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></>}>
                <input
                  type="text" value={companyName}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  maxLength={120}
                  style={inputStyle()}
                />
              </Field>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 10px', lineHeight: 1.5 }}>
                We only use this information to generate your estimate and follow up about relevant AI services. No account is required.
              </p>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <input
                  type="checkbox" checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--violet)' }}
                />
                <span>
                  I agree to receive my AI ROI estimate and relevant follow-up information from AiLunaPro. I understand that my answers and email will be processed to generate and store this estimate, and that I can request deletion of my data at any time.
                </span>
              </label>
              {errors.consent && (
                <div style={{ color: 'var(--red-text)', fontSize: 12, marginTop: 6 }}>{errors.consent}</div>
              )}

              <div style={{ marginTop: 16 }}>
                <TurnstileWidget onToken={t => setTsToken(t)} />
              </div>
            </fieldset>

            {errors.general && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--red-soft-bg)', color: 'var(--red-text)', fontSize: 13 }}>
                {errors.general}
              </div>
            )}

            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '13px 32px', borderRadius: 12, border: 'none',
                  background: submitting ? 'var(--surface-2)' : 'var(--violet)',
                  color: submitting ? 'var(--text-muted)' : '#fff',
                  fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  boxShadow: submitting ? 'none' : '0 8px 22px rgba(124,58,237,0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                {submitting ? 'Calculating…' : 'Calculate my ROI'}
              </button>
            </div>

            <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate({ name: 'login' })}
                style={{ background: 'none', border: 'none', color: 'var(--violet-text)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Result view ────────────────────────────────────────── */

function ResultView({ result, onReset }: { result: RoiResult; onReset: () => void }) {
  const monthly = result.estimatedMonthlyCostSaved;
  const yearly  = result.estimatedYearlyCostSaved;
  const time    = result.estimatedTimeSavedHoursPerMonth;
  const payback = result.estimatedPaybackMonths;

  return (
    <div id="roi-result">
      {/* Headline savings */}
      <div style={{
        padding: 32, borderRadius: 18,
        border: '1px solid var(--border)', background: 'var(--surface)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
        textAlign: 'center', marginBottom: 22,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          Estimated monthly savings
        </div>
        <div style={{
          fontSize: 56, fontWeight: 800, color: 'var(--green-text)',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.05,
        }}>
          ${monthly.toLocaleString('en-US')}<span style={{ fontSize: 22, color: 'var(--text-muted)', fontWeight: 600 }}>/mo</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 22 }}>
          <Stat label="Yearly savings"  value={`$${yearly.toLocaleString('en-US')}`} />
          <Stat label="Time saved"      value={`${time.toLocaleString('en-US')} h/mo`} />
          <Stat label="Payback"         value={payback === null ? '—' : `${payback.toLocaleString('en-US')} months`} />
        </div>
      </div>

      {/* Disclaimer + pricing note */}
      <div style={{
        padding: '12px 16px', marginBottom: 22, borderRadius: 10,
        background: 'var(--surface-2)', color: 'var(--text-muted)',
        fontSize: 12, lineHeight: 1.55,
      }}>
        <div>
          This is an estimate based on the information you provided and conservative automation assumptions. Actual savings may vary.
        </div>
        <div style={{ marginTop: 4 }}>
          Payback is estimated using a placeholder agent cost of $99/month until agent pricing is finalized.
        </div>
      </div>

      {/* Recommended agents */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          Recommended AiLunaPro agents
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {result.recommendedAgentIds.map(slug => (
            <a
              key={slug}
              href={AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: 16, borderRadius: 12,
                border: '2px solid var(--violet)', background: 'rgba(124,58,237,0.04)',
                textDecoration: 'none', color: 'var(--text-primary)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--violet-text)', textTransform: 'uppercase', marginBottom: 6 }}>
                AiLunaPro
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {humanizeSlug(slug)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--violet-text)', fontWeight: 600 }}>
                Get this agent
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Signup CTA */}
      <div style={{
        padding: 24, borderRadius: 14,
        background: 'var(--text-primary)', color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          Want a deeper analysis and your full action plan?
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>
          Create a free AiLunaPro workspace to access the full audit, registry, and agent catalog.
        </div>
        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '11px 28px', borderRadius: 10,
            background: 'var(--violet)', color: '#fff',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          Create your free account
        </a>
      </div>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
            textDecoration: 'underline',
          }}
        >
          Run another calculation
        </button>
      </div>
    </div>
  );
}

/* ── Local atoms ────────────────────────────────────────── */

function fieldsetStyle(): React.CSSProperties {
  return {
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '18px 20px',
    background: 'var(--surface)',
    margin: '0 0 18px',
  };
}
function legendStyle(): React.CSSProperties {
  return {
    padding: '0 8px', fontSize: 13, fontWeight: 700,
    color: 'var(--violet-text)', textTransform: 'uppercase', letterSpacing: 0.5,
  };
}
function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--surface-2)', color: 'var(--text-primary)',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };
}

function Field({ label, required, error, children }: { label: React.ReactNode; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--red-text)' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ color: 'var(--red-text)', fontSize: 12, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
