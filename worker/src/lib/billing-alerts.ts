/**
 * Durable billing alerts + retryable-webhook signalling.
 *
 * Cloudflare worker logs are real-time only (`wrangler tail`) — a `console.error`
 * for a failed token credit or a mismatched invoice is invisible minutes later.
 * `recordBillingAlert` writes a persistent, queryable document so a money-safety
 * failure survives the request and can be surfaced/reconciled later.
 *
 * Path: `platform_alerts/{alertId}` — worker-service-account write only.
 * Firestore's default-deny covers client access (no client rule grants it), so
 * these records are never reachable from the browser.
 */

import { firestoreSet } from './firestoreAdmin';

export type BillingAlertKind =
  | 'topup_credit_failed'      // paid, but incrementBalance failed — customer owed tokens
  | 'invoice_amount_mismatch'  // Stripe settled an amount ≠ the invoice total
  | 'topup_credit_recovered';  // a retry completed a previously-failed credit

export interface BillingAlertInput {
  kind:      BillingAlertKind;
  severity:  'critical' | 'warning';
  orgId?:    string;
  sessionId?: string;
  invoiceId?: string;
  message:   string;
  /** Non-PII context (ids, amounts, token counts). Never email/name/message text. */
  context?:  Record<string, string | number | boolean>;
}

/**
 * Persist a billing alert. Best-effort and self-contained: alerting must never
 * be the reason a webhook fails, so a write error is swallowed after logging.
 *
 * `alertId`, when derivable from a stable id (session/invoice), makes the alert
 * idempotent — a Stripe retry overwrites the same doc instead of spawning a new
 * one per delivery.
 */
export async function recordBillingAlert(saJson: string, input: BillingAlertInput): Promise<void> {
  const idBase = input.sessionId ?? input.invoiceId ?? `${Date.now()}`;
  const alertId = `${input.kind}__${idBase}`;
  const doc = {
    kind:      input.kind,
    severity:  input.severity,
    orgId:     input.orgId ?? '',
    sessionId: input.sessionId ?? '',
    invoiceId: input.invoiceId ?? '',
    message:   input.message,
    context:   JSON.stringify(input.context ?? {}),
    resolved:  false,
    at:        new Date().toISOString(),
  };
  // Loud log first (real-time visibility), THEN durable record.
  console.error(`[billing-alert:${input.severity}] ${input.kind} — ${input.message}`, doc.context);
  try {
    await firestoreSet(saJson, `platform_alerts/${alertId}`, doc, { merge: true });
  } catch (err) {
    console.error('[billing-alert] durable write FAILED (alert not persisted):', err instanceof Error ? err.message : err);
  }
}

/**
 * Thrown by a webhook handler when work was CLAIMED but not COMPLETED (e.g. the
 * token credit failed after the claim). The webhook entrypoint maps this to a
 * non-2xx response so Stripe REDELIVERS the event — the retry re-claims and
 * completes the work. Distinct from a plain handler error, which stays 2xx so
 * Stripe does not retry a permanently-bad event forever.
 */
export class RetryableWebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableWebhookError';
  }
}
