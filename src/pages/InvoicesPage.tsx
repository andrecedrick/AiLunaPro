/**
 * InvoicesPage — quote → accept → invoice flow.
 *
 * Authed, org-scoped (worker enforces membership). Members see their org's
 * invoices read-only; owners/admins can confirm a DRAFT (set the final amount →
 * status pending → the invoice-client email is sent to the customer). NO Stripe
 * execution yet — the payment link in the email is a placeholder. Invoices are
 * USD-denominated, so amounts render as plain $ (matches the worker + email).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { listInvoices, confirmInvoice, type InvoiceItem } from '../lib/quote/invoicesClient';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function InvoicesPage() {
  const { session } = useAuth();
  const T = useLocale();
  const I = T.invoices;
  const orgId = session?.orgId ?? '';
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';

  const [items, setItems] = useState<InvoiceItem[] | null>(null);
  const [error, setError] = useState(false);

  // Per-invoice confirm UI state.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let alive = true;
    setError(false); setItems(null);
    listInvoices(orgId)
      .then(list => { if (alive) setItems(list); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [orgId]);

  const statusLabel = (s: string): string =>
    s === 'draft' ? I.statusDraft : s === 'pending' ? I.statusPending : s === 'paid' ? I.statusPaid : s;
  const statusColor = (s: string): string =>
    s === 'paid' ? 'var(--green-text, #059669)' : s === 'pending' ? '#b45309' : 'var(--violet-text)';

  const amountText = (inv: InvoiceItem): string => {
    if (inv.amount != null) return usd(inv.amount);
    if (inv.rangeMinUsd != null && inv.rangeMaxUsd != null) return `${usd(inv.rangeMinUsd)} – ${usd(inv.rangeMaxUsd)}`;
    return I.amountPending;
  };
  const projectName = (inv: InvoiceItem): string =>
    inv.quoteTitle && inv.quoteTitle.trim() ? inv.quoteTitle : `${I.quoteLabel} · ${inv.quoteId}`;

  const openConfirm = (inv: InvoiceItem) => {
    setConfirmingId(inv.id);
    setConfirmError(false);
    setAmountInput(inv.rangeMaxUsd != null ? String(inv.rangeMaxUsd) : '');
  };

  const submitConfirm = async (inv: InvoiceItem) => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) { setConfirmError(true); return; }
    setConfirmBusy(true); setConfirmError(false);
    try {
      await confirmInvoice(orgId, inv.id, Math.round(amount));
      setItems(list => (list ?? []).map(x => x.id === inv.id ? { ...x, amount: Math.round(amount), status: 'pending' } : x));
      setSentId(inv.id);
      setConfirmingId(null);
    } catch {
      setConfirmError(true);
    } finally {
      setConfirmBusy(false);
    }
  };

  const card = (inv: InvoiceItem) => (
    <div key={inv.id} style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{projectName(inv)}</div>
          {inv.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{inv.customerEmail}</div>}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{inv.createdAt.slice(0, 10)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{amountText(inv)}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: statusColor(inv.status), background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' }}>{statusLabel(inv.status)}</span>
        </div>
      </div>

      {sentId === inv.id && (
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--green-text, #059669)' }}>{I.sent} ✅</div>
      )}

      {isAdmin && inv.status === 'draft' && sentId !== inv.id && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
          {confirmingId === inv.id ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{I.amountLabel}</label>
              <input type="number" inputMode="numeric" min={1} value={amountInput} onChange={e => setAmountInput(e.target.value)}
                style={{ width: 130, padding: '8px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)' }} />
              <button type="button" disabled={confirmBusy} onClick={() => void submitConfirm(inv)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: confirmBusy ? 'wait' : 'pointer', opacity: confirmBusy ? 0.6 : 1 }}>{confirmBusy ? '…' : I.confirmBtn}</button>
              <button type="button" disabled={confirmBusy} onClick={() => setConfirmingId(null)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{I.cancel}</button>
              {confirmError && <span style={{ fontSize: 12, color: 'var(--red-text)' }}>{I.confirmError}</span>}
            </div>
          ) : (
            <button type="button" onClick={() => openConfirm(inv)}
              style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{I.confirmSend}</button>
          )}
        </div>
      )}
    </div>
  );

  const drafts = (items ?? []).filter(i => i.status === 'draft');
  const rest = (items ?? []).filter(i => i.status !== 'draft');

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{I.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 20px' }}>{I.subtitle}</p>

      {error ? (
        <div style={{ padding: 18, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--red-text)', fontSize: 14 }}>{I.error}</div>
      ) : items === null ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', fontSize: 14 }}>{I.loading}</div>
      ) : items.length === 0 ? (
        <div style={{ padding: 28, borderRadius: 12, background: 'var(--surface)', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{I.empty}</div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {isAdmin && drafts.length > 0 && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>{I.pendingHeading}</div>
              {drafts.map(card)}
            </div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {(isAdmin ? rest : items).map(card)}
          </div>
        </div>
      )}
    </div>
  );
}
