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
import { useMoney } from '../lib/currency/useMoney';
import { usePreferences } from '../context/PreferencesContext';
import { fetchPlatformMe } from '../lib/platform/platformService';
import { listInvoices, listPendingQuotes, listAllQuotes, finalizeQuote, confirmInvoice, patchQuote, prefillFinalizeAmount, createInvoicePaymentLink, type InvoiceItem, type PendingQuote, type QuoteListItem } from '../lib/quote/invoicesClient';
import { sendQuoteToClient } from '../lib/quote/quoteClient';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const card = { padding: '14px 18px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' } as const;
const heading = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' } as const;
const pill = (color: string) => ({ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color, background: 'rgba(124,58,237,0.08)', borderRadius: 999, padding: '4px 11px' } as const);
const govBtn = (bg: string, fg: string) => ({ padding: '7px 14px', borderRadius: 8, border: 'none', background: bg, color: fg, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' } as const);
const govBtnOutline = { padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' } as const;

interface Evt { icon: string; label: string; title: string; date: string; sub?: string }

export function AdminCenterPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const money = useMoney();
  const { language } = usePreferences();
  const I = T.invoices;
  const A = T.adminCenter;
  const orgId = session?.orgId ?? '';

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems]     = useState<InvoiceItem[] | null>(null);
  const [pending, setPending] = useState<PendingQuote[] | null>(null);
  const [allQuotes, setAllQuotes] = useState<QuoteListItem[] | null>(null);
  const [error, setError]     = useState(false);

  const [activeId, setActiveId]   = useState<string | null>(null);
  const [amountInput, setAmount]  = useState('');
  const [busy, setBusy]           = useState(false);
  const [formError, setFormError] = useState(false);
  const [done, setDone]           = useState<{ id: string; emailed: boolean } | null>(null);
  const [resendId, setResendId]   = useState<string | null>(null);
  // ISSUE 3 — admin governance (edit budget / block / suspend).
  const [govBusy, setGovBusy]     = useState<string | null>(null);
  const [editId, setEditId]       = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState('');

  // ISSUE 1 — the Admin Center is ORG-SCOPED, so an org owner/admin may always see
  // their own org's center (its data endpoints are already owner/admin role-gated
  // server-side). Platform super-admins (ADMIN_EMAILS / PLATFORM_ADMIN_EMAILS) too.
  // Never block a valid org admin even if /api/platform/me fails.
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
    // Decoupled loads — a failure in one (e.g. invoices) sets that list to [] + a soft
    // banner, but must NEVER blank the others. The "All quotes" list always renders if
    // it loaded, even when invoices/pending error out (no silent admin-visibility loss).
    listInvoices(orgId).then(setItems).catch(() => { setItems([]); setError(true); });
    listPendingQuotes(orgId).then(setPending).catch(() => { setPending([]); setError(true); });
    listAllQuotes(orgId).then(setAllQuotes).catch(() => { setAllQuotes([]); setError(true); });
  };
  useEffect(() => { if (allowed) reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [allowed, orgId]);

  const openPricing = (q: PendingQuote) => {
    setActiveId(q.quoteId); setFormError(false);
    // ISSUE 1 — default the invoice amount to the client's PROPOSED BUDGET (so the
    // invoice matches the budget), not the estimate ceiling.
    setAmount(prefillFinalizeAmount(q));
  };
  const submitPricing = async (q: PendingQuote) => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) { setFormError(true); return; }
    setBusy(true); setFormError(false);
    try { const r = await finalizeQuote(orgId, q.quoteId, Math.round(amount)); setDone({ id: q.quoteId, emailed: r.emailed }); setActiveId(null); reload(); }
    catch { setFormError(true); } finally { setBusy(false); }
  };
  // ISSUE 3 — governance: block / suspend / re-activate, and edit the proposed budget.
  const setGovState = async (quoteId: string, adminState: 'blocked' | 'suspended' | 'active') => {
    setGovBusy(quoteId);
    try { await patchQuote(orgId, quoteId, { adminState }); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  const openEditBudget = (q: QuoteListItem) => { setEditId(q.quoteId); setEditBudget(q.expectedBudgetUsd != null ? String(q.expectedBudgetUsd) : ''); };
  const saveBudget = async (quoteId: string) => {
    const n = Number(editBudget);
    if (!Number.isFinite(n) || n < 0) return;
    setGovBusy(quoteId);
    try { await patchQuote(orgId, quoteId, { expectedBudgetUsd: Math.round(n) }); setEditId(null); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // ISSUE 5 — (re)send the proposal email to the client (stage → sent).
  const sendQuote = async (q: QuoteListItem) => {
    if (!q.customerEmail) return;
    setGovBusy(q.quoteId);
    try { await sendQuoteToClient(orgId, q.quoteId, q.customerEmail, language); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // ISSUE 7 — fast-track: finalise straight to an invoice at the proposed budget
  // (skips discussion). finalize creates the invoice + payment link + sends it.
  const sendAndPay = async (q: QuoteListItem) => {
    if (q.expectedBudgetUsd == null || q.expectedBudgetUsd <= 0) return;
    setGovBusy(q.quoteId);
    try { await finalizeQuote(orgId, q.quoteId, q.expectedBudgetUsd); reload(); }
    catch { setError(true); } finally { setGovBusy(null); }
  };
  // ISSUE 6 — open/create the Stripe payment link for an invoice.
  const genPaymentLink = async (inv: InvoiceItem) => {
    setGovBusy(inv.id);
    try {
      const r = await createInvoicePaymentLink(orgId, inv.id);
      if (r.paymentUrl) window.open(r.paymentUrl, '_blank', 'noopener');
      reload();
    } catch { setError(true); } finally { setGovBusy(null); }
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
    // FIX 5 — the proposed budget rides on BOTH the accept + adjustment events.
    const budgetSub = q.expectedBudgetUsd != null ? `${I.proposedBudget}: ${money.format(q.expectedBudgetUsd)}` : undefined;
    if (q.decision === 'discussion') events.push({ icon: '💬', label: A.evtAdjustment, title, date: q.decidedAt, sub: budgetSub });
    else events.push({ icon: '✅', label: A.evtAccepted, title, date: q.decidedAt, sub: budgetSub });
  }
  for (const inv of items ?? []) {
    if (inv.status === 'draft') continue;
    const title = qTitle(inv.quoteTitle, inv.quoteId);
    events.push(inv.status === 'paid'
      ? { icon: '💰', label: A.evtPaid, title, date: inv.createdAt, sub: inv.amount != null ? usd(inv.amount) : undefined }
      : { icon: '📧', label: A.evtInvoiceSent, title, date: inv.createdAt, sub: inv.amount != null ? usd(inv.amount) : undefined });
  }
  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // ISSUE 3 — a blocked/suspended quote drops out of the actionable pricing queue +
  // discussions (it can't be invoiced); it stays visible in "All quotes" for control.
  const govBlocked = new Set((allQuotes ?? []).filter(q => q.adminState === 'blocked' || q.adminState === 'suspended').map(q => q.quoteId));
  const pricingQueue = (pending ?? []).filter(q => !govBlocked.has(q.quoteId));
  const discussions = pricingQueue.filter(q => q.message);
  const invoiceList = (items ?? []).filter(i => i.status !== 'draft');

  if (allowed === null) return <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px', color: 'var(--text-muted)' }}>{I.loading}</div>;
  if (!allowed) return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden>🔒</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{A.restricted}</p>
    </div>
  );

  // Shared pricing controls (FIX 4 — "update price" usable from the queue AND from a
  // discussion card): set the final amount → finalise (creates + emails the invoice).
  const pricingControls = (q: PendingQuote) => (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {activeId === q.quoteId ? (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{I.amountLabel}</label>
          <input type="number" inputMode="numeric" min={1} value={amountInput} onChange={e => setAmount(e.target.value)} style={{ width: 130, padding: '8px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)' }} />
          <button type="button" disabled={busy} onClick={() => void submitPricing(q)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? '…' : I.finalizeBtn}</button>
          <button type="button" disabled={busy} onClick={() => setActiveId(null)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{I.cancel}</button>
          {formError && <span style={{ fontSize: 12, color: 'var(--red-text)' }}>{I.confirmError}</span>}
        </>
      ) : (
        <>
          <button type="button" onClick={() => openPricing(q)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{I.finalizeBtn}</button>
          <button type="button" onClick={() => navigate({ name: 'invoices', quoteId: q.quoteId })} style={{ background: 'none', border: 'none', color: 'var(--violet-text)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, textDecoration: 'underline' }}>{I.invoicesHeading}</button>
        </>
      )}
    </div>
  );

  const queueCard = (q: PendingQuote) => (
    <div key={q.quoteId} style={card}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
          {q.customerEmail && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail}</div>}
          {/* FIX 3/6 — the proposed budget is the headline figure (display currency). */}
          {q.expectedBudgetUsd != null
            ? <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' }}>{I.proposedBudget}<span style={{ display: 'block', fontSize: 18, fontWeight: 800, textTransform: 'none', letterSpacing: 0, color: 'var(--violet-text)', marginTop: 1 }}>{money.format(q.expectedBudgetUsd)}</span></div>
            : <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{I.proposedBudget}: —</div>}
        </div>
        <span style={pill(q.stage === 'negotiation' ? '#b45309' : 'var(--violet-text)')}>{q.stage === 'negotiation' ? I.stageNegotiationLabel : I.stageAcceptedLabel}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>{q.stage === 'negotiation' ? I.nextNegotiation : I.nextAccepted}</div>
      {pricingControls(q)}
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={heading}>{title}</div>
      {children}
    </div>
  );

  // PART 2 — per-quote lifecycle timeline (created → sent → client responded →
  // invoiced), built from the quote's own timestamps + the matching invoice.
  const quoteSteps = (q: QuoteListItem) => {
    const inv = (items ?? []).find(i => i.id === `quote_${q.quoteId}`);
    const invoiced = q.stage === 'invoice_sent' || q.stage === 'finalized' || !!inv;
    return [
      { label: A.tlCreated, date: q.createdAt, done: true },
      { label: A.tlSent, date: q.sentAt, done: !!q.sentAt || !!q.stage },
      { label: q.decision === 'discussion' ? A.tlChanges : A.tlAccepted, date: q.decidedAt, done: !!q.decidedAt },
      { label: A.tlInvoiced, date: inv?.createdAt ?? '', done: invoiced },
    ];
  };
  const allQuotesCard = (q: QuoteListItem) => (
    <div key={q.quoteId} style={card}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{q.customerEmail || '—'} · {I.quoteLabel} {q.quoteId.slice(0, 8)}</div>
        </div>
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {q.adminState === 'blocked' && <span style={pill('var(--red-text)')}>{A.blocked}</span>}
          {q.adminState === 'suspended' && <span style={pill('#b45309')}>{A.suspended}</span>}
          {/* ISSUE 1 — the proposed budget is ALWAYS shown (top-right, prominent), with
              a placeholder when none was proposed. Stored value is the raw USD integer. */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' }}>{I.proposedBudget}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--violet-text)', fontVariantNumeric: 'tabular-nums' }}>{q.expectedBudgetUsd != null ? money.format(q.expectedBudgetUsd) : '—'}</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        {quoteSteps(q).map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i > 0 && <span aria-hidden style={{ position: 'absolute', top: 9, right: '50%', width: '100%', height: 2, background: s.done ? 'var(--violet)' : 'var(--border)' }} />}
            <span style={{ position: 'relative', zIndex: 1, width: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: s.done ? 'var(--violet)' : 'var(--surface)', color: s.done ? '#fff' : 'var(--text-muted)', border: s.done ? 'none' : '1.5px solid var(--border)' }}>{s.done ? '✓' : i + 1}</span>
            <span style={{ marginTop: 5, fontSize: 10.5, fontWeight: 600, color: s.done ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.25 }}>{s.label}</span>
            {s.done && s.date && <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{s.date.slice(0, 10)}</span>}
          </div>
        ))}
      </div>
      {/* ISSUE 5/7 — send the proposal to the client, or fast-track straight to an
          invoice + payment at the proposed budget. Hidden once invoiced or governed. */}
      {q.adminState !== 'blocked' && q.adminState !== 'suspended' && q.stage !== 'invoice_sent' && q.stage !== 'finalized' && q.customerEmail && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Send Quote re-sends the PROPOSAL — hidden once the client has responded so a
              re-send can't pull the quote back out of the pricing queue. */}
          {q.stage !== 'client_responded' && q.stage !== 'negotiation' && (
            <button type="button" disabled={govBusy === q.quoteId} onClick={() => void sendQuote(q)} style={govBtn('var(--violet)', '#fff')}>{govBusy === q.quoteId ? '…' : A.sendQuote}</button>
          )}
          {/* Send & Pay finalises at the proposed budget (capped at the invoiceable max). */}
          {q.expectedBudgetUsd != null && q.expectedBudgetUsd > 0 && q.expectedBudgetUsd <= 10_000_000 && (
            <button type="button" disabled={govBusy === q.quoteId} onClick={() => void sendAndPay(q)} style={govBtn('var(--green-text, #059669)', '#fff')}>{govBusy === q.quoteId ? '…' : A.sendAndPay}</button>
          )}
        </div>
      )}
      {/* ISSUE 3 — admin governance: edit the proposed budget, block / suspend / re-activate. */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {editId === q.quoteId ? (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{A.budgetUsdLabel}</label>
            <input type="number" inputMode="numeric" min={0} value={editBudget} onChange={e => setEditBudget(e.target.value)} style={{ width: 130, padding: '8px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)' }} />
            <button type="button" disabled={govBusy === q.quoteId} onClick={() => void saveBudget(q.quoteId)} style={govBtn('var(--violet)', '#fff')}>{govBusy === q.quoteId ? '…' : A.save}</button>
            <button type="button" onClick={() => setEditId(null)} style={govBtnOutline}>{I.cancel}</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => openEditBudget(q)} style={govBtnOutline}>{A.editBudget}</button>
            {q.adminState === 'blocked' || q.adminState === 'suspended' ? (
              <button type="button" disabled={govBusy === q.quoteId} onClick={() => void setGovState(q.quoteId, 'active')} style={govBtn('var(--green-text, #059669)', '#fff')}>{govBusy === q.quoteId ? '…' : A.reactivate}</button>
            ) : (
              <>
                <button type="button" disabled={govBusy === q.quoteId} onClick={() => void setGovState(q.quoteId, 'suspended')} style={govBtnOutline}>{A.suspend}</button>
                <button type="button" disabled={govBusy === q.quoteId} onClick={() => void setGovState(q.quoteId, 'blocked')} style={govBtn('var(--red-text)', '#fff')}>{A.block}</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{A.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 22px' }}>{A.subtitle}</p>

      {items === null || pending === null || allQuotes === null ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', fontSize: 14 }}>{I.loading}</div>
      ) : (
        <div style={{ display: 'grid', gap: 28 }}>
          {/* Soft, NON-blocking error — a partial load failure never hides the lists. */}
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

          {/* 1.5 — All quotes (full lifecycle timeline — PART 2 super-admin visibility) */}
          {section(A.allQuotesHeading, (allQuotes ?? []).length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.allQuotesEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{(allQuotes ?? []).map(allQuotesCard)}</div>
          )}

          {/* 2 — Pricing queue + actions */}
          {section(I.queueHeading, pricingQueue.length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{I.queueEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{pricingQueue.map(queueCard)}</div>
          )}

          {/* 3 — Client discussions */}
          {section(A.discussionsHeading, discussions.length === 0
            ? <div style={{ ...card, borderStyle: 'dashed', color: 'var(--text-muted)', fontSize: 13.5 }}>{A.discussionsEmpty}</div>
            : <div style={{ display: 'grid', gap: 10 }}>{discussions.map(q => (
                <div key={q.quoteId} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{qTitle(q.quoteTitle, q.quoteId)}</div>
                    {/* FIX 4/6 — status pill: the client is waiting for the admin's response. */}
                    <span style={pill('#b45309')}>{A.statusWaitingResponse}</span>
                  </div>
                  {/* FIX 4 — budget + quoteId on the discussion record. */}
                  <div style={{ marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    {q.expectedBudgetUsd != null && <span style={{ fontSize: 12.5, color: 'var(--violet-text)', fontWeight: 700 }}>{I.proposedBudget}: {money.format(q.expectedBudgetUsd)}</span>}
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{I.quoteLabel} · {q.quoteId.slice(0, 8)}</span>
                  </div>
                  <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2, var(--surface))', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>“{q.message}”</div>
                  {q.customerEmail && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{A.contextLabel}: {q.customerEmail} · {A.replyHint}</div>}
                  {/* FIX 4 — "update price" action right on the discussion. */}
                  {pricingControls(q)}
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
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" disabled={resendId === inv.id} onClick={() => void resend(inv)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--violet-text)', fontWeight: 600, fontSize: 12.5, cursor: resendId === inv.id ? 'wait' : 'pointer' }}>{resendId === inv.id ? '…' : I.resendBtn}</button>
                      {/* ISSUE 6 — Stripe payment link (when configured); else bank transfer in the email. */}
                      {inv.paymentUrl
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
