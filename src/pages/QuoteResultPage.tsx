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
import { primaryBtnStyle } from '../components/ui-tools';
import { QuoteProgress } from '../components/QuoteProgress';
import { confirmQuoteDecisionByToken } from '../lib/quote/quoteClient';

// Roles that may see the Invoices surface (mirrors the sidebar gate; 'client' excluded).
const INVOICE_ROLES = ['owner', 'admin', 'billing', 'member'];

function hashFlags(): { action: 'accept' | 'discuss'; fromEmail: boolean; token: string } {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  const m = /[?&]t=([^&]+)/.exec(h);
  return {
    action:    /[?&]action=discuss/i.test(h) ? 'discuss' : 'accept',
    fromEmail: /[?&]src=email/i.test(h),
    token:     m ? decodeURIComponent(m[1]) : '',
  };
}

const linkBtn = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline', padding: 0 } as const;

export function QuoteResultPage() {
  const { navigate } = useRoute();
  const { session } = useAuth();
  const A = useLocale().publicTools.quote.accepted;
  const { action, fromEmail, token } = hashFlags();
  const canViewInvoice = !!session && INVOICE_ROLES.includes(session.role ?? '');
  const [phase, setPhase] = useState<'idle' | 'confirming' | 'done' | 'error'>('idle');
  const goQuote = () => navigate({ name: 'quote' });

  // Waiting/confirmation state (in-app submit, or a successful email confirm):
  // progress stepper at "Review", what-happens-next checklist, track CTA.
  const successView = (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
      <QuoteProgress active={2} />
      <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }} aria-hidden>✅</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px' }}>{A.title}</h1>
      <ul style={{ listStyle: 'none', margin: '0 auto 24px', padding: 0, display: 'grid', gap: 12, maxWidth: 360, textAlign: 'left' }}>
        {[A.s1, A.s2, A.s3, A.s4].map((s, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ flex: '0 0 auto', color: 'var(--green-text, #059669)', fontWeight: 800 }} aria-hidden>{i === 0 ? '⏳' : '✅'}</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        {canViewInvoice
          ? <button type="button" onClick={() => navigate({ name: 'invoices' })} style={primaryBtnStyle()}>{A.viewInvoice}</button>
          : <button type="button" onClick={() => navigate({ name: 'quote/status' })} style={primaryBtnStyle()}>{A.trackCta}</button>}
        {canViewInvoice && <button type="button" onClick={() => navigate({ name: 'quote/status' })} style={linkBtn}>{A.trackCta}</button>}
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
      try { await confirmQuoteDecisionByToken(token, isAccept ? 'accepted' : 'discussion'); setPhase('done'); }
      catch { setPhase('error'); }
    };
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 14 }} aria-hidden>{isAccept ? '📩' : '💬'}</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>{isAccept ? A.confirmTitle : A.discussTitle}</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 26px' }}>{isAccept ? A.confirmBody : A.discussConfirmBody}</p>
        <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
          <button type="button" disabled={phase === 'confirming'} onClick={() => void onConfirm()} style={{ ...primaryBtnStyle(), opacity: phase === 'confirming' ? 0.6 : 1, cursor: phase === 'confirming' ? 'wait' : 'pointer' }}>
            {phase === 'confirming' ? A.confirming : isAccept ? A.confirmCta : A.discussCta}
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
