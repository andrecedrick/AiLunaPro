/**
 * Contacts — org-scoped contact/lead management (CRM-lite).
 *
 * RBAC — ASSIGNMENT-BASED (see lib/contact-access.ts for the model and the reason
 * the legacy fallback exists). Role no longer widens visibility:
 *   - GET  /api/contacts/list   requireRole([owner,admin,member]) — SUPER ADMIN sees
 *     every contact in the org; owner/admin/member see ONLY contacts assigned to
 *     them. Two admins in one workspace no longer read each other's pipeline.
 *   - POST /api/contacts/create requireRole([owner,admin,member]) — any content role.
 *     The new contact is assigned to its creator, so creating never means losing it.
 *   - PATCH /api/contacts/:id   requireRole([owner,admin,member]) — you may edit only
 *     what is assigned to you (super admin: anything). A status change
 *     (block / activate / inactive) additionally requires owner/admin or super
 *     admin, so a member cannot block even their own contact.
 *   - DELETE /api/contacts/:id  requireRole([owner,admin,member]) — same assignment gate.
 *   - GET  /api/contacts/all    requirePlatformAdmin() — super-admin cross-org READ ONLY.
 *
 * Assignment, transfer and reassignment live in routes/contacts-assign.ts and are
 * SUPER ADMIN ONLY. CSV import lives in routes/contacts-import.ts.
 *
 * Storage: organizations/{orgId}/contacts/{id}. firestore.rules deny ALL client
 * access (PII: email/phone) — the worker service account is the only reader/writer.
 * Org isolation is structural via the {orgId} path segment; cross-tenant is impossible
 * because requireRole binds orgId to a verified membership and every path is org-scoped.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole, type Role } from '../middleware/requireRole';
import { requirePlatformAdmin, isSuperAdmin } from '../lib/platformAdmin';
import { canEditContact, canViewContact } from '../lib/contact-access';
import { firestoreGet, firestoreSet, firestoreDelete, firestoreRunQuery } from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const contacts = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const COLLECTION = (orgId: string) => `organizations/${orgId}/contacts`;
const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS_VALUES: readonly string[] = ['active', 'inactive', 'blocked'];
// 'demo_request' is written by the lead → contact bridge (lib/lead-contact.ts).
// Listed here so an operator can also set it by hand and so validation does not
// reject a contact the platform itself created.
const SOURCE_VALUES: readonly string[] = ['worksheet', 'quote', 'manual', 'visibility', 'import', 'demo_request'];
const ORG_ROLES: readonly Role[]    = ['owner', 'admin', 'member']; // billing/client excluded
const MANAGE_ROLES: readonly Role[] = ['owner', 'admin'];           // block + delete-any

const NAME_MAX = 120, COMPANY_MAX = 120, NOTES_MAX = 2000, PHONE_MAX = 40, TAG_MAX = 32, TAGS_MAX = 20;

function genId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Sales funnel stages. Distinct from `status`, which is the CRM record state. */
const LEAD_STATUS_VALUES: readonly string[] = ['new', 'contacted', 'qualified', 'won', 'lost'];

interface ContactInput {
  name: string; email: string; phone: string; company: string;
  tags: string[]; notes: string; status: string; source: string;
  leadStatus: string; owner: string; countryCode: string;
  linkedQuoteId: string; linkedAuditId: string;
}

