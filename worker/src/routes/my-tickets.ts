/**
 * Customer "My Tickets" — the in-app side of the support loop.
 *
 *   GET  /api/support/my-tickets           — the caller's own tickets + history
 *   POST /api/support/my-reply { ticketId, message }  — customer replies back
 *   POST /api/support/my-close { ticketId }           — customer closes
 *
 * Auth required. A caller only ever sees/acts on tickets whose `uid` matches the
 * verified token uid — enforced on every read and write (no cross-customer access).
 *
 * Reuses the EXISTING support_tickets model (no new ticketing system): the same
 * `replies[]` array the operator writes, so operator + customer share one thread.
 * A customer reply flips the ticket back to 'open' (needs the operator) and
 * notifies the operator in-app + by email — independent of the reply email that
 * goes the other way, so the conversation works even if a template is missing.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { firestoreRunQuery, firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { sanitizeText } from '../lib/support-shared';
import { recordBillingAlert, sendObservableEmail } from '../lib/billing-alerts';
import { createNotification } from '../lib/notifications';
import type { AppEnv } from '../index';

const myTickets = new Hono<AppEnv>();

const SCAN = 300;
const REPLY_MAX = 4000;

function str(v: unknown): string { return v === null || v === undefined ? '' : String(v); }
function safeTicketId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const id = raw.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

interface Reply { message: string; repliedAt: string; repliedBy: string; [k: string]: string }
function mapReplies(raw: unknown): Reply[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(r => {
    const o = (r ?? {}) as Record<string, unknown>;
    return { message: str(o.message), repliedAt: str(o.repliedAt), repliedBy: str(o.repliedBy) };
  });
}

/** A ticket as the OWNER sees it — no other customer's data is ever returned. */
function mapMine(name: string, f: Record<string, unknown>) {
  return {
    id:          str(f.id) || (name.split('/').pop() ?? ''),
    type:        str(f.type),
    status:      str(f.status) || 'open',
    description: str(f.description),
    createdAt:   str(f.createdAt),
    replies:     mapReplies(f.replies),
    closedAt:    str(f.closedAt),
    closedBy:    str(f.closedBy),
  };
}

myTickets.get('/api/support/my-tickets', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ items: [], total: 0 });
  const uid = c.get('uid') as string;

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'support_tickets' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit:   SCAN,
    });
    // OWNERSHIP: only the caller's own tickets.
    const items = rows.filter(r => str(r.fields.uid) === uid).map(r => mapMine(r.name, r.fields));
    return c.json({ items, total: items.length, open: items.filter(t => t.status !== 'closed').length });
  } catch (err) {
    console.warn('[my-tickets] list failed:', err instanceof Error ? err.message : err);
    return c.json({ items: [], total: 0, open: 0 });
  }
});

myTickets.post('/api/support/my-reply', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string; ADMIN_EMAIL?: string; SEQUENZY_API_KEY?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  const uid = c.get('uid') as string;

  let body: { ticketId?: unknown; message?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }
  const ticketId = safeTicketId(body.ticketId);
  if (!ticketId) return c.json({ error: 'Invalid ticketId', code: 'INVALID_ID' }, 400);
  const message = typeof body.message === 'string' ? sanitizeText(body.message, REPLY_MAX) : null;
  if (!message) return c.json({ error: 'Reply message is required', code: 'INVALID_MESSAGE' }, 400);

  const ticket = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`) as Record<string, unknown> | null;
  if (!ticket) return c.json({ error: 'Ticket not found', code: 'NOT_FOUND' }, 404);
  if (str(ticket.uid) !== uid) return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);

  const now = new Date().toISOString();
  const replies = mapReplies(ticket.replies);
  replies.push({ message, repliedAt: now, repliedBy: 'customer' });

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`, {
      replies, status: 'open', updatedAt: now,   // back to the operator queue
    }, { merge: true });
  } catch (err) {
    console.error('[my-tickets] reply persist failed:', err);
    return c.json({ error: 'Failed to save reply', code: 'PERSIST_FAILED' }, 500);
  }

  // Notify the OPERATOR in-app (durable alert → operator notification) + email.
  try {
    await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      kind: 'support_ticket_created', severity: 'warning', refId: `custreply_${ticketId}_${replies.length}`,
      message: `Customer replied to a ${str(ticket.type) || 'support'} ticket`,
      context: { type: str(ticket.type), page: str((ticket.context as Record<string, unknown> | undefined)?.route) },
    });
  } catch { /* best-effort */ }
  if (env.ADMIN_EMAIL) {
    await sendObservableEmail(env.FIREBASE_SERVICE_ACCOUNT_JSON, env.SEQUENZY_API_KEY, {
      to: env.ADMIN_EMAIL, slug: 'support-ticket-admin',
      variables: { TYPE: str(ticket.type) || 'question', PRIORITY: '-', DESCRIPTION: message, EMAIL: str(ticket.email), PHONE: str(ticket.phone), CONTEXT: 'customer reply' },
      replyTo: str(ticket.email),
    }, `custreply_${ticketId}`);
  }

  return c.json({ ok: true, status: 'open', repliesCount: replies.length });
});

myTickets.post('/api/support/my-close', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  const uid = c.get('uid') as string;

  let body: { ticketId?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }
  const ticketId = safeTicketId(body.ticketId);
  if (!ticketId) return c.json({ error: 'Invalid ticketId', code: 'INVALID_ID' }, 400);

  const ticket = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`) as Record<string, unknown> | null;
  if (!ticket) return c.json({ error: 'Ticket not found', code: 'NOT_FOUND' }, 404);
  if (str(ticket.uid) !== uid) return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);

  const now = new Date().toISOString();
  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`, {
      status: 'closed', closedAt: now, closedBy: 'customer', updatedAt: now,
    }, { merge: true });
  } catch (err) {
    console.error('[my-tickets] close failed:', err);
    return c.json({ error: 'Failed to close', code: 'PERSIST_FAILED' }, 500);
  }
  // Best-effort operator notification.
  try {
    await createNotification(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      id: `notif_custclose_${ticketId}`, audience: 'operator', type: 'ticket', route: 'admin',
      targetType: 'support_ticket', targetId: ticketId, title: 'Customer closed a ticket', severity: 'info',
    });
  } catch { /* best-effort */ }

  return c.json({ ok: true, status: 'closed' });
});

export default myTickets;
