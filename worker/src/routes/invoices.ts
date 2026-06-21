/**
 * Invoices route — read-only listing for the quote → accept → invoice flow.
 *
 *   GET /api/invoices?orgId=…
 *
 * Auth + role gated (owner/admin/billing/member; client → 403). orgId is the
 * membership-verified org from requireRole, so there is no cross-org access.
 * Lists the org's invoices (draft today; pending/paid later). No payment, no
 * Stripe, no email — purely a read of the worker-only `invoices` collection.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreRunQuery, firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { sendTransactional } from '../lib/sequenzy';
import { formatBankDetails } from '../lib/bank-details';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const invoices = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const INVOICE_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];
const CONFIRM_ROLES: RoleList = ['owner', 'admin']; // confirming + sending is admin-only
const AMOUNT_MAX = 10_000_000;

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

/* ── POST /api/invoices/:id/confirm — admin confirms + sends the invoice ────
 *
 * Owner/admin only. The admin sets the final amount; the invoice goes draft →
 * pending and the invoice-client email is sent to the customer. NO Stripe
 * execution yet: the payment link is a placeholder (bank transfer is the live
 * method). Idempotent — a non-draft invoice is returned unchanged, never re-sent.
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

  // Region-aware bank-transfer details from the org settings doc (optional).
  let bankDetails = '';
  try {
    const settings = await firestoreGet(saJson, `organizations/${orgId}/settings/billing`) as Record<string, unknown> | null;
    bankDetails = formatBankDetails(settings);
  } catch { /* bank details optional */ }
  // FIX 4 — never render a blank bank block in the email; show a graceful note
  // when the org hasn't configured details (Settings → Organization → Bank details).
  if (!bankDetails) bankDetails = 'Bank-transfer details available on request — reply to this email.';

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
  let emailed = false;
  let emailError: string | undefined;
  if (customer) {
    const res = await sendTransactional(env.SEQUENZY_API_KEY, {
      to:      customer,
      slug:    'invoice-client',
      replyTo: env.ADMIN_EMAIL,
      variables: {
        PROJECT:     project,
        AMOUNT:      `$${amount.toLocaleString('en-US')}`,
        INVOICE_URL: `${appBase}/#/invoices`, // "View your invoice" (placeholder pay link until Stripe Checkout)
        BANK_DETAILS: bankDetails,
      },
    });
    emailed = res.ok;
    emailError = res.error;
    // Surface a failed send loudly in the logs (no PII — status only). The most
    // common cause is an unset SEQUENZY_API_KEY or a missing invoice-client template.
    if (!emailed) console.warn('[invoices] confirm email NOT sent (check SEQUENZY_API_KEY / invoice-client):', res.error ?? 'unknown');
  }
  // Outcome log — id + flags only, no customer data.
  dlog(env, '[invoices] confirmed', id, 'emailed=', emailed);

  return c.json({ ok: true, status: 'pending', amount, emailed, ...(emailError ? { emailError } : {}) });
});

export default invoices;