/** Validate a create (full) or patch (partial) body. Returns the sanitized fields present. */
function validate(body: Record<string, unknown>, partial: boolean): { ok: true; value: Partial<ContactInput> } | { ok: false; error: string } {
  const v: Partial<ContactInput> = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has('name')) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return { ok: false, error: 'name is required' };
    if (name.length > NAME_MAX) return { ok: false, error: `name must be ≤ ${NAME_MAX} chars` };
    v.name = name;
  }
  if (!partial || has('email')) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(email)) return { ok: false, error: 'a valid email is required' };
    v.email = email;
  }
  if (has('phone')) {
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (phone.length > PHONE_MAX) return { ok: false, error: `phone must be ≤ ${PHONE_MAX} chars` };
    v.phone = phone;
  }
  // Company is MANDATORY — on create AND on any patch that touches it. A lead with
  // no company cannot be qualified or routed, so allowing an operator to clear the
  // field would re-open the exact gap signup was fixed to close.
  if (!partial || has('company')) {
    const company = typeof body.company === 'string' ? body.company.trim() : '';
    if (!company) return { ok: false, error: 'company is required' };
    if (company.length > COMPANY_MAX) return { ok: false, error: `company must be ≤ ${COMPANY_MAX} chars` };
    v.company = company;
  }
  if (has('notes')) {
    const notes = typeof body.notes === 'string' ? body.notes : '';
    if (notes.length > NOTES_MAX) return { ok: false, error: `notes must be ≤ ${NOTES_MAX} chars` };
    v.notes = notes;
  }
  if (has('tags')) {
    if (!Array.isArray(body.tags)) return { ok: false, error: 'tags must be an array' };
    const tags = body.tags.filter((t): t is string => typeof t === 'string').map(t => t.trim()).filter(Boolean).slice(0, TAGS_MAX);
    if (tags.some(t => t.length > TAG_MAX)) return { ok: false, error: `each tag must be ≤ ${TAG_MAX} chars` };
    v.tags = Array.from(new Set(tags));
  }
  if (!partial || has('status')) {
    const status = typeof body.status === 'string' ? body.status : 'active';
    if (!STATUS_VALUES.includes(status)) return { ok: false, error: `status must be one of: ${STATUS_VALUES.join(', ')}` };
    v.status = status;
  }
  if (!partial || has('source')) {
    const source = typeof body.source === 'string' ? body.source : 'manual';
    if (!SOURCE_VALUES.includes(source)) return { ok: false, error: `source must be one of: ${SOURCE_VALUES.join(', ')}` };
    v.source = source;
  }
  // Sales-pipeline fields. leadStatus drives the funnel, owner assigns the lead,
  // countryCode records the region — all editable by the same org roles that may
  // already edit name/phone/company, so this widens WHAT can be edited, never WHO.
  if (has('leadStatus')) {
    const ls = typeof body.leadStatus === 'string' ? body.leadStatus : '';
    if (ls && !LEAD_STATUS_VALUES.includes(ls)) return { ok: false, error: `leadStatus must be one of: ${LEAD_STATUS_VALUES.join(', ')}` };
    v.leadStatus = ls;
  }
  if (has('owner')) {
    const owner = typeof body.owner === 'string' ? body.owner.trim() : '';
    if (owner.length > NAME_MAX) return { ok: false, error: `owner must be ≤ ${NAME_MAX} chars` };
    v.owner = owner;
  }
  if (has('countryCode')) {
    const cc = typeof body.countryCode === 'string' ? body.countryCode.trim().toUpperCase() : '';
    if (cc && !/^[A-Z]{2}$/.test(cc)) return { ok: false, error: 'countryCode must be an ISO-3166 alpha-2 code' };
    v.countryCode = cc;
  }
  if (has('linkedQuoteId')) v.linkedQuoteId = safeId(body.linkedQuoteId);
  if (has('linkedAuditId')) v.linkedAuditId = safeId(body.linkedAuditId);
  return { ok: true, value: v };
}

/** Map a stored doc to the API shape (no internal-only fields beyond what the UI needs). */
function toItem(name: string, f: Record<string, unknown>) {
  return {
    contactId:     name.split('/').pop() ?? '',
    name:          typeof f.name === 'string' ? f.name : '',
    email:         typeof f.email === 'string' ? f.email : '',
    phone:         typeof f.phone === 'string' ? f.phone : '',
    company:       typeof f.company === 'string' ? f.company : '',
    tags:          Array.isArray(f.tags) ? f.tags.filter((t): t is string => typeof t === 'string') : [],
    notes:         typeof f.notes === 'string' ? f.notes : '',
    status:        typeof f.status === 'string' ? f.status : 'active',
    source:        typeof f.source === 'string' ? f.source : 'manual',
    linkedQuoteId: typeof f.linkedQuoteId === 'string' ? f.linkedQuoteId : '',
    linkedAuditId: typeof f.linkedAuditId === 'string' ? f.linkedAuditId : '',
    createdByUid:  typeof f.createdByUid === 'string' ? f.createdByUid : '',
    createdAt:     typeof f.createdAt === 'string' ? f.createdAt : '',
    updatedAt:     typeof f.updatedAt === 'string' ? f.updatedAt : '',
    // Written by the lead → contact bridge. Manually-created contacts have
    // neither, so both default rather than rendering as undefined.
    identityEmail:  typeof f.identityEmail === 'string' ? f.identityEmail : '',
    leadStatus:     typeof f.leadStatus === 'string' ? f.leadStatus : '',
    countryCode:    typeof f.countryCode === 'string' ? f.countryCode : '',
    phoneCountry:   typeof f.phoneCountry === 'string' ? f.phoneCountry : '',
    lastActivityAt: typeof f.lastActivityAt === 'string' ? f.lastActivityAt : '',
    owner:          typeof f.owner === 'string' ? f.owner : '',
    // Ownership ledger. `assignedToUid` is the authorisation key; the *Email and
    // *At fields exist so an operator can see WHO holds the lead and WHEN it
    // changed hands without resolving uids by hand.
    assignedToUid:        typeof f.assignedToUid === 'string' ? f.assignedToUid : '',
    assignedToEmail:      typeof f.assignedToEmail === 'string' ? f.assignedToEmail : '',
    assignedByEmail:      typeof f.assignedByEmail === 'string' ? f.assignedByEmail : '',
    assignedAt:           typeof f.assignedAt === 'string' ? f.assignedAt : '',
    lastReassignedByEmail: typeof f.lastReassignedByEmail === 'string' ? f.lastReassignedByEmail : '',
    lastReassignedAt:      typeof f.lastReassignedAt === 'string' ? f.lastReassignedAt : '',
    // Reconciliation link into Twenty. Written by the CRM push; empty for
    // manually-created contacts and for leads captured before the integration.
    twentyPersonId:  typeof f.twentyPersonId === 'string' ? f.twentyPersonId : '',
    twentyCompanyId: typeof f.twentyCompanyId === 'string' ? f.twentyCompanyId : '',
    lastMessage:    typeof f.lastMessage === 'string' ? f.lastMessage : '',
  };
}

