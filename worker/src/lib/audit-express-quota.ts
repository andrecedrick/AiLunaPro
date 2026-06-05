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

export const FREE_PDF_LIMIT = 3;
export const PDF_TOKEN_ACTION = 'audit_express.pdf' as const;

export type QuotaResult =
  | { ok: true; mode: 'free' | 'tokens'; remainingFree: number }
  | { ok: false; status: 402; code: 'PDF_LIMIT_REACHED' | 'TOKENS_INSUFFICIENT'; balance?: number; required?: number };

const usagePath = (orgId: string, uid: string) => `organizations/${orgId}/auditExpressUsage/${uid}`;

/**
 * Check + record one PDF download. `chargeKey` (e.g. auditId or inputsHash) makes
 * the token charge idempotent for the same download index. `useTokens` must be
 * true to spend tokens past the free tier.
 */
export async function enforcePdfQuota(
  saJson: string,
  orgId: string,
  uid: string,
  chargeKey: string,
  useTokens: boolean,
): Promise<QuotaResult> {
  const path = usagePath(orgId, uid);
  const doc = await firestoreGet(saJson, path);
  const count = doc && typeof doc.pdfCount === 'number' ? doc.pdfCount : 0;

  if (count < FREE_PDF_LIMIT) {
    await firestoreSet(saJson, path, { pdfCount: count + 1, updatedAt: new Date().toISOString() }, { merge: true });
    return { ok: true, mode: 'free', remainingFree: FREE_PDF_LIMIT - (count + 1) };
  }

  if (!useTokens) return { ok: false, status: 402, code: 'PDF_LIMIT_REACHED' };

  // Idempotent per (user, audit): the first paid export of a given audit is
  // charged; re-downloading the SAME audit reuses the eventId and is NOT
  // double-charged (protects against accidental re-clicks / flaky downloads).
  const eventId = `audit_express_pdf:${uid}:${chargeKey}`;
  const r = await consumeTokens(saJson, orgId, PDF_TOKEN_ACTION, uid, eventId, { kind: 'audit_express_pdf' });
  if (!r.ok) return { ok: false, status: 402, code: 'TOKENS_INSUFFICIENT', balance: r.balance, required: r.required };

  await firestoreSet(saJson, path, { pdfCount: count + 1, updatedAt: new Date().toISOString() }, { merge: true });
  return { ok: true, mode: 'tokens', remainingFree: 0 };
}
