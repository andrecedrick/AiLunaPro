/**
 * Audit Express PDF fair-usage quota (J16.1). Org-scoped, per-user, server-side.
 *
 *   - First FREE_PDF_LIMIT (3) PDF downloads per user are free.
 *   - After that, each download consumes PDF_TOKEN_ACTION tokens (idempotent per
 *     download index via consumeTokens' eventId).
 *
 * No PII stored (uid + counts only). Cannot be bypassed (enforced before bytes
 * are served on every PDF route).
 */

import { firestoreGet, firestoreSet } from './firestoreAdmin';
import { consumeTokens } from './tokens';
import type { TokenAction } from './token-costs';

export const FREE_PDF_LIMIT = 3;
export const PDF_TOKEN_ACTION = 'audit_express.pdf' as const;

export type QuotaResult =
  | { ok: true; mode: 'free' | 'tokens'; remainingFree: number }
  | { ok: false; status: 402; code: 'PDF_LIMIT_REACHED' | 'TOKENS_INSUFFICIENT'; balance?: number; required?: number };

/**
 * Per-feature PDF quota config. Defaults reproduce the original Audit Express
 * behavior EXACTLY (same usage collection, action, and eventId prefix), so
 * existing idempotency keys / counters are unchanged.
 */
export interface PdfQuotaOpts {
  action?: TokenAction;     // token action charged past the free tier
  usageCollection?: string; // Firestore subcollection holding the per-user counter
  eventPrefix?: string;     // idempotency key prefix for consumeTokens
  metadataKind?: string;    // ledger metadata.kind
  freeLimit?: number;       // free downloads before tokens kick in
}

/**
 * Check + record one PDF download. `chargeKey` (e.g. auditId/reportId) makes the
 * token charge idempotent per (user, item). `useTokens` must be true to spend
 * tokens past the free tier. Pass `opts` to scope a different feature's pool.
 */
export async function enforcePdfQuota(
  saJson: string,
  orgId: string,
  uid: string,
  chargeKey: string,
  useTokens: boolean,
  opts: PdfQuotaOpts = {},
): Promise<QuotaResult> {
  const action = opts.action ?? PDF_TOKEN_ACTION;
  const usageCollection = opts.usageCollection ?? 'auditExpressUsage';
  const eventPrefix = opts.eventPrefix ?? 'audit_express_pdf';
  const metadataKind = opts.metadataKind ?? 'audit_express_pdf';
  const freeLimit = opts.freeLimit ?? FREE_PDF_LIMIT;

  const path = `organizations/${orgId}/${usageCollection}/${uid}`;
  const doc = await firestoreGet(saJson, path);
  const count = doc && typeof doc.pdfCount === 'number' ? doc.pdfCount : 0;

  if (count < freeLimit) {
    await firestoreSet(saJson, path, { pdfCount: count + 1, updatedAt: new Date().toISOString() }, { merge: true });
    return { ok: true, mode: 'free', remainingFree: freeLimit - (count + 1) };
  }

  if (!useTokens) return { ok: false, status: 402, code: 'PDF_LIMIT_REACHED' };

  // Idempotent per (user, item): the first paid export of a given item is
  // charged; re-downloading the SAME item reuses the eventId and is NOT
  // double-charged (protects against accidental re-clicks / flaky downloads).
  const eventId = `${eventPrefix}:${uid}:${chargeKey}`;
  const r = await consumeTokens(saJson, orgId, action, uid, eventId, { kind: metadataKind });
  if (!r.ok) return { ok: false, status: 402, code: 'TOKENS_INSUFFICIENT', balance: r.balance, required: r.required };

  await firestoreSet(saJson, path, { pdfCount: count + 1, updatedAt: new Date().toISOString() }, { merge: true });
  return { ok: true, mode: 'tokens', remainingFree: 0 };
}
