/**
 * Contact assignment — SUPER ADMIN ONLY.
 *
 * Assign, transfer and reassign are the SAME operation: point a contact at a
 * different user. They are one route rather than three because three endpoints
 * that write the same field is three chances for them to disagree about what the
 * ledger looks like. The route distinguishes the cases by what it finds already
 * on the record:
 *   - no previous assignment → first assignment  (assignedBy / assignedAt)
 *   - a previous assignment  → transfer          (lastReassignedBy / lastReassignedAt,
 *                                                 with assignedAt refreshed to the
 *                                                 date the CURRENT holder received it)
 *
 * `assignedAt` deliberately tracks the current holder, not the original one. A
 * sales operator asking "how long has this lead been sitting with its owner?"
 * needs the handover date; the previous holder's tenure is not recoverable from
 * one field either way, and the reassignment stamp records that a handover
 * happened.
 *
 * WHY PLATFORM-ADMIN AND NOT requireRole: the spec grants assignment to the super
 * admin alone, and a platform operator is a NON-MEMBER of every org — requireRole
 * would 403 them by design. So the org is addressed by an explicit `orgId` in the
 * body and the operator allowlist is the only gate. Cross-org is intentional:
 * leads land in the prospect's own workspace, so assigning them to an AiLunaPro
 * sales rep is inherently a cross-org write.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreGet, firestoreSet, firestoreRunQuery } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const assign = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

/* ── GET /api/contacts/assignable?orgId= — who can hold a lead in this org ──── */
assign.get('/api/contacts/assignable', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = safeId(c.req.query('orgId'));
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, { from: [{ collectionId: 'members' }], limit: 200 }, `organizations/${orgId}`);
  } catch (err) {
    console.error('[contacts-assign] member list failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load members.', code: 'QUERY_FAILED' }, 500);
  }

  // billing/client are walled off from Contacts entirely, so they can never hold a
  // lead — offering them in the picker would create an assignment nobody can act on.
  const HOLDER_ROLES = ['owner', 'admin', 'member'];
  const members = rows
    .map(r => {
      const f = r.fields as Record<string, unknown>;
      return {
        uid:    r.name.split('/').pop() ?? '',
        email:  typeof f.email === 'string' ? f.email : '',
        role:   typeof f.role === 'string' ? f.role : '',
        status: typeof f.status === 'string' ? f.status : '',
      };
    })
    .filter(m => m.uid && HOLDER_ROLES.includes(m.role) && m.status !== 'disabled');

  return c.json({ ok: true, members });
});

/* ── POST /api/contacts/assign — assign · transfer · reassign ───────────────── */
assign.post('/api/contacts/assign', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId     = safeId(body.orgId);
  const contactId = safeId(body.contactId);
  // '' is a legitimate target: it UNASSIGNS, returning the lead to the pool that
  // only the super admin can see. Without it a misassignment could never be undone.
  const toUid     = safeId(body.assignToUid);
  if (!orgId || !contactId) return c.json({ error: 'orgId and contactId are required.', code: 'INVALID_INPUT' }, 400);

  const path = `organizations/${orgId}/contacts/${contactId}`;
  const existing = await firestoreGet(saJson, path);
  if (!existing) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  // The target must be a real, enabled member of THIS org. Assigning to an
  // arbitrary uid would create a lead that is invisible to everyone including the
  // person it names, because visibility is keyed on exactly this field.
  let toEmail = '';
  if (toUid) {
    const member = await firestoreGet(saJson, `organizations/${orgId}/members/${toUid}`);
    if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'NOT_A_MEMBER' }, 400);
    if (member.status === 'disabled') return c.json({ error: 'That member is disabled.', code: 'MEMBER_DISABLED' }, 400);
    toEmail = typeof member.email === 'string' ? member.email : '';
  }

  const now      = new Date().toISOString();
  const actor    = c.get('email') ?? '';
  const actorUid = c.get('uid') as string;
  const previous = typeof existing.assignedToUid === 'string' ? existing.assignedToUid : '';
  const isTransfer = Boolean(previous) && previous !== toUid;

  const patch: Record<string, unknown> = {
    assignedToUid:   toUid,
    assignedToEmail: toEmail,
    // The free-text `owner` column predates assignment and is what the CRM table
    // already renders. Keeping it in step means the existing UI shows the real
    // holder instead of a stale hand-typed name.
    owner:           toEmail,
    assignedByUid:   actorUid,
    assignedByEmail: actor,
    assignedAt:      now,
    updatedAt:       now,
    ...(isTransfer ? { lastReassignedByEmail: actor, lastReassignedAt: now } : {}),
  };

  await firestoreSet(saJson, path, patch as unknown as Parameters<typeof firestoreSet>[2], { merge: true });
  console.log(`[contacts-assign] org=${orgId} contact=${contactId} ${isTransfer ? 'transferred' : 'assigned'} assigned=${toUid ? 'yes' : 'unassigned'}`);
  return c.json({ ok: true, contactId, assignedToUid: toUid, assignedToEmail: toEmail, transferred: isTransfer });
});

export default assign;
