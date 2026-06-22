/**
 * MyQuotesPage — sender-side lifecycle tracking for the quotes you've sent.
 *
 * Authed, ORG-SCOPED (reuses GET /api/quote/list — membership-gated; owner/admin see
 * all org quotes, billing/member see only the quotes they created). Read-only: shows
 * each quote's proposed budget, lifecycle status, last activity, and — when the client
 * asked to negotiate — the discussion message + a clear next-step. No actions here
 * (pricing/finalise live in the Admin Center / Invoices panel). Presentational + one
 * fetch; no Stripe, no mutation.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useRoute } from '../context/RouteContext';
import { useMoney } from '../lib/currency/useMoney';
import { listAllQuotes, type QuoteListItem } from '../lib/quote/invoicesClient';

type Lifecycle = 'sent' | 'reviewing' | 'negotiation' | 'validated' | 'invoiced';

/** Map the persisted quote stage → the sender-facing lifecycle status. */
function lifecycle(stage: string): Lifecycle {
  if (stage === 'invoice_sent') return 'invoiced';
  if (stage === 'finalized') return 'validated';
  if (stage === 'negotiation') return 'negotiation';
  if (stage === 'client_responded') return 'reviewing';
  return 'sent';
}

const card = { padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' } as const;
const pillColor: Record<Lifecycle, string> = {
  sent: 'var(--text-muted)', reviewing: 'var(--violet-text)', negotiation: '#b45309',
  validated: 'var(--violet-text)', invoiced: 'var(--green-text, #059669)',
};

export function MyQuotesPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const M = T.myQuotes;
  const money = useMoney();
  const orgId = session?.orgId ?? '';

  const [items, setItems] = useState<QuoteListItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    let alive = true;
    setError(false);
    listAllQuotes(orgId).then(q => { if (alive) setItems(q); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [orgId]);

  const statusLabel: Record<Lifecycle, string> = {
    sent: M.statusSent, reviewing: M.statusReviewing, negotiation: M.statusNegotiation,
    validated: M.statusValidated, invoiced: M.statusInvoiced,
  };

  // Latest activity line (timestamp + what happened).
  const lastActivity = (q: QuoteListItem): { date: string; label: string } => {
    if (q.stage === 'invoice_sent' || q.stage === 'finalized') return { date: q.updatedAt || q.decidedAt, label: M.actInvoiced };
    if (q.decidedAt) return { date: q.decidedAt, label: q.decision === 'discussion' ? M.actChangesRequested : M.actAccepted };
    if (q.sentAt) return { date: q.sentAt, label: M.actSent };
    return { date: q.createdAt, label: M.actCreated };
  };

  const title = (q: QuoteListItem) => q.quoteTitle && q.quoteTitle.trim() ? q.quoteTitle : `${M.quoteLabel} · ${q.quoteId.slice(0, 8)}`;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{M.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 22px' }}>{M.subtitle}</p>

      {error ? (
        <div style={{ ...card, color: 'var(--red-text)' }}>{M.error}</div>
      ) : items === null ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', fontSize: 14 }}>{M.loading}</div>
      ) : items.length === 0 ? (
        <div style={{ ...card, borderStyle: 'dashed', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          <div style={{ marginBottom: 12 }}>{M.empty}</div>
          <button type="button" onClick={() => navigate({ name: 'quote' })} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{M.createCta}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(q => {
            const lc = lifecycle(q.stage);
            const act = lastActivity(q);
            return (
              <div key={q.quoteId} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title(q)}</div>
                    {q.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail}</div>}
                    {q.expectedBudgetUsd != null && (
                      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' }}>
                        {M.proposedBudget}
                        <span style={{ display: 'block', fontSize: 18, fontWeight: 800, textTransform: 'none', letterSpacing: 0, color: 'var(--violet-text)', marginTop: 1 }}>{money.format(q.expectedBudgetUsd)}</span>
                      </div>
                    )}
                  </div>
                  <span style={{ flex: '0 0 auto', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: pillColor[lc], background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' }}>{statusLabel[lc]}</span>
                </div>

                {/* Negotiation: the client's message + a clear sender next-step. */}
                {lc === 'negotiation' && (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--amber-soft-bg, #fef3c7)', border: '1px solid #f59e0b' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: q.message ? 4 : 0 }}>💬 {M.changesRequested}</div>
                    {q.message && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>“{q.message}”</div>}
                    <div style={{ marginTop: q.message ? 6 : 4, fontSize: 12, color: '#b45309' }}>→ {M.negotiationNextStep}</div>
                  </div>
                )}
                {lc === 'sent' && (
                  <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>⏳ {M.waitingResponse}</div>
                )}

                {/* Last activity (timestamp + action). */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{M.lastActivity}: {act.label}</span>
                  <span>{(act.date || '').slice(0, 10)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
