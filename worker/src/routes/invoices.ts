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
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreRunQuery, firestoreGet, firestoreSet, firestoreCreateIfNotExists } from '../lib/firestoreAdmin';
import { sendTransactional } from '../lib/sequenzy';
import { formatBankDetails } from '../lib/bank-details';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const invoices = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const INVOICE_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];
const CONFIRM_ROLES: RoleList = ['owner', 'admin']; // confirming + sending is admin-only
const AMOUNT_MAX = 10_000_000;

const QUOTE_DOC = (orgId: string, quoteId: string) => `organizations/${orgId}/quotes/${quoteId}`;

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
async function sendClientInvoice(env: AppEnv['Bindings'], saJson: string, a: { orgId: string; invoiceId: string; project: string; customer: string; amount: number; appBase: string }): Promise<{ emailed: boolean; emailError?: string }> {
  if (!a.customer) return { emailed: false };
  const bankDetails = await resolveBankDetails(saJson, a.orgId);
  const res = await sendTransactional(env.SEQUENZY_API_KEY, {
    to:      a.customer,
    slug:    'invoice-client',
    replyTo: env.ADMIN_EMAIL,
    variables: {
      PROJECT:      a.project,
      AMOUNT:       `$${a.amount.toLocaleString('en-US')}`,
      // Deep-link to the exact invoice so the panel highlights + scrolls to it.
      INVOICE_URL:  `${a.appBase}/#/invoices?invoiceId=${encodeURIComponent(a.invoiceId)}`,
      BANK_DETAILS: bankDetails,
    },
  });
  if (!res.ok) console.warn('[invoices] invoice-client NOT sent (check SEQUENZY_API_KEY / invoice-client):', res.error ?? 'unknown');
  return { emailed: res.ok, emailError: res.error };
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
  const { emailed, emailError } = await sendClientInvoice(env, saJson, { orgId, invoiceId: id, project, customer, amount, appBase });
  dlog(env, '[invoices] confirmed (re-send)', id, 'emailed=', emailed);

  return c.json({ ok: true, status: 'pending', amount, emailed, ...(emailError ? { emailError } : {}) });
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

  const invPath = `invoices/quote_${quoteId}`;
  const existing = await firestoreGet(saJson, invPath) as Record<string, unknown> | null;
  if (existing) {
    // Defense-in-depth on the flat invoices/ collection: the org-scoped quote lookup
    // above already prevents reaching another org's invoice, but assert it explicitly.
    if (existing.orgId !== orgId) return c.json({ error: 'Invoice not found.', code: 'NOT_FOUND' }, 404);
    // Already finalized — never recreate / re-amount / re-send (idempotent).
    return c.json({ ok: true, status: typeof existing.status === 'string' ? existing.status : 'pending', invoiceId: `quote_${quoteId}`, alreadyFinalized: true });
  }

  // Derive the invoice fields from the persisted quote (title from the render).
  const rangeMinUsd = typeof quote.overrideMinUsd === 'number' ? quote.overrideMinUsd : typeof quote.priceMinUsd === 'number' ? quote.priceMinUsd : null;
  const rangeMaxUsd = typeof quote.overrideMaxUsd === 'number' ? quote.overrideMaxUsd : typeof quote.priceMaxUsd === 'number' ? quote.priceMaxUsd : null;
  let quoteTitle = `Quote ${quoteId.slice(0, 8)}`;
  if (typeof quote.renderJson === 'string') {
    try { const r = JSON.parse(quote.renderJson) as Record<string, unknown>; if (typeof r.docTitle === 'string' && r.docTitle) quoteTitle = r.docTitle; } catch { /* keep default */ }
  }
  const customer = typeof quote.customerEmail === 'string' ? quote.customerEmail : '';
  const nowIso = new Date().toISOString();

  const invoice = {
    id: `quote_${quoteId}`, quoteId, orgId, quoteTitle, customerEmail: customer,
    rangeMinUsd, rangeMaxUsd,
    expectedBudgetUsd: typeof quote.expectedBudgetUsd === 'number' ? quote.expectedBudgetUsd : null,
    amount, currency: 'usd', status: 'pending', source: 'quote', schemaVersion: 1,
    createdAt: nowIso, confirmedAt: nowIso,
  };
  // Atomic create-once: if two finalise requests race (double-click / retry / two
  // admins), the loser throws ALREADY_EXISTS and returns WITHOUT re-sending the client
  // email. The firestoreGet fast-path above is just an optimisation, not the guard.
  try {
    await firestoreCreateIfNotExists(saJson, invPath, invoice as unknown as Parameters<typeof firestoreCreateIfNotExists>[2]);
  } catch (err) {
    if (err instanceof Error && err.message === 'ALREADY_EXISTS') {
      return c.json({ ok: true, status: 'pending', invoiceId: `quote_${quoteId}`, alreadyFinalized: true });
    }
    throw err;
  }
  // Quote → finalized now; → invoice_sent only if the client email actually goes out
  // (so a failed send leaves it re-sendable from the invoices list).
  await firestoreSet(saJson, QUOTE_DOC(orgId, quoteId), { stage: 'finalized', finalAmountUsd: amount, updatedAt: nowIso }, { merge: true });

  const appBase = (env.APP_BASE_URL ?? new URL(c.req.url).origin).replace(/\/+$/, '');
  const { emailed, emailError } = await sendClientInvoice(env, saJson, { orgId, invoiceId: `quote_${quoteId}`, project: quoteTitle, customer, amount, appBase });
  if (emailed) await firestoreSet(saJson, QUOTE_DOC(orgId, quoteId), { stage: 'invoice_sent', invoiceSentAt: nowIso }, { merge: true });
  dlog(env, '[invoices] finalized', quoteId, 'emailed=', emailed);

  return c.json({ ok: true, status: 'pending', amount, emailed, invoiceId: `quote_${quoteId}`, ...(emailError ? { emailError } : {}) });
});

export default invoices;
