/**
 * requireOwner — Phase J1.3.
 *
 * Verifies the authenticated user is the OWNER of the requested orgId.
 * Reads role from Firestore /organizations/{orgId}/members/{uid} via the
 * worker's service account (bypasses Firestore rules).
 *
 * Must run AFTER requireAuth() (needs c.var.uid).
 *
 * orgId source priority:
 *   1. body.orgId   (POST routes)
 *   2. query.orgId  (GET routes)
 *
 * Failures:
 *   400 — orgId missing
 *   503 — service account not configured
 *   403 — uid is not org owner (or member doc absent)
 */

import type { Context, Next } from 'hono';
import { firestoreGet } from '../lib/firestoreAdmin';

export function requireOwner() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const env = c.env as { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
    const uid = c.get('uid') as string | undefined;

    if (!uid) {
      return c.json({ error: 'Unauthenticated' }, 401);
    }
    if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return c.json({ error: 'Service account not configured' }, 503);
    }

    // Pull orgId from query first (GET), fallback to clone-readable body (POST)
    let orgId: string | undefined = c.req.query('orgId') ?? undefined;
    if (!orgId && c.req.method === 'POST') {
      try {
        const cloned = c.req.raw.clone();
        const body   = await cloned.json() as { orgId?: string };
        orgId = body.orgId;
      } catch { /* ignore — body may be empty */ }
    }
    if (!orgId) {
      return c.json({ error: 'Missing orgId' }, 400);
    }

    try {
      const member = await firestoreGet(
        env.FIREBASE_SERVICE_ACCOUNT_JSON,
        `organizations/${orgId}/members/${uid}`,
      );
      if (member?.status === 'disabled') {
        console.warn('[requireOwner] denied — disabled member uid:', uid, 'orgId:', orgId);
        return c.json({ error: 'Account disabled.', code: 'ACCOUNT_DISABLED' }, 403);
      }
      const role = member?.role as string | undefined;
      if (role !== 'owner') {
        console.warn('[requireOwner] denied — uid:', uid, 'orgId:', orgId, 'role:', role ?? 'none');
        return c.json({ error: 'Owner role required' }, 403);
      }
      c.set('orgId', orgId);
      await next();
    } catch (err) {
      console.error('[requireOwner] member lookup failed:', err);
      return c.json({ error: 'Authorization check failed' }, 500);
    }
  };
}
