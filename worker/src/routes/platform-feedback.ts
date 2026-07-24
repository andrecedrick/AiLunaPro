/**
 * Platform feedback + support visibility (read-only operator surfaces).
 *
 *   GET /api/platform/feedback   — public_feedback, newest first + signals
 *   GET /api/platform/support    — support_tickets, newest first
 *
 * Both are auth + platform-admin gated and STRICTLY READ-ONLY: nothing here
 * writes, resolves, or mutates a record.
 *
 * PII posture differs by collection, deliberately:
 *  - feedback is anonymous BY DESIGN (no uid / email / orgId is ever stored), so
 *    this route returns exactly what was captured: source, satisfaction,
 *    difficulty, blocker, suggestion, country, createdAt.
 *  - support tickets DO carry the submitter's email + phone. That contact detail
 *    IS the point of a ticket — an operator cannot answer without it — so it is
 *    returned to platform admins only. It is never logged and never leaves this
 *    gated surface.
 *
 * Customer Signals (§ aggregation) are computed here, deterministically: exact
 * string counting over normalised free text. NO LLM, no summarisation, no
 * inference — a "top blocker" is literally the most frequently submitted string.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery, firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { sanitizeText } from '../lib/support-shared';
import { sendObservableEmail } from '../lib/billing-alerts';
import type { AppEnv } from '../index';

const platformFeedback = new Hono<AppEnv>();

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;
/** How many entries each signal list returns. */
const TOP_N = 10;

/* ── Feedback ─────────────────────────────────────────── */

interface FeedbackRow {
  id:           string;
  source:       string;
  satisfaction: string;
  difficulty:   string;
  blocker:      string;
  suggestion:   string;
  country:      string;
  createdAt:    string;
}

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

function mapFeedback(name: string, f: Record<string, unknown>): FeedbackRow {
  const cf = (f.cf ?? {}) as Record<string, unknown>;
  return {
    id:           name.split('/').pop() ?? '',
    source:       str(f.source),
    satisfaction: str(f.satisfaction),
    difficulty:   str(f.difficulty),
    blocker:      str(f.blocker),
    suggestion:   str(f.suggestion),
    country:      str(cf.country),
    createdAt:    str(f.createdAt),
  };
}

/**
 * Normalise free text for exact-match counting: lowercase, collapse whitespace,
 * strip trailing punctuation. Deterministic and lossless enough that two users
 * typing the same complaint land in the same bucket — no fuzzy matching, no NLP.
 */
function normalizeSignal(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '').trim();
}

