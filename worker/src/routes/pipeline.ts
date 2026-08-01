/**
 * Commercial pipeline routes — stage, follow-up and activity logging.
 *
 *   PATCH /api/contacts/:id/pipeline   change stage / schedule follow-up / priority
 *   POST  /api/contacts/:id/activity   log an email, SMS, call or note
 *   GET   /api/contacts/:id/timeline   read the immutable history
 *
 * Authorisation is the SAME assignment gate the rest of the CRM uses
 * (lib/contact-access): you may work a lead if it is assigned to you, and a super
 * admin may work anything. Role does not widen it — an admin has no more reach
 * over another rep's pipeline than a member does.
 *
 * Every mutation appends a timeline event. That is the accountability contract:
 * a stage cannot move, a follow-up cannot be booked and a call cannot be logged
 * without a durable record of who did it and when.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole, type Role } from '../middleware/requireRole';
import { isSuperAdmin } from '../lib/platformAdmin';
import { canEditContact } from '../lib/contact-access';
import { firestoreGet, firestoreSet, firestoreRunQuery } from '../lib/firestoreAdmin';
import { createNotification } from '../lib/notifications';
import { appendEvent } from '../lib/timeline';
import {
  isPipelineStatus, isChannel, isPriority, isOutcome, pipelineFromLegacy,
  legacyFromPipeline, addDays, suggestFollowUpDays, isTerminal,
  type PipelineStatus, type Outcome,
} from '../lib/pipeline';
import type { AppEnv } from '../index';

const pipeline = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const ORG_ROLES: readonly Role[] = ['owner', 'admin', 'member'];
const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');
const NOTE_MAX = 2000;

/** Resolve the contact and check the caller may work it. */
async function gate(c: { env: unknown; get: (k: string) => unknown; req: { param: (k: string) => string | undefined } }, orgId: string) {
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON!;
  const id = safeId(c.req.param('id'));
  const path = `organizations/${orgId}/contacts/${id}`;
  const doc = await firestoreGet(saJson, path);
  if (!doc) return { error: 'NOT_FOUND' as const };
  const isSuper = isSuperAdmin(env, c.get('email') as string | undefined, c.get('emailVerified') as boolean | undefined);
  if (!canEditContact(doc, c.get('uid') as string, isSuper)) return { error: 'FORBIDDEN' as const };
  return { saJson, id, path, doc, isSuper };
}

/* ── PATCH /api/contacts/:id/pipeline ───────────────────────────────────────── */
pipeline.patch('/api/contacts/:id/pipeline', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const g = await gate(c, orgId);
  if ('error' in g) return c.json({ error: g.error, code: g.error }, g.error === 'NOT_FOUND' ? 404 : 403);
  const { saJson, id, path, doc } = g;

  const now = new Date().toISOString();
  const actor = (c.get('email') as string) ?? '';
  const current = pipelineFromLegacy(doc.pipelineStatus, doc.leadStatus, doc.assignedToUid);
  const patch: Record<string, string> = { updatedAt: now };
  const events: Array<Parameters<typeof appendEvent>[3]> = [];

  // ── stage ──
  let next: PipelineStatus = current;
  if (body.pipelineStatus !== undefined) {
    if (!isPipelineStatus(body.pipelineStatus)) {
      return c.json({ error: 'Unknown pipeline status.', code: 'INVALID_STATUS' }, 400);
    }
    next = body.pipelineStatus;
    if (next !== current) {
      patch.pipelineStatus = next;
      // The legacy five-value field is kept in step so the contacts table and the
      // CSV export keep showing something truthful.
      patch.leadStatus = legacyFromPipeline(next);
      patch.stageEnteredAt = now;
      // Closing a lead clears its follow-up: a won deal must not sit in the
      // overdue queue forever.
      if (isTerminal(next)) { patch.nextFollowUpAt = ''; patch.nextFollowUpChannel = ''; }
      events.push({ kind: 'status_changed', at: now, actor, summary: `Stage ${current} to ${next}`, data: { from: current, to: next } });
    }
  }

  // ── follow-up ──
  if (body.nextFollowUpAt !== undefined) {
    const raw = typeof body.nextFollowUpAt === 'string' ? body.nextFollowUpAt : '';
    if (raw) {
      const t = Date.parse(raw);
      if (!Number.isFinite(t)) return c.json({ error: 'Invalid follow-up date.', code: 'INVALID_DATE' }, 400);
      patch.nextFollowUpAt = new Date(t).toISOString();
    } else {
      patch.nextFollowUpAt = '';
    }
    if (body.nextFollowUpChannel !== undefined) {
      if (body.nextFollowUpChannel && !isChannel(body.nextFollowUpChannel)) {
        return c.json({ error: 'Unknown channel.', code: 'INVALID_CHANNEL' }, 400);
      }
      patch.nextFollowUpChannel = (body.nextFollowUpChannel as string) ?? '';
    }
    events.push({
      kind: 'follow_up_scheduled', at: now, actor,
      summary: patch.nextFollowUpAt ? `Follow-up set for ${patch.nextFollowUpAt.slice(0, 10)}` : 'Follow-up cleared',
      data: { due: patch.nextFollowUpAt, channel: patch.nextFollowUpChannel ?? '' },
    });
  }

  if (body.priority !== undefined) {
    if (!isPriority(body.priority)) return c.json({ error: 'Unknown priority.', code: 'INVALID_PRIORITY' }, 400);
    patch.priority = body.priority;
  }
  if (body.followUpNotes !== undefined) {
    patch.followUpNotes = (typeof body.followUpNotes === 'string' ? body.followUpNotes : '').slice(0, NOTE_MAX);
  }

  await firestoreSet(saJson, path, patch, { merge: true });
  for (const e of events) await appendEvent(saJson, orgId, id, e);

  // A closed deal is news the whole operator bench wants; an ordinary stage move
  // is not. Idempotent id so re-saving the same close cannot notify twice.
  if (patch.pipelineStatus === 'won' || patch.pipelineStatus === 'lost') {
    await createNotification(saJson, {
      audience: 'operator', type: `lead_${patch.pipelineStatus}`,
      targetType: 'contact', targetId: id, route: 'contacts',
      title: `Lead ${patch.pipelineStatus}`,
      severity: patch.pipelineStatus === 'won' ? 'info' : 'warning',
      id: `lead_${patch.pipelineStatus}_${id}`,
    });
  }

  return c.json({ ok: true, contactId: id, pipelineStatus: next });
});

