/**
 * Notification center API — the bell + notification panel read this.
 *
 *   GET  /api/notifications?filter=all|unread|read   — the caller's notifications
 *   POST /api/notifications/read      { id }          — mark one read
 *   POST /api/notifications/read-all                  — mark all the caller's read
 *
 * Auth required. A caller sees:
 *   - their OWN user notifications        (audience 'user' && uid === me)
 *   - operator notifications              (audience 'operator') IFF platform-admin
 * so read/unread is per-recipient and no one reads another user's notifications.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { isPlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery, firestoreGet, firestoreSet, firestoreCommit } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const notifications = new Hono<AppEnv>();

/**
 * Per-recipient page size.
 *
 * This used to be a GLOBAL scan: the newest 200 notifications in the whole
 * platform were read on every bell load and then filtered by uid in memory. A
 * user with three notifications still cost 200 document reads, and on the
 * Firestore free tier (50,000 reads/day) that capped the entire product at about
 * 250 bell loads per day. Worse, it was silently WRONG at scale — once the
 * platform produces more than 200 notifications in the window, a user's own
 * notification can fall outside the global 200 and simply never appear.
 *
 * The queries below are targeted, so this is now a real per-recipient page size
 * rather than a scan budget.
 */
const PAGE = 50;

function str(v: unknown): string { return v === null || v === undefined ? '' : String(v); }

interface NotifRow {
  id: string; audience: string; uid: string; type: string;
  targetType: string; targetId: string; route: string;
  title: string; severity: string; read: boolean; readAt: string; at: string;
}

function mapNotif(name: string, f: Record<string, unknown>): NotifRow {
  return {
    id:         str(f.id) || (name.split('/').pop() ?? ''),
    audience:   str(f.audience),
    uid:        str(f.uid),
    type:       str(f.type),
    targetType: str(f.targetType),
    targetId:   str(f.targetId),
    route:      str(f.route),
    title:      str(f.title),
    severity:   str(f.severity) || 'info',
    read:       f.read === true,
    readAt:     str(f.readAt),
    at:         str(f.at),
  };
}

/** True when `n` is addressed to this caller. */
function visibleTo(n: NotifRow, uid: string, operator: boolean): boolean {
  if (n.audience === 'user') return n.uid === uid;
  if (n.audience === 'operator') return operator;
  return false;
}

const eq = (field: string, value: string) =>
  ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } });

/** Newest-first page of one audience. Indexed — see firestore.indexes.json. */
async function queryAudience(saJson: string, filters: object[]): Promise<NotifRow[]> {
  const rows = await firestoreRunQuery(saJson, {
    from:    [{ collectionId: 'notifications' }],
    where:   { compositeFilter: { op: 'AND', filters } },
    orderBy: [{ field: { fieldPath: 'at' }, direction: 'DESCENDING' }],
    limit:   PAGE,
  });
  return rows.map(r => mapNotif(r.name, r.fields));
}

/**
 * The caller's notifications: their own, plus the operator feed when they are a
 * platform admin.
 *
 * Two targeted queries instead of one global scan. They are separate rather than
 * an OR filter because the operator feed is only fetched for the handful of users
 * entitled to it — an OR would make every ordinary user pay for a branch that can
 * never match them. A non-operator therefore issues ONE query that reads only
 * their own documents.
 *
 * The visibleTo() re-check is deliberate belt-and-braces: the query already
 * constrains audience and uid, but this function's result feeds read-all, which
 * WRITES. A query mistake must not become a cross-user write.
 */
/**
 * Legacy path: the global scan this route used to do.
 *
 * Kept ONLY as a fallback for the window before the composite indexes exist.
 * A targeted query against a missing index answers FAILED_PRECONDITION, and
 * without this the bell would silently show nothing — the route's error handler
 * returns an empty list, so the failure would look like "no notifications"
 * rather than like a broken query. Expensive, correct, and self-retiring: once
 * the indexes are live this never runs again.
 */
