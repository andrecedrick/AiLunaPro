/**
 * Invoices route — listing + admin finalise/re-send for the quote → invoice flow.
 *
 *   GET  /api/invoices?orgId=…            — list the org's invoices (pending/paid)
 *   POST /api/invoices/finalize          — admin sets the amount → the invoice is born
 *   POST /api/invoices/:id/confirm       — admin re-amounts / re-sends an invoice
 *
 * Auth + role gated. orgId is the membership-verified org from requireRole, so there
 * is no cross-org access. Invoices are created status 'pending' at finalise (never
 * 'draft' in the current flow — 'draft' is only a legacy/tolerated state, hidden by
 * the panel). No Stripe / charge — bank transfer is the live payment method.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreRunQuery, firestoreGet, firestoreSet, firestoreCreateIfNotExists } from '../lib/firestoreAdmin';
import { buildInvoicePdf, type InvoicePdfInput } from '../lib/quote-pdf';
import { signShareToken, verifyShareToken } from '../lib/audit-express-share';
import { sendTransactional } from '../lib/sequenzy';
import { formatBankDetails, bankDetailsFields } from '../lib/bank-details';
import { getStripe } from '../lib/stripe';
import { SMB_MAX_USD } from '../data/quote-config';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const invoices = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const INVOICE_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];
const CONFIRM_ROLES: RoleList = ['owner', 'admin']; // re-sending is admin-only

const QUOTE_DOC = (orgId: string, quoteId: string) => `organizations/${orgId}/quotes/${quoteId}`;

/* Customer invoice links: a dedicated share version so a quote-PDF (v1) or quote-accept
 * (v2) token can never be replayed against an invoice. 1 year — a paid receipt must stay
 * reachable for accounting long after the payment. */
const INVOICE_SHARE_VERSION = 3;
const INVOICE_LINK_TTL_SEC = 365 * 24 * 60 * 60;

/** The customer's own no-login invoice/receipt link. Null when links are disabled. */
async function customerInvoiceLink(env: AppEnv['Bindings'], invoiceId: string, orgId: string): Promise<string | null> {
  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return null;
  try {
    const { token } = await signShareToken(secret, orgId, invoiceId, INVOICE_SHARE_VERSION, INVOICE_LINK_TTL_SEC, Math.floor(Date.now() / 1000));
    const base = ((env as { WORKER_PUBLIC_BASE?: string }).WORKER_PUBLIC_BASE ?? 'https://api.ailunapro.com').replace(/\/+$/, '');
    return `${base}/api/invoices/shared/${token}`;
  } catch { return null; }
}

const esc = (s: string) => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string));

/** The customer's receipt page — served on the signed link, no account required. Shows the
 *  payment status and every detail a client needs to file it, with the PDF one click away. */
