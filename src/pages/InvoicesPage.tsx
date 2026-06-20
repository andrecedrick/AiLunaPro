/**
 * InvoicesPage (FIX 6) — minimal V1 listing of the org's invoices.
 *
 * Authed, org-scoped (worker enforces membership). Read-only: shows the draft
 * invoices opened when a client accepts a quote (and later pending/paid). No
 * payment, no Stripe, no edit actions yet.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useMoney } from '../lib/currency/useMoney';
import { listInvoices, type InvoiceItem } from '../lib/quote/invoicesClient';

export function InvoicesPage() {
  const { session } = useAuth();
  const T = useLocale();
  const money = useMoney();
  const I = T.invoices;
  const orgId = session?.orgId ?? '';

  const [items, setItems] = useState<InvoiceItem[] | null>(null);
  const [error, setError] = useState(false);

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
    if (inv.amount != null) return money.format(inv.amount);
    if (inv.rangeMinUsd != null && inv.rangeMaxUsd != null) return `${money.format(inv.rangeMinUsd)} – ${money.format(inv.rangeMaxUsd)}`;
    return I.amountPending;
  };

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
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{I.quoteLabel} · {inv.quoteId}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{inv.createdAt.slice(0, 10)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{amountText(inv)}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: statusColor(inv.status), background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' }}>{statusLabel(inv.status)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
