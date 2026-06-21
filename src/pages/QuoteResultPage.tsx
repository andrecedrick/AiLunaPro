/**
 * QuoteResultPage — post-accept confirmation.
 *
 * Reached two ways:
 *  (a) In-app accept — QuoteRequestPage records the decision (POST /decision:
 *      writes the decision, opens the draft invoice, notifies the admin) and THEN
 *      navigates here (hash "#/quote/result", no query). The success checklist is
 *      therefore truthful, and authed staff get a "View your invoice" CTA.
 *  (b) Email CTA — the quote email's Accept/Discuss buttons deep-link here with
 *      "?action=accept|discuss&src=email". These are plain GET links (no
 *      mutate-on-GET), so NOTHING is recorded server-side yet — the signed
 *      email-accept endpoint is not built. We must NOT claim the request was
 *      sent; instead we guide the recipient to confirm in-app / reply.
 *
 * Public + chromeless (rendered inside CampaignChrome). Reads only the hash.
 */

import type { ReactNode } from 'react';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { primaryBtnStyle } from '../components/ui-tools';

// Roles that may see the Invoices surface (mirrors the sidebar gate; 'client' is excluded).
const INVOICE_ROLES = ['owner', 'admin', 'billing', 'member'];

function hashFlags(): { action: 'accept' | 'discuss'; fromEmail: boolean } {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  return {
    action:    /[?&]action=discuss/i.test(h) ? 'discuss' : 'accept',
    fromEmail: /[?&]src=email/i.test(h),
  };
}

export function QuoteResultPage() {
  const { navigate } = useRoute();
  const { session } = useAuth();
  const A = useLocale().publicTools.quote.accepted;
  const { action, fromEmail } = hashFlags();
  const canViewInvoice = !!session && INVOICE_ROLES.includes(session.role ?? '');

  // Discuss only reaches this page from the email CTA (the in-app discuss path
  // confirms inline and never navigates here) — honest "reply to confirm" copy.
  if (action === 'discuss') {
    return <Shell icon="💬" title={A.discussTitle} body={A.discussBody} onBack={() => navigate({ name: 'quote' })} backLabel={A.back} />;
  }

  // Accept arriving from the email CTA: no server-side record happened — guide
  // the recipient to complete the acceptance in-app rather than claim success.
  if (fromEmail) {
    return <Shell icon="📩" title={A.emailTitle} body={A.emailBody} onBack={() => navigate({ name: 'quote' })} backLabel={A.back} />;
  }

  // In-app accept — the decision is already recorded; the checklist is truthful.
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 14 }} aria-hidden>✅</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px' }}>{A.title}</h1>

      {/* Explicit, no-hidden-steps confirmation of the full path through to payment. */}
      <ul style={{ listStyle: 'none', margin: '0 auto 24px', padding: 0, display: 'grid', gap: 12, maxWidth: 360, textAlign: 'left' }}>
        {[A.s1, A.s2, A.s3, A.s4].map((s, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ flex: '0 0 auto', color: 'var(--green-text, #059669)', fontWeight: 800 }} aria-hidden>✅</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>

      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        {canViewInvoice && (
          <button type="button" onClick={() => navigate({ name: 'invoices' })} style={primaryBtnStyle()}>{A.viewInvoice}</button>
        )}
        <button type="button" onClick={() => navigate({ name: 'quote' })} style={canViewInvoice ? { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline', padding: 0 } : primaryBtnStyle()}>
          {A.back}
        </button>
      </div>
    </div>
  );
}

/* ── Simple title + body + single CTA layout (discuss / email-landing). ── */
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
