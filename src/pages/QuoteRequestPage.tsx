/**
 * QuoteRequestPage — Phase Q1.
 * Public unauth route: #/quote
 *
 * Value-first lead magnet: pick a service type + complexity tier (+ describe the
 * project), get an INSTANT indicative price range, recommended solution, typical
 * scope, and next steps — computed client-side (computeQuotePreview), no token,
 * no round-trip, no email. Token-charged PDF/email generation is a later phase.
 *
 * Chromeless layout (rendered inside CampaignChrome, before the auth gate).
 * Indicative, non-contractual, informational only — disclaimer always visible.
 *
 * Only NON-PII selections (category/tier/qualifiers) are persisted for resume —
 * never the free-text project description.
 */

import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { useMoney } from '../lib/currency/useMoney';
import {
  QUOTE_CATEGORIES, QUOTE_TIERS, BUSINESS_SIZES, URGENCIES, BUDGET_BANDS, SUGGESTION_KEYS,
  isTierForCategory,
  type QuoteCategory, type QuoteTier, type BusinessSize, type Urgency, type BudgetBand,
} from '../data/quote-config';
import { computeQuotePreview, compareBudget, type QuotePreview } from '../lib/quote/score';
import { convertToUsd } from '../lib/currency/fxSnapshot';
import { generateQuote, downloadQuotePdf, emailQuote, overrideQuotePrice, recordDecision, QuoteGenError } from '../lib/quote/quoteClient';
import { tokenCost } from '../lib/tokens/costs';
import { InsufficientTokensModal } from '../components/tokens/InsufficientTokensModal';
import { FeedbackPrompt } from '../components/feedback/FeedbackPrompt';
import { fieldsetStyle, legendStyle, inputStyle, primaryBtnStyle, secondaryBtnStyle, sectionTitleStyle, listStyle, Field } from '../components/ui-tools';
import { usePreferences } from '../context/PreferencesContext';
import { EN, pdfLocale } from '../lib/locale/i18n';
import { saveFlowProgress, readFlowProgress, clearFlowProgress } from '../lib/leads/pendingLead';
import { emit } from '../lib/analytics/events';
import { captureSrc } from '../lib/analytics/srcParam';

const DESCRIPTION_MIN = 20;

interface FormErrors {
  service?:     string;
  tier?:        string;
  description?: string;
}

type SavedState = { category?: string; tier?: string; picks?: string[]; businessSize?: string; urgency?: string; budgetBand?: string };

/** Combine selected goal chips (localized labels) + free text into one description. */
function buildDescription(picks: string[], suggestions: Record<string, string>, details: string): string {
  return [...picks.map(k => suggestions[k] ?? k), details.trim()].filter(Boolean).join('. ');
}

