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
import { sendTransactional } from '../lib/sequenzy';
import { formatBankDetails } from '../lib/bank-details';
import { getStripe } from '../lib/stripe';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const invoices = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const INVOICE_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];
const CONFIRM_ROLES: RoleList = ['owner', 'admin']; // confirming + sending is admin-only
const AMOUNT_MAX = 10_000_000;

const QUOTE_DOC = (orgId: string, quoteId: string) => `organizations/${orgId}/quotes/${quoteId}`;

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
      success_url: `${a.appBase}/#/invoices?invoiceId=${encodeURIComponent(a.invoiceId)}&paid=1`,
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
async function sendClientInvoice(env: AppEnv['Bindings'], saJson: string, a: { orgId: string; invoiceId: string; project: string; customer: string; amount: number; appBase: string; paymentUrl?: string | null }): Promise<{ emailed: boolean; emailError?: string }> {
  if (!a.customer) return { emailed: false };
  const bankDetails = await resolveBankDetails(saJson, a.orgId);
  const appInvoiceUrl = `${a.appBase}/#/invoices?invoiceId=${encodeURIComponent(a.invoiceId)}`;
  const res = await sendTransactional(env.SEQUENZY_API_KEY, {
    to:      a.customer,
    slug:    'invoice-client',
    replyTo: env.ADMIN_EMAIL,
    variables: {
      PROJECT:      a.project,
      AMOUNT:       `$${a.amount.toLocaleString('en-US')}`,
      // Deep-link to the exact invoice so the panel highlights + scrolls to it.
      INVOICE_URL:  appInvoiceUrl,
      // ISSUE 6 — "Pay online": the Stripe Checkout link when configured, else the
      // in-app invoice page (so the button always works). Bank transfer stays below.
      PAYMENT_URL:  a.paymentUrl || appInvoiceUrl,
      BANK_DETAILS: bankDetails,
    },
  });
  if (!res.ok) console.warn('[invoices] invoice-client NOT sent (check SEQUENZY_API_KEY / invoice-client):', res.error ?? 'unknown');
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

  const rangeMinUsd = typeof quote.overrideMinUsd === 'number' ? quote.overrideMinUsd : typeof quote.priceMinUsd === 'number' ? quote.priceMinUsd : null;
  const rangeMaxUsd = typeof quote.overrideMaxUsd === 'number' ? quote.overrideMaxUsd : typeof quote.priceMaxUsd === 'number' ? quote.priceMaxUsd : null;
  let quoteTitle = `Quote ${quoteId.slice(0, 8)}`;
  if (typeof quote.renderJson === 'string') {
    try { const r = JSON.parse(quote.renderJson) as Record<string, unknown>; if (typeof r.docTitle === 'string' && r.docTitle) quoteTitle = r.docTitle; } catch { /* keep default */ }
  }
  const customer = typeof quote.customerEmail === 'string' ? quote.customerEmail : '';
  const nowIso = new Date().toISOString();

  const invoice = {
    id: invoiceId, quoteId, orgId, quoteTitle, customerEmail: customer,
    rangeMinUsd, rangeMaxUsd,
    expectedBudgetUsd: typeof quote.expectedBudgetUsd === 'number' ? quote.expectedBudgetUsd : null,
    amount, currency: 'usd', status: 'pending', source: 'quote', schemaVersion: 1,
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

  const paymentUrl = await ensureInvoicePaymentLink(env, saJson, { orgId, invoiceId, amount, project: quoteTitle, appBase });
  const { emailed, emailError } = await sendClientInvoice(env, saJson, { orgId, invoiceId, project: quoteTitle, customer, amount, appBase, paymentUrl });
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
    // Equality filter only (no orderBy) → no composite index needed; sort in JS.
    rows = await firestoreRunQuery(saJson, {
      from:  [{ collectionId: 'invoices' }],
      where: { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
      limit: 200,
    });
  } catch (err) {
    console.error('[invoices] query failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load invoices.', code: 'QUERY_FAILED' }, 500);
  }

  const items = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    return {
      id:            typeof f.id === 'string' ? f.id : (r.name.split('/').pop() ?? ''),
      quoteId:       typeof f.quoteId === 'string' ? f.quoteId : '',
      customerEmail: typeof f.customerEmail === 'string' ? f.customerEmail : '',
      amount:        typeof f.amount === 'number' ? f.amount : null,
      currency:      typeof f.currency === 'string' ? f.currency : 'usd',
      rangeMinUsd:   typeof f.rangeMinUsd === 'number' ? f.rangeMinUsd : null,
      rangeMaxUsd:   typeof f.rangeMaxUsd === 'number' ? f.rangeMaxUsd : null,
      expectedBudgetUsd: typeof f.expectedBudgetUsd === 'number' ? f.expectedBudgetUsd : null,
      status:        typeof f.status === 'string' ? f.status : 'draft',
      paymentUrl:    typeof f.paymentUrl === 'string' ? f.paymentUrl : null,
      createdAt:     typeof f.createdAt === 'string' ? f.createdAt : '',
    };
  });
  // Newest first.
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  return c.json({ ok: true, invoices: items });
});

