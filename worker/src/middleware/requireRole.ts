/**
 * requireRole — Phase J1.3C.
 *
 * Reusable role-based access middleware. Reads role from
 * /organizations/{orgId}/members/{uid} via service account.
 * Asserts role ∈ allowed roles. Sets c.var.orgId.
 *
 * orgId source priority:
 *   1. body.orgId (POST)
 *   2. query.orgId (GET)
 *
 * Use:
 *   route.get('...', requireAuth(), requireRole(['owner', 'admin']), handler)
 */

import type { Context, Next } from 'hono';
import { firestoreGet } from '../lib/firestoreAdmin';

type Role = 'owner' | 'admin' | 'member' | 'billing' | 'client';

export function requireRole(allowed: readonly Role[]) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const env = c.env as { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
    const uid = c.get('uid') as string | undefined;

    if (!uid) return c.json({ error: 'Unauthenticated' }, 401);
    if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return c.json({ error: 'Service account not configured' }, 503);
    }

    let orgId: string | undefined = c.req.query('orgId') ?? undefined;
    if (!orgId && (c.req.method === 'POST' || c.req.method === 'PATCH' || c.req.method === 'PUT')) {
      try {
        const cloned = c.req.raw.clone();
        const body   = await cloned.json() as { orgId?: string };
        orgId = body.orgId;
      } catch { /* ignore */ }
    }
    if (!orgId) return c.json({ error: 'Missing orgId' }, 400);

    try {
      const member = await firestoreGet(
        env.FIREBASE_SERVICE_ACCOUNT_JSON,
        `organizations/${orgId}/members/${uid}`,
      );
      // A disabled member keeps no authority — role alone is not enough.
      if (member?.status === 'disabled') {
        console.warn('[requireRole] denied — disabled member uid:', uid, 'orgId:', orgId);
        return c.json({ error: 'Account disabled.', code: 'ACCOUNT_DISABLED' }, 403);
      }
      const role = member?.role as Role | undefined;
      if (!role || !allowed.includes(role)) {
        console.warn('[requireRole] denied — uid:', uid, 'orgId:', orgId, 'role:', role ?? 'none', 'allowed:', allowed);
        return c.json({ error: `Role required: ${allowed.join(' | ')}` }, 403);
      }
      c.set('orgId', orgId);
      c.set('role',  role);
      await next();
    } catch (err) {
      console.error('[requireRole] member lookup failed:', err);
      return c.json({ error: 'Authorization check failed' }, 500);
    }
  };
}
