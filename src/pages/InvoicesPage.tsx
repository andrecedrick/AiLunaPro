/**
 * InvoicesPage — quote → response → admin pricing → invoice flow (state machine).
 *
 * Authed, org-scoped (worker enforces membership). Two surfaces:
 *  - Pricing queue (owner/admin) — quotes a client has responded to (accepted or
 *    negotiating) that await the final amount. Setting the amount FINALISES the
 *    quote: the invoice is created (the ONLY place that happens) and emailed to
 *    the client. No invoice exists before this point.
 *  - Invoices — finalised invoices (pending / paid). Drafts never appear (FIX 7).
 * USD-denominated, so amounts render as plain $ (matches the worker + email).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { listInvoices, listPendingQuotes, finalizeQuote, confirmInvoice, type InvoiceItem, type PendingQuote } from '../lib/quote/invoicesClient';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function InvoicesPage() {
  const { session } = useAuth();
  const T = useLocale();
  const I = T.invoices;
  const orgId = session?.orgId ?? '';
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';

  const [items, setItems]     = useState<InvoiceItem[] | null>(null);
  const [pending, setPending] = useState<PendingQuote[] | null>(null);
  const [error, setError]     = useState(false);

  // Per-quote pricing (finalise) UI state.
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [amountInput, setAmount]  = useState('');
  const [busy, setBusy]           = useState(false);
  const [formError, setFormError] = useState(false);
  const [done, setDone]           = useState<{ id: string; emailed: boolean } | null>(null);
  const [resendId, setResendId]   = useState<string | null>(null);

  const reload = () => {
    if (!orgId) return;
    setError(false);
    listInvoices(orgId).then(setItems).catch(() => setError(true));
    if (isAdmin) listPendingQuotes(orgId).then(setPending).catch(() => setError(true));
    else setPending([]);
  };
  useEffect(reload, [orgId, isAdmin]);

  const statusLabel = (s: string): string => s === 'pending' ? I.statusPending : s === 'paid' ? I.statusPaid : s;
  const statusColor = (s: string): string => s === 'paid' ? 'var(--green-text, #059669)' : '#b45309';

  const rangeText = (min: number | null, max: number | null): string =>
    min != null && max != null ? `${usd(min)} – ${usd(max)}` : I.amountPending;

  const openPricing = (q: PendingQuote) => {
    setActiveId(q.quoteId);
    setFormError(false);
    // Pre-fill with the range ceiling (or the client budget as a starting point).
    setAmount(q.rangeMaxUsd != null ? String(q.rangeMaxUsd) : q.expectedBudgetUsd != null ? String(q.expectedBudgetUsd) : '');
  };

  const submitPricing = async (q: PendingQuote) => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) { setFormError(true); return; }
    setBusy(true); setFormError(false);
    try {
      const r = await finalizeQuote(orgId, q.quoteId, Math.round(amount));
      setDone({ id: q.quoteId, emailed: r.emailed });
      setActiveId(null);
      // The quote leaves the queue and a new invoice appears — refresh both.
      reload();
    } catch {
      setFormError(true);
    } finally {
      setBusy(false);
    }
  };

  const resend = async (inv: InvoiceItem) => {
    if (inv.amount == null) return;
    setResendId(inv.id);
    try { const r = await confirmInvoice(orgId, inv.id, inv.amount); setDone({ id: inv.id, emailed: r.emailed }); }
    catch { setDone({ id: inv.id, emailed: false }); }
    finally { setResendId(null); }
  };

  /* ── Pricing-queue card (admin) ── */
  const queueCard = (q: PendingQuote) => {
    const negotiating = q.stage === 'negotiation';
    return (
      <div key={q.quoteId} style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{q.quoteTitle || `${I.quoteLabel} · ${q.quoteId.slice(0, 8)}`}</div>
            {q.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail}</div>}
            {q.expectedBudgetUsd != null && <div style={{ fontSize: 12, color: '#b45309', marginTop: 2, fontWeight: 600 }}>{I.clientBudget}: {usd(q.expectedBudgetUsd)}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{rangeText(q.rangeMinUsd, q.rangeMaxUsd)}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: negotiating ? '#b45309' : 'var(--violet-text)', background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' }}>
              {negotiating ? I.stageNegotiationLabel : I.stageAcceptedLabel}
            </span>
          </div>
        </div>

        {q.message && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2, var(--surface))', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>{I.clientMessageLabel}:</span> {q.message}
          </div>
        )}

        {/* FIX 6 — current stage + the next action are always explicit. */}
        <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>{negotiating ? I.nextNegotiation : I.nextAccepted}</div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
          {activeId === q.quoteId ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{I.amountLabel}</label>
              <input type="number" inputMode="numeric" min={1} value={amountInput} onChange={e => setAmount(e.target.value)}
                style={{ width: 130, padding: '8px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)' }} />
              <button type="button" disabled={busy} onClick={() => void submitPricing(q)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? '…' : I.finalizeBtn}</button>
              <button type="button" disabled={busy} onClick={() => setActiveId(null)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{I.cancel}</button>
              {formError && <span style={{ fontSize: 12, color: 'var(--red-text)' }}>{I.confirmError}</span>}
            </div>
          ) : (
            <button type="button" onClick={() => openPricing(q)}
              style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{I.finalizeBtn}</button>
          )}
        </div>
      </div>
    );
  };

  /* ── Finalised-invoice card ── */
  const invoiceCard = (inv: InvoiceItem) => (
    <div key={inv.id} style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{inv.quoteTitle && inv.quoteTitle.trim() ? inv.quoteTitle : `${I.quoteLabel} · ${inv.quoteId}`}</div>
          {inv.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{inv.customerEmail}</div>}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{inv.createdAt.slice(0, 10)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{inv.amount != null ? usd(inv.amount) : I.amountPending}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: statusColor(inv.status), background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' }}>{statusLabel(inv.status)}</span>
        </div>
      </div>

      {done?.id === inv.id && (
        done.emailed
          ? <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--green-text, #059669)' }}>✅ {I.sent}</div>
          : <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: '#b45309' }}>⚠ {I.sentNoEmail}</div>
      )}

      {isAdmin && inv.status === 'pending' && done?.id !== inv.id && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
          <button type="button" disabled={resendId === inv.id} onClick={() => void resend(inv)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12.5, cursor: resendId === inv.id ? 'wait' : 'pointer' }}>{resendId === inv.id ? '…' : I.resendBtn}</button>
        </div>
      )}
    </div>
  );

  // Finalised invoices only — drafts (legacy) never shown (FIX 7).
  const invoiceList = (items ?? []).filter(i => i.status !== 'draft');

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{I.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 20px' }}>{I.subtitle}</p>

      {error ? (
        <div style={{ padding: 18, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--red-text)', fontSize: 14 }}>{I.error}</div>
      ) : items === null ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', fontSize: 14 }}>{I.loading}</div>
      ) : (
        <div style={{ display: 'grid', gap: 26 }}>
          {/* Pricing queue (admin) */}
          {isAdmin && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{I.queueHeading}</div>
              {(pending ?? []).length === 0
                ? <div style={{ padding: 18, borderRadius: 12, background: 'var(--surface)', border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13.5 }}>{I.queueEmpty}</div>
                : (pending ?? []).map(queueCard)}
            </div>
          )}

          {/* Finalised invoices */}
          <div style={{ display: 'grid', gap: 10 }}>
            {isAdmin && <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{I.invoicesHeading}</div>}
            {invoiceList.length === 0
              ? <div style={{ padding: 28, borderRadius: 12, background: 'var(--surface)', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{I.empty}</div>
              : invoiceList.map(invoiceCard)}
          </div>
        </div>
      )}
    </div>
  );
}
