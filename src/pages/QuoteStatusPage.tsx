/**
 * QuoteStatusPage — public state-tracking view for the quote → invoice journey.
 *
 * Reached from the confirmation page ("Track your request"), carrying ?quoteId so
 * the "Open the invoices panel" CTA deep-links to the exact quote in the pricing
 * queue (#/invoices?quoteId=…). Shows the 4-step progress indicator (at Review),
 * a current-state badge, what's happening + the next step. Chromeless (inside
 * CampaignChrome); presentational only — no data fetch (state from the URL).
 */

import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { useMoney } from '../lib/currency/useMoney';
import { useEffect, useState } from 'react';
import { primaryBtnStyle } from '../components/ui-tools';
import { QuoteProgress } from '../components/QuoteProgress';
import { ENABLE_QUOTE_V2 } from '../lib/flags';
import { SMB_MAX_USD } from '../data/quote-config';
import { readQuotePayLink, getTransferDetails, markTransferInitiated, type TransferDetails } from '../lib/quote/quoteClient';

function hashState(): { quoteId: string; state: 'review' | 'negotiation' | 'waiting' | 'invoice'; budgetUsd: number | null } {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  const dec = (s: string): string => { try { return decodeURIComponent(s); } catch { return ''; } };
  const qid = /[?&]quoteId=([^&]+)/.exec(h);
  const st = /[?&]state=(review|negotiation|waiting|invoice)/i.exec(h);
  const bud = /[?&]budgetUsd=(\d+)/.exec(h);
  return {
    quoteId: qid ? dec(qid[1]) : '',
    state: (st ? st[1].toLowerCase() : 'review') as 'review' | 'negotiation' | 'waiting' | 'invoice',
    budgetUsd: bud ? Number(bud[1]) : null,
  };
}

