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
import { firestoreRunQuery, firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const notifications = new Hono<AppEnv>();

const SCAN = 200;

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

async function fetchMine(saJson: string, uid: string, operator: boolean): Promise<NotifRow[]> {
  const rows = await firestoreRunQuery(saJson, {
    from:    [{ collectionId: 'notifications' }],
    orderBy: [{ field: { fieldPath: 'at' }, direction: 'DESCENDING' }],
    limit:   SCAN,
  });
  return rows.map(r => mapNotif(r.name, r.fields)).filter(n => visibleTo(n, uid, operator));
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
    for (const n of unread) {
      await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `notifications/${n.id}`, { read: true, readAt: now }, { merge: true });
    }
    return c.json({ ok: true, marked: unread.length });
  } catch (err) {
    console.warn('[notifications] read-all failed:', err instanceof Error ? err.message : err);
    return c.json({ ok: false, marked: 0 });
  }
});

export default notifications;
