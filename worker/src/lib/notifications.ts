/**
 * Notification center — durable, per-recipient, read/unread notifications.
 *
 *   notifications/{id} = {
 *     audience: 'operator' | 'user',   // who sees it
 *     uid:      string,                // recipient (user audience); '' for operator
 *     type:     string,                // 'feedback' | 'ticket' | 'alert' | 'token'
 *                                      //  | 'reply' | 'closed' | 'invoice_paid' | 'quote'
 *     targetType, targetId,            // what it points at
 *     route:    string,                // in-app navigation target (Route name, param-less)
 *     title:    string,                // human label (no PII)
 *     severity: 'info' | 'warning' | 'critical',
 *     read:     boolean, readAt: string,
 *     at:       ISO,
 *   }
 *
 * Worker-service-account write only; Firestore default-deny keeps it off the
 * client, and it is served exclusively through /api/notifications. No PII in the
 * title/target — operator notifications summarise by type, user notifications are
 * addressed by uid (an opaque id, not an email).
 */

import { firestoreSet } from './firestoreAdmin';

export type NotifAudience = 'operator' | 'user';
export type NotifSeverity = 'info' | 'warning' | 'critical';

export interface NotificationInput {
  audience:    NotifAudience;
  uid?:        string;          // required for 'user'
  type:        string;
  targetType?: string;
  targetId?:   string;
  route?:      string;          // param-less Route name, e.g. 'admin' | 'my-quotes' | 'billing'
  title:       string;
  severity?:   NotifSeverity;
  /** Stable id for idempotency (e.g. `reply_${ticketId}_${n}`). Random if absent. */
  id?:         string;
}

function randomId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Create a notification. Best-effort: a write failure is logged, never thrown, so
 * notifying can never fail the underlying action. Idempotent when `id` is given.
 */
export async function createNotification(saJson: string, input: NotificationInput): Promise<void> {
  const id = input.id ?? randomId();
  const doc = {
    id,
    audience:   input.audience,
    uid:        input.audience === 'user' ? (input.uid ?? '') : '',
    type:       input.type,
    targetType: input.targetType ?? input.type,
    targetId:   input.targetId ?? '',
    route:      input.route ?? '',
    title:      input.title,
    severity:   input.severity ?? 'info',
    read:       false,
    readAt:     '',
    at:         new Date().toISOString(),
  };
  try {
    await firestoreSet(saJson, `notifications/${id}`, doc, { merge: true });
  } catch (err) {
    console.warn('[notifications] write failed (non-fatal):', err instanceof Error ? err.message : err);
  }
}

/** Map a billing-alert kind → the in-app area a notification should open. */
export function routeForAlertKind(kind: string): { route: string; type: string } {
  switch (kind) {
    case 'feedback_received':        return { route: 'admin', type: 'feedback' };
    case 'support_ticket_created':   return { route: 'admin', type: 'ticket' };
    case 'demo_request_received':    return { route: 'admin', type: 'demo' };
    case 'demo_visibility_failed':   return { route: 'admin', type: 'demo' };
    case 'lead_contact_failed':      return { route: 'contacts', type: 'demo' };
    case 'crm_push_failed':           return { route: 'admin', type: 'demo' };
    case 'topup_credit_failed':
    case 'topup_credit_recovered':
    case 'invoice_amount_mismatch':  return { route: 'admin', type: 'token' };
    case 'notification_email_failed':return { route: 'admin', type: 'alert' };
    default:                         return { route: 'admin', type: 'alert' };
  }
}
