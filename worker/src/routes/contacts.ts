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
import { upsertCompany } from '../lib/company-registry';
import { toContactItem } from '../lib/contact-item';
import { firestoreGet, firestoreSet, firestoreDelete, firestoreRunQuery } from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const contacts = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const COLLECTION = (orgId: string) => `organizations/${orgId}/contacts`;
const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS_VALUES: readonly string[] = ['active', 'inactive', 'blocked'];
// Every source the platform itself writes, plus the ones an operator may set by
// hand. 'signup' was missing while lib/lead-contact.ts hard-coded 'demo_request'
// for BOTH signups and demo requests, so the whole signup population was filed
// under the wrong source and no funnel counted from it could be right.
// 'reconcile' is written only by the company reconciliation pass.
const SOURCE_VALUES: readonly string[] = [
  'worksheet', 'quote', 'manual', 'visibility', 'import', 'demo_request', 'signup', 'reconcile',
];
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

/**
 * Local adapter: routes here key off the Firestore document PATH, the shared
 * mapper off the document id. One projection, two call shapes.
 */
const toItem = (name: string, f: Record<string, unknown>) =>
  toContactItem(name.split(String.fromCharCode(47)).pop() ?? '', f);

/** Find an existing contact in the org with this emailKey (dedup). Excludes `exceptId`. */
async function findByEmail(saJson: string, orgId: string, emailKey: string, exceptId: string): Promise<boolean> {
  const rows = await firestoreRunQuery(saJson, {
    from: [{ collectionId: 'contacts' }],
    where: { fieldFilter: { field: { fieldPath: 'emailKey' }, op: 'EQUAL', value: { stringValue: emailKey } } },
    limit: 2,
  }, `organizations/${orgId}`);
  return rows.some(r => (r.name.split('/').pop() ?? '') !== exceptId);
}

/* ── Pagination ────────────────────────────────────────────────────────────────
 * The list used to fetch up to 1000 contacts on every load and filter them in
 * memory. That is 1000 document reads for a member who can see three of them, and
 * at 10,000 contacts the page simply could not show the newest ones.
 *
 * Reads are now bounded by the page size. The cursor is (createdAt, documentId):
 * createdAt alone is not unique — contacts written in the same millisecond by the
 * import would straddle a page boundary and either repeat or vanish — so the
 * document id is carried as the tie-break, which is also why __name__ is the
 * second orderBy key.
 */
const DEFAULT_LIMIT = 50, MAX_LIMIT = 200;
/** Cap on documents READ while filling one page (see fillPage). */
const MAX_SCAN_PER_PAGE = 1000;

export const encodeCursor = (createdAt: string, docId: string): string =>
  btoa(`${createdAt}\u0000${docId}`).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

export function decodeCursor(raw: string): { createdAt: string; docId: string } | null {
  if (!raw) return null;
  try {
    const s = atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const i = s.indexOf('\u0000');
    if (i < 0) return null;
    return { createdAt: s.slice(0, i), docId: s.slice(i + 1) };
  } catch { return null; }
}