async function fetchByScan(saJson: string, uid: string, operator: boolean): Promise<NotifRow[]> {
  const rows = await firestoreRunQuery(saJson, {
    from:    [{ collectionId: 'notifications' }],
    orderBy: [{ field: { fieldPath: 'at' }, direction: 'DESCENDING' }],
    limit:   200,
  });
  return rows.map(r => mapNotif(r.name, r.fields)).filter(n => visibleTo(n, uid, operator));
}

async function fetchMine(saJson: string, uid: string, operator: boolean): Promise<NotifRow[]> {
  const queries = [queryAudience(saJson, [eq('audience', 'user'), eq('uid', uid)])];
  if (operator) queries.push(queryAudience(saJson, [eq('audience', 'operator')]));

  let pages: NotifRow[][];
  try {
    pages = await Promise.all(queries);
  } catch (err) {
    console.warn('[notifications] targeted query failed — falling back to scan. Deploy firestore.indexes.json:',
      err instanceof Error ? err.message.slice(0, 200) : '');
    return fetchByScan(saJson, uid, operator);
  }

  const merged = pages.flat().filter(n => visibleTo(n, uid, operator));
  // Both pages are newest-first individually; the merge has to be re-sorted so
  // the bell shows a single chronological feed.
  merged.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return merged;
}

notifications.get('/api/notifications', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ items: [], unreadCount: 0, generatedAt: Date.now() });

  const uid      = c.get('uid') as string;
  const operator = isPlatformAdmin(env, c.get('email'), c.get('emailVerified'));
  const filter   = c.req.query('filter');

  try {
    const mine = await fetchMine(env.FIREBASE_SERVICE_ACCOUNT_JSON, uid, operator);
    const unreadCount = mine.filter(n => !n.read).length;
    let items = mine;
    if (filter === 'unread') items = mine.filter(n => !n.read);
    else if (filter === 'read') items = mine.filter(n => n.read);
    return c.json({ items, unreadCount, total: mine.length, generatedAt: Date.now() });
  } catch (err) {
    console.warn('[notifications] list failed:', err instanceof Error ? err.message : err);
    return c.json({ items: [], unreadCount: 0, total: 0, generatedAt: Date.now() });
  }
});

notifications.post('/api/notifications/read', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);

  let body: { id?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }
  const id = typeof body.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(body.id) ? body.id : null;
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400);

  const uid      = c.get('uid') as string;
  const operator = isPlatformAdmin(env, c.get('email'), c.get('emailVerified'));

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `notifications/${id}`) as Record<string, unknown> | null;
  if (!doc) return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
  // Ownership check — never let a caller mark someone else's notification.
  if (!visibleTo(mapNotif(`notifications/${id}`, doc), uid, operator)) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `notifications/${id}`, { read: true, readAt: new Date().toISOString() }, { merge: true });
  return c.json({ ok: true });
});

notifications.post('/api/notifications/read-all', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);

  const uid      = c.get('uid') as string;
  const operator = isPlatformAdmin(env, c.get('email'), c.get('emailVerified'));

  try {
    const mine = await fetchMine(env.FIREBASE_SERVICE_ACCOUNT_JSON, uid, operator);
    const unread = mine.filter(n => !n.read);
    const now = new Date().toISOString();
    // One commit instead of N sequential PATCHes. Marking 50 notifications read
    // was 50 round trips; it is now one, and the page count bounds it at PAGE.
    await firestoreCommit(env.FIREBASE_SERVICE_ACCOUNT_JSON, unread.map(n => ({
      path: `notifications/${n.id}`,
      data: { read: true, readAt: now },
    })));
    return c.json({ ok: true, marked: unread.length });
  } catch (err) {
    console.warn('[notifications] read-all failed:', err instanceof Error ? err.message : err);
    return c.json({ ok: false, marked: 0 });
  }
});

export default notifications;
