/**
 * DiagnosticPage — Phase K1A.
 * Public unauth route: #/diagnostic
 *
 * Single-page form: 8 questions (last is routing-only, no score), email +
 * optional company name + GDPR consent + Turnstile. On submit: posts to
 * /api/public/diagnostic, renders a result block with normalized score,
 * bucket label, 3 recommended agent cards (each linking to the affiliate
 * URL), and a sign-up CTA.
 *
 * Chromeless (no Sidebar). Renders before the auth gate in App.tsx.
 */

import { useMemo, useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import type { Dict } from '../lib/locale/i18n/en';
import { DIAGNOSTIC_QUESTIONS } from '../data/diagnostic-questions';
import { submitDiagnostic, friendlyDiagnosticError } from '../lib/diagnostic/diagnosticClient';
import type { DiagnosticResult, Bucket } from '../types/diagnostic';
import { TurnstileWidget } from '../components/diagnostic/TurnstileWidget';
import { savePendingResult, saveFlowProgress, readFlowProgress, clearFlowProgress } from '../lib/leads/pendingLead';
import { track } from '../lib/analytics/track';
import { captureSrc, getSrc, withSrc } from '../lib/analytics/srcParam';
import { computeDiagnosticPreview, type DiagnosticPreview } from '../lib/diagnostic/score';

const AFFILIATE_URL = 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD';

function buildBucketCopy(t: Dict['publicTools']['diagnostic']): Record<Bucket, { title: string; message: string }> {
  return {
    low: {
      title:   t.buckets.low.title,
      message: t.buckets.low.message,
    },
    medium: {
      title:   t.buckets.medium.title,
      message: t.buckets.medium.message,
    },
    high: {
      title:   t.buckets.high.title,
      message: t.buckets.high.message,
    },
  };
}

interface FormErrors {
  general?: string;
  email?:   string;
  consent?: string;
  answers?: string;
}

export function DiagnosticPage() {
  const { navigate } = useRoute();
  // B1: these public tool pages render inside CampaignChrome, which already shows
  // a "← Back to app" return for authenticated users. So the "Already have an
  // account? Sign in" prompt below is only meaningful to anonymous visitors —
  // hide it once auth resolves and the user is logged in. Gate on isLoading too
  // so an authed user never sees it flash during Firebase auth resolution.
  const { isAuthenticated, isLoading } = useAuth();
  const T = useLocale();
  // A2: capture the SEO landing-page acquisition tag (?src) once, persist for the session.
  const [src] = useState(() => captureSrc());
  // Localized diagnostic question + option labels (data-driven content), keyed
  // by question id / option value; falls back to the raw English data.
  const DQ = T.diagnosticQuestions.byId as Record<string, { label: string; options: Record<string, string> }>;

  // Answers state — keyed by question.id. B2.4: an unfinished run is restored
  // from localStorage so abandoning the flow never loses progress (client-side
  // only; cleared on submit or reset).
  const [resumed] = useState(() => {
    const p = readFlowProgress('diagnostic');
    return p && Object.keys((p.state.answers as Record<string, string>) ?? {}).length > 0;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const p = readFlowProgress('diagnostic');
    return (p?.state.answers as Record<string, string>) ?? {};
  });
  const [email, setEmail]           = useState('');
  const [companyName, setCompany]   = useState('');
  const [consent, setConsent]       = useState(false);
  const [turnstileToken, setTsToken] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [result,     setResult]     = useState<DiagnosticResult | null>(null);
  const [preview,    setPreview]    = useState<DiagnosticPreview | null>(null);

  const allAnswered = useMemo(
    () => DIAGNOSTIC_QUESTIONS.every(q => typeof answers[q.id] === 'string' && answers[q.id].length > 0),
    [answers],
  );

  const onChangeAnswer = (qid: string, value: string) => {
    setAnswers(prev => {
      const next = { ...prev, [qid]: value };
      // B2.4: persist in-progress answers locally; signal flow start once.
      if (Object.keys(prev).length === 0) track('lead_flow_started', { flow: 'diagnostic', src: src ?? undefined });
      saveFlowProgress('diagnostic', { answers: next });
      // A1 Change 2: keep the value-first preview live if it's already revealed.
      setPreview(p => (p ? computeDiagnosticPreview(next) : p));
      return next;
    });
  };

  // A1 Change 2 (value-first): reveal the score CLIENT-SIDE before the email
  // gate. No email/consent/captcha required to see it; the email step below
  // unlocks the full report (recommended agents) + saves it. The previewed
  // number is identical to the server's (locked by the parity test).
  const onSeeScore = () => {
    if (!allAnswered) { setErrors({ answers: T.publicTools.diagnostic.errors.answers }); return; }
    setErrors({});
    setPreview(computeDiagnosticPreview(answers));
    track('score_viewed', { flow: 'diagnostic', src: src ?? undefined });
    requestAnimationFrame(() => {
      const el = document.getElementById('diagnostic-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: FormErrors = {};
    if (!allAnswered)                                        err.answers = T.publicTools.diagnostic.errors.answers;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))           err.email   = T.publicTools.diagnostic.errors.email;
    if (!consent)                                            err.consent = T.publicTools.diagnostic.errors.consent;
    if (turnstileToken === null)                             err.general = T.publicTools.diagnostic.errors.captchaLoading;
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      const r = await submitDiagnostic({
        answers,
        lead: {
          email,
          companyName: companyName.trim() || undefined,
          consent: true,
        },
        turnstileToken: turnstileToken ?? undefined,
      });
      setResult(r);
      // B2.3/B2.4: completed — clear the resume state, keep a non-PII headline
      // for post-auth continuity (guided journey start banner).
      clearFlowProgress('diagnostic');
      savePendingResult({ kind: 'diagnostic', headline: `AI maturity score ${r.score}/100 (${r.bucket})`, createdAt: new Date().toISOString() });
      track('lead_flow_completed', { flow: 'diagnostic', src: src ?? undefined });
      // Scroll result into view
      requestAnimationFrame(() => {
        const el = document.getElementById('diagnostic-result');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (sErr) {
      console.error('[DiagnosticPage] submit failed:', sErr);
      setErrors({ general: friendlyDiagnosticError(sErr) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface-2)',
      padding: '40px 20px',
      fontFamily: 'inherit',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 800, color: 'var(--text-primary)',
            margin: '0 0 10px',
          }}>
            {T.publicTools.diagnostic.header.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
            {T.publicTools.diagnostic.header.subtitle}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
            {T.publicTools.diagnostic.header.freeLine}
          </p>
        </div>

        {result ? (
          <ResultView result={result} onReset={() => { setResult(null); setPreview(null); setAnswers({}); clearFlowProgress('diagnostic'); }} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* B2.4: abandoned-flow resume notice (client-side only) */}
            {resumed && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--brand-tint-bg)', color: 'var(--text-primary)', border: '1px solid var(--violet)',
              }}>
                {T.publicTools.diagnostic.resumeNotice}
              </div>
            )}
            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {DIAGNOSTIC_QUESTIONS.map((q, i) => (
                <fieldset
                  key={q.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '18px 20px',
                    background: 'var(--surface)',
                    margin: 0,
                  }}
                >
                  <legend style={{
                    padding: '0 8px', fontSize: 13, fontWeight: 700,
                    color: 'var(--violet-text)', textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {format(T.publicTools.diagnostic.questionLegend, { n: i + 1, total: DIAGNOSTIC_QUESTIONS.length })}
                  </legend>
                  <div style={{
                    fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                    marginBottom: 12, lineHeight: 1.4,
                  }}>
                    {DQ[q.id]?.label ?? q.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map(opt => {
                      const checked = answers[q.id] === opt.value;
                      return (
                        <label
                          key={opt.value}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8,
                            border: checked ? '2px solid var(--violet)' : '1px solid var(--border)',
                            background: checked ? 'rgba(124,58,237,0.06)' : 'transparent',
                            cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.value}
                            checked={checked}
                            onChange={() => onChangeAnswer(q.id, opt.value)}
                            style={{ accentColor: 'var(--violet)', cursor: 'pointer' }}
                          />
                          <span>{DQ[q.id]?.options?.[opt.value] ?? opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            {errors.answers && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--red-soft-bg)', color: 'var(--red-text)', fontSize: 13 }}>
                {errors.answers}
              </div>
            )}

            {/* A1 Change 2 — value-first: reveal the score before the email gate. */}
            {!preview ? (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={onSeeScore}
                  disabled={!allAnswered}
                  style={{
                    padding: '13px 32px', borderRadius: 12, border: 'none',
                    background: allAnswered ? 'var(--violet)' : 'var(--surface-2)',
                    color: allAnswered ? '#fff' : 'var(--text-muted)',
                    fontSize: 15, fontWeight: 700,
                    cursor: allAnswered ? 'pointer' : 'not-allowed',
                    boxShadow: allAnswered ? '0 8px 22px rgba(124,58,237,0.25)' : 'none',
                  }}
                >
                  {T.publicTools.diagnostic.submit.idle}
                </button>
              </div>
            ) : (
            <>
            {/* Value-first score reveal (computed client-side; identical to the saved result) */}
            <div id="diagnostic-preview" style={{ marginTop: 24, padding: '22px 24px', borderRadius: 14, border: '2px solid var(--violet)', background: 'var(--brand-soft-bg, #f5f3ff)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--violet-text)', marginBottom: 6 }}>{T.publicTools.diagnostic.result.scoreLabel}</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{preview.score}<span style={{ fontSize: 20, color: 'var(--text-muted)' }}>{T.publicTools.diagnostic.result.scoreUnit}</span></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 10 }}>{T.publicTools.diagnostic.buckets[preview.bucket].title}</div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '6px auto 0', maxWidth: 460 }}>{T.publicTools.diagnostic.buckets[preview.bucket].message}</p>
            </div>

            {/* Lead capture */}
            <div style={{
              marginTop: 24, padding: 22, borderRadius: 14,
              border: '1px solid var(--border)', background: 'var(--surface)',
            }}>
              <h2 style={{
                fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                margin: '0 0 14px',
              }}>
                {T.publicTools.diagnostic.leadCapture.heading}
              </h2>

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                {T.publicTools.diagnostic.leadCapture.emailLabel} <span style={{ color: 'var(--red-text)' }}>{T.publicTools.diagnostic.leadCapture.requiredMark}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={T.publicTools.diagnostic.leadCapture.emailPlaceholder}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 14,
                  border: '1px solid var(--border)', borderRadius: 8,
                  background: 'var(--surface-2)', color: 'var(--text-primary)',
                  marginBottom: errors.email ? 4 : 14,
                  boxSizing: 'border-box',
                }}
              />
              {errors.email && (
                <div style={{ color: 'var(--red-text)', fontSize: 12, marginBottom: 14 }}>{errors.email}</div>
              )}

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                {T.publicTools.diagnostic.leadCapture.companyNameLabel} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{T.publicTools.diagnostic.leadCapture.optionalMark}</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompany(e.target.value)}
                placeholder={T.publicTools.diagnostic.leadCapture.companyNamePlaceholder}
                maxLength={120}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 14,
                  border: '1px solid var(--border)', borderRadius: 8,
                  background: 'var(--surface-2)', color: 'var(--text-primary)',
                  marginBottom: 16,
                  boxSizing: 'border-box',
                }}
              />

              {/* Helper text above consent */}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                {T.publicTools.diagnostic.leadCapture.helperText}
              </p>

              {/* Consent */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--violet)' }}
                />
                <span>
                  {T.publicTools.diagnostic.leadCapture.consentLabel}
                </span>
              </label>
              {errors.consent && (
                <div style={{ color: 'var(--red-text)', fontSize: 12, marginTop: 6 }}>{errors.consent}</div>
              )}

              {/* Turnstile */}
              <div style={{ marginTop: 16 }}>
                <TurnstileWidget onToken={t => setTsToken(t)} />
              </div>
            </div>

            {errors.general && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--red-soft-bg)', color: 'var(--red-text)', fontSize: 13 }}>
                {errors.general}
              </div>
            )}

            {/* Submit */}
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
                {submitting ? T.publicTools.diagnostic.submit.loading : T.publicTools.diagnostic.submit.unlock}
              </button>
            </div>
            </>
            )}

            {!isLoading && !isAuthenticated && (
              <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                {T.publicTools.diagnostic.signInPrompt}{' '}
                <button
                  type="button"
                  onClick={() => navigate({ name: 'login' })}
                  style={{ background: 'none', border: 'none', color: 'var(--violet-text)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  {T.publicTools.diagnostic.signInLink}
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

function ResultView({ result, onReset }: { result: DiagnosticResult; onReset: () => void }) {
  const T = useLocale();
  const BUCKET_COPY = useMemo(() => buildBucketCopy(T.publicTools.diagnostic), [T]);
  const copy = BUCKET_COPY[result.bucket];
  const pct  = Math.max(0, Math.min(100, result.score));
  const ringColor =
    result.bucket === 'high'   ? 'var(--green-text)'  :
    result.bucket === 'medium' ? 'var(--violet-text)' :
                                  'var(--yellow-text)';

  return (
    <div id="diagnostic-result">
      {/* Score card */}
      <div style={{
        padding: 32, borderRadius: 18,
        border: '1px solid var(--border)', background: 'var(--surface)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 10,
        marginBottom: 28,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {T.publicTools.diagnostic.result.scoreLabel}
        </div>
        <div style={{
          fontSize: 56, fontWeight: 800, color: ringColor,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.05,
        }}>
          {pct}<span style={{ fontSize: 22, color: 'var(--text-muted)', fontWeight: 600 }}>{T.publicTools.diagnostic.result.scoreUnit}</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          {copy.title}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, maxWidth: 480, lineHeight: 1.55 }}>
          {copy.message}
        </p>

        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: 420, marginTop: 12, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: ringColor,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Recommended agents */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {T.publicTools.diagnostic.result.recommendedAgentsHeading}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                {T.publicTools.diagnostic.result.agentCardBrand}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {humanizeSlug(slug)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--violet-text)', fontWeight: 600 }}>
                {T.publicTools.diagnostic.result.agentCardCta}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Sign-up CTA */}
      <div style={{
        padding: 24, borderRadius: 14,
        background: 'var(--text-primary)', color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          {T.publicTools.diagnostic.result.ctaHeading}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>
          {T.publicTools.diagnostic.result.ctaBody}
        </div>
        <a
          href={withSrc(AFFILIATE_URL)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('cta_clicked', { flow: 'diagnostic', target: 'signup', src: getSrc() ?? undefined })}
          style={{
            display: 'inline-block',
            padding: '11px 28px', borderRadius: 10,
            background: 'var(--violet)', color: '#fff',
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          {T.publicTools.diagnostic.result.ctaButton}
        </a>
        {/* B2.1: the cross-platform step is deliberate — make it explicit. */}
        <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 10 }}>
          {T.publicTools.diagnostic.result.ctaFootnote
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
          {T.publicTools.diagnostic.result.retakeButton}
        </button>
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