export function QuoteStatusPage() {
  const { navigate } = useRoute();
  const money = useMoney();
  const Q = useLocale().publicTools.quote;
  const S = Q.status;
  const flow = Q.flow;
  const steps = [flow.s1, flow.s2, flow.s3, flow.s4];
  const { quoteId, state, budgetUsd } = hashState();
  // U1 — instant "Pay now": the Stripe link stashed by the confirm page when a
  // within-range accept auto-finalised. Present → the buyer pays immediately (no wait).
  const payUrl = quoteId ? readQuotePayLink(quoteId) : null;
  const mutedLink = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline', padding: 0 } as const;

  // High-ticket (> $15k) = bank transfer: fetch the (public) instructions + let the buyer
  // flag the wire as initiated. invoiceId = quote_<quoteId>.
  const isBankTransfer = budgetUsd !== null && budgetUsd > SMB_MAX_USD;
  const [transfer, setTransfer] = useState<TransferDetails | null>(null);
  const [initiated, setInitiated] = useState(false);
  const [initiating, setInitiating] = useState(false);
  useEffect(() => {
    if (!isBankTransfer || !quoteId) return;
    let live = true;
    getTransferDetails(`quote_${quoteId}`)
      .then(d => { if (live) { setTransfer(d); if (d.status === 'awaiting_transfer') setInitiated(true); } })
      .catch(() => {});
    return () => { live = false; };
  }, [isBankTransfer, quoteId]);
  const onInitiated = async () => {
    if (!quoteId || initiating) return;
    setInitiating(true);
    try { await markTransferInitiated(`quote_${quoteId}`); setInitiated(true); }
    catch { /* non-fatal — admin still follows up */ } finally { setInitiating(false); }
  };
  const bankRow = (label: string, value: string, strong = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <strong style={{ color: 'var(--text-primary)', fontWeight: strong ? 800 : 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right', wordBreak: 'break-all' }}>{value}</strong>
    </div>
  );

  const badgeLabel = state === 'negotiation' ? S.stateNegotiation
    : state === 'waiting' ? S.stateWaiting
    : state === 'invoice' ? S.stateInvoice
    : S.stateReview;
  // Negotiation step (3) is active during admin pricing; otherwise Review (2).
  const activeStep = state === 'invoice' ? 4 : state === 'waiting' || state === 'negotiation' ? 3 : 2;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>{S.title}</h1>
      <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>{S.intro}</p>

      {/* FIX 6 — the user's proposed budget (primary) + waiting-for-validation. */}
      {budgetUsd !== null && budgetUsd > 0 && (
        <div style={{ margin: '0 auto 20px', maxWidth: 360, padding: '16px 18px', borderRadius: 12, background: 'var(--brand-soft-bg, #f5f3ff)', border: '1px solid var(--violet)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text)', marginBottom: 6 }}>{S.budgetLabel}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{money.format(budgetUsd)}</div>
          {/* Phase 4 — remove the passive "waiting" dead-end feel: V2 shows a forward,
              reassuring line (payment comes next); legacy keeps the plain status. */}
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8 }}>
            {isBankTransfer ? S.bank.cardHint : payUrl ? S.payReady : ENABLE_QUOTE_V2 ? S.waitingActive : `⏳ ${S.waitingValidation}`}
          </div>
        </div>
      )}

      {/* Current-state badge */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text)', background: 'var(--brand-tint-bg, rgba(124,58,237,0.10))', borderRadius: 999, padding: '5px 14px' }}>{badgeLabel}</span>
      </div>

      <QuoteProgress active={activeStep} />

      {/* High-ticket → bank-transfer instructions; else the SMB pay/review copy. */}
      {isBankTransfer ? (
        <div style={{ margin: '0 auto 24px', maxWidth: 420, textAlign: 'left' }}>
          <div style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{S.bank.heading}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{S.bank.secureNote}</div>
            {transfer ? (
              <div style={{ display: 'grid', gap: 8, fontSize: 13.5 }}>
                {bankRow(S.bank.amountLabel, money.format(transfer.amount ?? budgetUsd ?? 0), true)}
                {bankRow(S.bank.referenceLabel, transfer.reference)}
                {transfer.companyName ? bankRow(S.bank.companyLabel, transfer.companyName) : null}
                {transfer.bankName ? bankRow(S.bank.bankLabel, transfer.bankName) : null}
                {transfer.iban ? bankRow(S.bank.ibanLabel, transfer.iban) : null}
                {transfer.swiftBic ? bankRow(S.bank.swiftLabel, transfer.swiftBic) : null}
                {!transfer.available ? <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{transfer.bankText}</div> : null}
                {transfer.deadlineIso ? bankRow(S.bank.deadlineLabel, transfer.deadlineIso.slice(0, 10)) : null}
              </div>
            ) : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>…</div>}
          </div>
          {initiated
            ? <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--green-soft-bg, #e1f5ee)', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>✅ {S.bank.awaitingConfirm}</div>
            : <button type="button" disabled={initiating} onClick={() => void onInitiated()} style={{ ...primaryBtnStyle(), width: '100%', marginTop: 12, opacity: initiating ? 0.6 : 1, cursor: initiating ? 'wait' : 'pointer' }}>{initiating ? '…' : S.bank.initiateBtn}</button>}
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>{S.bank.invoiceNote}</div>
        </div>
      ) : payUrl ? (
        <div style={{ margin: '0 auto 24px', maxWidth: 400, padding: '12px 16px', borderRadius: 10, background: 'var(--green-soft-bg, #e1f5ee)', color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.55 }}>
          ✅ {S.payReady}
        </div>
      ) : (
        <>
          <div style={{ margin: '0 auto 16px', maxWidth: 400, padding: '12px 16px', borderRadius: 10, background: 'var(--amber-soft-bg, #fef3c7)', color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.55 }}>
            ⏳ {S.reviewNote}
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: '0 auto 28px', maxWidth: 400 }}>{S.nextStep}</p>
        </>
      )}

      <ol style={{ listStyle: 'none', margin: '0 auto 28px', padding: 0, display: 'grid', gap: 10, maxWidth: 380, textAlign: 'left' }}>
        {steps.map((s, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ flex: '0 0 auto', width: 22, height: 22, borderRadius: 999, background: 'var(--violet)', color: '#fff', fontSize: 11.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        {/* U1 — instant "Pay now" (external Stripe Checkout) when the quote auto-finalised. */}
        {payUrl && <a href={payUrl} style={{ ...primaryBtnStyle(), textDecoration: 'none' }}>{S.payNow}</a>}
        <button type="button" onClick={() => navigate({ name: 'invoices', ...(quoteId ? { quoteId } : {}) })} style={payUrl ? mutedLink : primaryBtnStyle()}>{S.openPanel}</button>
        <button type="button" onClick={() => navigate({ name: 'quote' })} style={mutedLink}>{S.back}</button>
      </div>
    </div>
  );
}