/* ── POST /api/contacts/:id/activity ────────────────────────────────────────── */
pipeline.post('/api/contacts/:id/activity', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const channel = body.channel;
  if (!isChannel(channel)) return c.json({ error: 'Unknown channel.', code: 'INVALID_CHANNEL' }, 400);
  const outcome = body.outcome === undefined || body.outcome === '' ? '' : body.outcome;
  if (outcome !== '' && !isOutcome(outcome)) return c.json({ error: 'Unknown outcome.', code: 'INVALID_OUTCOME' }, 400);

  const g = await gate(c, orgId);
  if ('error' in g) return c.json({ error: g.error, code: g.error }, g.error === 'NOT_FOUND' ? 404 : 403);
  const { saJson, id, path, doc } = g;

  const now = new Date().toISOString();
  const actor = (c.get('email') as string) ?? '';
  const note = (typeof body.note === 'string' ? body.note : '').slice(0, NOTE_MAX);

  const patch: Record<string, string> = {
    lastContactAt: now, lastContactChannel: channel, updatedAt: now, lastActivityAt: now,
  };

  // Logging a real contact attempt advances a lead nobody has worked yet. It is
  // deliberately the ONLY implicit stage move: an operator who calls a brand new
  // lead should not also have to remember to tick "contacted".
  const current = pipelineFromLegacy(doc.pipelineStatus, doc.leadStatus, doc.assignedToUid);
  let nextStage = current;
  if ((current === 'new' || current === 'assigned') && channel !== 'note') {
    nextStage = outcome === 'no_answer' || outcome === 'left_message' ? 'attempted_contact' : 'contacted';
    patch.pipelineStatus = nextStage;
    patch.leadStatus = legacyFromPipeline(nextStage);
    patch.stageEnteredAt = now;
  }

  // Auto-schedule the next touch from the outcome, unless the caller booked one
  // explicitly. A bounce returns 0 days and schedules NOTHING — chasing a dead
  // address on the same channel is how a lead silently rots.
  if (outcome && body.nextFollowUpAt === undefined) {
    const days = suggestFollowUpDays(outcome as Outcome);
    if (days > 0) {
      patch.nextFollowUpAt = addDays(now, days);
      patch.nextFollowUpChannel = channel;
    }
  }
  if (typeof body.nextFollowUpAt === 'string' && body.nextFollowUpAt) {
    const t = Date.parse(body.nextFollowUpAt);
    if (!Number.isFinite(t)) return c.json({ error: 'Invalid follow-up date.', code: 'INVALID_DATE' }, 400);
    patch.nextFollowUpAt = new Date(t).toISOString();
    patch.nextFollowUpChannel = channel;
  }

  await firestoreSet(saJson, path, patch, { merge: true });
  await appendEvent(saJson, orgId, id, {
    kind: channel, at: now, actor,
    summary: note || `${channel} logged${outcome ? ` (${outcome})` : ''}`,
    data: { channel, outcome: String(outcome || ''), ...(patch.nextFollowUpAt ? { nextFollowUp: patch.nextFollowUpAt } : {}) },
  });
  if (nextStage !== current) {
    await appendEvent(saJson, orgId, id, {
      kind: 'status_changed', at: now, actor,
      summary: `Stage ${current} to ${nextStage}`, data: { from: current, to: nextStage, via: channel },
    });
  }

  return c.json({
    ok: true, contactId: id, pipelineStatus: nextStage,
    nextFollowUpAt: patch.nextFollowUpAt ?? '',
    // A bounce is reported so the UI can say why nothing was scheduled.
    bounced: outcome === 'bounced',
  });
});

/* ── GET /api/contacts/:id/timeline ─────────────────────────────────────────── */
pipeline.get('/api/contacts/:id/timeline', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;

  const g = await gate(c, orgId);
  if ('error' in g) return c.json({ error: g.error, code: g.error }, g.error === 'NOT_FOUND' ? 404 : 403);
  const { saJson, id } = g;

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, { from: [{ collectionId: 'timeline' }], limit: 200 },
      `organizations/${orgId}/contacts/${id}`);
  } catch (err) {
    console.error('[pipeline] timeline read failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load the timeline.', code: 'QUERY_FAILED' }, 500);
  }

  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const events = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(f)) if (k.startsWith('data_')) data[k.slice(5)] = s(v);
    return { eventId: r.name.split('/').pop() ?? '', kind: s(f.kind), at: s(f.at), actor: s(f.actor), summary: s(f.summary), data };
  // Newest first. The document id is sequence-prefixed, so this is a stable
  // chronological sort even for events written in the same millisecond.
  }).sort((a, b) => (a.eventId < b.eventId ? 1 : a.eventId > b.eventId ? -1 : 0));

  return c.json({ ok: true, events });
});

export default pipeline;