export function clampLimit(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

/** One newest-first page, starting after `cursor` when given. */
async function queryPage(
  saJson: string, parent: string, allDescendants: boolean, limit: number,
  cursor: { createdAt: string; docId: string } | null,
) {
  const from = [{ collectionId: 'contacts', ...(allDescendants ? { allDescendants: true } : {}) }];
  const orderBy = [
    { field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' },
    { field: { fieldPath: '__name__' },  direction: 'DESCENDING' },
  ];
  const q: Record<string, unknown> = { from, orderBy, limit };
  if (cursor) {
    q.startAt = {
      before: false, // startAFTER the cursor document
      values: [{ stringValue: cursor.createdAt }, { referenceValue: cursor.docId }],
    };
  }
  return firestoreRunQuery(saJson, q, parent);
}

export interface ContactPage<T> { items: T[]; nextCursor: string; scanned: number }

/**
 * Fill one page of contacts the caller may actually SEE.
 *
 * Visibility is assignment-based and cannot be expressed as an index on the
 * legacy records (they carry no `assignedToUid` at all — see lib/contact-access),
 * so filtering still happens after the read. The loop exists so that filtering
 * does not produce a page of two rows: it keeps pulling pages until the page is
 * full, the collection is exhausted, or MAX_SCAN_PER_PAGE documents have been
 * read. That cap is the guarantee — one request can never read more than 1000
 * documents no matter how sparse the caller's share of the org is.
 */
async function fillPage<T extends { contactId: string; createdAt: string }>(
  saJson: string, parent: string, allDescendants: boolean,
  limit: number, cursorRaw: string,
  map: (name: string, fields: Record<string, unknown>) => T,
  visible: (item: T) => boolean,
): Promise<ContactPage<T>> {
  // Each kept item is carried WITH its document name and createdAt, because the
  // cursor must point at the last item actually RETURNED. Deriving it from the
  // last row FETCHED silently skipped every over-fetched row that did not fit in
  // the page — 25 contacts lost per page, invisible unless you count the walk.
  const kept: { item: T; at: string; docId: string }[] = [];
  let cursor = decodeCursor(cursorRaw);
  let scanned = 0;
  let exhausted = false;

  while (kept.length < limit && scanned < MAX_SCAN_PER_PAGE) {
    const want = Math.min(limit - kept.length + 25, MAX_SCAN_PER_PAGE - scanned);
    let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
    try {
      rows = await queryPage(saJson, parent, allDescendants, want, cursor);
    } catch (err) {
      // A fresh collection group without the ordering index answers
      // FAILED_PRECONDITION. Degrade to an unordered, unpaginated read rather
      // than 500-ing the CRM, and stop after it.
      console.warn('[contacts] ordered page failed, falling back:', err instanceof Error ? err.message : '');
      const flat = await firestoreRunQuery(saJson, {
        from: [{ collectionId: 'contacts', ...(allDescendants ? { allDescendants: true } : {}) }],
        limit: MAX_SCAN_PER_PAGE,
      }, parent);
      const mapped = flat.map(r => map(r.name, r.fields as Record<string, unknown>)).filter(visible);
      mapped.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
      return { items: mapped.slice(0, limit), nextCursor: '', scanned: flat.length };
    }

    scanned += rows.length;
    if (rows.length === 0) { exhausted = true; break; }

    for (const r of rows) {
      const fields = r.fields as Record<string, unknown>;
      const item = map(r.name, fields);
      if (visible(item)) kept.push({ item, at: String(fields.createdAt ?? ''), docId: r.name });
    }
    // Resume from the last row READ, so the next iteration of this loop does not
    // re-read what it just filtered out.
    const last = rows[rows.length - 1];
    cursor = { createdAt: String((last.fields as Record<string, unknown>).createdAt ?? ''), docId: last.name };
    if (rows.length < want) { exhausted = true; break; }
  }

  const page = kept.slice(0, limit);
  const overflowed = kept.length > limit;
  // The caller's cursor is the last item they were GIVEN. When the page
  // overflowed, the discarded remainder must be re-read next time, not skipped.
  const tail = page[page.length - 1];
  const nextCursor = (exhausted && !overflowed) || !tail ? '' : encodeCursor(tail.at, tail.docId);
  return { items: page.map(k => k.item), nextCursor, scanned };
}

/* ── GET /api/contacts/list — org-scoped ──────────────────────────────────── */
contacts.get('/api/contacts/list', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;

  // Visibility is assignment-based, NOT role-based: an admin sees exactly what is
  // assigned to them, the same as a member. Only a super admin sees the whole org.
  const isSuper = isSuperAdmin(env, c.get('email'), c.get('emailVerified'));
  const tag    = (c.req.query('tag') ?? '').trim();
  const source = (c.req.query('source') ?? '').trim();
  const status = (c.req.query('status') ?? '').trim();
  const limit  = clampLimit(c.req.query('limit'));

  // Server-side filters are applied INSIDE the page fill, not after it. Filtering
  // a completed page would hand back three rows for a page size of fifty and make
  // the operator paginate through mostly-empty screens.
  const visible = (x: ReturnType<typeof toItem>) =>
    canViewContact(x, uid, isSuper) &&
    (tag ? x.tags.includes(tag) : true) &&
    (source ? x.source === source : true) &&
    (status ? x.status === status : true);

  try {
    const page = await fillPage(saJson, `organizations/${orgId}`, false, limit,
      c.req.query('cursor') ?? '', toItem, visible);
    dlog(env as Record<string, unknown>, '[contacts] list org', orgId, 'returned', page.items.length, 'scanned', page.scanned);
    return c.json({ ok: true, contacts: page.items, nextCursor: page.nextCursor, scanned: page.scanned });
  } catch (err) {
    console.error('[contacts] list failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load contacts.', code: 'QUERY_FAILED' }, 500);
  }
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

  // Registry entry before the contact, so a manually-typed company joins the same
  // deduplicated registry the automated flows use. The registry's stored spelling
  // wins over a fresh one so an operator correction is not undone by the next
  // person who types the sloppy version.
  let companyId = '';
  let company = f.company ?? '';
  try {
    const reg = await upsertCompany(saJson, { orgId, name: company, source: f.source ?? 'manual', uid });
    companyId = reg.companyId;
    if (reg.name) company = reg.name;
  } catch (err) {
    console.warn('[contacts] company registry upsert failed:', err instanceof Error ? err.message : '');
  }

  const doc = {
    contactId, orgId,
    name: f.name!, email: f.email!, emailKey: f.email!,
    phone: f.phone ?? '', company, companyId, notes: f.notes ?? '',
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

  // orgId is derived from the document path (…/organizations/{orgId}/contacts/{id}).
  const withOrg = (name: string, fields: Record<string, unknown>) => {
    const m = name.match(/organizations\/([^/]+)\/contacts\//);
    return { ...toItem(name, fields), orgId: m ? m[1] : '' };
  };

  try {
    const page = await fillPage(saJson, '', true, clampLimit(c.req.query('limit')),
      c.req.query('cursor') ?? '', withOrg, () => true);
    return c.json({ ok: true, contacts: page.items, nextCursor: page.nextCursor, scanned: page.scanned });
  } catch (err) {
    console.error('[contacts] cross-org list failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load contacts.', code: 'QUERY_FAILED' }, 500);
  }
});

export { contactsPlatform };
export default contacts;
