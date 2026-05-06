/**
 * Team members management — Phase J1.3E (worker authority).
 *
 *   POST   /api/team/members/:uid/role
 *   POST   /api/team/members/:uid/disable
 *   POST   /api/team/members/:uid/enable
 *   DELETE /api/team/members/:uid
 *
 * Permissions:
 *   - owner: any role change, any remove (except last owner)
 *   - admin: non-owner roles only, cannot edit owner
 *   - member/billing/client: 403
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const members = new Hono<AppEnv>();

type Role = 'owner' | 'admin' | 'member' | 'billing' | 'client';

function isValidRole(r: string): r is Role {
  return r === 'owner' || r === 'admin' || r === 'member' || r === 'billing' || r === 'client';
}

/* ── Helper: list members + count owners ──────────────── */

async function countActiveOwners(saJson: string, projectId: string, orgId: string): Promise<number> {
  // Reuse JWT logic via inline (mirror team-invites.ts approach)
  const sa = JSON.parse(saJson) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const header  = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };
  const encode = (o: unknown) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const pemBody = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signBytes = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signBytes)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${unsigned}.${sig}`;
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const tokData = await tokRes.json() as { access_token: string };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/organizations/${orgId}/members?pageSize=200`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tokData.access_token}` } });
  if (!res.ok) return 1;
  const data = await res.json() as { documents?: Array<{ fields?: Record<string, { stringValue?: string }> }> };
  return (data.documents ?? []).filter(d =>
    d.fields?.role?.stringValue === 'owner' && d.fields?.status?.stringValue === 'active'
  ).length;
}

/* ── POST /api/team/members/:uid/role ─────────────────── */

interface ChangeRoleBody {
  orgId: string;
  role:  Role;
}

members.post('/api/team/members/:uid/role', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const targetUid  = c.req.param('uid');
  const orgId      = c.get('orgId') as string;
  const viewerRole = c.get('role')  as Role;

  if (!targetUid) return c.json({ error: 'Missing target uid' }, 400);

  let body: ChangeRoleBody;
  try { body = await c.req.json<ChangeRoleBody>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  if (!isValidRole(body.role)) return c.json({ error: 'Invalid role' }, 400);

  // Admin cannot promote to owner
  if (viewerRole === 'admin' && body.role === 'owner') {
    return c.json({ error: 'Admins cannot promote to owner' }, 403);
  }

  // Read current member
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}/members/${targetUid}`);
  if (!member) return c.json({ error: 'Member not found' }, 404);

  const currentRole = member.role as Role;

  // Admin cannot edit owner
  if (viewerRole === 'admin' && currentRole === 'owner') {
    return c.json({ error: 'Admins cannot edit owners' }, 403);
  }

  // Last-owner safeguard
  if (currentRole === 'owner' && body.role !== 'owner') {
    const ownerCount = await countActiveOwners(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      (c.env as { FIREBASE_PROJECT_ID: string }).FIREBASE_PROJECT_ID,
      orgId,
    );
    if (ownerCount <= 1) {
      return c.json({ error: 'Cannot demote the last owner' }, 409);
    }
  }

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/members/${targetUid}`,
      { role: body.role, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Update failed' }, 500);
  }

  return c.json({ ok: true });
});

/* ── DELETE /api/team/members/:uid ────────────────────── */

members.delete('/api/team/members/:uid', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const targetUid  = c.req.param('uid');
  const orgId      = c.get('orgId') as string;
  const viewerRole = c.get('role')  as Role;

  if (!targetUid) return c.json({ error: 'Missing target uid' }, 400);

  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}/members/${targetUid}`);
  if (!member) return c.json({ error: 'Member not found' }, 404);

  const currentRole = member.role as Role;
  if (viewerRole === 'admin' && currentRole === 'owner') {
    return c.json({ error: 'Admins cannot remove owners' }, 403);
  }

  if (currentRole === 'owner') {
    const ownerCount = await countActiveOwners(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      (c.env as { FIREBASE_PROJECT_ID: string }).FIREBASE_PROJECT_ID,
      orgId,
    );
    if (ownerCount <= 1) {
      return c.json({ error: 'Cannot remove the last owner' }, 409);
    }
  }

  // Delete via REST
  try {
    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON!) as { client_email: string; private_key: string; project_id: string };
    const now = Math.floor(Date.now() / 1000);
    const header  = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: sa.client_email, sub: sa.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now, exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/datastore',
    };
    const encode = (o: unknown) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const unsigned = `${encode(header)}.${encode(payload)}`;
    const pemBody = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
    const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey('pkcs8', keyBytes,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const signBytes = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
    const sig = btoa(String.fromCharCode(...new Uint8Array(signBytes)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const jwt = `${unsigned}.${sig}`;
    const tokRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
    });
    const tokData = await tokRes.json() as { access_token: string };

    const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/members/${targetUid}`;
    const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${tokData.access_token}` } });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Delete failed: ${await res.text()}`);
    }
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Delete failed' }, 500);
  }

  return c.json({ ok: true });
});

/* ── POST /api/team/members/:uid/disable | enable ─────── */

async function setMemberStatus(env: AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string }, orgId: string, uid: string, status: 'active' | 'disabled') {
  await firestoreSet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON!,
    `organizations/${orgId}/members/${uid}`,
    { status, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

members.post('/api/team/members/:uid/disable', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const targetUid  = c.req.param('uid');
  const orgId      = c.get('orgId') as string;
  const viewerRole = c.get('role')  as Role;

  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}/members/${targetUid}`);
  if (!member) return c.json({ error: 'Member not found' }, 404);
  if (viewerRole === 'admin' && member.role === 'owner') return c.json({ error: 'Admins cannot disable owners' }, 403);

  try { await setMemberStatus(env, orgId, targetUid!, 'disabled'); }
  catch (err) { return c.json({ error: err instanceof Error ? err.message : 'Disable failed' }, 500); }
  return c.json({ ok: true });
});

members.post('/api/team/members/:uid/enable', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const targetUid = c.req.param('uid');
  const orgId     = c.get('orgId') as string;

  try { await setMemberStatus(env, orgId, targetUid!, 'active'); }
  catch (err) { return c.json({ error: err instanceof Error ? err.message : 'Enable failed' }, 500); }
  return c.json({ ok: true });
});

export default members;