export function QuoteRequestPage() {
  const { navigate } = useRoute();
  const { isAuthenticated, isLoading, session } = useAuth();
  const T = useLocale();
  const money = useMoney();
  const { language } = usePreferences();
  const [src] = useState(() => captureSrc());

  const saved = readFlowProgress('quote')?.state as SavedState | undefined;
  const [resumed] = useState(() => Boolean(saved && (saved.category || saved.tier)));
  const [category,    setCategory]    = useState<QuoteCategory | ''>((saved?.category as QuoteCategory | undefined) ?? '');
  const [tier,        setTier]        = useState<QuoteTier | ''>((saved?.tier as QuoteTier | undefined) ?? '');
  const [picks,       setPicks]       = useState<string[]>(Array.isArray(saved?.picks) ? saved!.picks! : []);
  const [details,     setDetails]     = useState('');
  const [businessSize, setBusinessSize] = useState<string>(saved?.businessSize ?? '');
  const [urgency,      setUrgency]      = useState<string>(saved?.urgency ?? '');
  const [budgetBand,   setBudgetBand]   = useState<string>(saved?.budgetBand ?? '');

  const [errors,  setErrors]  = useState<FormErrors>({});
  const [preview, setPreview] = useState<QuotePreview | null>(null);

  // Q2 — token-charged generation (authenticated only).
  const [generating, setGenerating] = useState(false);
  const [genError,   setGenError]   = useState<string | null>(null);
  const [generated,  setGenerated]  = useState(false);
  const [modal,      setModal]      = useState<{ open: boolean; balance: number; required: number }>({ open: false, balance: 0, required: 0 });
  const [downloading, setDownloading] = useState(false);
  const [pdfError,    setPdfError]    = useState<string | null>(null);
  // U2 — budget + client decision.
  const [budgetInput, setBudgetInput] = useState('');
  const [decisionState, setDecisionState] = useState<'idle' | 'saving' | 'accepted' | 'discussion' | 'error'>('idle');
  // B3 — negotiation message (reveal-on-Discuss).
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [discussMessage, setDiscussMessage] = useState('');
  // Q4 — email + admin price override. B2 adds an optional client recipient.
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [clientEmail, setClientEmail] = useState('');
  const [override,   setOverride]   = useState<{ minUsd: number; maxUsd: number } | null>(null);
  const [showOverride, setShowOverride] = useState(false);
  const [ovMin, setOvMin] = useState('');
  const [ovMax, setOvMax] = useState('');
  const [ovReason, setOvReason] = useState('');
  const [ovBusy, setOvBusy] = useState(false);
  const [ovError, setOvError] = useState<string | null>(null);
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';
  // Stable per estimate session: a network retry reuses it (server idempotent,
  // no double charge); reset() mints a fresh one for the next quote.
  const quoteIdRef = useRef<string>('');

  const Q = T.publicTools.quote;
  const suggestions = Q.guided.suggestions as Record<string, string>;
  const effectiveDescription = buildDescription(picks, suggestions, details);
  const togglePick = (k: string) => setPicks(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);

  // Persist NON-PII selections only (category/tier/goal-keys/qualifiers) — never
  // the free-text details. Signal flow start once.
  const flowStartedRef = useRef(false);
  useEffect(() => {
    if (preview) return;
    if (!category && !tier && picks.length === 0) return;
    if (!flowStartedRef.current) {
      flowStartedRef.current = true;
      if (!resumed) emit('lead_flow_started', { flow: 'quote', src: src ?? undefined });
    }
    saveFlowProgress('quote', { category, tier, picks, businessSize, urgency, budgetBand });
  }, [category, tier, picks, businessSize, urgency, budgetBand, preview, resumed]);

  // Keep the estimate live once revealed (recompute on a valid category/tier).
  useEffect(() => {
    setPreview(prev => {
      if (!prev) return prev;
      if (!category || !tier || !isTierForCategory(category, tier)) return prev;
      return computeQuotePreview({ category, tier });
    });
  }, [category, tier]);

  const onPickCategory = (next: QuoteCategory | '') => {
    setCategory(next);
    setTier('');        // tiers are category-specific
    setPicks([]);       // goal suggestions are category-specific
    setPreview(null);   // re-reveal after the new tier is chosen
  };

  const onGetEstimate = () => {
    const err: FormErrors = {};
    if (!category) err.service = Q.errors.service;
    if (!category || !isTierForCategory(category, tier as string)) err.tier = Q.errors.tier;
    if (picks.length === 0 && details.trim().length < DESCRIPTION_MIN) err.description = Q.guided.selectError;
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setPreview(computeQuotePreview({ category: category as QuoteCategory, tier: tier as QuoteTier }));
    emit('score_viewed', { flow: 'quote', src: src ?? undefined });
    requestAnimationFrame(() => {
      document.getElementById('quote-estimate')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const reset = () => {
    setPreview(null);
    setCategory(''); setTier(''); setPicks([]); setDetails('');
    setBusinessSize(''); setUrgency(''); setBudgetBand('');
    setErrors({});
    setGenerating(false); setGenError(null); setGenerated(false);
    setModal({ open: false, balance: 0, required: 0 });
    setDownloading(false); setPdfError(null);
    setBudgetInput(''); setDecisionState('idle');
    setEmailState('idle'); setOverride(null); setShowOverride(false);
    setOvMin(''); setOvMax(''); setOvReason(''); setOvBusy(false); setOvError(null);
    quoteIdRef.current = '';
    clearFlowProgress('quote');
  };

  const onGenerate = async () => {
    if (generating) return;
    const orgId = session?.orgId;
    if (!orgId) { setGenError(Q.generate.needOrg); return; }
    if (!category || !isTierForCategory(category, tier as string)) return;
    if (!quoteIdRef.current) {
      const raw = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `q-${src ?? 'x'}-${preview?.solutionKey ?? ''}`;
      quoteIdRef.current = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    }
    setGenerating(true); setGenError(null);
    try {
      await generateQuote(orgId, {
        quoteId:     quoteIdRef.current,
        category:    category as QuoteCategory,
        tier:        tier as QuoteTier,
        description: effectiveDescription,
        ...(businessSize ? { businessSize: businessSize as BusinessSize } : {}),
        ...(urgency      ? { urgency: urgency as Urgency } : {}),
        ...(budgetBand   ? { budgetBand: budgetBand as BudgetBand } : {}),
      });
      setGenerated(true);
      emit('lead_flow_completed', { flow: 'quote', src: src ?? undefined });
      requestAnimationFrame(() => {
        document.getElementById('quote-generated')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (e) {
      if (e instanceof QuoteGenError && e.code === 'INSUFFICIENT_TOKENS') {
        setModal({ open: true, balance: e.balance ?? 0, required: e.required ?? tokenCost('quote.generation') });
      } else {
        setGenError(Q.generate.error);
      }
    } finally {
      setGenerating(false);
    }
  };

  // Build the 8-section whitepaper render payload (exact display strings). PDF
  // language: Latin → current locale; RU/ZH → English (pdfLocale rule). Reflects
  // an override. Justification is deterministic (no LLM).
  const buildRender = () => {
    const p = preview!;
    const useEnglish = pdfLocale(language) !== language;
    const pq = (useEnglish ? EN.publicTools.quote : Q);
    const sols     = pq.solutions as Record<string, string>;
    const scp      = pq.scope as Record<string, string>;
    const services = pq.services as Record<string, string>;
    const tiers    = pq.tiers as Record<string, string>;
    const prop     = pq.proposal;
    const solDesc  = prop.solutionDesc as Record<string, string>;
    const timelineMap = prop.timeline as Record<string, string>;

    const min = override ? override.minUsd : p.priceMinUsd;
    const max = override ? override.maxUsd : p.priceMaxUsd;
    const openEnded = override ? false : p.openEnded;
    const rangeText = `${money.format(min)} – ${money.format(max)}${openEnded ? '+' : ''}`;
    const solutionLabel = sols[p.solutionKey] ?? p.solutionKey;
    const tCat = p.category === 'website' ? 'website' : p.category === 'audit' ? 'audit' : 'agent';

    const justification: string[] = [
      format(prop.justification.market, { category: services[p.category] ?? p.category, tier: tiers[p.tier] ?? p.tier, range: rangeText }),
      format(prop.justification.complexity, { tier: tiers[p.tier] ?? p.tier }),
      format(prop.justification.scope, { count: String(p.scopeKeys.length) }),
    ];
    if (p.opsCostUpliftPct) {
      justification.push(format(prop.justification.ops, { min: String(p.opsCostUpliftPct.minPct), max: String(p.opsCostUpliftPct.maxPct) }));
    }

    // U3 — negotiation summary values (initial / budget / adjusted), localized currency.
    const neg = pq.negotiation;
    const initialText = `${money.format(p.priceMinUsd)} – ${money.format(p.priceMaxUsd)}${p.openEnded ? '+' : ''}`;
    const adjustedText = override ? `${money.format(override.minUsd)} – ${money.format(override.maxUsd)}` : '';
    const bNum = Number(budgetInput);
    const bUsd = budgetInput.trim() !== '' && Number.isFinite(bNum) && bNum >= 0 ? convertToUsd(bNum, money.currency) : null;
    const budgetText = bUsd !== null ? money.format(bUsd) : '';

    return {
      docTitle:             pq.pdf.docTitle,
      projectName:          solutionLabel,
      clientName:           session?.org?.name ?? '',
      labelClient:          prop.coverClient,
      labelDate:            prop.coverDate,
      labelValid:           prop.coverValid,
      labelRef:             prop.coverRef,
      execHeading:          pq.pdf.summaryHeading,
      execSummary:          format(prop.execSummaryTemplate, { solution: solutionLabel }),
      // User free-text only when it matches the PDF language (the ASCII engine
      // can't render RU/ZH text — the server skips an empty summary).
      summary:              useEnglish ? '' : effectiveDescription,
      solutionHeading:      prop.solutionHeading,
      solutionLabel,
      solutionDescription:  solDesc[p.category] ?? '',
      scopeHeading:         pq.result.scopeHeading,
      scope:                p.scopeKeys.map(k => scp[k] ?? k),
      pricingHeading:       pq.pdf.pricingHeading,
      rangeText,
      justificationHeading: prop.justification.heading,
      justification,
      paymentHeading:       prop.paymentHeading,
      paymentNote:          pq.guided.paymentNote,
      timelineHeading:      prop.timelineHeading,
      timeline:             (timelineMap[tCat] ?? '').split('\n').map(s => s.trim()).filter(Boolean),
      disclaimer:           pq.result.disclaimer,
      negHeading:           neg.heading,
      negInitialLabel:      neg.initialLabel,
      negBudgetLabel:       neg.budgetLabel,
      negAdjustedLabel:     neg.adjustedLabel,
      negInitial:           initialText,
      negBudget:            budgetText,
      negAdjusted:          adjustedText,
    };
  };

  const onDownloadPdf = async () => {
    if (downloading || !preview) return;
    const orgId = session?.orgId;
    if (!orgId || !quoteIdRef.current) return;
    setDownloading(true); setPdfError(null);
    try {
      await downloadQuotePdf(orgId, quoteIdRef.current, buildRender());
      emit('quote_pdf_downloaded', { flow: 'quote', src: src ?? undefined });
    } catch {
      setPdfError(Q.generate.error);
    } finally {
      setDownloading(false);
    }
  };

  const onEmail = async () => {
    if (emailState === 'sending' || !preview) return;
    const orgId = session?.orgId;
    if (!orgId || !quoteIdRef.current) return;
    setEmailState('sending');
    try {
      const r = await emailQuote(orgId, quoteIdRef.current, language, buildRender(), false, clientEmail.trim() || undefined);
      emit('quote_emailed', { flow: 'quote', emailed: r.emailed, src: src ?? undefined });
      setEmailState('sent');
    } catch {
      setEmailState('error');
    }
  };

  const onOverride = async () => {
    if (ovBusy || !preview) return;
    const orgId = session?.orgId;
    if (!orgId || !quoteIdRef.current) return;
    const min = Number(ovMin), max = Number(ovMax);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min || ovReason.trim().length < 3) {
      setOvError(Q.override.invalid);
      return;
    }
    setOvBusy(true); setOvError(null);
    try {
      const r = await overrideQuotePrice(orgId, quoteIdRef.current, { minUsd: min, maxUsd: max, reason: ovReason.trim() });
      setOverride({ minUsd: r.overrideMinUsd, maxUsd: r.overrideMaxUsd });
      setShowOverride(false);
      setEmailState('idle'); // a fresh email will carry the adjusted price
    } catch {
      setOvError(Q.override.error);
    } finally {
      setOvBusy(false);
    }
  };

  const onDecision = async (decision: 'accepted' | 'discussion') => {
    if (decisionState === 'saving' || !preview) return;
    const orgId = session?.orgId;
    if (!orgId || !quoteIdRef.current) return;
    setDecisionState('saving');
    try {
      const budgetNum = Number(budgetInput);
      const expectedBudgetUsd = budgetInput.trim() !== '' && Number.isFinite(budgetNum) && budgetNum >= 0
        ? Math.round(convertToUsd(budgetNum, money.currency))
        : undefined;
      const msg = decision === 'discussion' ? discussMessage.trim() : '';
      await recordDecision(orgId, quoteIdRef.current, {
        decision,
        ...(expectedBudgetUsd !== undefined ? { expectedBudgetUsd } : {}),
        ...(msg ? { message: msg } : {}),
      });
      emit('quote_decision', { flow: 'quote', decision, src: src ?? undefined });
      setDecisionState(decision);
      // FIX 1 — after accept, route to the confirmation result page.
      if (decision === 'accepted') navigate({ name: 'quote/result' });
    } catch {
      setDecisionState('error');
    }
  };

  // U2 — budget comparison (display currency → USD; compared to the shown price).
  const budgetUsdInput = budgetInput.trim() !== '' && Number.isFinite(Number(budgetInput))
    ? convertToUsd(Number(budgetInput), money.currency) : null;
  const budgetVerdict = (preview && budgetUsdInput !== null && budgetUsdInput >= 0)
    ? compareBudget(
        budgetUsdInput,
        override ? override.minUsd : preview.priceMinUsd,
        override ? override.maxUsd : preview.priceMaxUsd,
        override ? false : preview.openEnded,
      )
    : null;

  // U3 — negotiation summary (on screen). Same values that go into PDF + email.
  const negInitialText = preview ? `${money.format(preview.priceMinUsd)} – ${money.format(preview.priceMaxUsd)}${preview.openEnded ? '+' : ''}` : '';
  const negBudgetText = (budgetUsdInput !== null && budgetUsdInput >= 0) ? money.format(budgetUsdInput) : '';
  const negAdjustedText = override ? `${money.format(override.minUsd)} – ${money.format(override.maxUsd)}` : '';
  const showNegotiation = !!(negBudgetText || negAdjustedText);

  const tierOptions = category ? QUOTE_TIERS[category] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)', padding: '40px 20px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            {Q.header.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
            {Q.header.subtitle}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
            {Q.header.freeLine}
          </p>
        </div>

        {resumed && !preview && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'var(--brand-tint-bg)', color: 'var(--text-primary)', border: '1px solid var(--violet)' }}>
            {Q.resumeNotice}
          </div>
        )}

        <fieldset style={fieldsetStyle()}>
          <legend style={legendStyle()}>{Q.form.serviceLegend}</legend>

          <Field label={Q.form.serviceLabel} required error={errors.service}>
            <select value={category} onChange={e => onPickCategory(e.target.value as QuoteCategory | '')} style={inputStyle()}>
              <option value="">{Q.form.servicePlaceholder}</option>
              {QUOTE_CATEGORIES.map(c => (
                <option key={c} value={c}>{(Q.services as Record<string, string>)[c]}</option>
              ))}
            </select>
          </Field>

          <Field label={Q.form.tierLabel} required error={errors.tier}>
            <select value={tier} onChange={e => setTier(e.target.value as QuoteTier | '')} disabled={!category} style={inputStyle()}>
              <option value="">{Q.form.tierPlaceholder}</option>
              {tierOptions.map(t => (
                <option key={t} value={t}>{(Q.tiers as Record<string, string>)[t]}</option>
              ))}
            </select>
          </Field>

          {/* Smart guidance: selectable goal chips (per category) + free text. */}
          {category && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                {Q.guided.goalsLabel} <span style={{ color: 'var(--red-text)' }}>{Q.requiredMark}</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTION_KEYS[category].map(k => {
                  const on = picks.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => togglePick(k)}
                      aria-pressed={on}
                      style={{
                        padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                        fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                        border: on ? '1.5px solid var(--violet)' : '1px solid var(--border)',
                        background: on ? 'var(--brand-tint-bg, rgba(124,58,237,0.08))' : 'var(--surface-2)',
                        color: on ? 'var(--violet-text)' : 'var(--text-secondary)',
                      }}
                    >
                      {on ? '✓ ' : ''}{suggestions[k] ?? k}
                    </button>
                  );
                })}
              </div>
              {errors.description && <div style={{ color: 'var(--red-text)', fontSize: 12, marginTop: 6 }}>{errors.description}</div>}
            </div>
          )}

          <Field label={Q.guided.detailsLabel}>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={Q.guided.detailsPlaceholder}
              maxLength={2000}
              rows={3}
              style={{ ...inputStyle(), resize: 'vertical', minHeight: 72 }}
            />
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle()}>
          <legend style={legendStyle()}>{Q.form.optionalLegend}</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <Field label={Q.form.businessSizeLabel}>
              <select value={businessSize} onChange={e => setBusinessSize(e.target.value)} style={inputStyle()}>
                <option value="">{Q.form.notSpecified}</option>
                {BUSINESS_SIZES.map(v => <option key={v} value={v}>{(Q.businessSizes as Record<string, string>)[v]}</option>)}
              </select>
            </Field>
            <Field label={Q.form.urgencyLabel}>
              <select value={urgency} onChange={e => setUrgency(e.target.value)} style={inputStyle()}>
                <option value="">{Q.form.notSpecified}</option>
                {URGENCIES.map(v => <option key={v} value={v}>{(Q.urgencies as Record<string, string>)[v]}</option>)}
              </select>
            </Field>
            <Field label={Q.form.budgetBandLabel}>
              <select value={budgetBand} onChange={e => setBudgetBand(e.target.value)} style={inputStyle()}>
                <option value="">{Q.form.notSpecified}</option>
                {BUDGET_BANDS.map(v => <option key={v} value={v}>{(Q.budgetBands as Record<string, string>)[v]}</option>)}
              </select>
            </Field>
          </div>
        </fieldset>

        {!preview && (
          <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={onGetEstimate} style={primaryBtnStyle()}>
              {Q.submit.idle}
            </button>
          </div>
        )}

        {preview && (
          <>
            <EstimateView preview={preview} onReset={reset} />

            {isAuthenticated ? (
              generated ? (
                <>
                <div id="quote-generated" style={{ marginTop: 22, padding: 20, borderRadius: 14, background: 'var(--green-soft-bg, #ecfdf5)', border: '1px solid var(--green-text, #059669)' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 12 }}>{Q.generate.success}</div>

                  {showNegotiation && (
                    <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>{Q.negotiation.heading}</div>
                      <NegRow label={Q.negotiation.initialLabel} value={negInitialText} />
                      {negBudgetText && <NegRow label={Q.negotiation.budgetLabel} value={negBudgetText} />}
                      {negAdjustedText && <NegRow label={Q.negotiation.adjustedLabel} value={negAdjustedText} accent />}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                    <button type="button" disabled={downloading} onClick={() => void onDownloadPdf()} style={{ ...primaryBtnStyle(), opacity: downloading ? 0.6 : 1 }}>
                      {downloading ? '…' : Q.pdf.download}
                    </button>
                    <button type="button" disabled={emailState === 'sending'} onClick={() => void onEmail()} style={{ ...secondaryBtnStyle(), opacity: emailState === 'sending' ? 0.6 : 1 }}>
                      {emailState === 'sending' ? '…' : emailState === 'sent' ? Q.email.sent : Q.email.button}
                    </button>
                  </div>
                  {/* B2 — optional client recipient (empty → sent to the signed-in user). */}
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder={Q.email.clientPlaceholder} aria-label={Q.email.clientLabel} style={{ ...inputStyle(), maxWidth: 260 }} />
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{Q.email.clientLabel}</div>
                  </div>
                  {pdfError && <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--red-text)', fontSize: 13 }}>{pdfError}</div>}
                  {emailState === 'error' && <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--red-text)', fontSize: 13 }}>{Q.email.error}</div>}

                  {/* U2 — your budget + decision (accept / discuss) */}
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border)', textAlign: 'center' }}>
                    {/* Accept navigates to #/quote/result (the confirmation surface), so only the
                        discussion-sent state paints here; the decision form shows otherwise. */}
                    {decisionState === 'discussion' ? (
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-text, #059669)' }}>{Q.decision.discussionSent}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{Q.decision.adjustHeading}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{Q.decision.budgetLabel}</label>
                          <input type="number" inputMode="numeric" min={0} value={budgetInput} onChange={e => setBudgetInput(e.target.value)} onBlur={() => { if (budgetVerdict) emit('quote_budget_entered', { flow: 'quote', verdict: budgetVerdict, src: src ?? undefined }); }} placeholder={Q.decision.budgetPlaceholder} style={{ ...inputStyle(), maxWidth: 150 }} />
                        </div>
                        {budgetVerdict && (
                          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                            {budgetVerdict === 'below' ? Q.decision.verdictBelow : budgetVerdict === 'above' ? Q.decision.verdictAbove : Q.decision.verdictWithin}
                          </div>
                        )}
                        {!showDiscuss ? (
                          /* PART 2/3 — Accept is the single primary CTA; "request a price
                             adjustment" is a de-emphasised text link below it (not co-equal). */
                          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
                            <button type="button" disabled={decisionState === 'saving'} onClick={() => void onDecision('accepted')} style={{ ...primaryBtnStyle(), padding: '13px 36px', fontSize: 15 }}>{Q.decision.accept}</button>
                            <button type="button" disabled={decisionState === 'saving'} onClick={() => setShowDiscuss(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline', padding: 0 }}>{Q.decision.discuss}</button>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gap: 8, maxWidth: 360, margin: '0 auto' }}>
                            <textarea value={discussMessage} onChange={e => setDiscussMessage(e.target.value)} rows={3} maxLength={2000} placeholder={Q.decision.messagePlaceholder} aria-label={Q.decision.messagePlaceholder} style={{ ...inputStyle(), resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button type="button" onClick={() => { setShowDiscuss(false); setDiscussMessage(''); }} style={{ ...secondaryBtnStyle(), padding: '8px 14px' }}>✕</button>
                              <button type="button" disabled={decisionState === 'saving'} onClick={() => void onDecision('discussion')} style={{ ...primaryBtnStyle(), padding: '10px 20px' }}>{Q.decision.messageSend}</button>
                            </div>
                          </div>
                        )}
                        {decisionState === 'error' && <div style={{ marginTop: 8, color: 'var(--red-text)', fontSize: 12 }}>{Q.decision.error}</div>}
                      </>
                    )}
                  </div>

                  {/* FIX 5 — explain the quote → invoice → payment flow */}
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>{Q.flow.heading}</div>
                    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                      {[Q.flow.s1, Q.flow.s2, Q.flow.s3, Q.flow.s4].map((s, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                          <span style={{ flex: '0 0 auto', width: 20, height: 20, borderRadius: 999, background: 'var(--violet)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {isAdmin && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
                      {!showOverride ? (
                        <div style={{ textAlign: 'center' }}>
                          <button type="button" onClick={() => setShowOverride(true)} style={{ background: 'none', border: 'none', color: 'var(--violet-text)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            {Q.override.toggle}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input type="number" inputMode="numeric" min={0} value={ovMin} onChange={e => setOvMin(e.target.value)} placeholder={Q.override.minLabel} style={inputStyle()} />
                            <input type="number" inputMode="numeric" min={0} value={ovMax} onChange={e => setOvMax(e.target.value)} placeholder={Q.override.maxLabel} style={inputStyle()} />
                          </div>
                          <textarea value={ovReason} onChange={e => setOvReason(e.target.value)} placeholder={Q.override.reasonLabel} maxLength={500} rows={2} style={{ ...inputStyle(), resize: 'vertical' }} />
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => { setShowOverride(false); setOvError(null); }} style={{ ...secondaryBtnStyle(), padding: '8px 14px' }}>✕</button>
                            <button type="button" disabled={ovBusy} onClick={() => void onOverride()} style={{ ...primaryBtnStyle(), padding: '8px 16px', opacity: ovBusy ? 0.6 : 1 }}>{ovBusy ? '…' : Q.override.save}</button>
                          </div>
                          {ovError && <div style={{ color: 'var(--red-text)', fontSize: 12 }}>{ovError}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <FeedbackPrompt source="quote" />
                </>
              ) : (
                <div style={{ marginTop: 22, textAlign: 'center' }}>
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => void onGenerate()}
                    style={{ ...primaryBtnStyle(), opacity: generating ? 0.6 : 1, cursor: generating ? 'wait' : 'pointer' }}
                  >
                    {generating ? Q.generate.loading : `${Q.generate.button} · ${format(Q.generate.cost, { n: tokenCost('quote.generation') })}`}
                  </button>
                  {genError && <div style={{ marginTop: 10, color: 'var(--red-text)', fontSize: 13 }}>{genError}</div>}
                </div>
              )
            ) : (!isLoading && (
              <div style={{ marginTop: 22, padding: 24, borderRadius: 14, background: 'var(--text-primary)', color: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{Q.result.ctaHeading}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>{Q.result.ctaBody}</div>
                <button type="button" onClick={() => { emit('cta_clicked', { flow: 'quote', target: 'signup', src: src ?? undefined }); navigate({ name: 'signup' }); }} style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 10, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {Q.result.ctaButton}
                </button>
              </div>
            ))}

            <InsufficientTokensModal
              open={modal.open}
              onClose={() => setModal(m => ({ ...m, open: false }))}
              balance={modal.balance}
              required={modal.required}
              actionLabel={Q.generate.button}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Estimate view ──────────────────────────────────────── */

function EstimateView({ preview, onReset }: { preview: QuotePreview; onReset: () => void }) {
  const T = useLocale();
  const money = useMoney();
  const Q = T.publicTools.quote;
  const solutions = Q.solutions as Record<string, string>;
  const scopeMap = Q.scope as Record<string, string>;
  const nextSteps = Q.nextSteps as Record<string, string>;

  const rangeText = `${money.format(preview.priceMinUsd)} – ${money.format(preview.priceMaxUsd)}${preview.openEnded ? Q.result.openEndedSuffix : ''}`;

  return (
    <div id="quote-estimate">
      {/* Headline range */}
      <div style={{ marginTop: 24, padding: '24px 26px', borderRadius: 16, border: '2px solid var(--violet)', background: 'var(--brand-soft-bg, #f5f3ff)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--violet-text)', marginBottom: 8 }}>
          {Q.result.rangeLabel}
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
          {rangeText}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
          {Q.result.recommendedLabel}: <strong>{solutions[preview.solutionKey] ?? preview.solutionKey}</strong>
        </div>
      </div>

      {/* Scope */}
      <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <h2 style={sectionTitleStyle()}>{Q.result.scopeHeading}</h2>
        <ul style={listStyle()}>
          {preview.scopeKeys.map(k => <li key={k} style={{ marginBottom: 6 }}>{scopeMap[k] ?? k}</li>)}
        </ul>
      </div>

      {/* Next steps */}
      <div style={{ marginTop: 14, padding: '18px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <h2 style={sectionTitleStyle()}>{Q.result.nextStepsHeading}</h2>
        <ol style={listStyle()}>
          {preview.nextStepKeys.map(k => <li key={k} style={{ marginBottom: 6 }}>{nextSteps[k] ?? k}</li>)}
        </ol>
      </div>

      {/* Ops-cost note (agents/automation only) */}
      {preview.opsCostUpliftPct && (
        <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'var(--amber-soft-bg, #fef3c7)', color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.55 }}>
          {format(Q.result.opsCostNote, { min: String(preview.opsCostUpliftPct.minPct), max: String(preview.opsCostUpliftPct.maxPct) })}
        </div>
      )}

      {/* B2B payment model (informational only — no automated in-app billing). */}
      <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.55 }}>
        {Q.guided.paymentNote}
      </div>

      {/* Disclaimer (always visible) */}
      <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.55 }}>
        {Q.result.disclaimer}
      </div>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button type="button" onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
          {Q.result.rerunButton}
        </button>
      </div>
    </div>
  );
}

/* ── Local atoms (page-specific) ─────────────────────────── */

function NegRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? 'var(--violet-text)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
