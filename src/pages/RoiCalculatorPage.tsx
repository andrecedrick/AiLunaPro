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

import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { WORKFLOW_LABELS, WORKFLOW_VALUES, AGENT_DEFAULT_MONTHLY_USD, type Workflow } from '../data/roi-config';
import { useMoney } from '../lib/currency/useMoney';
import { submitRoi, friendlyRoiError } from '../lib/roi/roiClient';
import type { RoiResult } from '../types/roi';
import { TurnstileWidget } from '../components/diagnostic/TurnstileWidget';
import { savePendingResult, saveFlowProgress, readFlowProgress, clearFlowProgress } from '../lib/leads/pendingLead';
import { track } from '../lib/analytics/track';
import { captureSrc, getSrc, withSrc } from '../lib/analytics/srcParam';
import { computeRoiPreview, type RoiPreview } from '../lib/roi/score';

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
  // B1: rendered inside CampaignChrome, which already shows "← Back to app" for
  // authenticated users — so the "Already have an account? Sign in" prompt below
  // is only meaningful to anonymous visitors. Hide it once auth resolves and the
  // user is logged in; gate on isLoading too so it never flashes during resolution.
  const { isAuthenticated, isLoading } = useAuth();
  const T = useLocale();
  const money = useMoney();
  // A2: capture the SEO landing-page acquisition tag (?src) once, persist for the session.
  const [src] = useState(() => captureSrc());

  // B2.4: restore an unfinished run from localStorage (client-side only).
  const saved = readFlowProgress('roi')?.state as { teamSize?: string; hours?: string; cost?: string; workflow?: string } | undefined;
  const [resumed] = useState(() => Boolean(saved && (saved.teamSize || saved.hours || saved.workflow)));
  const [teamSize,    setTeamSize]    = useState<string>(saved?.teamSize ?? '');
  const [hours,       setHours]       = useState<string>(saved?.hours ?? '');
  const [cost,        setCost]        = useState<string>(saved?.cost ?? '50');
  const [workflow,    setWorkflow]    = useState<Workflow | ''>((saved?.workflow as Workflow | undefined) ?? '');
  const [email,       setEmail]       = useState('');
  const [companyName, setCompany]     = useState('');
  const [consent,     setConsent]     = useState(false);
  const [turnstileToken, setTsToken]  = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [result,     setResult]     = useState<RoiResult | null>(null);
  const [preview,    setPreview]    = useState<RoiPreview | null>(null);

  // B2.4: persist in-progress inputs locally (NON-PII only — never email or
  // company) so an abandoned run can be resumed; signal flow start once.
  const flowStartedRef = useRef(false);
  useEffect(() => {
    if (result) return;
    const dirty = teamSize !== '' || hours !== '' || workflow !== '' || cost !== '50';
    if (!dirty) return;
    if (!flowStartedRef.current) {
      flowStartedRef.current = true;
      if (!resumed) track('lead_flow_started', { flow: 'roi', src: src ?? undefined });
    }
    saveFlowProgress('roi', { teamSize, hours, cost, workflow });
  }, [teamSize, hours, cost, workflow, result, resumed]);

  // A1 Change 2b (value-first): once the savings are revealed, keep them live as
  // the visitor tweaks inputs. Recompute only when inputs are valid (never show
  // NaN); the functional updater keeps `preview` out of the dep list (no loop).
  useEffect(() => {
    setPreview(prev => {
      if (!prev) return prev;
      const hoursNum = Number(hours);
      const costNum  = Number(cost);
      if (!workflow) return prev;
      if (!Number.isFinite(hoursNum) || hoursNum < 0 || hoursNum > 10000) return prev;
      if (!Number.isFinite(costNum)  || costNum  < 1 || costNum  > 1000)  return prev;
      return computeRoiPreview({
        monthlyHoursOnRepetitiveWork: hoursNum,
        averageHourlyCost:            costNum,
        targetWorkflow:               workflow as Workflow,
      });
    });
  }, [hours, cost, workflow]);

  // A1 Change 2b (value-first): reveal the savings CLIENT-SIDE before the email
  // gate. No email/consent/captcha required to see them; the email step below
  // unlocks the full result (recommended agents) + saves it. The previewed
  // figures are identical to the server's (locked by the parity test).
  const onSeePreview = () => {
    const err: FormErrors = {};
    const teamSizeNum = Number(teamSize);
    if (!Number.isFinite(teamSizeNum) || !Number.isInteger(teamSizeNum) || teamSizeNum < 1 || teamSizeNum > 10000) {
      err.teamSize = T.publicTools.roi.errors.teamSize;
    }
    const hoursNum = Number(hours);
    if (!Number.isFinite(hoursNum) || hoursNum < 0 || hoursNum > 10000) {
      err.hours = T.publicTools.roi.errors.hours;
    }
    const costNum = Number(cost);
    if (!Number.isFinite(costNum) || costNum < 1 || costNum > 1000) {
      err.cost = T.publicTools.roi.errors.cost;
    }
    if (!workflow || !(WORKFLOW_VALUES as readonly string[]).includes(workflow)) {
      err.workflow = T.publicTools.roi.errors.workflow;
    }
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setPreview(computeRoiPreview({
      monthlyHoursOnRepetitiveWork: hoursNum,
      averageHourlyCost:            costNum,
      targetWorkflow:               workflow as Workflow,
    }));
    track('score_viewed', { flow: 'roi', src: src ?? undefined });
    requestAnimationFrame(() => {
      const el = document.getElementById('roi-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: FormErrors = {};

    const teamSizeNum = Number(teamSize);
    if (!Number.isFinite(teamSizeNum) || !Number.isInteger(teamSizeNum) || teamSizeNum < 1 || teamSizeNum > 10000) {
      err.teamSize = T.publicTools.roi.errors.teamSize;
    }
    const hoursNum = Number(hours);
    if (!Number.isFinite(hoursNum) || hoursNum < 0 || hoursNum > 10000) {
      err.hours = T.publicTools.roi.errors.hours;
    }
    const costNum = Number(cost);
    if (!Number.isFinite(costNum) || costNum < 1 || costNum > 1000) {
      err.cost = T.publicTools.roi.errors.cost;
    }
    if (!workflow || !(WORKFLOW_VALUES as readonly string[]).includes(workflow)) {
      err.workflow = T.publicTools.roi.errors.workflow;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email   = T.publicTools.roi.errors.email;
    if (!consent)                                  err.consent = T.publicTools.roi.errors.consent;
    if (turnstileToken === null)                   err.general = T.publicTools.roi.errors.captchaLoading;

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
      // B2.3/B2.4: completed — clear resume state; keep a non-PII headline for
      // post-auth continuity (guided journey start banner).
      clearFlowProgress('roi');
      savePendingResult({ kind: 'roi', headline: `estimated savings of ${money.format(r.result.estimatedMonthlyCostSaved)}/month`, createdAt: new Date().toISOString() });
      track('lead_flow_completed', { flow: 'roi', src: src ?? undefined });
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
    setPreview(null);
    setTeamSize(''); setHours(''); setCost('50'); setWorkflow('');
    setEmail(''); setCompany(''); setConsent(false);
    clearFlowProgress('roi');
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
            {T.publicTools.roi.header.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
            {T.publicTools.roi.header.subtitle}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
            {T.publicTools.roi.header.freeLine}
          </p>
        </div>

        {result ? (
          <ResultView result={result} onReset={reset} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* B2.4: abandoned-flow resume notice (client-side only) */}
            {resumed && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--brand-tint-bg)', color: 'var(--text-primary)', border: '1px solid var(--violet)',
              }}>
                {T.publicTools.roi.resumeNotice}
              </div>
            )}
            <fieldset style={fieldsetStyle()}>
              <legend style={legendStyle()}>{T.publicTools.roi.form.teamLegend}</legend>

              <Field label={T.publicTools.roi.form.teamSizeLabel} required error={errors.teamSize}>
                <input
                  type="number" inputMode="numeric" min={1} max={10000}
                  value={teamSize} onChange={e => setTeamSize(e.target.value)}
                  placeholder={T.publicTools.roi.form.teamSizePlaceholder}
                  style={inputStyle()}
                />
              </Field>

              <Field
                label={T.publicTools.roi.form.monthlyHoursLabel}
                required
                error={errors.hours}
              >
                <input
                  type="number" inputMode="decimal" min={0} max={10000} step={1}
                  value={hours} onChange={e => setHours(e.target.value)}
                  placeholder={T.publicTools.roi.form.monthlyHoursPlaceholder}
                  style={inputStyle()}
                />
              </Field>

              <Field label={T.publicTools.roi.form.hourlyCostLabel} required error={errors.cost}>
                <input
                  type="number" inputMode="decimal" min={1} max={1000} step={1}
                  value={cost} onChange={e => setCost(e.target.value)}
                  style={inputStyle()}
                />
              </Field>

              <Field label={T.publicTools.roi.form.targetWorkflowLabel} required error={errors.workflow}>
                <select
                  value={workflow}
                  onChange={e => setWorkflow(e.target.value as Workflow | '')}
                  style={inputStyle()}
                >
                  <option value="">{T.publicTools.roi.form.workflowPlaceholderOption}</option>
                  {WORKFLOW_VALUES.map(w => (
                    <option key={w} value={w}>{(T.roiWorkflows as Record<string, string>)[w] ?? WORKFLOW_LABELS[w]}</option>
                  ))}
                </select>
              </Field>
            </fieldset>

            {/* A1 Change 2b — value-first: reveal the savings before the email gate. */}
            {!preview ? (
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={onSeePreview}
                  style={{
                    padding: '13px 32px', borderRadius: 12, border: 'none',
                    background: 'var(--violet)', color: '#fff',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 22px rgba(124,58,237,0.25)',
                  }}
                >
                  {T.publicTools.roi.submit.idle}
                </button>
              </div>
            ) : (
            <>
            {/* Value-first savings reveal (computed client-side; identical to the saved result) */}
            <div id="roi-preview" style={{ marginTop: 24, padding: '22px 24px', borderRadius: 14, border: '2px solid var(--violet)', background: 'var(--brand-soft-bg, #f5f3ff)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--violet-text)', marginBottom: 6 }}>{T.publicTools.roi.result.monthlySavingsLabel}</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--green-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{money.format(preview.estimatedMonthlyCostSaved)}<span style={{ fontSize: 20, color: 'var(--text-muted)', fontWeight: 600 }}>{T.publicTools.roi.result.monthlySavingsUnit}</span></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 18 }}>
                <Stat label={T.publicTools.roi.result.yearlySavingsLabel} value={money.format(preview.estimatedYearlyCostSaved)} />
                <Stat label={T.publicTools.roi.result.timeSavedLabel} value={format(T.publicTools.roi.result.timeSavedValue, { hours: preview.estimatedTimeSavedHoursPerMonth.toLocaleString('en-US') })} />
                <Stat label={T.publicTools.roi.result.paybackLabel} value={preview.estimatedPaybackMonths === null ? T.publicTools.roi.result.paybackEmpty : format(T.publicTools.roi.result.paybackValue, { months: preview.estimatedPaybackMonths.toLocaleString('en-US') })} />
              </div>
              <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {T.publicTools.roi.result.disclaimer}{' '}{format(T.publicTools.roi.result.pricingNote, { cost: money.format(AGENT_DEFAULT_MONTHLY_USD) })}
              </div>
            </div>

            {/* Lead capture */}
            <fieldset style={fieldsetStyle()}>
              <legend style={legendStyle()}>{T.publicTools.roi.leadCapture.legend}</legend>

              <Field label={T.publicTools.roi.leadCapture.emailLabel} required error={errors.email}>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={T.publicTools.roi.leadCapture.emailPlaceholder}
                  style={inputStyle()}
                />
              </Field>

              <Field label={<>{T.publicTools.roi.leadCapture.companyNameLabel} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{T.publicTools.roi.leadCapture.optionalMark}</span></>}>
                <input
                  type="text" value={companyName}
                  onChange={e => setCompany(e.target.value)}
                  placeholder={T.publicTools.roi.leadCapture.companyNamePlaceholder}
                  maxLength={120}
                  style={inputStyle()}
                />
              </Field>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 10px', lineHeight: 1.5 }}>
                {T.publicTools.roi.leadCapture.helperText}
              </p>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <input
                  type="checkbox" checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--violet)' }}
                />
                <span>
                  {T.publicTools.roi.leadCapture.consentLabel}
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
                {submitting ? T.publicTools.roi.submit.loading : T.publicTools.roi.submit.unlock}
              </button>
            </div>
            </>
            )}

            {!isLoading && !isAuthenticated && (
              <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                {T.publicTools.roi.signInPrompt}{' '}
                <button
                  type="button"
                  onClick={() => navigate({ name: 'login' })}
                  style={{ background: 'none', border: 'none', color: 'var(--violet-text)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  {T.publicTools.roi.signInLink}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Result view ────────────────────────────────────────── */

function ResultView({ result, onReset }: { result: RoiResult; onReset: () => void }) {
  const T = useLocale();
  const money = useMoney();
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
          {T.publicTools.roi.result.monthlySavingsLabel}
        </div>
        <div style={{
          fontSize: 56, fontWeight: 800, color: 'var(--green-text)',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.05,
        }}>
          {money.format(monthly)}<span style={{ fontSize: 22, color: 'var(--text-muted)', fontWeight: 600 }}>{T.publicTools.roi.result.monthlySavingsUnit}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 22 }}>
          <Stat label={T.publicTools.roi.result.yearlySavingsLabel}  value={money.format(yearly)} />
          <Stat label={T.publicTools.roi.result.timeSavedLabel}      value={format(T.publicTools.roi.result.timeSavedValue, { hours: time.toLocaleString('en-US') })} />
          <Stat label={T.publicTools.roi.result.paybackLabel}         value={payback === null ? T.publicTools.roi.result.paybackEmpty : format(T.publicTools.roi.result.paybackValue, { months: payback.toLocaleString('en-US') })} />
        </div>
      </div>

      {/* Disclaimer + pricing note */}
      <div style={{
        padding: '12px 16px', marginBottom: 22, borderRadius: 10,
        background: 'var(--surface-2)', color: 'var(--text-muted)',
        fontSize: 12, lineHeight: 1.55,
      }}>
        <div>
          {T.publicTools.roi.result.disclaimer}
        </div>
        <div style={{ marginTop: 4 }}>
          {format(T.publicTools.roi.result.pricingNote, { cost: money.format(AGENT_DEFAULT_MONTHLY_USD) })}
        </div>
      </div>

      {/* Recommended agents */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {T.publicTools.roi.result.recommendedAgentsHeading}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {result.recommendedAgentIds.map(slug => (
            <a
              key={slug}
              href={withSrc(AFFILIATE_URL)}
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
                {T.publicTools.roi.result.agentCardBrand}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {humanizeSlug(slug)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--violet-text)', fontWeight: 600 }}>
                {T.publicTools.roi.result.agentCardCta}
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
          {T.publicTools.roi.result.ctaHeading}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>
          {T.publicTools.roi.result.ctaBody}
        </div>
        <a
          href={withSrc(AFFILIATE_URL)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('cta_clicked', { flow: 'roi', target: 'signup', src: getSrc() ?? undefined })}
          style={{
            display: 'inline-block',
            padding: '11px 28px', borderRadius: 10,
            background: 'var(--violet)', color: '#fff',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          {T.publicTools.roi.result.ctaButton}
        </a>
        {/* B2.1: the cross-platform step is deliberate — make it explicit. */}
        <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 10 }}>
          {T.publicTools.roi.result.ctaFootnote
            .split(/\*\*(.+?)\*\*/)
            .map((seg, i) => (i % 2 === 1 ? <strong key={i}>{seg}</strong> : seg))}
        </div>
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
          {T.publicTools.roi.result.rerunButton}
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
  const T = useLocale();
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--red-text)' }}>{T.publicTools.roi.requiredMark}</span>}
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
