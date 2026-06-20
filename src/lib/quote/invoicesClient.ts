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
  status:        string;
  createdAt:     string;
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
