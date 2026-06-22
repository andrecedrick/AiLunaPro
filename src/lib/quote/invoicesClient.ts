/**
 * Invoices client — read-only list for the quote → accept → invoice flow.
 * Calls the auth-gated, org-scoped worker route with the Firebase ID token.
 * No payment, no Stripe — display only.
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
  expectedBudgetUsd?: number | null;
  status:        string;
  paymentUrl?:   string | null;
  createdAt:     string;
}

/** A quote a client has responded to, awaiting the admin's final amount (no invoice yet). */
export interface PendingQuote {
  quoteId:           string;
  quoteTitle:        string;
  customerEmail:     string;
  rangeMinUsd:       number | null;
  rangeMaxUsd:       number | null;
  expectedBudgetUsd: number | null;
  message:           string;
  stage:             string;   // 'client_responded' | 'negotiation'
  decision:          string;   // 'accepted' | 'discussion'
  decidedAt:         string;
}

/** A quote at any lifecycle stage — full-visibility tracking (sender + admin). */
export interface QuoteListItem {
  quoteId:           string;
  quoteTitle:        string;
  customerEmail:     string;
  rangeMinUsd:       number | null;
  rangeMaxUsd:       number | null;
  expectedBudgetUsd: number | null;
  message:           string;
  stage:             string;   // 'sent' | 'client_responded' | 'negotiation' | 'finalized' | 'invoice_sent'
  status:            string;   // raw quote.status (generated/overridden/accepted/discussion)
  adminState:        string;   // 'blocked' | 'suspended' | '' (admin governance)
  decision:          string;   // 'accepted' | 'discussion' | ''
  createdAt:         string;
  sentAt:            string;
  decidedAt:         string;
  updatedAt:         string;
}

/** List the org's quotes. `mine` → only the caller's own (for /my-quotes); otherwise
 *  owner/admin get full org visibility (incl. drafts), server-enforced. Throws on non-OK. */
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

/** Admin: edit a quote (budget / message) or govern it (block / suspend / re-activate).
 *  Owner/admin + org-scoped, server-enforced. Throws on non-OK. */
export async function patchQuote(
  orgId: string, quoteId: string,
  input: { adminState?: 'blocked' | 'suspended' | 'active'; expectedBudgetUsd?: number; message?: string },
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

/** Admin: get/create the Stripe payment link for an invoice (ISSUE 6). Throws
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

/** The finalize-amount prefill: default to the client's PROPOSED BUDGET (so the invoice
 *  matches the budget), then the estimate range ceiling, else blank. USD integer. */
export function prefillFinalizeAmount(q: { expectedBudgetUsd: number | null; rangeMaxUsd: number | null }): string {
  if (q.expectedBudgetUsd != null && q.expectedBudgetUsd > 0) return String(q.expectedBudgetUsd);
  if (q.rangeMaxUsd != null) return String(q.rangeMaxUsd);
  return '';
}

/** Admin: list quotes awaiting the final amount (the pricing queue). Throws on non-OK. */
export async function listPendingQuotes(orgId: string): Promise<PendingQuote[]> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/quote/pending?orgId=${encodeURIComponent(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { quotes?: PendingQuote[] } | null;
  return j?.quotes ?? [];
}

/** Admin: confirm the final amount for a quote → creates the invoice + sends it to
 *  the client (STEP 4). The ONLY place an invoice is created. Throws on non-OK. */
export async function finalizeQuote(orgId: string, quoteId: string, amount: number): Promise<{ status: string; emailed: boolean }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/invoices/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, quoteId, amount }),
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { status?: string; emailed?: boolean } | null;
  return { status: j?.status ?? 'pending', emailed: j?.emailed === true };
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

/** Admin: confirm the final amount and send the invoice (draft → pending).
 *  No Stripe execution yet. Throws on a non-OK response. */
export async function confirmInvoice(orgId: string, id: string, amount: number): Promise<{ status: string; emailed: boolean }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/invoices/${encodeURIComponent(id)}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ orgId, amount }),
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { status?: string; emailed?: boolean } | null;
  return { status: j?.status ?? 'pending', emailed: j?.emailed === true };
}
