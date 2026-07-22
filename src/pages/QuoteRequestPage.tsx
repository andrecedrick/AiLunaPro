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

import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
import { computeQuotePreview, type QuotePreview } from '../lib/quote/score';
import { generateQuote, downloadQuotePdf, emailQuote, QuoteGenError } from '../lib/quote/quoteClient';
import { patchQuote } from '../lib/quote/invoicesClient';
import { tokenCost } from '../lib/tokens/costs';
import { InsufficientTokensModal } from '../components/tokens/InsufficientTokensModal';
import { ActionValueHint } from '../components/tokens/ActionValueHint';
import { FeedbackPrompt } from '../components/feedback/FeedbackPrompt';
import { fieldsetStyle, legendStyle, inputStyle, primaryBtnStyle, secondaryBtnStyle, sectionTitleStyle, listStyle, Field } from '../components/ui-tools';
import { usePreferences } from '../context/PreferencesContext';
import { useSessionValue } from '../context/SessionValueContext';
import { pdfLocale } from '../lib/locale/i18n';
// Direct catalog import - this page is lazy, so English stays off the entry chunk.
import { en as EN } from '../lib/locale/i18n/en';
import { saveFlowProgress, readFlowProgress, clearFlowProgress, readFreshRoi, bindRoiToQuote, clearPendingResult, type PendingRoiSummary } from '../lib/leads/pendingLead';
import { RoiValueBlock } from '../components/quote/RoiValueBlock';
import { DecisionBlock } from '../components/quote/DecisionBlock';
import { computeDecision, investmentFromPrice } from '../lib/quote/decision';
import { takeWorksheetQuotePrefill } from '../lib/worksheet/quotePrefill';
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
  // Phase 2 / D2 — value-first Quote reads the structured ROI figures the ROI
  // Calculator stashed (non-PII, localStorage), but ONLY when FRESH (<30 min).
  // V2 only; stale/absent → graceful fallback (no ROI block, generic cost-of-delay),
  // never wrong values. Re-validated + bound to the quote before it ever reaches the
  // client email (see onGenerate/onSendProposal), and cleared once used.
  const [roiCtx, setRoiCtx] = useState<PendingRoiSummary | null>(() => readFreshRoi(Date.now()));

  // Q2 — token-charged generation (authenticated only).
  const [generating, setGenerating] = useState(false);
  const [genError,   setGenError]   = useState<string | null>(null);
  const [generated,  setGenerated]  = useState(false);
  const { recordAction } = useSessionValue();
  const [modal,      setModal]      = useState<{ open: boolean; balance: number; required: number }>({ open: false, balance: 0, required: 0 });
  const [downloading, setDownloading] = useState(false);
  const [pdfError,    setPdfError]    = useState<string | null>(null);
  // FIX 1/2/7: the page is a single "send the proposal to your client" form — only the
  // client email is required; one submit emails the FIXED-price proposal. The client
  // accepts / pays from the email. No budget input — the price is the offer's priceUsd.
  // Q4 — the client recipient is now REQUIRED (the submit sends the proposal email).
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [clientEmail, setClientEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  // No in-page override: the price is the deterministic estimate; the admin confirms
  // the final amount later in the Invoices / Admin Center pricing queue.
  // Stable per estimate session: a network retry reuses it (server idempotent,
  // no double charge); reset() mints a fresh one for the next quote.
  const quoteIdRef = useRef<string>('');

  // Admin price override (Phase 1): finalUsd overrides the system priceUsd for THIS send
  // (owner/admin only). null = use the base. priceUsd itself is NEVER mutated; the client
  // never sets the price. USD-canonical — edited in USD, converted client-side.
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';
  const [finalUsd, setFinalUsd] = useState<number | null>(null);
  const [priceReason, setPriceReason] = useState('');
  // F3 — raw text the admin sees in the price field. null = untouched (show the base);
  // a string (incl. '') = the admin's own input, so clearing the field no longer snaps
  // back to base. finalUsd stays the parsed source of truth for render/email/effective.
  const [priceInput, setPriceInput] = useState<string | null>(null);
  // F2 — did a prior send in THIS session persist a finalPriceUsd override? If so, a
  // later reset-to-base must PATCH finalPriceUsd:null to clear it (else the worker
  // re-locks the stale override). Fresh quotes start with nothing stored.
  const overridePersistedRef = useRef(false);

  // Worksheet → Quote handoff: one-shot prefill (pre-select the service category +
  // seed the description from the user's recoverable tasks). Read once on mount.
  useEffect(() => {
    const pf = takeWorksheetQuotePrefill();
    if (!pf) return;
    if ((QUOTE_CATEGORIES as readonly string[]).includes(pf.category)) {
      setCategory(pf.category as QuoteCategory);
      setTier('');
      setPicks([]);
    }
    if (pf.descriptionSeed) setDetails(pf.descriptionSeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Q = T.publicTools.quote;
  // Phase 4 — value-framed primary CTA ("Start recovering {amount}/month"), shown only
  // in V2 when ROI figures are present; else null → the existing labels are used (graceful).
  // The label drives the SAME existing action (sign up / generate); the surrounding subtext
  // keeps the mechanical step honest.
  const recoverCta = roiCtx
    ? format(Q.result.ctaStartRecovering, { amount: money.format(roiCtx.estimatedMonthlyCostSaved) })
    : null;
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
    setEmailState('idle'); setEmailError(null); setClientEmail('');
    setFinalUsd(null); setPriceReason('');
    quoteIdRef.current = '';
    // D2 — new quote context: re-read the ROI under the freshness gate (drops it if
    // now stale) so the next quote never shows/sends a previous quote's numbers.
    setRoiCtx(readFreshRoi(Date.now()));
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
    // D2 — attach the (fresh) ROI to THIS quote so it can never surface on a different
    // quote's client email. No-op when there is no ROI to bind.
    if (roiCtx) bindRoiToQuote(quoteIdRef.current);
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
      recordAction('quote.generation'); // Part 4: session value tracker (gated by ENABLE_TOKEN_MODEL_V2)
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
  // language: Latin → current locale; RU/ZH → English (pdfLocale rule). Uses the
  // deterministic estimate (no in-page override). Justification is deterministic (no LLM).
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

    const priceText = money.format(finalUsd ?? p.priceUsd);   // admin override reflected in the PDF/email render
    const solutionLabel = sols[p.solutionKey] ?? p.solutionKey;
    const tCat = p.category === 'website' ? 'website' : p.category === 'audit' ? 'audit' : 'agent';

    const justification: string[] = [
      format(prop.justification.market, { category: services[p.category] ?? p.category, tier: tiers[p.tier] ?? p.tier, range: priceText }),
      format(prop.justification.complexity, { tier: tiers[p.tier] ?? p.tier }),
      format(prop.justification.scope, { count: String(p.scopeKeys.length) }),
    ];
    if (p.opsCostUpliftPct) {
      justification.push(format(prop.justification.ops, { min: String(p.opsCostUpliftPct.minPct), max: String(p.opsCostUpliftPct.maxPct) }));
    }

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
      rangeText:            priceText,
      justificationHeading: prop.justification.heading,
      justification,
      paymentHeading:       prop.paymentHeading,
      paymentNote:          pq.guided.paymentNote,
      timelineHeading:      prop.timelineHeading,
      timeline:             (timelineMap[tCat] ?? '').split('\n').map(s => s.trim()).filter(Boolean),
      disclaimer:           pq.result.disclaimer,
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

  // FIX 1/2/7 — the single primary action: send the proposal to the client. Client
  // email + proposed budget are both REQUIRED; the client then accepts / requests
  // changes from the email itself (no in-app self-accept). Budget rides along so the
  // email + admin notify + the email Accept/Discuss CTAs all carry the amount.
  const onSendProposal = async () => {
    if (emailState === 'sending' || !preview) return;
    const orgId = session?.orgId;
    if (!orgId || !quoteIdRef.current) return;
    const email = clientEmail.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // Fixed published price: the amount is the offer's priceUsd, locked by the worker at
    // send. No budget input, no floor, no client-driven amount — only the client email is
    // required to send the proposal.
    setEmailError(emailOk ? null : Q.send.emailRequired);
    if (!emailOk) return;
    setEmailState('sending');
    try {
      // F1/F2 — reconcile the admin price override into Firestore BEFORE the send locks it.
      // The worker /email locks price = stored.finalPriceUsd ?? base, so this PATCH MUST
      // land first, or the client would be sent/invoiced the base while the render shows
      // the override. BLOCKING: on failure we abort the send (no silent base fallback).
      //   overrideUsd != null → set it; == null with a prior persisted override → clear it
      //   (finalPriceUsd:null) so a reset-to-base can't re-lock the stale amount.
      if (isAdmin) {
        const overrideUsd = finalUsd !== null && finalUsd !== preview.priceUsd ? finalUsd : null;
        if (overrideUsd !== null || overridePersistedRef.current) {
          try {
            await patchQuote(orgId, quoteIdRef.current, {
              finalPriceUsd: overrideUsd,
              priceReason: overrideUsd !== null ? priceReason.trim() : '',
            });
            overridePersistedRef.current = overrideUsd !== null;
          } catch {
            setEmailState('error');   // F1 — do NOT send at the wrong price
            return;
          }
        }
      }
      // ROI + decision merge variables for the email — formatted EXACTLY like the in-app
      // blocks (useMoney, no leading ≈ since the template adds it; i18n time/payback/×).
      // D2 — RE-VALIDATE at send time: the ROI must still be FRESH (<30 min) AND bound
      // to THIS quote; otherwise no ROI is sent and the worker/template hide the block.
      // Guarantees the client email never carries stale or another quote's ROI.
      const boundRoi = readFreshRoi(Date.now(), quoteIdRef.current);
      const roiVars = boundRoi ? (() => {
        const R = T.publicTools.roi.result;
        const QR = T.publicTools.quote.result;
        const dec = computeDecision({
          investmentUsd:   investmentFromPrice(finalUsd ?? preview.priceUsd),
          yearlySavedUsd:  boundRoi.estimatedYearlyCostSaved,
          monthlySavedUsd: boundRoi.estimatedMonthlyCostSaved,
        });
        const dash = '—';
        return {
          MONTHLY_SAVED: money.format(boundRoi.estimatedMonthlyCostSaved, { approx: false }),
          YEARLY_SAVED:  money.format(boundRoi.estimatedYearlyCostSaved, { approx: false }),
          TIME_SAVED:    format(R.timeSavedValue, { hours: boundRoi.estimatedTimeSavedHoursPerMonth.toLocaleString('en-US') }),
          PAYBACK:       boundRoi.estimatedPaybackMonths === null ? dash : format(R.paybackValue, { months: boundRoi.estimatedPaybackMonths.toLocaleString('en-US') }),
          ROI_MULTIPLE:  dec ? format(QR.decisionMultiple, { mult: dec.roiYear1.toFixed(1) }) : dash,
          BREAKEVEN:     dec && dec.paybackMonths !== null ? format(QR.decisionMonths, { months: String(Math.round(dec.paybackMonths)) }) : dash,
          THREE_YEAR:    dec ? format(QR.decisionMultiple, { mult: dec.roi3yr.toFixed(1) }) : dash,
        } as Record<string, string>;
      })() : undefined;
      const r = await emailQuote(orgId, quoteIdRef.current, language, buildRender(), false, email, roiVars);
      emit('quote_emailed', { flow: 'quote', emailed: r.emailed, src: src ?? undefined });
      // D2 — clear the ROI after it has been consumed by a send so it can never be
      // reused on a later, unrelated quote.
      clearPendingResult('roi');
      setRoiCtx(null);
      setEmailState('sent');
    } catch {
      setEmailState('error');
    }
  };

  // The single fixed published price for this offer — the same value shown here, in the
  // email, PDF, DB, confirmation page, and Stripe.
  const effectiveUsd = preview ? (finalUsd ?? preview.priceUsd) : 0;
  const priceText = preview ? money.format(effectiveUsd) : '';

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
            {/* V2 — one centered, elevated premium card holds the whole value → decision →
                investment → CTA stack (single card layout). Legacy: plain wrapper, no change. */}
            <div style={{ maxWidth: 560, margin: '24px auto 0', background: 'var(--surface-2)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 14px 40px rgba(0,0,0,0.05)', padding: '28px 26px 30px' }}>
            <EstimateView preview={preview} roi={roiCtx} />

            {isAuthenticated ? (
              generated ? (
                <>
                <div id="quote-generated" style={{ marginTop: 22, padding: 20, borderRadius: 14, background: 'var(--green-soft-bg, #ecfdf5)', border: '1px solid var(--green-text, #059669)' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 12 }}>{Q.generate.success}</div>

                  {emailState === 'sent' ? (
                    /* FIX 7 — sent confirmation: one clear status + next step. */
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-text, #059669)', marginBottom: 6 }}>✅ {format(Q.send.sentTo, { email: clientEmail.trim() })}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>{Q.send.sentNext}</div>
                      <button type="button" onClick={() => navigate({ name: 'admin' })} style={secondaryBtnStyle()}>{Q.send.track}</button>
                    </div>
                  ) : (
                    /* PRIMARY — the single "send the proposal to your client" form:
                       1) client email (required) · 2) the fixed published price · 3) one submit. */
                    <div style={{ marginBottom: 8, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 4 }}>{Q.send.heading}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>{Q.send.intro}</div>

                      {/* 1 — client email (REQUIRED, primary) */}
                      <label htmlFor="quote-client-email" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                        {Q.send.emailLabel} <span style={{ color: 'var(--red-text)' }}>{Q.requiredMark}</span>
                      </label>
                      <input id="quote-client-email" type="email" inputMode="email" value={clientEmail}
                        onChange={e => { setClientEmail(e.target.value); if (emailError) setEmailError(null); }}
                        placeholder={Q.email.clientPlaceholder} aria-invalid={!!emailError}
                        style={{ ...inputStyle(), marginBottom: emailError ? 4 : 14, ...(emailError ? { borderColor: 'var(--red-text)' } : {}) }} />
                      {emailError && <div style={{ fontSize: 12.5, color: 'var(--red-text)', marginBottom: 12 }}>{emailError}</div>}

                      {/* 2 — price. Owner/admin can override the system price (USD) before sending;
                             everyone else sees the fixed published price. priceUsd stays the base. */}
                      {isAdmin ? (
                        <div style={{ margin: '0 0 16px', padding: '14px 16px', borderRadius: 12, background: 'var(--brand-soft-bg, #f5f3ff)', border: '1px solid var(--violet)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{Q.decision.suggestedLabel}</span>
                            <strong style={{ fontSize: 14, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>${(preview?.priceUsd ?? 0).toLocaleString('en-US')}</strong>
                          </div>
                          <label htmlFor="quote-final-price" style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text)', marginBottom: 6 }}>{Q.decision.finalLabel}</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>$</span>
                            <input id="quote-final-price" type="number" inputMode="numeric" min={1}
                              value={priceInput === null ? String(effectiveUsd) : priceInput}
                              onChange={e => { const raw = e.target.value; setPriceInput(raw); const n = Math.round(Number(raw)); setFinalUsd(raw.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null); }}
                              style={{ ...inputStyle(), fontWeight: 800, fontSize: 22, fontVariantNumeric: 'tabular-nums' }} />
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                            {[-10, -5, 5, 10].map(pct => (
                              <button key={pct} type="button" onClick={() => { if (!preview) return; const v = Math.max(1, Math.round(preview.priceUsd * (1 + pct / 100))); setFinalUsd(v); setPriceInput(String(v)); }}
                                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{pct > 0 ? `+${pct}%` : `${pct}%`}</button>
                            ))}
                            {finalUsd !== null && preview && finalUsd !== preview.priceUsd && (
                              <button type="button" onClick={() => { setFinalUsd(null); setPriceReason(''); setPriceInput(null); }}
                                style={{ padding: '5px 10px', border: 'none', background: 'transparent', color: 'var(--violet-text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>{Q.decision.resetPrice}</button>
                            )}
                          </div>
                          <input type="text" value={priceReason} onChange={e => setPriceReason(e.target.value.slice(0, 300))} placeholder={Q.decision.reasonPlaceholder} maxLength={300}
                            style={{ ...inputStyle(), fontSize: 13 }} />
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{Q.decision.billedUsd}</div>
                        </div>
                      ) : (
                        <div style={{ margin: '0 0 16px', padding: '16px 18px', borderRadius: 12, background: 'var(--brand-soft-bg, #f5f3ff)', border: '1px solid var(--violet)', textAlign: 'center' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text)', marginBottom: 6 }}>{Q.decision.priceLabel}</div>
                          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{priceText}</div>
                        </div>
                      )}

                      {/* 4 — single submit (PDF download is a de-emphasised secondary link) */}
                      <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
                        <button type="button" disabled={emailState === 'sending'} onClick={() => void onSendProposal()} style={{ ...primaryBtnStyle(), padding: '13px 36px', fontSize: 15, width: '100%', maxWidth: 320, opacity: emailState === 'sending' ? 0.6 : 1 }}>
                          {emailState === 'sending' ? '…' : Q.send.submit}
                        </button>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 360, textAlign: 'center', lineHeight: 1.5 }}>{Q.send.hint}</div>
                        <button type="button" disabled={downloading} onClick={() => void onDownloadPdf()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, textDecoration: 'underline', padding: 0, marginTop: 2 }}>
                          {downloading ? '…' : Q.pdf.download}
                        </button>
                      </div>
                      {emailState === 'error' && <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--red-text)', fontSize: 13 }}>{Q.email.error}</div>}
                      {pdfError && <div style={{ marginTop: 8, textAlign: 'center', color: 'var(--red-text)', fontSize: 13 }}>{pdfError}</div>}
                    </div>
                  )}

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
                    {generating ? Q.generate.loading : (recoverCta ?? Q.generate.button)}
                  </button>
                  {/* CRO — the primary CTA reads pure outcome; the token cost stays visible
                         (honesty) but demoted to this muted subline, never inside the button. */}
                  {!generating && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      {format(Q.generate.cost, { n: tokenCost('quote.generation') })}
                    </div>
                  )}
                  <ActionValueHint action="quote.generation" style={{ display: 'block', marginTop: 8 }} />
                  {genError && <div style={{ marginTop: 10, color: 'var(--red-text)', fontSize: 13 }}>{genError}</div>}
                </div>
              )
            ) : (!isLoading && (
              <div style={{ marginTop: 22, padding: 24, borderRadius: 14, background: 'var(--text-primary)', color: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{Q.result.ctaHeading}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>{Q.result.ctaBody}</div>
                <button type="button" onClick={() => { emit('cta_clicked', { flow: 'quote', target: 'signup', src: src ?? undefined }); navigate({ name: 'signup' }); }} style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {recoverCta ?? Q.result.ctaButton}
                </button>
              </div>
            ))}

            {/* Quote trailer — rendered AFTER the CTA so the value → CTA chain is
                unbroken: a generic cost-of-delay nudge, then the disclaimer (demoted
                below the decision point), then the rerun link. UI-only, no numbers. */}
            {(
              <>
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'var(--amber-soft-bg, #fef3c7)', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55, textAlign: 'center' }}>
                  {roiCtx
                    ? format(Q.result.costOfDelayAmount, { amount: money.format(roiCtx.estimatedMonthlyCostSaved) })
                    : Q.result.costOfDelay}
                </div>
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.55 }}>
                  {Q.result.disclaimer}
                </div>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button type="button" onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                    {Q.result.rerunButton}
                  </button>
                </div>
              </>
            )}
            </div>

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

function EstimateView({ preview, roi = null }: { preview: QuotePreview; roi?: PendingRoiSummary | null }) {
  const T = useLocale();
  const money = useMoney();
  const Q = T.publicTools.quote;
  const solutions = Q.solutions as Record<string, string>;
  const scopeMap = Q.scope as Record<string, string>;
  const nextSteps = Q.nextSteps as Record<string, string>;

  const priceText = money.format(preview.priceUsd);
  const solutionTitle = solutions[preview.solutionKey] ?? preview.solutionKey;

  // Decision summary — derived purely from the quote investment + ROI savings. Null when
  // there is no meaningful decision (no ROI carried / no savings) → block simply omitted.
  const decision = roi
    ? computeDecision({
        investmentUsd:   investmentFromPrice(preview.priceUsd),
        yearlySavedUsd:  roi.estimatedYearlyCostSaved,
        monthlySavedUsd: roi.estimatedMonthlyCostSaved,
      })
    : null;

  // ISSUE 3 — conversion-first investment card: the number never stands alone. What the
  // investment BUYS (deliverables) sits with it, and the "no payment today" reassurance
  // defuses sticker shock — the CTA below stays a zero-commitment step.
  const priceCard = (
    <div style={{ marginTop: 14, padding: '18px 20px', borderRadius: 14, background: 'var(--surface-1)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>
          {Q.decision.priceLabel}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
          {priceText}
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: '12px 0 0', borderTop: '1px dashed var(--border)', display: 'grid', gap: 7 }}>
        {[Q.decision.valueItem1, Q.decision.valueItem2, Q.decision.valueItem3].map((v, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span aria-hidden style={{ flex: '0 0 auto', color: 'var(--green-text, #059669)', fontWeight: 800 }}>✓</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--brand-tint-bg, rgba(124,58,237,0.08))', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        🔒 {Q.decision.priceNote}
      </div>
    </div>
  );

  // Sections read as soft, borderless tiles inside the one premium card.
  const softSection: CSSProperties = { borderRadius: 14, background: 'var(--surface-1)', border: 'none' };

  // ISSUE 3 — business-impact section: ALWAYS present (not ROI-dependent), placed
  // BEFORE scope/price so the visitor reads outcomes before any number.
  const impactBlock = (
    <div style={{ marginTop: 14, padding: '18px 20px', ...softSection }}>
      <h2 style={sectionTitleStyle()}>{Q.decision.impactHeading}</h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {[Q.decision.impact1, Q.decision.impact2, Q.decision.impact3].map((v, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <span aria-hidden style={{ flex: '0 0 auto' }}>{['⚡', '🛡️', '📈'][i]}</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const scopeBlock = (
    <div style={{ marginTop: 14, padding: '18px 20px', ...softSection }}>
      <h2 style={sectionTitleStyle()}>{Q.result.scopeHeading}</h2>
      <ul style={listStyle()}>
        {preview.scopeKeys.map(k => <li key={k} style={{ marginBottom: 6 }}>{scopeMap[k] ?? k}</li>)}
      </ul>
    </div>
  );

  const nextStepsBlock = (
    <div style={{ marginTop: 14, padding: '18px 20px', ...softSection }}>
      <h2 style={sectionTitleStyle()}>{Q.result.nextStepsHeading}</h2>
      <ol style={listStyle()}>
        {preview.nextStepKeys.map(k => <li key={k} style={{ marginBottom: 6 }}>{nextSteps[k] ?? k}</li>)}
      </ol>
    </div>
  );

  const opsNote = preview.opsCostUpliftPct && (
    <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'var(--amber-soft-bg, #fef3c7)', color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.55 }}>
      {format(Q.result.opsCostNote, { min: String(preview.opsCostUpliftPct.minPct), max: String(preview.opsCostUpliftPct.maxPct) })}
    </div>
  );

  const paymentNote = (
    <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 14, background: 'var(--surface-1)', color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.55 }}>
      {Q.guided.paymentNote}
    </div>
  );

  // Value-first is the ONLY layout — no legacy price-first fallback. Order is always:
  // ROI (if carried) → decision (if computable) → solution → scope → next steps →
  // investment → notes. Disclaimer + rerun render in the parent after the CTA so the
  // value → CTA chain stays unbroken. When ROI/decision are absent the block is simply
  // omitted and the solution leads — the premium card layout is preserved either way.
  return (
    <div id="quote-estimate">
      {roi && <RoiValueBlock roi={roi} />}
      {decision && <DecisionBlock decision={decision} />}
      <div style={{ marginTop: roi ? 16 : 4, padding: '18px 22px', borderRadius: 14, background: 'var(--surface-1)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--violet-text)', marginBottom: 6 }}>
          {Q.result.recommendedLabel}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
          {solutionTitle}
        </div>
      </div>
      {impactBlock}
      {scopeBlock}
      {nextStepsBlock}
      {priceCard}
      {opsNote}
      {paymentNote}
    </div>
  );
}
