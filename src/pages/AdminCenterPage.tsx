/**
 * AdminCenterPage — super-admin control center for the quote → invoice flow.
 *
 * ORG-SCOPED (current organization only — reuses the existing membership-gated
 * endpoints; no cross-tenant access). Gated by isSuperAdmin (GET /api/platform/me:
 * email in ADMIN_EMAILS or PLATFORM_ADMIN_EMAILS). One place to monitor activity,
 * track client discussions, set the final price (finalise), and re-send invoices.
 * No backend logic / state-machine change — actions reuse the existing endpoints.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useRoute } from '../context/RouteContext';
import { fetchPlatformMe } from '../lib/platform/platformService';
import { listInvoices, listPendingQuotes, finalizeQuote, confirmInvoice, type InvoiceItem, type PendingQuote } from '../lib/quote/invoicesClient';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const card = { padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' } as const;
const heading = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' } as const;
const pill = (color: string) => ({ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color, background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' } as const);

interface Evt { icon: string; label: string; title: string; date: string; sub?: string }

export function AdminCenterPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const I = T.invoices;
  const A = T.adminCenter;
  const orgId = session?.orgId ?? '';

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems]     = useState<InvoiceItem[] | null>(null);
  const [pending, setPending] = useState<PendingQuote[] | null>(null);
  const [error, setError]     = useState(false);

  const [activeId, setActiveId]   = useState<string | null>(null);
  const [amountInput, setAmount]  = useState('');
  const [busy, setBusy]           = useState(false);
  const [formError, setFormError] = useState(false);
  const [done, setDone]           = useState<{ id: string; emailed: boolean } | null>(null);
  const [resendId, setResendId]   = useState<string | null>(null);

  useEffect(() => { fetchPlatformMe().then(m => setAllowed(m.isSuperAdmin)).catch(() => setAllowed(false)); }, []);

  const reload = () => {
    if (!orgId) return;
    setError(false);
    listInvoices(orgId).then(setItems).catch(() => setError(true));
    listPendingQuotes(orgId).then(setPending).catch(() => setError(true));
  };
  useEffect(() => { if (allowed) reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [allowed, orgId]);

  const openPricing = (q: PendingQuote) => {
    setActiveId(q.quoteId); setFormError(false);
    setAmount(q.rangeMaxUsd != null ? String(q.rangeMaxUsd) : q.expectedBudgetUsd != null ? String(q.expectedBudgetUsd) : '');
  };
  const submitPricing = async (q: PendingQuote) => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) { setFormError(true); return; }
    setBusy(true); setFormError(false);
    try { const r = await finalizeQuote(orgId, q.quoteId, Math.round(amount)); setDone({ id: q.quoteId, emailed: r.emailed }); setActiveId(null); reload(); }
    catch { setFormError(true); } finally { setBusy(false); }
  };
  const resend = async (inv: InvoiceItem) => {
    if (inv.amount == null) return;
    setResendId(inv.id);
    try { const r = await confirmInvoice(orgId, inv.id, inv.amount); setDone({ id: inv.id, emailed: r.emailed }); }
    catch { setDone({ id: inv.id, emailed: false }); } finally { setResendId(null); }
  };

  const qTitle = (t: string | undefined, id: string) => t && t.trim() ? t : `${I.quoteLabel} · ${id.slice(0, 8)}`;
  const statusLabel = (s: string) => s === 'pending' ? I.statusPending : s === 'paid' ? I.statusPaid : s;

  // ── Derived activity feed (no backend — built from the org's quotes + invoices). ──
  const events: Evt[] = [];
  for (const q of pending ?? []) {
    const title = qTitle(q.quoteTitle, q.quoteId);
    if (q.decision === 'discussion') events.push({ icon: '💬', label: A.evtAdjustment, title, date: q.decidedAt, sub: q.expectedBudgetUsd != null ? `${I.clientBudget}: ${usd(q.expectedBudgetUsd)}` : undefined });
    else events.push({ icon: '✅', label: A.evtAccepted, title, date: q.decidedAt });
  }
  for (const inv of items ?? []) {
    if (inv.status === 'draft') continue;
    const title = qTitle(inv.quoteTitle, inv.quoteId);
    events.push(inv.status === 'paid'
      ? { icon: '💰', label: A.evtPaid, title, date: inv.createdAt, sub: inv.amount != null ? usd(inv.amount) : undefined }
      : { icon: '📧', label: A.evtInvoiceSent, title, date: inv.createdAt, sub: inv.amount != null ? usd(inv.amount) : undefined });
  }
  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const discussions = (pending ?? []).filter(q => q.message);
  const invoiceList = (items ?? []).filter(i => i.status !== 'draft');

  if (allowed === null) return <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px', color: 'var(--text-muted)' }}>{I.loading}</div>;
  if (!allowed) return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden>🔒</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{A.restricted}</p>
    </div>
  );

  const queueCard = (q: PendingQuote) => (
    <div key={q.quoteId} style={card}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
          {q.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail}</div>}
          {q.expectedBudgetUsd != null && <div style={{ fontSize: 12, color: '#b45309', marginTop: 2, fontWeight: 600 }}>{I.clientBudget}: {usd(q.expectedBudgetUsd)}</div>}
        </div>
        <span style={pill(q.stage === 'negotiation' ? '#b45309' : 'var(--violet-text)')}>{q.stage === 'negotiation' ? I.stageNegotiationLabel : I.stageAcceptedLabel}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>{q.stage === 'negotiation' ? I.nextNegotiation : I.nextAccepted}</div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {activeId === q.quoteId ? (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{I.amountLabel}</label>
            <input type="number" inputMode="numeric" min={1} value={amountInput} onChange={e => setAmount(e.target.value)} style={{ width: 130, padding: '8px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)' }} />
            <button type="button" disabled={busy} onClick={() => void submitPricing(q)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? '…' : I.finalizeBtn}</button>
            <button type="button" disabled={busy} onClick={() => setActiveId(null)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{I.cancel}</button>
            {formError && <span style={{ fontSize: 12, color: 'var(--red-text)' }}>{I.confirmError}</span>}
          </>
        ) : (
          <>
            <button type="button" onClick={() => openPricing(q)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{I.finalizeBtn}</button>
            <button type="button" onClick={() => navigate({ name: 'invoices', quoteId: q.quoteId })} style={{ background: 'none', border: 'none', color: 'var(--violet-text)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, textDecoration: 'underline' }}>{I.invoicesHeading}</button>
          </>
        )}
      </div>
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={heading}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 22px' }}>{A.subtitle}</p>

      {error ? (
        <div style={{ ...card, color: 'var(--red-text)' }}>{I.error}</div>
      ) : items === null || pending === null ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', fontSize: 14 }}>{I.loading}</div>
      ) : (
        <div style={{ display: 'grid', gap: 28 }}>
          {/* 1 — Activity feed */}
          {section(A.activityHeading, events.length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.activityEmpty}</div>
            : <div style={{ ...card, display: 'grid', gap: 0 }}>
                {events.slice(0, 10).map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i ? '1px solid var(--border)' : undefined }}>
                    <span aria-hidden style={{ flex: '0 0 auto' }}>{e.icon}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>{e.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {e.title}{e.sub ? ` · ${e.sub}` : ''}</span>
                    <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontSize: 11.5, color: 'var(--text-muted)' }}>{(e.date || '').slice(0, 10)}</span>
                  </div>
                ))}
              </div>
          )}

          {/* 2 — Pricing queue + actions */}
          {section(I.queueHeading, (pending ?? []).length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{I.queueEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{(pending ?? []).map(queueCard)}</div>
          )}

          {/* 3 — Client discussions */}
          {section(A.discussionsHeading, discussions.length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.discussionsEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{discussions.map(q => (
                <div key={q.quoteId} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
                    {q.expectedBudgetUsd != null && <span style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>{I.clientBudget}: {usd(q.expectedBudgetUsd)}</span>}
                  </div>
                  <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2, var(--surface))', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>“{q.message}”</div>
                  {q.customerEmail && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{A.contextLabel}: {q.customerEmail}</div>}
                </div>
              ))}</div>
          )}

          {/* 4 — Invoices */}
          {section(I.invoicesHeading, invoiceList.length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{I.empty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{invoiceList.map(inv => (
                <div key={inv.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(inv.quoteTitle, inv.quoteId)}</div>
                      {inv.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{inv.customerEmail}</div>}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{inv.createdAt.slice(0, 10)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{inv.amount != null ? usd(inv.amount) : I.amountPending}</span>
                      <span style={pill(inv.status === 'paid' ? 'var(--green-text, #059669)' : '#b45309')}>{statusLabel(inv.status)}</span>
                    </div>
                  </div>
                  {done?.id === inv.id && (done.emailed
                    ? <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--green-text, #059669)' }}>✅ {I.sent}</div>
                    : <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: '#b45309' }}>⚠ {I.sentNoEmail}</div>)}
                  {inv.status === 'pending' && done?.id !== inv.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                      <button type="button" disabled={resendId === inv.id} onClick={() => void resend(inv)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12.5, cursor: resendId === inv.id ? 'wait' : 'pointer' }}>{resendId === inv.id ? '…' : I.resendBtn}</button>
                    </div>
                  )}
                </div>
              ))}</div>
          )}
        </div>
      )}
    </div>
  );
}
