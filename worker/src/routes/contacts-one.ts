/**
 * Fetch ONE contact — GET /api/contacts/one?orgId=&contactId=
 *
 * WHY THIS EXISTS: opening a lead from the sales follow-up queue had no way to
 * read a single contact. The page fell back to listing up to 200 contacts and
 * searching the result in memory — 200 document reads to render one panel.
 *
 * Worse for a super admin, and this is the reported "unresponsive" click: the
 * queue is cross-org for an operator, so the fallback called the org-scoped list
 * for the PROSPECT's organisation. That route is behind requireRole, a platform
 * operator is deliberately never a member of a tenant org, and the call 403'd.
 * The client swallowed it, so nothing opened and nothing was reported.
 *
 * The gate here is therefore NOT requireRole. It is the same authorisation the
 * rest of the CRM uses, expressed for a single document:
 *   - a platform operator may read any contact in any org (they already can,
 *     through /api/contacts/all — this only makes it one read instead of a scan)
 *   - anyone else must be a member of that org AND pass canViewContact
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { isSuperAdmin } from '../lib/platformAdmin';
import { canViewContact } from '../lib/contact-access';
import { firestoreGet } from '../lib/firestoreAdmin';
import { toContactItem } from '../lib/contact-item';
import type { AppEnv } from '../index';

const one = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

one.get('/api/contacts/one', requireAuth(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = safeId(c.req.query('orgId'));
  const contactId = safeId(c.req.query('contactId'));
  if (!orgId || !contactId) return c.json({ error: 'orgId and contactId are required.', code: 'INVALID_INPUT' }, 400);

  const uid = c.get('uid') as string;
  const isSuper = isSuperAdmin(env, c.get('email'), c.get('emailVerified'));

  // Membership is only checked for non-operators, and only ONE read either way.
  if (!isSuper) {
    const member = await firestoreGet(saJson, `organizations/${orgId}/members/${uid}`);
    if (!member || member.status === 'disabled') {
      return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
    }
  }

  const doc = await firestoreGet(saJson, `organizations/${orgId}/contacts/${contactId}`);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  // Assignment gate. A member of the org still may not read a colleague's lead.
  if (!canViewContact(doc, uid, isSuper)) {
    return c.json({ error: 'Not your contact.', code: 'FORBIDDEN' }, 403);
  }

  return c.json({ ok: true, contact: { ...toContactItem(contactId, doc), orgId } });
});

export default one;