/** Find an existing contact in the org with this emailKey (dedup). Excludes `exceptId`. */
async function findByEmail(saJson: string, orgId: string, emailKey: string, exceptId: string): Promise<boolean> {
  const rows = await firestoreRunQuery(saJson, {
    from: [{ collectionId: 'contacts' }],
    where: { fieldFilter: { field: { fieldPath: 'emailKey' }, op: 'EQUAL', value: { stringValue: emailKey } } },
    limit: 2,
  }, `organizations/${orgId}`);
  return rows.some(r => (r.name.split('/').pop() ?? '') !== exceptId);
}

/**
 * Load contacts under `parent` (org doc, or '' for a root collectionGroup).
 * Tries the indexed orderBy(createdAt) query; on ANY failure (e.g. a fresh
 * collectionGroup with no single-field index yet → FAILED_PRECONDITION) it
 * retries WITHOUT orderBy and sorts in code, so the endpoint degrades gracefully
 * instead of 500-ing with QUERY_FAILED. Always returns newest-first.
 */
async function loadContacts(saJson: string, parent: string, allDescendants: boolean, limit: number) {
  const from = [{ collectionId: 'contacts', ...(allDescendants ? { allDescendants: true } : {}) }];
  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, { from, orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }], limit }, parent);
  } catch (err) {
    console.warn('[contacts] ordered query failed, retrying without orderBy:', err instanceof Error ? err.message : '');
    rows = await firestoreRunQuery(saJson, { from, limit }, parent);
  }
  rows.sort((a, b) => {
    const ca = String((a.fields as Record<string, unknown>).createdAt ?? '');
    const cb = String((b.fields as Record<string, unknown>).createdAt ?? '');
    return ca < cb ? 1 : ca > cb ? -1 : 0;
  });
  return rows;
}

/* ── GET /api/contacts/list — org-scoped ──────────────────────────────────── */
contacts.get('/api/contacts/list', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await loadContacts(saJson, `organizations/${orgId}`, false, 1000);
  } catch (err) {
    console.error('[contacts] list failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load contacts.', code: 'QUERY_FAILED' }, 500);
  }

  // Visibility is assignment-based, NOT role-based: an admin sees exactly what is
  // assigned to them, the same as a member. Only a super admin sees the whole org.
  const isSuper = isSuperAdmin(env, c.get('email'), c.get('emailVerified'));
  const tag    = (c.req.query('tag') ?? '').trim();
  const source = (c.req.query('source') ?? '').trim();
  const status = (c.req.query('status') ?? '').trim();

  const list = rows
    .map(r => toItem(r.name, r.fields as Record<string, unknown>))
    .filter(x => canViewContact(x, uid, isSuper))
    .filter(x => (tag ? x.tags.includes(tag) : true))
    .filter(x => (source ? x.source === source : true))
    .filter(x => (status ? x.status === status : true));

  return c.json({ ok: true, contacts: list });
});

