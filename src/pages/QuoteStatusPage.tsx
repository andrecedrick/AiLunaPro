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
import { primaryBtnStyle } from '../components/ui-tools';
import { QuoteProgress } from '../components/QuoteProgress';
import { ENABLE_QUOTE_V2 } from '../lib/flags';
import { readQuotePayLink } from '../lib/quote/quoteClient';

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
            {payUrl ? S.payReady : ENABLE_QUOTE_V2 ? S.waitingActive : `⏳ ${S.waitingValidation}`}
          </div>
        </div>
      )}

      {/* Current-state badge */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text)', background: 'var(--brand-tint-bg, rgba(124,58,237,0.10))', borderRadius: 999, padding: '5px 14px' }}>{badgeLabel}</span>
      </div>

      <QuoteProgress active={activeStep} />

      {/* U1 — a payable quote skips the "an admin will confirm the amount" wait copy. */}
      {payUrl ? (
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
