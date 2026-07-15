/**
 * QuoteResultPage — post-accept confirmation + email Accept/Discuss handler.
 *
 * Three entry paths:
 *  (a) In-app accept — QuoteRequestPage records the decision (POST /decision) THEN
 *      navigates here (hash "#/quote/result", no query). Success checklist is truthful.
 *  (b) Email CTA WITH an action token — the quote email's Accept/Discuss links land
 *      here with "?action=accept|discuss&src=email&t=<token>". NOTHING is recorded on
 *      load (no mutate-on-GET); the recipient clicks "Confirm", which POSTs the token
 *      to /api/quote/decision/confirm — that records the decision, opens the draft
 *      invoice, and notifies the admin. Only then is the success checklist shown.
 *  (c) Email CTA WITHOUT a token (legacy links) — honest "confirm in-app / reply" copy,
 *      never a false "request sent".
 *
 * Public + chromeless (CampaignChrome). Reads only the hash; the token is the gate.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { useMoney } from '../lib/currency/useMoney';
import { primaryBtnStyle } from '../components/ui-tools';
import { QuoteProgress } from '../components/QuoteProgress';
import { confirmQuoteDecisionByToken, stashQuotePayLink } from '../lib/quote/quoteClient';
import { SMB_MAX_USD } from '../data/quote-config';

// Roles that may see the Invoices surface (mirrors the sidebar gate; 'client' excluded).
const INVOICE_ROLES = ['owner', 'admin', 'billing', 'member'];

function hashFlags(): { action: 'accept' | 'discuss'; fromEmail: boolean; token: string; quoteId: string; budgetUsd: number | null } {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  const m = /[?&]t=([^&]+)/.exec(h);
  const qid = /[?&]quoteId=([^&]+)/.exec(h);
  const bud = /[?&]budgetUsd=(\d+)/.exec(h);
  const dec = (s: string): string => { try { return decodeURIComponent(s); } catch { return ''; } };
  return {
    action:    /[?&]action=discuss/i.test(h) ? 'discuss' : 'accept',
    fromEmail: /[?&]src=email/i.test(h),
    token:     m ? dec(m[1]) : '',
    quoteId:   qid ? dec(qid[1]) : '',
    budgetUsd: bud ? Number(bud[1]) : null,
  };
}

const linkBtn = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline', padding: 0 } as const;

export function QuoteResultPage() {
  const { navigate } = useRoute();
  const { session } = useAuth();
  const Q = useLocale().publicTools.quote;
  const A = Q.accepted;
  const money = useMoney();
  const { action, fromEmail, token, quoteId, budgetUsd } = hashFlags();
  // High-ticket (> $15k) = bank transfer: relabel the accept CTA + show the secure-transfer note.
  const isBankTransfer = budgetUsd !== null && budgetUsd > SMB_MAX_USD;
  const canViewInvoice = !!session && INVOICE_ROLES.includes(session.role ?? '');
  const [phase, setPhase] = useState<'idle' | 'confirming' | 'done' | 'error'>('idle');
  // U1/BUG 4 — the instant Stripe pay link returned by the accept: the success view
  // surfaces a DIRECT "Pay now" CTA (no dead-end "track your request" hunt).
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const goQuote = () => navigate({ name: 'quote' });
  // Carry the proposed amount to the status page so it shows the exact figure; when a
  // pay link is ready (or bank transfer), land in the 'invoice' state (invoice surfaced).
  const goStatus = () => navigate({ name: 'quote/status', ...(quoteId ? { quoteId } : {}), ...(budgetUsd !== null && budgetUsd > 0 ? { budgetUsd } : {}), ...(payUrl || isBankTransfer ? { state: 'invoice' } : {}) });

  // Waiting/confirmation state (in-app submit, or a successful email confirm):
  // progress stepper at "Review", what-happens-next checklist, track CTA.
  const successView = (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
      <QuoteProgress active={2} />
      <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }} aria-hidden>✅</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px' }}>{A.title}</h1>
      {budgetUsd !== null && budgetUsd > 0 && (
        <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: '0 0 18px' }}>
          {Q.status.budgetLabel}: <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{money.format(budgetUsd)}</strong>
        </div>
      )}
      <ul style={{ listStyle: 'none', margin: '0 auto 24px', padding: 0, display: 'grid', gap: 12, maxWidth: 360, textAlign: 'left' }}>
        {[A.s1, A.s2, A.s3, A.s4].map((s, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ flex: '0 0 auto', color: 'var(--green-text, #059669)', fontWeight: 800 }} aria-hidden>{i === 0 ? '⏳' : '✅'}</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      {/* BUG 4 — DIRECT conversion path: "Pay now" the moment a pay link exists, else
             "View your invoice" (authed → invoices panel; client → the invoice/status
             view). No "track your request" hunt — the client never has to search. */}
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        {payUrl
          ? <a href={payUrl} style={{ ...primaryBtnStyle(), textDecoration: 'none' }}>{Q.status.payNow}</a>
          : canViewInvoice
            ? <button type="button" onClick={() => navigate({ name: 'invoices', ...(quoteId ? { quoteId } : {}) })} style={primaryBtnStyle()}>{A.viewInvoice}</button>
            : <button type="button" onClick={goStatus} style={primaryBtnStyle()}>{A.viewInvoice}</button>}
        {payUrl && (canViewInvoice
          ? <button type="button" onClick={() => navigate({ name: 'invoices', ...(quoteId ? { quoteId } : {}) })} style={linkBtn}>{A.viewInvoice}</button>
          : <button type="button" onClick={goStatus} style={linkBtn}>{A.viewInvoice}</button>)}
        <button type="button" onClick={goQuote} style={linkBtn}>{A.back}</button>
      </div>
    </div>
  );

  // (a) In-app accept — already recorded server-side.
  if (action === 'accept' && !fromEmail) return successView;

  // (b) Email CTA with a token — require an explicit Confirm click, then POST.
  if (fromEmail && token) {
    if (phase === 'done') {
      return action === 'accept'
        ? successView
        : <Shell icon="💬" title={A.sentTitle} body={A.sentBody} onBack={goQuote} backLabel={A.back} />;
    }
    const isAccept = action === 'accept';
    const onConfirm = async () => {
      setPhase('confirming');
      try {
        // FIX 1 — carry the proposed budget so the admin notify always has it, even
        // if it wasn't persisted at email time (server-stored value still wins).
        const r = await confirmQuoteDecisionByToken(token, isAccept ? 'accepted' : 'discussion', budgetUsd !== null && budgetUsd > 0 ? { expectedBudgetUsd: budgetUsd } : undefined);
        // U1 — within-range accept auto-finalised → stash the instant pay link so the
        // status page shows "Pay now" (no admin-wait dead-end).
        if (isAccept && r.paymentUrl) { if (quoteId) stashQuotePayLink(quoteId, r.paymentUrl); setPayUrl(r.paymentUrl); }
        setPhase('done');
      } catch { setPhase('error'); }
    };
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 14 }} aria-hidden>{isAccept ? '📩' : '💬'}</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>{isAccept ? A.confirmTitle : A.discussTitle}</h1>
        {budgetUsd !== null && budgetUsd > 0 && (
          <div style={{ margin: '0 auto 18px', maxWidth: 340, padding: '14px 18px', borderRadius: 12, background: 'var(--brand-soft-bg, #f5f3ff)', border: '1px solid var(--violet)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text)', marginBottom: 4 }}>{Q.status.budgetLabel}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{money.format(budgetUsd)}</div>
          </div>
        )}
        {isAccept && isBankTransfer && (
          <div style={{ margin: '0 auto 18px', maxWidth: 380, padding: '10px 14px', borderRadius: 10, background: 'var(--brand-tint-bg, rgba(124,58,237,0.08))', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>
            🏦 {A.bankMessage}
          </div>
        )}
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 26px' }}>{isAccept ? A.confirmBody : A.discussConfirmBody}</p>
        <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
          <button type="button" disabled={phase === 'confirming'} onClick={() => void onConfirm()} style={{ ...primaryBtnStyle(), opacity: phase === 'confirming' ? 0.6 : 1, cursor: phase === 'confirming' ? 'wait' : 'pointer' }}>
            {phase === 'confirming' ? A.confirming : isAccept ? (isBankTransfer ? A.bankProceedCta : A.confirmCta) : A.discussCta}
          </button>
          <button type="button" onClick={goQuote} style={linkBtn}>{A.back}</button>
        </div>
        {phase === 'error' && <p style={{ marginTop: 16, fontSize: 13, color: 'var(--red-text)' }}>{A.confirmError}</p>}
      </div>
    );
  }

  // (c) Email CTA without a token (legacy links) — honest, no false claim.
  const isAccept = action === 'accept';
  return (
    <Shell
      icon={isAccept ? '📩' : '💬'}
      title={isAccept ? A.emailTitle : A.discussTitle}
      body={isAccept ? A.emailBody : A.discussBody}
      onBack={goQuote}
      backLabel={A.back}
    />
  );
}

/* ── Simple title + body + single CTA layout. ── */
function Shell({ icon, title, body, onBack, backLabel }: { icon: string; title: string; body: ReactNode; onBack: () => void; backLabel: string }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 14 }} aria-hidden>{icon}</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>{title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 26px' }}>{body}</p>
      <button type="button" onClick={onBack} style={primaryBtnStyle()}>{backLabel}</button>
    </div>
  );
}
