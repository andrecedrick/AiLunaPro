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
import { listInvoices, listAllQuotes, listPlatformQuotes, patchQuote, resendInvoice, finalizeQuote, createInvoicePaymentLink, markInvoicePaid, downloadInvoicePdf, type InvoiceItem, type QuoteListItem, type PlatformInvoiceItem } from '../lib/quote/invoicesClient';
import { sendQuoteToClient } from '../lib/quote/quoteClient';
import { buildOrgActivity, buildPlatformActivity } from '../lib/quote/activityFeed';
import { TokenUsagePanel } from '../components/tokens/TokenUsagePanel';
import { TokenEconomyPanel } from '../components/tokens/TokenEconomyPanel';
import { ProductionAlertsPanel } from '../components/platform/ProductionAlertsPanel';
import { fetchAlertNotify, fetchPlatformSupport, fetchPlatformFeedback } from '../lib/platform/platformService';
import { CustomerFeedbackPanel } from '../components/platform/CustomerFeedbackPanel';
import { SupportInboxPanel } from '../components/platform/SupportInboxPanel';
import { DemoRequestsPanel } from '../components/platform/DemoRequestsPanel';

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
  const [done, setDone]       = useState<{ id: string; emailed: boolean; code?: string; detail?: string } | null>(null);
  const [resendId, setResendId] = useState<string | null>(null);
  const [govBusy, setGovBusy] = useState<string | null>(null);
  // FIX 3 — TRUE cross-org platform visibility (operators only).
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [platformQuotes, setPlatformQuotes] = useState<QuoteListItem[] | null>(null);
  const [platformInvoices, setPlatformInvoices] = useState<PlatformInvoiceItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Proactive alert signal — open critical count for the notification banner.
  const [alertNotify, setAlertNotify] = useState<{ openCritical: number; latestKind: string } | null>(null);
  // CS notification strip — open tickets, awaiting reply, feedback count.
  const [csStrip, setCsStrip] = useState<{ openTickets: number; awaiting: number; feedbacks: number } | null>(null);

  const orgAdmin = session?.role === 'owner' || session?.role === 'admin';
  useEffect(() => {
    let alive = true;
    // PERF — an org owner/admin is authorized SYNCHRONOUSLY from the session: grant
    // access + start the data fetches immediately instead of blocking a full
    // /api/platform/me round-trip (which now only elevates non-admin superadmins
    // and detects platform operators, in parallel).
    if (orgAdmin) setAllowed(true);
    fetchPlatformMe()
      .then(m => { if (alive) { setAllowed(m.isSuperAdmin || orgAdmin); setPlatformAdmin(m.isPlatformAdmin); } })
      .catch(() => { if (alive) setAllowed(orgAdmin); });
    return () => { alive = false; };
  }, [orgAdmin]);

  // Operators additionally get the cross-org lists (quotes + ALL invoices, read-only).
  useEffect(() => {
    if (!platformAdmin) return;
    let alive = true;
    // Notification signal — badge open critical alerts without opening the panel.
    fetchAlertNotify().then(n => { if (alive && n) setAlertNotify({ openCritical: n.openCritical, latestKind: n.latestKind }); }).catch(() => {});
    // CS strip counters — open tickets, awaiting reply, feedback count.
    Promise.all([fetchPlatformSupport(), fetchPlatformFeedback()]).then(([sup, fb]) => {
      if (alive) setCsStrip({ openTickets: sup?.open ?? 0, awaiting: sup?.awaiting ?? 0, feedbacks: fb?.total ?? 0 });
    }).catch(() => {});
    listPlatformQuotes()
      .then(d => { if (alive) { setPlatformQuotes(d.quotes); setPlatformInvoices(d.invoices); } })
      .catch(() => { if (alive) setPlatformQuotes([]); });
    return () => { alive = false; };
  }, [platformAdmin]);

  // Scroll to the panel a clicked notification points at. Runs on mount (fresh
  // navigation) AND on the notif-nav event (already on this page → same-route
  // navigate is a no-op, so the event is what triggers the scroll). Retries a few
  // times because panels mount lazily after their data loads.
  useEffect(() => {
    const go = () => {
      let sec: string | null = null;
      try { sec = sessionStorage.getItem('ailunapro:notif-section'); } catch { sec = null; }
      if (!sec) return;
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(sec!);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); try { sessionStorage.removeItem('ailunapro:notif-section'); } catch { /* noop */ } return; }
        if (tries++ < 20) setTimeout(tick, 150);
      };
      tick();
    };
    go();
    window.addEventListener('ailunapro:notif-nav', go);
    return () => window.removeEventListener('ailunapro:notif-nav', go);
  }, []);

  // PERF — targeted reloads: an action refetches only the list(s) it changed, not both.
  const reload = (which: 'quotes' | 'invoices' | 'all' = 'all') => {
    if (!orgId) return;
    setError(false);
    if (which !== 'quotes')   listInvoices(orgId).then(setItems).catch(() => { setItems([]); setError(true); });
    if (which !== 'invoices') listAllQuotes(orgId).then(setAllQuotes).catch(() => { setAllQuotes([]); setError(true); });
  };
  useEffect(() => { if (allowed) reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [allowed, orgId]);

  // Governance: block / suspend / re-activate (the ONLY admin control in the fixed-price model).
  const setGovState = async (quoteId: string, adminState: 'blocked' | 'suspended' | 'active') => {
    setGovBusy(quoteId);
    try { await patchQuote(orgId, quoteId, { adminState }); reload('quotes'); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // Re-send the PROPOSAL email to the client (stage → sent). Only before they respond.
  const sendQuote = async (q: QuoteListItem) => {
    if (!q.customerEmail) return;
    setGovBusy(q.quoteId);
    try { await sendQuoteToClient(orgId, q.quoteId, q.customerEmail, language); reload('quotes'); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // P4.1 recovery — an ACCEPTED quote whose auto-invoice never landed (accepted, no
  // payment-status joined) has no invoice: create it now (idempotent server-side).
  const acceptedNoInvoice = (q: QuoteListItem) =>
    !!q.decidedAt && !q.paymentStatus && q.adminState !== 'blocked' && q.adminState !== 'suspended';
  const recoverInvoice = async (q: QuoteListItem) => {
    setGovBusy(q.quoteId);
    try { await finalizeQuote(orgId, q.quoteId); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  const genPaymentLink = async (inv: InvoiceItem) => {
    setGovBusy(inv.id);
    try { const r = await createInvoicePaymentLink(orgId, inv.id); if (r.paymentUrl) window.open(r.paymentUrl, '_blank', 'noopener'); reload('invoices'); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // Bank-transfer only: admin confirms receipt (there is no Stripe webhook for these).
  const markPaid = async (inv: InvoiceItem) => {
    setGovBusy(inv.id);
    try { await markInvoicePaid(orgId, inv.id); reload(); }   // paid mirrors the quote stage → both lists
    catch { setError(true); } finally { setGovBusy(null); }
  };
  const resend = async (inv: InvoiceItem) => {
    setResendId(inv.id);
    try { const r = await resendInvoice(orgId, inv.id); setDone({ id: inv.id, emailed: r.emailed, code: r.code, detail: r.emailError }); }
    catch (e) { setDone({ id: inv.id, emailed: false, code: 'ERROR', detail: (e as Error)?.message }); } finally { setResendId(null); }
  };
  // FIX 2 — precise resend feedback: sent ✅ / no client email / send failed.
  const resendMsg = (d: { emailed: boolean; code?: string }): string =>
    d.emailed ? I.sent : d.code === 'NO_RECIPIENT' ? I.resendNoRecipient : I.sentNoEmail;

  const qTitle = (t: string | undefined, id: string) => t && t.trim() ? t : `${I.quoteLabel} · ${id.slice(0, 8)}`;
  const statusLabel = (s: string) => s === 'pending' ? I.statusPending : s === 'paid' ? I.statusPaid : s === 'awaiting_transfer' ? A.awaitingTransfer : s === 'draft' ? I.statusDraft : s;
  const payLabel = (s: string) => s === 'paid' ? A.paymentPaid : s === 'pending' ? A.paymentPending : A.paymentNone;
  const payColor = (s: string) => s === 'paid' ? 'var(--green-text, #059669)' : s === 'pending' ? '#b45309' : 'var(--text-muted)';

  // Activity feeds — derived by the PURE, TESTED activityFeed module (single source of
  // truth for both feeds; see src/lib/quote/activityFeed.ts + tests/unit/activityFeed).
  const feedDeps = { evtSent: A.evtSent, evtAccepted: A.evtAccepted, evtInvoiceSent: A.evtInvoiceSent, evtPaid: A.evtPaid, title: qTitle, usd };
  const events: Evt[] = buildOrgActivity(allQuotes, items, feedDeps);

  // Cross-org operator feed — same pure module (org shown per row).
  const platformEvents: Evt[] = buildPlatformActivity(platformQuotes, platformInvoices, feedDeps);

  // ADMIN sees EVERY invoice, drafts included (muted label) — nothing hidden. The
  // client-facing InvoicesPage keeps filtering legacy drafts.
  const invoiceList = items ?? [];

  if (allowed === null) return <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px', color: 'var(--text-muted)' }}>{I.loading}</div>;
  if (!allowed) return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden>🔒</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{A.restricted}</p>
    </div>
  );

  const section = (title: string, children: React.ReactNode, id?: string) => (
    <div id={id} style={{ display: 'grid', gap: 10, scrollMarginTop: 80 }}>
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
          {acceptedNoInvoice(q) && <span style={pill('#b45309')}>{A.invoicePending}</span>}
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
        {acceptedNoInvoice(q) && (
          <button type="button" disabled={govBusy === q.quoteId} onClick={() => void recoverInvoice(q)} style={govBtn('var(--violet)', '#fff')}>{govBusy === q.quoteId ? '…' : A.createInvoice}</button>
        )}
      </div>
    </div>
  );

  // FIX 3 — cross-org platform card: READ-ONLY (operators never govern a tenant quote).
  // Collapsed = title · client · org · payment · price; expand → the full record + payment.
  const platformCard = (q: QuoteListItem) => {
    const key = `${q.orgId}:${q.quoteId}`;
    const open = expanded === key;
    return (
      <div key={key} style={card}>
        <button type="button" onClick={() => setExpanded(open ? null : key)}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, width: '100%', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail || '—'} · <span style={{ color: 'var(--violet-text)', fontWeight: 700 }}>{q.orgId}</span></div>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={pill(payColor(q.paymentStatus))}>{payLabel(q.paymentStatus)}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={fieldLabel}>{A.priceLabel}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--violet-text)', fontVariantNumeric: 'tabular-nums' }}>{usd(q.price)}</div>
            </div>
            <span aria-hidden style={{ color: 'var(--text-muted)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
          </div>
        </button>
        {open && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {field(A.orgLabel, q.orgId || '—')}
            {field(A.quoteIdLabel, q.quoteId)}
            {field(A.uidLabel, q.createdBy || '—')}
            {field(A.sourceLabel, q.source || '—')}
            {field(A.currencyLabel, (q.currency || 'usd').toUpperCase())}
            {field(A.stripeIdLabel, q.stripePaymentId || '—')}
            {field(A.tlCreated, q.createdAt ? q.createdAt.slice(0, 10) : '—')}
            {field(A.tlAccepted, q.decidedAt ? q.decidedAt.slice(0, 10) : '—')}
            {field(A.paidLabel, q.paidAt ? q.paidAt.slice(0, 10) : '—')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 22px' }}>{A.subtitle}</p>

      {(
        // PERF — no whole-page gate: the shell paints immediately and each section
        // hydrates independently (activity/quotes/invoices show their own loading).
        <div style={{ display: 'grid', gap: 28 }}>
          {error && <div style={{ ...card, color: 'var(--red-text)', fontSize: 13.5 }}>{I.error}</div>}

          {/* 1 — Activity feed */}
          {section(A.activityHeading, items === null || allQuotes === null
            ? <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13.5 }}>{I.loading}</div>
            : events.length === 0
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

          {/* 2 — This org: every quote with full client + payment data (owner/admin scope) */}
          {section(A.orgQuotesHeading, allQuotes === null
            ? <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13.5 }}>{I.loading}</div>
            : allQuotes.length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.allQuotesEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{allQuotes.map(quoteCard)}</div>
          )}

          {/* 2b — TRUE cross-org platform visibility (platform operators only, read-only):
                 cross-org activity feed first, then every quote with payment data */}
          {platformAdmin && section(A.platformHeading, platformQuotes === null
            ? <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13.5 }}>{I.loading}</div>
            : platformQuotes.length === 0
              ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.platformEmpty}</div>
              : <div style={{ display: 'grid', gap: 10 }}>
                  {platformEvents.length > 0 && (
                    <div style={{ ...card, display: 'grid', gap: 0 }}>
                      {platformEvents.slice(0, 10).map((e, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i ? '1px solid var(--border)' : undefined }}>
                          <span aria-hidden style={{ flex: '0 0 auto' }}>{e.icon}</span>
                          <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>{e.label}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {e.title}{e.sub ? ` · ${e.sub}` : ''}</span>
                          <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontSize: 11.5, color: 'var(--text-muted)' }}>{(e.date || '').slice(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {platformQuotes.map(platformCard)}
                </div>
          )}

          {/* 3 — Invoices (re-send + payment link) */}
          {section(I.invoicesHeading, items === null
            ? <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13.5 }}>{I.loading}</div>
            : invoiceList.length === 0
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
                  {done?.id === inv.id && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: done.emailed ? 'var(--green-text, #059669)' : '#b45309' }}>{done.emailed ? '✅' : '⚠'} {resendMsg(done)}</div>
                      {!done.emailed && done.detail && (
                        <div style={{ marginTop: 4, fontSize: 11, fontFamily: 'ui-monospace, Consolas, monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{done.detail}</div>
                      )}
                    </div>
                  )}
                  {/* BUG 1 — a PAID invoice re-sends the payment CONFIRMATION (receipt);
                         unpaid keeps the pay-request resend + payment actions. */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" disabled={resendId === inv.id} onClick={() => void resend(inv)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12.5, cursor: resendId === inv.id ? 'wait' : 'pointer' }}>{resendId === inv.id ? '…' : inv.status === 'paid' ? I.resendConfirmationBtn : I.resendBtn}</button>
                    <button type="button" onClick={() => downloadInvoicePdf(orgId, inv.id).catch(() => setError(true))} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>{I.downloadPdf}</button>
                    {inv.status !== 'paid' && (inv.paymentMethod === 'bank_transfer'
                      ? <button type="button" disabled={govBusy === inv.id} onClick={() => void markPaid(inv)} style={govBtn('var(--green-text, #059669)', '#fff')}>{govBusy === inv.id ? '…' : A.markPaidBtn}</button>
                      : inv.paymentUrl
                        ? <button type="button" onClick={() => window.open(inv.paymentUrl as string, '_blank', 'noopener')} style={govBtn('var(--violet)', '#fff')}>{A.openPaymentLink}</button>
                        : <button type="button" disabled={govBusy === inv.id} onClick={() => void genPaymentLink(inv)} style={govBtnOutline}>{govBusy === inv.id ? '…' : A.genPaymentLink}</button>)}
                  </div>
                </div>
              ))}</div>
          )}
        </div>
      )}

      {/* Token Usage — org observability (balance, per-action rollup, event history). */}
      {section('Token Usage', <TokenUsagePanel orgId={orgId} />)}

      {/* Token Economy — cross-org aggregates, platform operators only. No PII. */}
      {platformAdmin && section('Token Economy', <TokenEconomyPanel />)}

      {/* CS notification strip — open tickets · awaiting reply · feedback (operators). */}
      {platformAdmin && csStrip && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {([
            ['Open tickets', csStrip.openTickets, csStrip.openTickets > 0 ? '#b45309' : undefined],
            ['Awaiting response', csStrip.awaiting, csStrip.awaiting > 0 ? '#b91c1c' : undefined],
            ['Feedback', csStrip.feedbacks, undefined],
          ] as const).map(([label, value, color]) => (
            <div key={label}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: color ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Proactive notification — open critical alerts, always visible to operators. */}
      {platformAdmin && alertNotify && alertNotify.openCritical > 0 && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid #b91c1c', background: 'rgba(185,28,28,0.08)', color: '#b91c1c', fontWeight: 700, fontSize: 13.5 }}>
          <span aria-hidden>⚠</span>
          {alertNotify.openCritical} open critical production alert{alertNotify.openCritical === 1 ? '' : 's'}
          {alertNotify.latestKind ? ` — latest: ${alertNotify.latestKind}` : ''}. See Production Alerts below.
        </div>
      )}

      {/* Production Alerts — durable billing/production alerts, operators only, read-only. */}
      {platformAdmin && section('Production Alerts', <ProductionAlertsPanel />, 'cs-alerts')}

      {/* Customer Feedback Center + Customer Signals + Luna Insights (deterministic). */}
      {platformAdmin && section('Customer Feedback Center', <CustomerFeedbackPanel />, 'cs-feedback')}

      {/* Support Inbox — read-only ticket queue with callback contact details. */}
      {platformAdmin && section('Support Inbox', <SupportInboxPanel />, 'cs-support')}

      {/* Demo Requests — commercial leads from the dashboard CTA. Was invisible. */}
      {platformAdmin && section('Demo Requests', <DemoRequestsPanel />, 'cs-demo')}
    </div>
  );
}
