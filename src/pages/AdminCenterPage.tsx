/**
 * AdminCenterPage — superadmin visibility + governance for the fixed-price quote flow.
 *
 * ORG-SCOPED (current organization only — membership-gated endpoints; no cross-tenant).
 * Gated by isSuperAdmin (GET /api/platform/me: email in ADMIN_EMAILS / PLATFORM_ADMIN_
 * EMAILS) OR an org owner/admin. Fixed-price model: there is NO admin pricing / finalize /
 * negotiation. This is a read-only VISIBILITY panel (client, uid, price, currency,
 * payment status, Stripe id, timestamps) plus block/suspend governance + invoice re-send.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { usePreferences } from '../context/PreferencesContext';
import { fetchPlatformMe } from '../lib/platform/platformService';
import { listInvoices, listAllQuotes, patchQuote, resendInvoice, createInvoicePaymentLink, markInvoicePaid, type InvoiceItem, type QuoteListItem } from '../lib/quote/invoicesClient';
import { sendQuoteToClient } from '../lib/quote/quoteClient';

const usd = (n: number | null) => n != null ? `$${Math.round(n).toLocaleString('en-US')}` : '—';
const card = { padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' } as const;
const heading = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' } as const;
const pill = (color: string) => ({ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color, background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' } as const);
const govBtn = (bg: string, fg: string) => ({ padding: '7px 14px', borderRadius: 8, border: 'none', background: bg, color: fg, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' } as const);
const govBtnOutline = { padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' } as const;
const fieldLabel = { fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' } as const;
const fieldValue = { fontSize: 12.5, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all' } as const;

interface Evt { icon: string; label: string; title: string; date: string; sub?: string }

export function AdminCenterPage() {
  const { session } = useAuth();
  const T = useLocale();
  const { language } = usePreferences();
  const I = T.invoices;
  const A = T.adminCenter;
  const orgId = session?.orgId ?? '';

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems]     = useState<InvoiceItem[] | null>(null);
  const [allQuotes, setAllQuotes] = useState<QuoteListItem[] | null>(null);
  const [error, setError]     = useState(false);
  const [done, setDone]       = useState<{ id: string; emailed: boolean } | null>(null);
  const [resendId, setResendId] = useState<string | null>(null);
  const [govBusy, setGovBusy] = useState<string | null>(null);

  const orgAdmin = session?.role === 'owner' || session?.role === 'admin';
  useEffect(() => {
    let alive = true;
    fetchPlatformMe()
      .then(m => { if (alive) setAllowed(m.isSuperAdmin || orgAdmin); })
      .catch(() => { if (alive) setAllowed(orgAdmin); });
    return () => { alive = false; };
  }, [orgAdmin]);

  const reload = () => {
    if (!orgId) return;
    setError(false);
    listInvoices(orgId).then(setItems).catch(() => { setItems([]); setError(true); });
    listAllQuotes(orgId).then(setAllQuotes).catch(() => { setAllQuotes([]); setError(true); });
  };
  useEffect(() => { if (allowed) reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [allowed, orgId]);

  // Governance: block / suspend / re-activate (the ONLY admin control in the fixed-price model).
  const setGovState = async (quoteId: string, adminState: 'blocked' | 'suspended' | 'active') => {
    setGovBusy(quoteId);
    try { await patchQuote(orgId, quoteId, { adminState }); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // Re-send the PROPOSAL email to the client (stage → sent). Only before they respond.
  const sendQuote = async (q: QuoteListItem) => {
    if (!q.customerEmail) return;
    setGovBusy(q.quoteId);
    try { await sendQuoteToClient(orgId, q.quoteId, q.customerEmail, language); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  const genPaymentLink = async (inv: InvoiceItem) => {
    setGovBusy(inv.id);
    try { const r = await createInvoicePaymentLink(orgId, inv.id); if (r.paymentUrl) window.open(r.paymentUrl, '_blank', 'noopener'); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // Bank-transfer only: admin confirms receipt (there is no Stripe webhook for these).
  const markPaid = async (inv: InvoiceItem) => {
    setGovBusy(inv.id);
    try { await markInvoicePaid(orgId, inv.id); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  const resend = async (inv: InvoiceItem) => {
    setResendId(inv.id);
    try { const r = await resendInvoice(orgId, inv.id); setDone({ id: inv.id, emailed: r.emailed }); }
    catch { setDone({ id: inv.id, emailed: false }); } finally { setResendId(null); }
  };

  const qTitle = (t: string | undefined, id: string) => t && t.trim() ? t : `${I.quoteLabel} · ${id.slice(0, 8)}`;
  const statusLabel = (s: string) => s === 'pending' ? I.statusPending : s === 'paid' ? I.statusPaid : s === 'awaiting_transfer' ? A.awaitingTransfer : s;
  const payLabel = (s: string) => s === 'paid' ? A.paymentPaid : s === 'pending' ? A.paymentPending : A.paymentNone;
  const payColor = (s: string) => s === 'paid' ? 'var(--green-text, #059669)' : s === 'pending' ? '#b45309' : 'var(--text-muted)';

  // Activity feed (built from accepted quotes + invoices — no negotiation/pending).
  const events: Evt[] = [];
  for (const q of allQuotes ?? []) {
    if (!q.decidedAt) continue;
    events.push({ icon: '✅', label: A.evtAccepted, title: qTitle(q.quoteTitle, q.quoteId), date: q.decidedAt, sub: q.price != null ? usd(q.price) : undefined });
  }
  for (const inv of items ?? []) {
    if (inv.status === 'draft') continue;
    events.push(inv.status === 'paid'
      ? { icon: '💰', label: A.evtPaid, title: qTitle(inv.quoteTitle, inv.quoteId), date: inv.createdAt, sub: usd(inv.amount) }
      : { icon: '📧', label: A.evtInvoiceSent, title: qTitle(inv.quoteTitle, inv.quoteId), date: inv.createdAt, sub: usd(inv.amount) });
  }
  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const invoiceList = (items ?? []).filter(i => i.status !== 'draft');

  if (allowed === null) return <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px', color: 'var(--text-muted)' }}>{I.loading}</div>;
  if (!allowed) return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden>🔒</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{A.restricted}</p>
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={heading}>{title}</div>
      {children}
    </div>
  );

  const field = (label: string, value: string) => (
    <div style={{ minWidth: 0 }}><div style={fieldLabel}>{label}</div><div style={fieldValue}>{value}</div></div>
  );

  // PART 3 — full superadmin visibility card: all real client + payment data per quote.
  const quoteCard = (q: QuoteListItem) => (
    <div key={q.quoteId} style={card}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail || '—'}</div>
        </div>
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {q.adminState === 'blocked' && <span style={pill('var(--red-text)')}>{A.blocked}</span>}
          {q.adminState === 'suspended' && <span style={pill('#b45309')}>{A.suspended}</span>}
          <span style={pill(payColor(q.paymentStatus))}>{payLabel(q.paymentStatus)}</span>
          <div style={{ textAlign: 'right' }}>
            <div style={fieldLabel}>{A.priceLabel}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--violet-text)', fontVariantNumeric: 'tabular-nums' }}>{usd(q.price)}</div>
          </div>
        </div>
      </div>

      {/* Full record — every already-captured field (no IP capture). */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {field(A.quoteIdLabel, q.quoteId)}
        {field(A.uidLabel, q.createdBy || '—')}
        {field(A.orgLabel, q.orgId || '—')}
        {field(A.sourceLabel, q.source || '—')}
        {field(A.currencyLabel, (q.currency || 'usd').toUpperCase())}
        {field(A.stripeIdLabel, q.stripePaymentId || '—')}
        {field(A.tlCreated, q.createdAt ? q.createdAt.slice(0, 10) : '—')}
        {field(A.tlAccepted, q.decidedAt ? q.decidedAt.slice(0, 10) : '—')}
        {field(A.paidLabel, q.paidAt ? q.paidAt.slice(0, 10) : '—')}
      </div>

      {/* Governance: block / suspend / re-activate + re-send the proposal (pre-response). */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {q.adminState === 'blocked' || q.adminState === 'suspended' ? (
          <button type="button" disabled={govBusy === q.quoteId} onClick={() => void setGovState(q.quoteId, 'active')} style={govBtn('var(--green-text, #059669)', '#fff')}>{govBusy === q.quoteId ? '…' : A.reactivate}</button>
        ) : (
          <>
            <button type="button" disabled={govBusy === q.quoteId} onClick={() => void setGovState(q.quoteId, 'suspended')} style={govBtnOutline}>{A.suspend}</button>
            <button type="button" disabled={govBusy === q.quoteId} onClick={() => void setGovState(q.quoteId, 'blocked')} style={govBtn('var(--red-text)', '#fff')}>{A.block}</button>
          </>
        )}
        {q.customerEmail && !q.decidedAt && q.stage !== 'invoice_sent' && q.stage !== 'finalized' && q.adminState !== 'blocked' && q.adminState !== 'suspended' && (
          <button type="button" disabled={govBusy === q.quoteId} onClick={() => void sendQuote(q)} style={govBtn('var(--violet)', '#fff')}>{govBusy === q.quoteId ? '…' : A.sendQuote}</button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 22px' }}>{A.subtitle}</p>

      {items === null || allQuotes === null ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', fontSize: 14 }}>{I.loading}</div>
      ) : (
        <div style={{ display: 'grid', gap: 28 }}>
          {error && <div style={{ ...card, color: 'var(--red-text)', fontSize: 13.5 }}>{I.error}</div>}

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

          {/* 2 — Superadmin visibility: every quote with full client + payment data */}
          {section(A.superadminHeading, (allQuotes ?? []).length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.allQuotesEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{(allQuotes ?? []).map(quoteCard)}</div>
          )}

          {/* 3 — Invoices (re-send + payment link) */}
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
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{usd(inv.amount)}</span>
                      <span style={pill(inv.status === 'paid' ? 'var(--green-text, #059669)' : '#b45309')}>{statusLabel(inv.status)}</span>
                    </div>
                  </div>
                  {done?.id === inv.id && (done.emailed
                    ? <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--green-text, #059669)' }}>✅ {I.sent}</div>
                    : <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: '#b45309' }}>⚠ {I.sentNoEmail}</div>)}
                  {inv.status !== 'paid' && done?.id !== inv.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" disabled={resendId === inv.id} onClick={() => void resend(inv)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12.5, cursor: resendId === inv.id ? 'wait' : 'pointer' }}>{resendId === inv.id ? '…' : I.resendBtn}</button>
                      {inv.paymentMethod === 'bank_transfer'
                        ? <button type="button" disabled={govBusy === inv.id} onClick={() => void markPaid(inv)} style={govBtn('var(--green-text, #059669)', '#fff')}>{govBusy === inv.id ? '…' : A.markPaidBtn}</button>
                        : inv.paymentUrl
                          ? <button type="button" onClick={() => window.open(inv.paymentUrl as string, '_blank', 'noopener')} style={govBtn('var(--violet)', '#fff')}>{A.openPaymentLink}</button>
                          : <button type="button" disabled={govBusy === inv.id} onClick={() => void genPaymentLink(inv)} style={govBtnOutline}>{govBusy === inv.id ? '…' : A.genPaymentLink}</button>}
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