/** Count occurrences of a normalised string, keeping the first-seen original. */
function tally(values: string[]): Array<{ value: string; count: number }> {
  const counts = new Map<string, { value: string; count: number }>();
  for (const raw of values) {
    const key = normalizeSignal(raw);
    if (!key) continue;
    const cur = counts.get(key);
    if (cur) cur.count += 1;
    else counts.set(key, { value: raw.trim(), count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Satisfaction buckets — tolerant of both word and numeric encodings. */
function isPositive(s: string): boolean {
  const v = s.toLowerCase();
  return v === 'good' || v === 'positive' || v === 'yes' || v === '1' || v === '5' || v === '4';
}
function isNegative(s: string): boolean {
  const v = s.toLowerCase();
  return v === 'bad' || v === 'negative' || v === 'no' || v === '0' || v === '1_bad' || v === '2';
}

/** Difficulty → numeric, for an average. Non-numeric words map to a scale. */
function difficultyScore(d: string): number | null {
  const v = d.toLowerCase().trim();
  if (v === '') return null;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  const map: Record<string, number> = { easy: 1, ok: 2, medium: 2, hard: 3, 'very hard': 4, blocked: 5 };
  return map[v] ?? null;
}

platformFeedback.get('/api/platform/feedback', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  const limit = Math.min(parseInt(c.req.query('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'public_feedback' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    });
    const items = rows.map(r => mapFeedback(r.name, r.fields));

    const rated    = items.filter(i => i.satisfaction !== '');
    const positive = rated.filter(i => isPositive(i.satisfaction)).length;
    const negative = rated.filter(i => isNegative(i.satisfaction)).length;
    const diffs    = items.map(i => difficultyScore(i.difficulty)).filter((n): n is number => n !== null);
    const avgDifficulty = diffs.length ? Number((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(2)) : null;

    return c.json({
      items,
      total:    items.length,
      rated:    rated.length,
      positive,
      negative,
      positivePct: rated.length ? Math.round((positive / rated.length) * 100) : 0,
      negativePct: rated.length ? Math.round((negative / rated.length) * 100) : 0,
      avgDifficulty,
      // Customer Signals — pure deterministic counting, no LLM.
      topBlockers:    tally(items.map(i => i.blocker)).slice(0, TOP_N),
      topSuggestions: tally(items.map(i => i.suggestion)).slice(0, TOP_N),
      topSources:     tally(items.map(i => i.source)).slice(0, TOP_N),
      capped:      rows.length === limit,
      generatedAt: Date.now(),
    });
  } catch (err) {
    // Collection never written → empty, not an error.
    console.warn('[platform-feedback] query failed:', err instanceof Error ? err.message : err);
    return c.json({
      items: [], total: 0, rated: 0, positive: 0, negative: 0, positivePct: 0, negativePct: 0,
      avgDifficulty: null, topBlockers: [], topSuggestions: [], topSources: [], capped: false, generatedAt: Date.now(),
    });
  }
});

/* ── Support tickets ──────────────────────────────────── */

interface TicketReply {
  message:   string;
  repliedAt: string;
  repliedBy: string;
  /** Index signature: lets a reply be written directly as a Firestore map. */
  [k: string]: string;
}

interface TicketRow {
  id:          string;
  type:        string;
  status:      string;
  email:       string;
  phone:       string;
  page:        string;
  description: string;
  priority:    string;
  country:     string;
  createdAt:   string;
  replies:     TicketReply[];
  closedAt:    string;
  closedBy:    string;
}

function mapReplies(raw: unknown): TicketReply[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(r => {
    const o = (r ?? {}) as Record<string, unknown>;
    return { message: str(o.message), repliedAt: str(o.repliedAt), repliedBy: str(o.repliedBy) };
  });
}

function mapTicket(name: string, f: Record<string, unknown>): TicketRow {
  const cf  = (f.cf ?? {}) as Record<string, unknown>;
  const ctx = (f.context ?? {}) as Record<string, unknown>;
  return {
    id:          name.split('/').pop() ?? '',
    type:        str(f.type),
    status:      str(f.status) || 'open',
    email:       str(f.email),
    phone:       str(f.phone),
    // `page` is the route captured in the ticket context at submit time.
    page:        str(ctx.route),
    description: str(f.description),
    priority:    str(f.priority),
    country:     str(cf.country),
    createdAt:   str(f.createdAt),
    replies:     mapReplies(f.replies),
    closedAt:    str(f.closedAt),
    closedBy:    str(f.closedBy),
  };
}

platformFeedback.get('/api/platform/support', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  const limit = Math.min(parseInt(c.req.query('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const statusFilter = c.req.query('status');

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'support_tickets' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    });
    let items = rows.map(r => mapTicket(r.name, r.fields));
    if (statusFilter) items = items.filter(t => t.status === statusFilter);

    return c.json({
      items,
      total:      items.length,
      // Open = anything not closed; Awaiting = still 'open' (no reply yet).
      open:       items.filter(t => t.status !== 'closed').length,
      awaiting:   items.filter(t => t.status === 'open').length,
      byType:     tally(items.map(t => t.type)),
      // Most problematic pages — deterministic count of ticket origin routes.
      topPages:   tally(items.map(t => t.page)).slice(0, TOP_N),
      capped:      rows.length === limit,
      generatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('[platform-support] query failed:', err instanceof Error ? err.message : err);
    return c.json({ items: [], total: 0, open: 0, awaiting: 0, byType: [], topPages: [], capped: false, generatedAt: Date.now() });
  }
});

/* ── Ticket reply + status (platform-admin, MUTATING) ─── */

const REPLY_MAX = 4000;
const TICKET_STATUSES = ['open', 'answered', 'closed'] as const;
type TicketStatus = typeof TICKET_STATUSES[number];

/** support_tickets ids are base64url from generateSupportId — restrict to that shape. */
function safeTicketId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const id = raw.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

/**
 * POST /api/platform/support/reply  { ticketId, message }
 * Appends an operator reply to the ticket's conversation history, flips status to
 * 'answered', and emails the reply to the ticket contact. The reply is PERSISTED
 * before the email is attempted; a mail failure is reported (emailed:false) but
 * never loses the reply.
 */
platformFeedback.post('/api/platform/support/reply', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string; SEQUENZY_API_KEY?: string; APP_BASE_URL?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);

  let body: { ticketId?: unknown; message?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const ticketId = safeTicketId(body.ticketId);
  if (!ticketId) return c.json({ error: 'Invalid ticketId', code: 'INVALID_ID' }, 400);
  const message = typeof body.message === 'string' ? sanitizeText(body.message, REPLY_MAX) : null;
  if (!message) return c.json({ error: 'Reply message is required', code: 'INVALID_MESSAGE' }, 400);

  const ticket = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`) as Record<string, unknown> | null;
  if (!ticket) return c.json({ error: 'Ticket not found', code: 'NOT_FOUND' }, 404);

  const repliedBy = str(c.get('email')) || 'operator';
  const now = new Date().toISOString();
  const replies = mapReplies(ticket.replies);
  replies.push({ message, repliedAt: now, repliedBy });

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`, {
      replies, status: 'answered', answeredAt: now, updatedAt: now,
    }, { merge: true });
  } catch (err) {
    console.error('[support-reply] persist failed:', err);
    return c.json({ error: 'Failed to save reply', code: 'PERSIST_FAILED' }, 500);
  }

  // Email the customer (best-effort; the reply is already saved).
  let emailed = false;
  const to = str(ticket.email);
  if (to) {
    // Observable send — a failure records a durable notification_email_failed
    // alert, so a reply that never reached the customer is visible to operators.
    const res = await sendObservableEmail(env.FIREBASE_SERVICE_ACCOUNT_JSON, env.SEQUENZY_API_KEY, {
      to, slug: 'support-ticket-reply',
      variables: { MESSAGE: message, TYPE: str(ticket.type) || 'question', TICKET: ticketId },
    }, ticketId);
    emailed = res.ok;
  }

  return c.json({ ok: true, status: 'answered', emailed, repliesCount: replies.length });
});

/**
 * POST /api/platform/support/status  { ticketId, status }
 * Sets the ticket status (open | answered | closed). 'closed' records closedAt +
 * closedBy for the timeline. No email — this is an internal state change.
 */
platformFeedback.post('/api/platform/support/status', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);

  let body: { ticketId?: unknown; status?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const ticketId = safeTicketId(body.ticketId);
  if (!ticketId) return c.json({ error: 'Invalid ticketId', code: 'INVALID_ID' }, 400);
  if (typeof body.status !== 'string' || !TICKET_STATUSES.includes(body.status as TicketStatus)) {
    return c.json({ error: 'Invalid status', code: 'INVALID_STATUS' }, 400);
  }
  const status = body.status as TicketStatus;

  const ticket = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`) as Record<string, unknown> | null;
  if (!ticket) return c.json({ error: 'Ticket not found', code: 'NOT_FOUND' }, 404);

  const now = new Date().toISOString();
  const patch: Record<string, string> = { status, updatedAt: now };
  if (status === 'closed') { patch.closedAt = now; patch.closedBy = str(c.get('email')) || 'operator'; }

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${ticketId}`, patch, { merge: true });
  } catch (err) {
    console.error('[support-status] persist failed:', err);
    return c.json({ error: 'Failed to update status', code: 'PERSIST_FAILED' }, 500);
  }

  return c.json({ ok: true, status });
});

/* ── Unified notifications feed (bell) ────────────────── */

/**
 * GET /api/platform/notifications — the durable feed the notification bell reads,
 * for platform operators. Merges the three real notification sources that were
 * previously only visible in their own panels:
 *   - open platform_alerts (billing/token failures, email failures, feedback,
 *     new tickets) — resolved === false
 *   - awaiting support tickets (status 'open')
 *   - recent customer feedback
 * newest-first, capped. `count` = open-critical alerts + awaiting tickets (the
 * "needs attention" number). No PII: tickets/feedback are summarised by
 * type/source/page, never email/description.
 */
const NOTIF_LIMIT = 50;

interface NotifItem {
  id:       string;
  type:     'alert' | 'ticket' | 'feedback';
  kind:     string;
  label:    string;
  severity: string;
  at:       string;
}

platformFeedback.get('/api/platform/notifications', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ items: [], count: 0, generatedAt: Date.now() });
  }
  const sa = env.FIREBASE_SERVICE_ACCOUNT_JSON;

  const items: NotifItem[] = [];
  let openCritical = 0;
  let awaiting = 0;

  // Open alerts.
  try {
    const rows = await firestoreRunQuery(sa, {
      from:    [{ collectionId: 'platform_alerts' }],
      orderBy: [{ field: { fieldPath: 'at' }, direction: 'DESCENDING' }],
      limit:   NOTIF_LIMIT,
    });
    for (const r of rows) {
      const f = r.fields;
      if (f.resolved === true) continue;
      const severity = str(f.severity) || 'warning';
      if (severity === 'critical') openCritical += 1;
      items.push({
        id: `alert:${r.name.split('/').pop() ?? ''}`,
        type: 'alert', kind: str(f.kind) || 'alert',
        label: str(f.message) || str(f.kind), severity, at: str(f.at),
      });
    }
  } catch { /* collection may not exist yet */ }

  // Awaiting tickets.
  try {
    const rows = await firestoreRunQuery(sa, {
      from:    [{ collectionId: 'support_tickets' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit:   NOTIF_LIMIT,
    });
    for (const r of rows) {
      const f = r.fields;
      if ((str(f.status) || 'open') !== 'open') continue;
      awaiting += 1;
      const ctx = (f.context ?? {}) as Record<string, unknown>;
      items.push({
        id: `ticket:${str(f.id) || (r.name.split('/').pop() ?? '')}`,
        type: 'ticket', kind: 'support_ticket_open',
        label: `New ${str(f.type) || 'support'} ticket · ${str(ctx.route) || '—'}`,
        severity: 'warning', at: str(f.createdAt),
      });
    }
  } catch { /* none */ }

  // Recent feedback (last few).
  try {
    const rows = await firestoreRunQuery(sa, {
      from:    [{ collectionId: 'public_feedback' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit:   10,
    });
    for (const r of rows) {
      const f = r.fields;
      items.push({
        id: `feedback:${str(f.id) || (r.name.split('/').pop() ?? '')}`,
        type: 'feedback', kind: 'feedback_received',
        label: `New feedback · ${str(f.source) || '—'}`,
        severity: 'info', at: str(f.createdAt),
      });
    }
  } catch { /* none */ }

  items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  return c.json({
    items:  items.slice(0, NOTIF_LIMIT),
    count:  openCritical + awaiting,     // the "needs attention" badge number
    openCritical,
    awaiting,
    generatedAt: Date.now(),
  });
});

export default platformFeedback;
