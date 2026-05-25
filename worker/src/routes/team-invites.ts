/**
 * Team invites — Phase J1.3E (worker authority).
 *
 *   POST   /api/team/invites
 *   GET    /api/team/invites?orgId=...
 *   POST   /api/team/invites/:inviteId/cancel
 *   POST   /api/team/invites/accept
 *
 * All writes go through the worker (service account) — bypasses Firestore
 * client-side rules. Authority + role enforcement happens here.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { sendTransactional } from '../lib/sequenzy';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const invites = new Hono<AppEnv>();

type Role = 'owner' | 'admin' | 'member' | 'billing' | 'client';

const INVITE_TTL_DAYS = 7;

/* ── Token helpers (Web Crypto) ───────────────────────── */

function generateToken(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function isValidRole(r: string): r is Role {
  return r === 'owner' || r === 'admin' || r === 'member' || r === 'billing' || r === 'client';
}

/* ── POST /api/team/invites ───────────────────────────── */

interface CreateInviteBody {
  orgId:        string;
  email:        string;
  displayName:  string;
  role:         Role;
  message?:     string;
}

invites.post('/api/team/invites', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    APP_BASE_URL?:                  string;
    SEQUENZY_API_KEY?:              string;
  };
  const uid       = c.get('uid')   as string;
  const viewerRole = c.get('role') as Role;

  let body: CreateInviteBody;
  try { body = await c.req.json<CreateInviteBody>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  if (!body.email || !body.role) return c.json({ error: 'Missing email or role' }, 400);
  if (!isValidRole(body.role))   return c.json({ error: 'Invalid role' }, 400);

  // Admin cannot invite owner
  if (viewerRole === 'admin' && body.role === 'owner') {
    return c.json({ error: 'Admins cannot invite owners' }, 403);
  }

  const orgId    = c.get('orgId') as string;
  const inviteId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const token    = generateToken();
  const tokenHash = await sha256Hex(token);
  const now      = new Date();
  const expires  = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const inviteDoc = {
    id:          inviteId,
    orgId,
    email:       body.email.toLowerCase().trim(),
    displayName: body.displayName?.trim() ?? '',
    role:        body.role,
    status:      'pending',
    invitedBy:   uid,
    tokenHash,
    createdAt:   now.toISOString(),
    expiresAt:   expires.toISOString(),
    ...(body.message ? { message: body.message } : {}),
  };

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/invites/${inviteId}`,
      inviteDoc,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firestore write failed';
    return c.json({ error: msg }, 500);
  }

  dlog(env, '[team-invites] created', inviteId, 'role=', body.role, 'invitedBy=', uid);

  // Best-effort invitation email (non-fatal). Never blocks invite creation:
  // the invite doc + copyable link already exist regardless of email outcome.
  // waitUntil keeps the isolate alive until the send settles (Workers cancel
  // un-awaited work once the response returns).
  c.executionCtx.waitUntil((async () => {
    try {
      const org       = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}`);
      const workspace = (org?.name as string) || 'your workspace';
      const baseUrl   = env.APP_BASE_URL ?? 'http://localhost:5173';
      const acceptUrl = `${baseUrl}/#/invite/${orgId}/${inviteId}/${token}`;
      const r = await sendTransactional(env.SEQUENZY_API_KEY, {
        to:   inviteDoc.email,
        slug: 'team-invite',
        variables: {
          WORKSPACE:    workspace,
          INVITEE_NAME: inviteDoc.displayName || '',
          ROLE:         body.role,
          ACCEPT_URL:   acceptUrl,
          EXPIRES:      expires.toISOString().slice(0, 10),
        },
      });
      if (!r.ok) console.error('[team-invites] invite email failed (non-fatal):', r.error);
      else dlog(env, '[team-invites] invite email sent', inviteId);
    } catch (err) {
      console.error('[team-invites] invite email error (non-fatal):', err);
    }
  })());

  // Return invite link with raw token (only chance to see it)
  return c.json({
    invite: { ...inviteDoc, tokenHash: undefined },
    inviteId,
    rawToken: token,
    // Frontend builds full link from these
  });
});

/* ── GET /api/team/invites ────────────────────────────── */