function customerReceiptPage(d: InvoicePdfInput): string {
  const paid = d.status === 'paid';
  const method = d.paymentMethod === 'bank_transfer' ? 'Bank transfer' : 'Card (online payment)';
  const rows: Array<[string, string]> = [
    ['Invoice number', d.invoiceId],
    ['Project', d.quoteTitle || 'Project quote'],
    ['Billed to', d.customerEmail || '—'],
    ['Issued on', d.createdAt.slice(0, 10)],
    ...(paid ? ([['Payment date', (d.paidAt ?? '').slice(0, 10) || '—'], ['Payment method', method]] as Array<[string, string]>) : []),
    ['Payment reference', d.reference],
    ['Billed by', 'AiLunaPro'],
  ];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${paid ? 'Receipt' : 'Invoice'} ${esc(d.invoiceId)} — AiLunaPro</title>
<style>
 body{margin:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2a3c;padding:24px 12px}
 .card{max-width:600px;margin:0 auto;background:#fff;border:1px solid #ececf2;border-radius:14px;padding:28px 32px}
 .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:19px;color:#1a1a2e}
 .logo{background:#4F46E5;color:#fff;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px}
 h1{font-size:20px;margin:18px 0 4px;color:#1a1a2e}
 .sub{color:#6b7280;font-size:13px;margin:0 0 18px}
 .amt{background:${paid ? '#ecfdf5' : '#f8f9fc'};border:1px solid ${paid ? '#a7f3d0' : '#e6e6f0'};border-radius:10px;padding:16px 18px;margin:18px 0}
 .amt .k{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${paid ? '#047857' : '#6b7280'}}
 .amt .v{font-size:24px;font-weight:800;color:${paid ? '#059669' : '#1a1a2e'};margin-top:4px}
 table{width:100%;border-collapse:collapse;font-size:13px}
 td{padding:9px 0;border-top:1px solid #f0f0f5}
 td.k{color:#6b7280;width:45%}td.v{font-weight:700;word-break:break-all}
 .btn{display:block;text-align:center;background:#4F46E5;color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;margin:22px 0 8px}
 .note{text-align:center;color:#9ca3af;font-size:12px}
</style></head><body><div class="card">
<div class="brand"><span class="logo">AL</span>AiLunaPro</div>
<h1>${paid ? '✅ Payment received — thank you!' : 'Invoice'}</h1>
<p class="sub">${paid ? 'This page is your receipt. No account needed — keep this link to retrieve it any time.' : 'This invoice is awaiting payment.'}</p>
<div class="amt"><div class="k">${paid ? 'Amount paid' : 'Amount due'}</div><div class="v">$${d.amountUsd.toLocaleString('en-US')} USD</div></div>
<table>${rows.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`).join('')}</table>
<a class="btn" href="?dl=1">Download invoice PDF</a>
<p class="note">Questions? Just reply to the email that brought you here.</p>
</div></body></html>`;
}

/** ISSUE 6 — GRACEFUL Stripe payment link. Create a one-time Checkout Session for the
 *  invoice amount (USD) when Stripe is configured; persist the url on the invoice; the
 *  webhook (type='invoice_payment') marks it paid. Returns null when Stripe is unset or
 *  the call fails (the email/UI then fall back to bank transfer). Amount is an integer
 *  USD value → unit_amount in cents. Idempotent enough: reuses a stored url if present. */
async function ensureInvoicePaymentLink(
  env: AppEnv['Bindings'], saJson: string,
  a: { orgId: string; invoiceId: string; amount: number; project: string; appBase: string; existingUrl?: string; prevSessionId?: string },
): Promise<string | null> {
  if (a.existingUrl) return a.existingUrl;
  const key = (env as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY;
  if (!key) return null;                                  // graceful: bank transfer only
  try {
    const stripe = getStripe(key);
    // Re-amount: void the previous (different-amount) Checkout link so a client can
    // never settle a stale total. Best-effort — already-completed/expired sessions throw.
    if (a.prevSessionId) {
      try { await stripe.checkout.sessions.expire(a.prevSessionId); }
      catch (e) { console.warn('[invoices] could not expire stale session', a.prevSessionId, ':', e instanceof Error ? e.message : ''); }
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: a.project || 'Invoice' }, unit_amount: Math.round(a.amount) * 100 }, quantity: 1 }],
      // BUG 1 — the payer is usually the CLIENT (not an org member): land on the PUBLIC
      // quote-status page (paid confirmation view), never the auth-walled /invoices.
      success_url: `${a.appBase}/#/quote/status?quoteId=${encodeURIComponent(a.invoiceId.startsWith('quote_') ? a.invoiceId.slice(6) : a.invoiceId)}&state=invoice&paid=1`,
      cancel_url:  `${a.appBase}/#/invoices?invoiceId=${encodeURIComponent(a.invoiceId)}`,
      client_reference_id: a.orgId,
      metadata: { type: 'invoice_payment', invoiceId: a.invoiceId, orgId: a.orgId },
    });
    if (!session.url) return null;
    await firestoreSet(saJson, `invoices/${a.invoiceId}`, { paymentUrl: session.url, paymentSessionId: session.id, updatedAt: new Date().toISOString() }, { merge: true });
    return session.url;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) console.warn('[invoices] payment link create failed:', err.code ?? err.type, err.message);
    else console.warn('[invoices] payment link create failed:', err instanceof Error ? err.message : '');
    return null;                                          // never block finalise on a Stripe hiccup
  }
}

/** Region-aware bank-transfer details (org settings) with a graceful fallback so
 *  the invoice email never renders a blank bank block. */
async function resolveBankDetails(saJson: string, orgId: string): Promise<string> {
  let bank = '';
  try {
    const settings = await firestoreGet(saJson, `organizations/${orgId}/settings/billing`) as Record<string, unknown> | null;
    bank = formatBankDetails(settings);
  } catch { /* bank details optional */ }
  return bank || 'Bank-transfer details available on request — reply to this email.';
}

/** Send the invoice-client email (best-effort, non-fatal). Shared by confirm + finalize. */
async function sendClientInvoice(env: AppEnv['Bindings'], saJson: string, a: { orgId: string; invoiceId: string; project: string; customer: string; amount: number; appBase: string; paymentUrl?: string | null; method?: 'stripe' | 'bank_transfer'; reference?: string; deadlineIso?: string | null }): Promise<{ emailed: boolean; emailError?: string }> {
  if (!a.customer) return { emailed: false };
  const bankDetails = await resolveBankDetails(saJson, a.orgId);
  // CUSTOMER-FACING: the client is not an org member — never send them /#/invoices (the
  // member panel = sign-in wall). Their invoice link is the signed no-login document.
  const customerLink = await customerInvoiceLink(env, a.invoiceId, a.orgId);
  // NO fallback to /#/invoices: that is the member panel = sign-in wall, and a paying client
  // has no account. If the link cannot be minted the email still carries the full invoice
  // detail (it IS the document) and the reply-to; a dead button beats an auth wall.
  if (!customerLink) console.error('[invoices] AUDIT_SHARE_SECRET missing — invoice-client sent WITHOUT a customer link');
  const appInvoiceUrl = customerLink ?? '';
  const isBank = a.method === 'bank_transfer';
  const res = await sendTransactional(env.SEQUENZY_API_KEY, {
    to:      a.customer,
    slug:    'invoice-client',
    replyTo: env.ADMIN_EMAIL,
    variables: {
      PROJECT:      a.project,
      AMOUNT:       `$${a.amount.toLocaleString('en-US')}`,
      // Deep-link to the exact invoice so the panel highlights + scrolls to it.
      INVOICE_URL:  appInvoiceUrl,
      // "Pay online": Stripe Checkout for SMB (≤ SMB_MAX_USD). For bank transfer the
      // button points at the in-app invoice page — NEVER a Stripe link (the template
      // hides the button when BANK_TRANSFER is set). Bank details stay below.
      PAYMENT_URL:  isBank ? appInvoiceUrl : (a.paymentUrl || appInvoiceUrl),
      BANK_DETAILS: bankDetails,
      // Bank-transfer vars for the single invoice-client template's conditional block:
      // reference = quote id (must appear on the wire), deadline = +14 days, flag = show bank.
      REFERENCE:    a.reference ?? a.invoiceId,
      // Full sentence (or empty for SMB) so the single template can print {{DEADLINE}}
      // directly without an empty "pay by ___" line on Stripe invoices.
      DEADLINE:     a.deadlineIso ? `Please complete your bank transfer by ${a.deadlineIso.slice(0, 10)}.` : '',
      BANK_TRANSFER: isBank ? '1' : '',
    },
  });
  if (!res.ok) console.warn('[invoices] invoice-client NOT sent (check SEQUENZY_API_KEY / invoice-client):', res.error ?? 'unknown');
  return { emailed: res.ok, emailError: res.error };
}

/** BUG 1 — payment-confirmation email (paid receipt). Sent when an invoice becomes paid
 *  (Stripe webhook exact-amount reconcile + admin bank-transfer mark-paid) and re-sent by
 *  /confirm on an already-paid invoice. Best-effort, non-fatal; exported for stripe.ts. */
export async function sendPaymentConfirmation(env: AppEnv['Bindings'], saJson: string, a: { orgId: string; invoiceId: string; project: string; customer: string; amount: number; appBase: string; reference?: string; paidAt?: string | null; paymentMethod?: string }): Promise<{ emailed: boolean; emailError?: string }> {
  if (!a.customer) return { emailed: false };
  // The receipt link is the CUSTOMER's: a signed no-login PDF (never /#/invoices, which
  // is the org-member panel and would ask a paying client to sign in). Falls back to the
  // app URL only if share links are disabled server-side.
  const link = await customerInvoiceLink(env, a.invoiceId, a.orgId);
  const res = await sendTransactional(env.SEQUENZY_API_KEY, {
    to:      a.customer,
    slug:    'payment-confirmation',
    replyTo: env.ADMIN_EMAIL,
    variables: {
      PROJECT:     a.project,
      AMOUNT:      `$${a.amount.toLocaleString('en-US')}`,
      REFERENCE:   a.reference ?? a.invoiceId,
      // A real receipt: invoice number, payment date and method — not just an amount.
      INVOICE_NO:  a.invoiceId,
      PAID_ON:     (a.paidAt ?? new Date().toISOString()).slice(0, 10),
      METHOD:      a.paymentMethod === 'bank_transfer' ? 'Bank transfer' : 'Card (online payment)',
      // The receipt page (no ?dl=1): opens in the browser with the payment detail visible
      // and a Download-PDF button. Never /#/invoices — see sendClientInvoice.
      INVOICE_URL: link ?? '',
    },
  });
  if (!res.ok) console.warn('[invoices] payment-confirmation NOT sent (check SEQUENZY_API_KEY / payment-confirmation):', res.error ?? 'unknown');
  else await firestoreSet(saJson, `invoices/${a.invoiceId}`, { confirmationEmailedAt: new Date().toISOString() }, { merge: true }).catch(() => { /* audit best-effort */ });
  return { emailed: res.ok, emailError: res.error };
}

/**
 * U1 — the invoice-birth core, shared by the admin finalise route AND the within-range
 * auto-finalise on client accept (quote.ts). Creates the invoice ONCE (create-if-not-
 * exists → no duplicate invoice / no duplicate payment), mints the Stripe payment link
 * (graceful null when Stripe unset), sends the invoice-client email, and advances the
 * quote stage finalized → invoice_sent. The amount is used AS-IS (no pricing change).
 * Callers validate the amount range + governance (blocked/suspended) before calling.
 */
export async function finalizeQuoteInvoice(
  env: AppEnv['Bindings'], saJson: string,
  a: { orgId: string; quoteId: string; quote: Record<string, unknown>; amount: number; appBase: string },
): Promise<{ invoiceId: string; status: string; amount: number; paymentUrl: string | null; emailed: boolean; emailError?: string; alreadyFinalized: boolean }> {
  const { orgId, quoteId, quote, amount, appBase } = a;
  const invoiceId = `quote_${quoteId}`;
  const invPath = `invoices/${invoiceId}`;

  // Idempotent fast-path: an invoice already exists → never recreate / re-charge.
  const existing = await firestoreGet(saJson, invPath) as Record<string, unknown> | null;
  if (existing) {
    return {
      invoiceId,
      status: typeof existing.status === 'string' ? existing.status : 'pending',
      amount: typeof existing.amount === 'number' ? existing.amount : amount,
      paymentUrl: typeof existing.paymentUrl === 'string' ? existing.paymentUrl : null,
      emailed: false, alreadyFinalized: true,
    };
  }

  // Fixed price: no range, no override — the invoice carries the single amount only.
  const rangeMinUsd = null;
  const rangeMaxUsd = null;
  let quoteTitle = `Quote ${quoteId.slice(0, 8)}`;
  if (typeof quote.renderJson === 'string') {
    try { const r = JSON.parse(quote.renderJson) as Record<string, unknown>; if (typeof r.docTitle === 'string' && r.docTitle) quoteTitle = r.docTitle; } catch { /* keep default */ }
  }
  const customer = typeof quote.customerEmail === 'string' ? quote.customerEmail : '';
  const nowIso = new Date().toISOString();

  // Payment split: ≤ SMB_MAX_USD → Stripe self-serve; above → bank transfer (no Stripe).
  const paymentMethod: 'stripe' | 'bank_transfer' = amount > SMB_MAX_USD ? 'bank_transfer' : 'stripe';
  const transferDeadline = paymentMethod === 'bank_transfer'
    ? new Date(Date.parse(nowIso) + 14 * 24 * 60 * 60 * 1000).toISOString() : null;

  const invoice = {
    id: invoiceId, quoteId, orgId, quoteTitle, customerEmail: customer,
    rangeMinUsd, rangeMaxUsd,
    expectedBudgetUsd: typeof quote.expectedBudgetUsd === 'number' ? quote.expectedBudgetUsd : null,
    amount, currency: 'usd', status: 'pending', source: 'quote', schemaVersion: 1,
    paymentMethod, ...(transferDeadline ? { transferDeadline } : {}),
    createdAt: nowIso, confirmedAt: nowIso,
  };
  // Atomic create-once: a race (double-click / retry / concurrent admin+auto) → the
  // loser throws ALREADY_EXISTS and returns WITHOUT a second invoice or email.
  try {
    await firestoreCreateIfNotExists(saJson, invPath, invoice as unknown as Parameters<typeof firestoreCreateIfNotExists>[2]);
  } catch (err) {
    if (err instanceof Error && err.message === 'ALREADY_EXISTS') {
      const now = await firestoreGet(saJson, invPath) as Record<string, unknown> | null;
      return {
        invoiceId,
        status: typeof now?.status === 'string' ? now.status : 'pending',
        amount: typeof now?.amount === 'number' ? now.amount : amount,
        paymentUrl: typeof now?.paymentUrl === 'string' ? now.paymentUrl : null,
        emailed: false, alreadyFinalized: true,
      };
    }
    throw err;
  }
  // Quote → finalized now; → invoice_sent only if the client email actually goes out.
  await firestoreSet(saJson, QUOTE_DOC(orgId, quoteId), { stage: 'finalized', finalAmountUsd: amount, updatedAt: nowIso }, { merge: true });

  // Bank transfer → never mint a Stripe link.
  const paymentUrl = paymentMethod === 'stripe'
    ? await ensureInvoicePaymentLink(env, saJson, { orgId, invoiceId, amount, project: quoteTitle, appBase })
    : null;
  const { emailed, emailError } = await sendClientInvoice(env, saJson, { orgId, invoiceId, project: quoteTitle, customer, amount, appBase, paymentUrl, method: paymentMethod, reference: quoteId, deadlineIso: transferDeadline });
  if (emailed) await firestoreSet(saJson, QUOTE_DOC(orgId, quoteId), { stage: 'invoice_sent', invoiceSentAt: nowIso }, { merge: true });
  return { invoiceId, status: 'pending', amount, paymentUrl, emailed, emailError, alreadyFinalized: false };
}

invoices.get('/api/invoices', requireAuth(), requireRole(INVOICE_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified by requireRole

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    // Equality filter only (no orderBy → no composite index); sorted in JS below.
    // DATA-LOSS BUG: without orderBy, `limit` takes an ARBITRARY window in document-key
    // (uuid) order — NOT the newest. At 200 an org's most recent invoice could be
    // silently dropped from the list/feed while still existing in Firestore. Raised to
    // 1000 (parity with the platform query) so the window covers any near-term volume;
    // the JS sort then puts newest first. Logged if we ever hit the cap.
    rows = await firestoreRunQuery(saJson, {
      from:  [{ collectionId: 'invoices' }],
      where: { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
      limit: 1000,
    });
    if (rows.length >= 1000) console.warn('[invoices] org hit the 1000-invoice window — newest-first completeness at risk:', orgId);
  } catch (err) {
    console.error('[invoices] query failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load invoices.', code: 'QUERY_FAILED' }, 500);
  }

  const items = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    return {
      id:            typeof f.id === 'string' ? f.id : (r.name.split('/').pop() ?? ''),
      quoteId:       typeof f.quoteId === 'string' ? f.quoteId : '',
      // DATA-CONSISTENCY BUG: quoteTitle IS persisted on the invoice at birth
      // (finalizeQuoteInvoice) but was never mapped here — so every invoice-sourced
      // row/event rendered a raw uuid ("Quote · 4332d263-…", "Devis · f337693e")
      // while quote-sourced events showed the real project name. Same invoice, two
      // identities across surfaces. Now returned → one identity everywhere.
      quoteTitle:    typeof f.quoteTitle === 'string' ? f.quoteTitle : '',
      customerEmail: typeof f.customerEmail === 'string' ? f.customerEmail : '',
      amount:        typeof f.amount === 'number' ? f.amount : null,
      currency:      typeof f.currency === 'string' ? f.currency : 'usd',
      rangeMinUsd:   typeof f.rangeMinUsd === 'number' ? f.rangeMinUsd : null,
      rangeMaxUsd:   typeof f.rangeMaxUsd === 'number' ? f.rangeMaxUsd : null,
      expectedBudgetUsd: typeof f.expectedBudgetUsd === 'number' ? f.expectedBudgetUsd : null,
      status:        typeof f.status === 'string' ? f.status : 'draft',
      paymentUrl:    typeof f.paymentUrl === 'string' ? f.paymentUrl : null,
      paymentMethod: typeof f.paymentMethod === 'string' ? f.paymentMethod : 'stripe',
      transferInitiatedAt: typeof f.transferInitiatedAt === 'string' ? f.transferInitiatedAt : null,
      transferDeadline:    typeof f.transferDeadline === 'string' ? f.transferDeadline : null,
      paidAt:        typeof f.paidAt === 'string' ? f.paidAt : null,
      createdAt:     typeof f.createdAt === 'string' ? f.createdAt : '',
    };
  });
  // Newest first.
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  return c.json({ ok: true, invoices: items });
});

/* ── POST /api/invoices/:id/confirm — admin RE-SENDS an invoice (no re-amount) ──
 *
 * Owner/admin only. Fixed-price model: the invoice amount is immutable (= quote.price),
 * so this ONLY re-sends the invoice-client email and reuses the existing Stripe link
 * (creates one if missing). No amount input, no re-amount. A paid invoice is final.
 * Cross-org guard: the invoice must belong to the caller's membership-verified org.
 */
invoices.post('/api/invoices/:id/confirm', requireAuth(), requireRole(CONFIRM_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified
  const id = (c.req.param('id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!id) return c.json({ error: 'Invalid invoice id.', code: 'INVALID_ID' }, 400);

  const invPath = `invoices/${id}`;
  const inv = await firestoreGet(saJson, invPath) as Record<string, unknown> | null;
  if (!inv) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  // Cross-org guard: an admin of org A must not touch org B's invoice.
  if (inv.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  // BUG 1 — a PAID invoice re-sends the PAYMENT CONFIRMATION (receipt), never the
  // pay-request email (the amount is settled; there is nothing left to pay).
  if (inv.status === 'paid') {
    const paidCustomer = typeof inv.customerEmail === 'string' ? inv.customerEmail : '';
    if (!paidCustomer) return c.json({ error: 'This invoice has no client email on file.', code: 'NO_RECIPIENT' }, 409);
    const paidAmount = typeof inv.amount === 'number' ? inv.amount : 0;
    const paidBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
    const paidProject = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle
      : typeof inv.quoteId === 'string' ? `Quote ${inv.quoteId.slice(0, 8)}` : id;
    const conf = await sendPaymentConfirmation(env, saJson, { orgId, invoiceId: id, project: paidProject, customer: paidCustomer, amount: paidAmount, appBase: paidBase, reference: typeof inv.quoteId === 'string' ? inv.quoteId : id, paidAt: typeof inv.paidAt === 'string' ? inv.paidAt : null, paymentMethod: typeof inv.paymentMethod === 'string' ? inv.paymentMethod : 'stripe' });
    return c.json({ ok: true, status: 'paid', alreadyConfirmed: true, emailed: conf.emailed, ...(conf.emailed ? {} : { code: 'EMAIL_FAILED' }), ...(conf.emailError ? { emailError: conf.emailError } : {}) });
  }

  const amount = typeof inv.amount === 'number' ? inv.amount : NaN;
  if (!Number.isFinite(amount) || amount <= 0) return c.json({ error: 'Invoice has no amount.', code: 'NO_AMOUNT' }, 409);

  // Re-send at the LOCKED amount; reuse the existing Stripe link (never re-amount).
  const appBase  = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const project  = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle
    : typeof inv.quoteId === 'string' ? `Quote ${inv.quoteId.slice(0, 8)}` : id;
  const customer = typeof inv.customerEmail === 'string' ? inv.customerEmail : '';
  // FIX 2 — customerEmail validation: a resend with no recipient can never email. Fail
  // LOUD (409) instead of the silent 200/emailed:false the admin reads as "nothing happened".
  if (!customer) return c.json({ error: 'This invoice has no client email on file.', code: 'NO_RECIPIENT' }, 409);

  // FIX 2 — bank-transfer invoices resend too: reuse the stored method (bank_transfer keeps
  // no Stripe link), so a bank-transfer / awaiting_transfer invoice re-sends its instructions.
  const method: 'stripe' | 'bank_transfer' = (inv.paymentMethod === 'bank_transfer' || amount > SMB_MAX_USD) ? 'bank_transfer' : 'stripe';
  const paymentUrl = method === 'stripe'
    ? await ensureInvoicePaymentLink(env, saJson, { orgId, invoiceId: id, amount, project, appBase, existingUrl: typeof inv.paymentUrl === 'string' ? inv.paymentUrl : undefined })
    : null;
  const { emailed, emailError } = await sendClientInvoice(env, saJson, { orgId, invoiceId: id, project, customer, amount, appBase, paymentUrl, method, reference: typeof inv.quoteId === 'string' ? inv.quoteId : id, deadlineIso: typeof inv.transferDeadline === 'string' ? inv.transferDeadline : null });
  // FIX 2 — audit the resend (durable trail; requested "log resend action").
  if (emailed) {
    const uid = c.get('uid') as string | undefined;
    await firestoreSet(saJson, invPath, { lastResentAt: new Date().toISOString(), ...(uid ? { lastResentBy: uid } : {}) }, { merge: true });
  }
  dlog(env, '[invoices] re-sent', id, 'emailed=', emailed, 'method=', method, 'payLink=', !!paymentUrl);

  // FIX 2 — proper error reporting: emailed:false carries EMAIL_FAILED (+ emailError) so the
  // UI shows a real reason instead of a faint amber note. Invoice state is never mutated.
  return c.json({ ok: true, status: typeof inv.status === 'string' ? inv.status : 'pending', amount, emailed, paymentUrl: paymentUrl ?? null, ...(emailed ? {} : { code: 'EMAIL_FAILED' }), ...(emailError ? { emailError } : {}) });
});

/* ── POST /api/invoices/:id/payment-link — get/create the Stripe payment link ──
 *
 * Owner/admin, org-scoped. Returns the invoice's payment link (creating it if Stripe is
 * configured + none exists yet). 503 when Stripe is not configured (the UI then shows
 * bank transfer only). A paid invoice returns its stored link without re-creating.
 */
invoices.post('/api/invoices/:id/payment-link', requireAuth(), requireRole(CONFIRM_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified
  const id = (c.req.param('id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!id) return c.json({ error: 'Invalid invoice id.', code: 'INVALID_ID' }, 400);

  const inv = await firestoreGet(saJson, `invoices/${id}`) as Record<string, unknown> | null;
  if (!inv || inv.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  if (inv.status === 'paid') return c.json({ ok: true, status: 'paid', paymentUrl: typeof inv.paymentUrl === 'string' ? inv.paymentUrl : null });

  const amount = typeof inv.amount === 'number' ? inv.amount : NaN;
  if (!Number.isFinite(amount) || amount <= 0) return c.json({ error: 'Invoice has no amount yet.', code: 'NO_AMOUNT' }, 409);
  // High-ticket (> SMB_MAX_USD) is bank transfer only — never mint a Stripe link.
  if (amount > SMB_MAX_USD || inv.paymentMethod === 'bank_transfer') {
    return c.json({ error: 'This invoice is paid by bank transfer.', code: 'BANK_TRANSFER_ONLY' }, 409);
  }

  const project = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle : id;
  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const paymentUrl = await ensureInvoicePaymentLink(env, saJson, { orgId, invoiceId: id, amount, project, appBase, existingUrl: typeof inv.paymentUrl === 'string' ? inv.paymentUrl : undefined });
  if (!paymentUrl) return c.json({ error: 'Online payment is not configured.', code: 'PAYMENT_UNAVAILABLE' }, 503);
  return c.json({ ok: true, paymentUrl });
});

/* ── GET /api/invoices/:id/transfer-details — PUBLIC bank-transfer instructions ──
 *
 * Display-only. Bank details are the company's RECEIVING account (non-secret); the
 * client reaches this from the email/accept flow (not an org member). No client PII
 * is returned. The money-releasing action (mark-paid) stays admin-only.
 */
invoices.get('/api/invoices/:id/transfer-details', async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const id = (c.req.param('id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!id) return c.json({ error: 'Invalid invoice id.', code: 'INVALID_ID' }, 400);

  const inv = await firestoreGet(saJson, `invoices/${id}`) as Record<string, unknown> | null;
  if (!inv) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  const orgId  = typeof inv.orgId === 'string' ? inv.orgId : '';
  const amount = typeof inv.amount === 'number' ? inv.amount : 0;
  const method = inv.paymentMethod === 'bank_transfer' || amount > SMB_MAX_USD ? 'bank_transfer' : 'stripe';

  let settings: Record<string, unknown> | null = null;
  try { settings = await firestoreGet(saJson, `organizations/${orgId}/settings/billing`) as Record<string, unknown> | null; } catch { /* optional */ }
  const fields = bankDetailsFields(settings);
  const bankText = formatBankDetails(settings) || 'Available upon request — reply to your quote email.';

  return c.json({
    ok:          true,
    paymentMethod: method,
    status:      typeof inv.status === 'string' ? inv.status : 'pending',
    reference:   typeof inv.quoteId === 'string' ? inv.quoteId : id,
    amount:      typeof inv.amount === 'number' ? inv.amount : null,
    currency:    typeof inv.currency === 'string' ? inv.currency : 'usd',
    deadlineIso: typeof inv.transferDeadline === 'string' ? inv.transferDeadline : null,
    bankText,
    companyName: fields.companyName,
    bankName:    fields.bankName,
    iban:        fields.iban,
    swiftBic:    fields.swiftBic,
    available:   !!(fields.iban || fields.swiftBic || fields.companyName),
  });
});

/* ── POST /api/invoices/:id/transfer-initiated — PUBLIC flag ("I've initiated it") ──
 *
 * Low-stakes: flips pending → awaiting_transfer + records the timestamp so an admin
 * follows up. Never touches 'paid'. Bank-transfer invoices only. Idempotent.
 */
invoices.post('/api/invoices/:id/transfer-initiated', async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const id = (c.req.param('id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!id) return c.json({ error: 'Invalid invoice id.', code: 'INVALID_ID' }, 400);

  const inv = await firestoreGet(saJson, `invoices/${id}`) as Record<string, unknown> | null;
  if (!inv) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  const amount = typeof inv.amount === 'number' ? inv.amount : 0;
  const method = inv.paymentMethod === 'bank_transfer' || amount > SMB_MAX_USD ? 'bank_transfer' : 'stripe';
  if (method !== 'bank_transfer') return c.json({ error: 'Not a bank-transfer invoice.', code: 'NOT_BANK_TRANSFER' }, 400);
  if (inv.status === 'paid') return c.json({ ok: true, status: 'paid' });

  await firestoreSet(saJson, `invoices/${id}`, { status: 'awaiting_transfer', transferInitiatedAt: new Date().toISOString() }, { merge: true });
  return c.json({ ok: true, status: 'awaiting_transfer' });
});

/* ── POST /api/invoices/:id/mark-paid — ADMIN ONLY, bank-transfer only ──
 *
 * Bank-transfer invoices get no Stripe webhook, so an owner/admin confirms receipt
 * here. Refused for Stripe invoices (they reconcile automatically) so this can never
 * bypass Stripe. Org-scoped + idempotent. Mirrors the quote stage to 'paid'.
 */
invoices.post('/api/invoices/:id/mark-paid', requireAuth(), requireRole(CONFIRM_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string; // membership-verified
  const uid   = c.get('uid') as string;
  const id = (c.req.param('id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!id) return c.json({ error: 'Invalid invoice id.', code: 'INVALID_ID' }, 400);

  const inv = await firestoreGet(saJson, `invoices/${id}`) as Record<string, unknown> | null;
  if (!inv || inv.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  const amount = typeof inv.amount === 'number' ? inv.amount : 0;
  const method = inv.paymentMethod === 'bank_transfer' || amount > SMB_MAX_USD ? 'bank_transfer' : 'stripe';
  if (method !== 'bank_transfer') return c.json({ error: 'Stripe invoices reconcile automatically.', code: 'NOT_BANK_TRANSFER' }, 400);
  if (inv.status === 'paid') return c.json({ ok: true, status: 'paid', alreadyPaid: true });

  const nowIso = new Date().toISOString();
  await firestoreSet(saJson, `invoices/${id}`, { status: 'paid', paidAt: nowIso, paidBy: uid, paymentMethod: 'bank_transfer' }, { merge: true });
  if (typeof inv.quoteId === 'string' && inv.quoteId) {
    try { await firestoreSet(saJson, QUOTE_DOC(orgId, inv.quoteId), { stage: 'paid', paidAt: nowIso }, { merge: true }); } catch { /* best-effort */ }
  }
  // BUG 1 — the client gets a payment confirmation the moment the transfer is confirmed.
  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const project = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle
    : typeof inv.quoteId === 'string' ? `Quote ${inv.quoteId.slice(0, 8)}` : id;
  const { emailed } = await sendPaymentConfirmation(env, saJson, {
    orgId, invoiceId: id, project,
    customer: typeof inv.customerEmail === 'string' ? inv.customerEmail : '',
    amount, appBase, reference: typeof inv.quoteId === 'string' ? inv.quoteId : id,
    paidAt: nowIso, paymentMethod: 'bank_transfer',
  });
  dlog(env, '[invoices] mark-paid', id, 'by', uid, 'confirmationEmailed=', emailed);
  return c.json({ ok: true, status: 'paid', emailed });
});

/* ── GET /api/invoices/shared/:token — PUBLIC customer invoice/receipt ───────
 *
 * CUSTOMER-FACING BILLING FIX: a paying client is NOT an org member, so the old
 * emailed link (/#/invoices) hit the auth wall — the customer could never open the
 * invoice they had just paid for. This route is the customer's copy: the HMAC token
 * IS the gate (same mechanism as the public quote PDF), so it needs no account, no
 * sign-in and grants no admin access. READ-ONLY: it renders the invoice document and
 * nothing else — the token carries orgId+invoiceId, and only that invoice is served.
 * `?dl=1` downloads; otherwise it opens inline in the browser. */
invoices.get('/api/invoices/shared/:token', async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return c.json({ error: 'Links are not enabled.', code: 'SHARE_DISABLED' }, 503);

  const v = await verifyShareToken(secret, c.req.param('token'), Math.floor(Date.now() / 1000));
  if (!v.ok) {
    return c.json(
      { error: v.code === 'SHARE_EXPIRED' ? 'This link has expired.' : 'This link is invalid.', code: v.code },
      v.code === 'SHARE_EXPIRED' ? 410 : 401,
    );
  }
  // Dedicated version: a quote-PDF (v1) or accept (v2) token can never open an invoice.
  if (v.payload.shareVersion !== INVOICE_SHARE_VERSION) {
    return c.json({ error: 'This link is invalid.', code: 'SHARE_INVALID' }, 401);
  }

  const { orgId, auditId: invoiceId } = v.payload;
  const inv = await firestoreGet(saJson, `invoices/${invoiceId}`) as Record<string, unknown> | null;
  if (!inv || inv.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  const amount = typeof inv.amount === 'number' ? inv.amount : 0;
  if (amount <= 0) return c.json({ error: 'Invoice has no amount.', code: 'NO_AMOUNT' }, 409);

  const doc = {
    invoiceId,
    reference:     typeof inv.quoteId === 'string' && inv.quoteId ? inv.quoteId : invoiceId,
    quoteTitle:    typeof inv.quoteTitle === 'string' ? inv.quoteTitle : '',
    customerEmail: typeof inv.customerEmail === 'string' ? inv.customerEmail : '',
    amountUsd:     amount,
    status:        typeof inv.status === 'string' ? inv.status : 'pending',
    paymentMethod: typeof inv.paymentMethod === 'string' ? inv.paymentMethod : 'stripe',
    createdAt:     typeof inv.createdAt === 'string' ? inv.createdAt : new Date().toISOString(),
    paidAt:        typeof inv.paidAt === 'string' ? inv.paidAt : null,
  };

  // ?dl=1 → the PDF itself (the button on the page below, and any direct link).
  if (c.req.query('dl') === '1') {
    const bytes = buildInvoicePdf(doc);
    return new Response(bytes.slice().buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  }
  // Otherwise the customer's receipt page: payment status + full detail in the browser,
  // with the PDF one click away. No account, no sign-in.
  return c.html(customerReceiptPage(doc));
});

/* ── GET /api/invoices/:id/pdf — downloadable invoice document (BUG 2) ───────
 * Auth + org-scoped (INVOICE_ROLES + orgId guard). Deterministic PDF built from
 * the invoice doc; a PAID invoice doubles as the payment receipt. */
invoices.get('/api/invoices/:id/pdf', requireAuth(), requireRole(INVOICE_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string; // membership-verified
  const id = (c.req.param('id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  if (!id) return c.json({ error: 'Invalid invoice id.', code: 'INVALID_ID' }, 400);

  const inv = await firestoreGet(saJson, `invoices/${id}`) as Record<string, unknown> | null;
  if (!inv || inv.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  const amount = typeof inv.amount === 'number' ? inv.amount : 0;
  if (amount <= 0) return c.json({ error: 'Invoice has no amount.', code: 'NO_AMOUNT' }, 409);

  const bytes = buildInvoicePdf({
    invoiceId:     id,
    reference:     typeof inv.quoteId === 'string' && inv.quoteId ? inv.quoteId : id,
    quoteTitle:    typeof inv.quoteTitle === 'string' ? inv.quoteTitle : '',
    customerEmail: typeof inv.customerEmail === 'string' ? inv.customerEmail : '',
    amountUsd:     amount,
    status:        typeof inv.status === 'string' ? inv.status : 'pending',
    paymentMethod: typeof inv.paymentMethod === 'string' ? inv.paymentMethod : 'stripe',
    createdAt:     typeof inv.createdAt === 'string' ? inv.createdAt : new Date().toISOString(),
    paidAt:        typeof inv.paidAt === 'string' ? inv.paidAt : null,
  });
  return new Response(bytes.slice().buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
});

export default invoices;