/* ── POST /api/invoices/:id/confirm — admin re-amounts + re-sends an invoice ────
 *
 * Owner/admin only. Operates on an EXISTING invoice (created by finalise): updates
 * the amount → pending and re-sends the invoice-client email (e.g. when the first
 * send failed, or the amount needs correcting). It also still upgrades any legacy
 * 'draft' invoice to pending. NO Stripe execution: the payment link is a placeholder
 * (bank transfer is the live method). A paid invoice is final, never re-amounted.
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

  let body: { amount?: unknown };
  try { body = await c.req.json() as { amount?: unknown }; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const amount = typeof body.amount === 'number' ? Math.round(body.amount) : NaN;
  if (!Number.isFinite(amount) || amount <= 0 || amount > AMOUNT_MAX) {
    return c.json({ error: 'A valid amount is required.', code: 'INVALID_AMOUNT' }, 400);
  }

  const invPath = `invoices/${id}`;
  const inv = await firestoreGet(saJson, invPath) as Record<string, unknown> | null;
  if (!inv) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  // Cross-org guard: an admin of org A must not touch org B's invoice.
  if (inv.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
  // A paid invoice is final — never re-amount or re-send. Draft OR pending can be
  // (re)confirmed: draft = first confirm; pending = an explicit admin re-send with a
  // possibly-updated amount (admin-initiated via a button, so not an accidental dup).
  if (inv.status === 'paid') {
    return c.json({ ok: true, status: 'paid', alreadyConfirmed: true });
  }

  // Persist amount + pending. NO Stripe execution: the payment link is a
  // placeholder (app invoices page) until Stripe Checkout is wired.
  await firestoreSet(saJson, invPath, {
    amount, status: 'pending', confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Send the invoice to the customer (best-effort, non-fatal).
  const appBase  = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const project  = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle
    : typeof inv.quoteId === 'string' ? `Quote ${inv.quoteId.slice(0, 8)}` : id;
  const customer = typeof inv.customerEmail === 'string' ? inv.customerEmail : '';
  // Re-amount may change the total → mint a fresh payment link for the new amount and
  // void the old one (so the client can't pay a stale total).
  const paymentUrl = await ensureInvoicePaymentLink(env, saJson, { orgId, invoiceId: id, amount, project, appBase, prevSessionId: typeof inv.paymentSessionId === 'string' ? inv.paymentSessionId : undefined });
  const { emailed, emailError } = await sendClientInvoice(env, saJson, { orgId, invoiceId: id, project, customer, amount, appBase, paymentUrl });
  dlog(env, '[invoices] confirmed (re-send)', id, 'emailed=', emailed, 'payLink=', !!paymentUrl);

  return c.json({ ok: true, status: 'pending', amount, emailed, paymentUrl: paymentUrl ?? null, ...(emailError ? { emailError } : {}) });
});

/* ── POST /api/invoices/finalize — admin sets the final amount → the invoice is born ──
 *
 * Owner/admin only. STEP 4 of the workflow: the admin confirms the final amount for
 * an accepted/negotiating quote. This is the ONLY place an invoice is created (status
 * 'pending') — no invoice exists before this point (FIX 1). The client invoice email
 * is sent and the quote advances to stage 'finalized' → 'invoice_sent'. Idempotent:
 * a quote whose invoice already exists is returned unchanged, never recreated.
 * Cross-org safe — orgId is the membership-verified org from requireRole.
 */
invoices.post('/api/invoices/finalize', requireAuth(), requireRole(CONFIRM_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified
  let body: { quoteId?: unknown; amount?: unknown };
  try { body = await c.req.json() as { quoteId?: unknown; amount?: unknown }; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const quoteId = typeof body.quoteId === 'string' ? body.quoteId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) : '';
  if (!quoteId) return c.json({ error: 'quoteId required.', code: 'INVALID_QUOTE_ID' }, 400);
  const amount = typeof body.amount === 'number' ? Math.round(body.amount) : NaN;
  if (!Number.isFinite(amount) || amount <= 0 || amount > AMOUNT_MAX) {
    return c.json({ error: 'A valid amount is required.', code: 'INVALID_AMOUNT' }, 400);
  }

  const quote = await firestoreGet(saJson, QUOTE_DOC(orgId, quoteId)) as Record<string, unknown> | null;
  if (!quote) return c.json({ error: 'Quote not found.', code: 'NOT_FOUND' }, 404);
  // Governance guard (ISSUE 3): a blocked/suspended quote cannot be invoiced.
  if (quote.adminState === 'blocked' || quote.adminState === 'suspended') {
    return c.json({ error: 'This quote is blocked or suspended.', code: 'QUOTE_BLOCKED' }, 409);
  }

  // Defense-in-depth: an existing invoice for this quote must belong to the caller's org.
  const existing0 = await firestoreGet(saJson, `invoices/quote_${quoteId}`) as Record<string, unknown> | null;
  if (existing0 && existing0.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);

  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const r = await finalizeQuoteInvoice(env, saJson, { orgId, quoteId, quote, amount, appBase });
  if (r.alreadyFinalized) return c.json({ ok: true, status: r.status, invoiceId: r.invoiceId, alreadyFinalized: true });
  dlog(env, '[invoices] finalized', quoteId, 'emailed=', r.emailed, 'payLink=', !!r.paymentUrl);
  return c.json({ ok: true, status: 'pending', amount: r.amount, emailed: r.emailed, invoiceId: r.invoiceId, paymentUrl: r.paymentUrl ?? null, ...(r.emailError ? { emailError: r.emailError } : {}) });
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

  const project = typeof inv.quoteTitle === 'string' && inv.quoteTitle ? inv.quoteTitle : id;
  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const paymentUrl = await ensureInvoicePaymentLink(env, saJson, { orgId, invoiceId: id, amount, project, appBase, existingUrl: typeof inv.paymentUrl === 'string' ? inv.paymentUrl : undefined });
  if (!paymentUrl) return c.json({ error: 'Online payment is not configured.', code: 'PAYMENT_UNAVAILABLE' }, 503);
  return c.json({ ok: true, paymentUrl });
});

export default invoices;