invites.get('/api/team/invites', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    FIREBASE_PROJECT_ID:            string;
  };
  const orgId = c.get('orgId') as string;

  // List via Firestore REST (runQuery would be cleaner but listDocuments works)
  // Use listDocuments path
  try {
    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON!) as { client_email: string; private_key: string; project_id: string };
    // For simplicity: use firestoreGet on each known invite ID is not viable.
    // We need a proper list. Use the REST listDocuments endpoint.
    const list = await listInvitesViaRest(env.FIREBASE_SERVICE_ACCOUNT_JSON!, sa.project_id, orgId);
    return c.json({ invites: list });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'List failed';
    return c.json({ error: msg }, 500);
  }
});

async function listInvitesViaRest(saJson: string, projectId: string, orgId: string): Promise<Array<Record<string, unknown>>> {
  // Inline minimal token + listDocuments
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
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const tokData = await tokRes.json() as { access_token: string };

  // Paginate via nextPageToken so orgs with >1 page of invites aren't silently
  // truncated. pageSize=300 keeps round-trips low; MAX_PAGES is a safety cap
  // (300×50 = 15000 invites) to bound an unexpected loop.
  type InviteDoc = { name: string; fields: Record<string, { stringValue?: string; integerValue?: string; booleanValue?: boolean; timestampValue?: string }> };
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/organizations/${orgId}/invites?pageSize=300`;
  const out: Array<Record<string, unknown>> = [];
  let pageToken = '';
  const MAX_PAGES = 50;
  let pages = 0;

  do {
    const url = pageToken ? `${base}&pageToken=${encodeURIComponent(pageToken)}` : base;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${tokData.access_token}` } });
    if (!res.ok) throw new Error(`listDocuments failed: ${await res.text()}`);
    const data = await res.json() as { documents?: InviteDoc[]; nextPageToken?: string };

    for (const doc of data.documents ?? []) {
      const fields = doc.fields ?? {};
      const id = doc.name.split('/').pop() ?? '';
      const row: Record<string, unknown> = { id };
      for (const [k, v] of Object.entries(fields)) {
        if (k === 'tokenHash') continue;        // never expose
        if (v.stringValue    !== undefined) row[k] = v.stringValue;
        else if (v.integerValue   !== undefined) row[k] = parseInt(v.integerValue, 10);
        else if (v.booleanValue   !== undefined) row[k] = v.booleanValue;
        else if (v.timestampValue !== undefined) row[k] = v.timestampValue;
      }
      out.push(row);
    }

    pageToken = data.nextPageToken ?? '';
    pages++;
    if (pages >= MAX_PAGES) {
      console.warn('[team-invites] invite list pagination cap reached for org', orgId);
      break;
    }
  } while (pageToken);

  return out;
}

/* ── POST /api/team/invites/:inviteId/regenerate ──────── */

invites.post('/api/team/invites/:inviteId/regenerate', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    APP_BASE_URL?:                  string;
    SEQUENZY_API_KEY?:              string;
  };
  const orgId      = c.get('orgId') as string;
  const viewerRole = c.get('role')  as Role;
  const inviteId   = c.req.param('inviteId');
  if (!inviteId) return c.json({ error: 'Missing inviteId' }, 400);

  const invite = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}/invites/${inviteId}`);
  if (!invite) return c.json({ error: 'Invitation not found' }, 404);
  if (invite.status !== 'pending') return c.json({ error: 'Only pending invites can be regenerated' }, 409);

  // Admin cannot regenerate owner invite
  if (viewerRole === 'admin' && invite.role === 'owner') {
    return c.json({ error: 'Admins cannot regenerate owner invites' }, 403);
  }

  const newToken     = generateToken();
  const newTokenHash = await sha256Hex(newToken);
  const newExpires   = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/invites/${inviteId}`,
      {
        tokenHash:    newTokenHash,
        expiresAt:    newExpires.toISOString(),
        regeneratedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Regenerate failed' }, 500);
  }

  dlog(env, '[team-invites] regenerated', inviteId);

  // Best-effort re-send of the invitation email with the new link (non-fatal).
  c.executionCtx.waitUntil((async () => {
    try {
      const org       = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `organizations/${orgId}`);
      const workspace = (org?.name as string) || 'your workspace';
      const baseUrl   = env.APP_BASE_URL ?? 'http://localhost:5173';
      const acceptUrl = `${baseUrl}/#/invite/${orgId}/${inviteId}/${newToken}`;
      const r = await sendTransactional(env.SEQUENZY_API_KEY, {
        to:   String(invite.email ?? ''),
        slug: 'team-invite',
        variables: {
          WORKSPACE:    workspace,
          INVITEE_NAME: String(invite.displayName ?? ''),
          ROLE:         String(invite.role ?? ''),
          ACCEPT_URL:   acceptUrl,
          EXPIRES:      newExpires.toISOString().slice(0, 10),
        },
      });
      if (!r.ok) console.error('[team-invites] regen email failed (non-fatal):', r.error);
    } catch (err) {
      console.error('[team-invites] regen email error (non-fatal):', err);
    }
  })());

  return c.json({
    inviteId,
    rawToken:  newToken,
    expiresAt: newExpires.toISOString(),
  });
});

