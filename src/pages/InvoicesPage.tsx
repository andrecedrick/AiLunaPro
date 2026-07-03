/**
 * InvoicesPage — read-only invoices for the fixed-price quote → accept → pay flow.
 *
 * Authed, org-scoped (worker enforces membership). Fixed-price model: there is NO admin
 * pricing step — an invoice is born automatically when the client accepts, at the
 * quote's LOCKED price. This page just LISTS invoices (pending / paid) and lets an admin
 * re-send a pending invoice (never re-amount). USD-denominated (matches worker + email).
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { listInvoices, resendInvoice, type InvoiceItem } from '../lib/quote/invoicesClient';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

// Deep-link target from the email CTAs: #/invoices?invoiceId=… or ?quoteId=…
function hashFocus(): { invoiceId: string; quoteId: string } {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  const dec = (s: string): string => { try { return decodeURIComponent(s); } catch { return ''; } };
  const inv = /[?&]invoiceId=([^&]+)/.exec(h);
  const q = /[?&]quoteId=([^&]+)/.exec(h);
  return { invoiceId: inv ? dec(inv[1]) : '', quoteId: q ? dec(q[1]) : '' };
}
const focusRing = '0 0 0 2px var(--violet)';

export function InvoicesPage() {
  const { session } = useAuth();
  const T = useLocale();
  const I = T.invoices;
  const orgId = session?.orgId ?? '';
  const isAdmin = session?.role === 'owner' || session?.role === 'admin';

  const [items, setItems]     = useState<InvoiceItem[] | null>(null);
  const [error, setError]     = useState(false);
  const [done, setDone]       = useState<{ id: string; emailed: boolean } | null>(null);
  const [resendId, setResendId] = useState<string | null>(null);
  const [focus] = useState(hashFocus);   // deep-link target from the email CTA (captured at mount)
  const focused = useRef(false);          // one-shot: don't re-scroll on reload()
  // An invoice id is `quote_<quoteId>`; a ?quoteId= deep-link maps to that invoice.
  const focusQuoteId = focus.quoteId || (focus.invoiceId.startsWith('quote_') ? focus.invoiceId.slice('quote_'.length) : '');
  const hasFocus = !!(focus.invoiceId || focus.quoteId);
  const isInvoiceFocused = (inv: InvoiceItem) =>
    (!!focus.invoiceId && inv.id === focus.invoiceId) ||
    (!!focusQuoteId && (inv.quoteId === focusQuoteId || inv.id === `quote_${focusQuoteId}`));

  const reload = () => {
    if (!orgId) return;
    setError(false);
    listInvoices(orgId).then(setItems).catch(() => setError(true));
  };
  useEffect(reload, [orgId]);

  const statusLabel = (s: string): string => s === 'pending' ? I.statusPending : s === 'paid' ? I.statusPaid : s;
  const statusColor = (s: string): string => s === 'paid' ? 'var(--green-text, #059669)' : '#b45309';

  // Deep-link focus: scroll to the targeted invoice once, after paint.
  useEffect(() => {
    if (focused.current || !hasFocus || items === null) return;
    const esc = (s: string) => s.replace(/["\\]/g, '');
    const parts: string[] = [];
    if (focus.invoiceId) parts.push(`[data-focus-invoice="${esc(focus.invoiceId)}"]`);
    if (focusQuoteId) parts.push(`[data-focus-quoteof="${esc(focusQuoteId)}"]`);
    const raf = requestAnimationFrame(() => {
      const el = parts.length && typeof document !== 'undefined' ? document.querySelector(parts.join(', ')) : null;
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); focused.current = true; }
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const resend = async (inv: InvoiceItem) => {
    setResendId(inv.id);
    try { const r = await resendInvoice(orgId, inv.id); setDone({ id: inv.id, emailed: r.emailed }); }
    catch { setDone({ id: inv.id, emailed: false }); }
    finally { setResendId(null); }
  };

  /* ── Invoice card ── */
  const invoiceCard = (inv: InvoiceItem) => {
    const isFocused = isInvoiceFocused(inv);
    return (
    <div key={inv.id} data-focus-invoice={inv.id} data-focus-quoteof={inv.quoteId} style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: isFocused ? focusRing : undefined }}>
      {isFocused && <div style={{ marginBottom: 10, fontSize: 12, fontWeight: 700, color: 'var(--violet-text)' }}>📧 {I.fromEmail}</div>}
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
  };

  // Finalised invoices only — drafts (legacy) never shown.
  const invoiceList = (items ?? []).filter(i => i.status !== 'draft');
  const focusMatched = invoiceList.some(isInvoiceFocused);
  const focusNotFound = hasFocus && items !== null && !focusMatched && invoiceList.length === 0;

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
          {focusNotFound && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--amber-soft-bg, #fef3c7)', border: '1px solid #f59e0b', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>⚠ {I.notFound}</div>
          )}

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