/* ── POST /api/contacts/create — org-scoped ───────────────────────────────── */
contacts.post('/api/contacts/create', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const v = validate(body, false);
  if (!v.ok) return c.json({ error: v.error, code: 'INVALID_INPUT' }, 400);
  const f = v.value;

  // Dedup: no two contacts with the same email in one org.
  if (await findByEmail(saJson, orgId, f.email!, '')) {
    return c.json({ error: 'A contact with this email already exists.', code: 'DUPLICATE_EMAIL' }, 409);
  }

  const contactId = genId();
  const now = new Date().toISOString();
  const email = c.get('email') ?? '';
  const doc = {
    contactId, orgId,
    name: f.name!, email: f.email!, emailKey: f.email!,
    phone: f.phone ?? '', company: f.company ?? '', notes: f.notes ?? '',
    tags: f.tags ?? [], status: f.status ?? 'active', source: f.source ?? 'manual',
    linkedQuoteId: f.linkedQuoteId ?? '', linkedAuditId: f.linkedAuditId ?? '',
    createdByUid: uid, createdAt: now, updatedAt: now,
    // Assigned to its creator at birth. Without this, visibility being
    // assignment-based would mean a member creates a contact and immediately
    // cannot see it — the record would vanish the moment it was saved.
    assignedToUid: uid, assignedToEmail: email,
    assignedByUid: uid, assignedByEmail: email, assignedAt: now,
    lastReassignedByEmail: '', lastReassignedAt: '',
  };
  await firestoreSet(saJson, `${COLLECTION(orgId)}/${contactId}`, doc);
  dlog(env as Record<string, unknown>, '[contacts] created', contactId, 'org', orgId);
  return c.json({ ok: true, contactId });
});

/* ── PATCH /api/contacts/:id — org-scoped, ownership + block gating ────────── */
contacts.patch('/api/contacts/:id', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;
  const role  = c.get('role') as Role;
  const id    = safeId(c.req.param('id'));

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const path = `${COLLECTION(orgId)}/${id}`;
  const existing = await firestoreGet(saJson, path);
  if (!existing) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  // You may edit only what is assigned to you. Role does not widen this — an
  // admin has no more reach over another admin's lead than a member does.
  const isSuper   = isSuperAdmin(env, c.get('email'), c.get('emailVerified'));
  const isManager = MANAGE_ROLES.includes(role) || isSuper;
  if (!canEditContact(existing, uid, isSuper)) {
    return c.json({ error: 'Not your contact.', code: 'FORBIDDEN' }, 403);
  }

  const v = validate(body, true);
  if (!v.ok) return c.json({ error: v.error, code: 'INVALID_INPUT' }, 400);
  const f = v.value;

  // Block / activate is a governance action — owner/admin (or super admin) only.
  if (f.status !== undefined && existing.status !== f.status && !isManager) {
    return c.json({ error: 'Only owner/admin can change a contact status.', code: 'FORBIDDEN_STATUS' }, 403);
  }

  // Email change → re-dedup (excluding this contact).
  const patch: Record<string, unknown> = { ...f, updatedAt: new Date().toISOString() };
  if (f.email !== undefined && f.email !== existing.email) {
    if (await findByEmail(saJson, orgId, f.email, id)) {
      return c.json({ error: 'A contact with this email already exists.', code: 'DUPLICATE_EMAIL' }, 409);
    }
    patch.emailKey = f.email;
  }
  // createdAt / createdByUid / orgId are never patched (preserve provenance).
  delete (patch as Record<string, unknown>).createdAt;
  delete (patch as Record<string, unknown>).createdByUid;

  await firestoreSet(saJson, path, patch as unknown as Parameters<typeof firestoreSet>[2], { merge: true });
  return c.json({ ok: true, contactId: id });
});

/* ── DELETE /api/contacts/:id — org-scoped, member own-only ────────────────── */
contacts.delete('/api/contacts/:id', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;
  const id    = safeId(c.req.param('id'));

  const path = `${COLLECTION(orgId)}/${id}`;
  const existing = await firestoreGet(saJson, path);
  if (!existing) return c.json({ ok: true }); // idempotent

  // Same assignment gate as edit: deleting someone else's lead is the most
  // destructive form of "editing a contact that is not yours".
  if (!canEditContact(existing, uid, isSuperAdmin(env, c.get('email'), c.get('emailVerified')))) {
    return c.json({ error: 'Not your contact.', code: 'FORBIDDEN' }, 403);
  }
  await firestoreDelete(saJson, path);
  return c.json({ ok: true });
});

/* ── GET /api/contacts/all — PLATFORM super-admin, cross-org READ ONLY ─────── */
const contactsPlatform = new Hono<AppEnv>();
contactsPlatform.get('/api/contacts/all', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await loadContacts(saJson, '', true, 2000);
  } catch (err) {
    console.error('[contacts] cross-org list failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load contacts.', code: 'QUERY_FAILED' }, 500);
  }

  // orgId is derived from the document path (…/organizations/{orgId}/contacts/{id}).
  const list = rows.map(r => {
    const m = r.name.match(/organizations\/([^/]+)\/contacts\//);
    return { ...toItem(r.name, r.fields as Record<string, unknown>), orgId: m ? m[1] : '' };
  });
  return c.json({ ok: true, contacts: list });
});

export { contactsPlatform };
export default contacts;
