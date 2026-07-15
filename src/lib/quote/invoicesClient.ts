/**
 * Invoices client — read-only list for the quote → accept → pay flow.
 * Calls the auth-gated, org-scoped worker route with the Firebase ID token.
 * Fixed-price model: no admin pricing/finalize — display + governance + re-send only.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export interface InvoiceItem {
  id:            string;
  quoteId:       string;
  quoteTitle?:   string;
  customerEmail: string;
  amount:        number | null;
  currency:      string;
  rangeMinUsd:   number | null;
  rangeMaxUsd:   number | null;
  status:        string;
  paymentUrl?:   string | null;
  paymentMethod?: string;              // 'stripe' | 'bank_transfer'
  transferInitiatedAt?: string | null;
  transferDeadline?:    string | null;
  paidAt?:       string | null;
  createdAt:     string;
}

/** A quote at any lifecycle stage — full-visibility tracking (sender + superadmin). */
export interface QuoteListItem {
  quoteId:           string;
  quoteTitle:        string;
  customerEmail:     string;
  createdBy:         string;        // client/sender uid (superadmin visibility)
  orgId:             string;
  source:            string;        // audit / dashboard / …
  price:             number | null; // the single LOCKED price (USD)
  currency:          string;
  rangeMinUsd:       number | null; // the estimate range (informational)
  rangeMaxUsd:       number | null;
  stage:             string;   // 'sent' | 'client_responded' | 'finalized' | 'invoice_sent'
  status:            string;
  adminState:        string;   // 'blocked' | 'suspended' | '' (admin governance)
  decision:          string;   // 'accepted' | ''
  createdAt:         string;
  sentAt:            string;
  decidedAt:         string;   // accepted-at
  updatedAt:         string;
  // Payment (superadmin, joined from the invoice; blank until accepted/invoiced).
  paymentStatus:     string;   // 'pending' | 'paid' | ''
  paidAt:            string;
  stripePaymentId:   string;   // Stripe Checkout session id
  paymentUrl:        string;
  invoiceAmount:     number | null;
}

/** List the org's quotes. `mine` → only the caller's own (for /my-quotes); otherwise
 *  owner/admin/superadmin get full org visibility (incl. drafts), server-enforced. */
export async function listAllQuotes(orgId: string, opts?: { mine?: boolean }): Promise<QuoteListItem[]> {
  const idToken = await getIdToken();
  const q = `orgId=${encodeURIComponent(orgId)}${opts?.mine ? '&mine=1' : ''}`;
  const res = await fetch(`${WORKER_BASE}/api/quote/list?${q}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { quotes?: QuoteListItem[] } | null;
  return j?.quotes ?? [];
}

/** Platform operator ONLY: TRUE cross-org quote visibility (collectionGroup, all orgs).
 *  Read-only. 403 for non-operators (requirePlatformAdmin, server-enforced). */
export async function listPlatformQuotes(): Promise<QuoteListItem[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/platform/quotes`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { quotes?: QuoteListItem[] } | null;
  return j?.quotes ?? [];
}

/** Admin GOVERNANCE only: block / suspend / re-activate a quote. Fixed-price — there is
 *  no price/budget/message edit. Owner/admin + org-scoped, server-enforced. */
export async function patchQuote(
  orgId: string, quoteId: string,
  input: { adminState?: 'blocked' | 'suspended' | 'active'; finalPriceUsd?: number | null; priceReason?: string },
): Promise<void> {
  const idToken = await getIdToken();
  // orgId goes in the QUERY string: requireRole only clones the body for POST, so a
  // PATCH must carry orgId as ?orgId= (same as the GET clients) or it 400s.
  const res = await fetch(`${WORKER_BASE}/api/quote/${encodeURIComponent(quoteId)}?orgId=${encodeURIComponent(orgId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, ...input }),
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
}

/** Admin RECOVERY (P4.1): create the missing invoice for an ACCEPTED quote whose
 *  auto-invoice failed on accept. Idempotent server-side (create-if-not-exists → no
 *  duplicate invoice / charge). Owner/admin, org-scoped. Throws on a non-OK response. */
export async function finalizeQuote(orgId: string, quoteId: string): Promise<{ finalized: boolean; paymentUrl?: string | null; paymentMethod?: string }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/${encodeURIComponent(quoteId)}/finalize?orgId=${encodeURIComponent(orgId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  const j = await res.json().catch(() => null) as { finalized?: boolean; paymentUrl?: string | null; paymentMethod?: string; code?: string } | null;
  if (!res.ok) throw new Error(j?.code ?? `HTTP_${res.status}`);
  return { finalized: j?.finalized === true, paymentUrl: j?.paymentUrl ?? null, paymentMethod: j?.paymentMethod };
}

/** Admin: get/create the Stripe payment link for an invoice. Throws
 *  QuoteGenError('PAYMENT_UNAVAILABLE') when Stripe is not configured (→ bank transfer). */
export async function createInvoicePaymentLink(orgId: string, invoiceId: string): Promise<{ paymentUrl: string | null; status?: string }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/invoices/${encodeURIComponent(invoiceId)}/payment-link?orgId=${encodeURIComponent(orgId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  const j = await res.json().catch(() => null) as { paymentUrl?: string | null; status?: string; code?: string } | null;
  if (!res.ok) throw new Error(j?.code ?? `HTTP_${res.status}`);
  return { paymentUrl: j?.paymentUrl ?? null, status: j?.status };
}

/** List the org's invoices (newest first). Throws on a non-OK response. */
export async function listInvoices(orgId: string): Promise<InvoiceItem[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/invoices?orgId=${encodeURIComponent(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { invoices?: InvoiceItem[] } | null;
  return j?.invoices ?? [];
}

/** Admin: RE-SEND an invoice to the client (fixed amount = quote.price, immutable).
 *  No amount input, no re-amount. Throws on a non-OK response. */
export async function resendInvoice(orgId: string, id: string): Promise<{ status: string; emailed: boolean; code?: string; emailError?: string }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/invoices/${encodeURIComponent(id)}/confirm?orgId=${encodeURIComponent(orgId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId }),
  });
  const j = await res.json().catch(() => null) as { status?: string; emailed?: boolean; code?: string; emailError?: string } | null;
  // NO_RECIPIENT is a known, actionable outcome (missing client email) — surface its code
  // to the UI rather than throwing a generic error. Other non-OK statuses still throw.
  if (!res.ok && j?.code !== 'NO_RECIPIENT') throw new Error(j?.code ?? `HTTP_${res.status}`);
  return { status: j?.status ?? 'pending', emailed: j?.emailed === true, code: j?.code, emailError: j?.emailError };
}

/** Admin: mark a BANK-TRANSFER invoice paid (owner/admin, org-scoped). The worker
 *  refuses this for Stripe invoices (they reconcile via webhook). Idempotent. */
export async function markInvoicePaid(orgId: string, invoiceId: string): Promise<{ status: string }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/invoices/${encodeURIComponent(invoiceId)}/mark-paid?orgId=${encodeURIComponent(orgId)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }, body: JSON.stringify({ orgId }),
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { status?: string } | null;
  return { status: j?.status ?? 'paid' };
}