/* ── POST /api/team/invites/:inviteId/cancel ──────────── */

invites.post('/api/team/invites/:inviteId/cancel', requireAuth(), requireRole(['owner', 'admin']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId    = c.get('orgId') as string;
  const inviteId = c.req.param('inviteId');
  if (!inviteId) return c.json({ error: 'Missing inviteId' }, 400);

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/invites/${inviteId}`,
      { status: 'cancelled', cancelledAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Cancel failed' }, 500);
  }
  return c.json({ ok: true });
});

/* ── POST /api/team/invites/accept ────────────────────── */

interface AcceptBody {
  orgId:    string;
  inviteId: string;
  token:    string;
}

invites.post('/api/team/invites/accept', requireAuth(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const uid = c.get('uid') as string;

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Service account not configured' }, 503);

  let body: AcceptBody;
  try { body = await c.req.json<AcceptBody>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const { orgId, inviteId, token } = body;
  if (!orgId || !inviteId || !token) return c.json({ error: 'Missing fields' }, 400);

  // Fetch invite
  const invite = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/invites/${inviteId}`);
  if (!invite) return c.json({ error: 'Invitation not found' }, 404);

  if (invite.status === 'cancelled') return c.json({ error: 'Invitation was cancelled' }, 410);
  if (invite.status === 'accepted')  return c.json({ error: 'Invitation already accepted' }, 409);

  const expiresAt = invite.expiresAt as string | undefined;
  if (expiresAt && Date.parse(expiresAt) < Date.now()) {
    return c.json({ error: 'Invitation expired' }, 410);
  }

  const tokenHash = await sha256Hex(token);
  if (tokenHash !== invite.tokenHash) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Get user info from Firebase Auth (we have uid from JWT)
  // Read user doc to obtain email/displayName/initials
  const userDoc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `users/${uid}`);
  if (!userDoc) return c.json({ error: 'User profile not found' }, 404);

  const email       = (userDoc.email       as string | undefined) ?? (invite.email as string);
  const displayName = (userDoc.displayName as string | undefined) ?? '';
  const initials    = (userDoc.initials    as string | undefined) ?? '';
  const role        = invite.role as Role;

  // Create member doc
  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON,
      `organizations/${orgId}/members/${uid}`,
      {
        userId:      uid,
        orgId,
        role,
        status:      'active',
        displayName,
        email,
        initials,
        invitedBy:   invite.invitedBy as string,
        joinedAt:    new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
      },
    );
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Member create failed' }, 500);
  }

  // Append orgId to user.orgIds (read-modify-write)
  try {
    const existingOrgIds = (userDoc.orgIds as string[] | undefined) ?? [];
    const merged = existingOrgIds.includes(orgId) ? existingOrgIds : [...existingOrgIds, orgId];
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON,
      `users/${uid}`,
      { orgIds: merged, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (err) {
    console.warn('[team-invites] orgIds update failed:', err);
  }

  // Mark invite accepted
  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON,
      `organizations/${orgId}/invites/${inviteId}`,
      { status: 'accepted', acceptedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (err) {
    console.warn('[team-invites] mark accepted failed:', err);
  }

  dlog(env, '[team-invites] accepted', inviteId, 'uid=', uid, 'orgId=', orgId, 'role=', role);
  return c.json({ ok: true, orgId, role });
});

export default invites;
