/**
 * CSV contact import — POST /api/contacts/import.
 *
 * Open to every content role (owner / admin / member), because importing is how a
 * sales user gets their own list into the CRM; it is not a governance action. What
 * they import lands assigned to THEM, so an import can never widen anyone's
 * visibility. A super admin may redirect the batch to another member with
 * `assignToUid`, which is the only way an import assigns to someone else.
 *
 * LARGE FILES are handled by chunking, not by streaming: the client splits the
 * file and posts batches of at most IMPORT_MAX_ROWS. A Worker request has a CPU
 * budget and a Firestore write is one round trip each, so a single 10,000-row POST
 * would time out halfway and leave the operator with no idea which rows landed.
 * Batching makes every request individually complete and individually reportable,
 * and the per-row `rejected[]` means a partial batch is still an actionable result
 * rather than a failure.
 *
 * Row validation (email / phone / country / company / in-file duplicates) lives in
 * lib/contact-import.ts. This route owns only the two things that need the
 * database: duplicates against the org, and the writes.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole, type Role } from '../middleware/requireRole';
import { isSuperAdmin } from '../lib/platformAdmin';
import { firestoreGet, firestoreSet, firestoreRunQuery } from '../lib/firestoreAdmin';
import { planImport, IMPORT_MAX_ROWS, type ImportRow } from '../lib/contact-import';
import type { AppEnv } from '../index';

const imp = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const ORG_ROLES: readonly Role[] = ['owner', 'admin', 'member'];
/** Firestore writes issued at once. Bounded so a batch cannot exhaust the isolate. */
const WRITE_CONCURRENCY = 8;

const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

function genId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

imp.post('/api/contacts/import', requireAuth(), requireRole(ORG_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as Bindings;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid') as string;
  const email = c.get('email') ?? '';

  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const rows = Array.isArray(body.rows) ? (body.rows as ImportRow[]) : null;
  if (!rows) return c.json({ error: 'rows must be an array.', code: 'INVALID_INPUT' }, 400);
  if (rows.length === 0) return c.json({ ok: true, imported: 0, rejected: [] });
  if (rows.length > IMPORT_MAX_ROWS) {
    return c.json({ error: `At most ${IMPORT_MAX_ROWS} rows per request.`, code: 'BATCH_TOO_LARGE' }, 413);
  }

  // Owner of the batch. Only a super admin may direct it elsewhere, and only to a
  // real enabled member — otherwise the rows would be written invisible to everyone.
  const isSuper = isSuperAdmin(env, c.get('email'), c.get('emailVerified'));
  let ownerUid = uid, ownerEmail = email;
  const requested = safeId(body.assignToUid);
  if (requested && requested !== uid) {
    if (!isSuper) return c.json({ error: 'Only a super admin can assign an import to another user.', code: 'FORBIDDEN_ASSIGN' }, 403);
    const member = await firestoreGet(saJson, `organizations/${orgId}/members/${requested}`);
    if (!member || member.status === 'disabled') {
      return c.json({ error: 'Not an active member of this workspace.', code: 'NOT_A_MEMBER' }, 400);
    }
    ownerUid = requested;
    ownerEmail = typeof member.email === 'string' ? member.email : '';
  }

  // Existing emails in the org — the dedup key the CRM already enforces.
  let existing: Set<string>;
  try {
    const docs = await firestoreRunQuery(saJson, { from: [{ collectionId: 'contacts' }], limit: 2000 }, `organizations/${orgId}`);
    existing = new Set(docs.map(d => String((d.fields as Record<string, unknown>).emailKey ?? '')).filter(Boolean));
  } catch (err) {
    console.error('[contacts-import] dedup scan failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not read existing contacts.', code: 'QUERY_FAILED' }, 500);
  }

  const plan = planImport(rows, existing);
  const now = new Date().toISOString();

  // Writes are issued in bounded waves. A row that fails to write is reported as
  // rejected rather than dropped: an import that silently loses leads is the same
  // defect as a CRM that never receives them.
  const failed: { row: number; code: string; email: string }[] = [];
  for (let i = 0; i < plan.valid.length; i += WRITE_CONCURRENCY) {
    const wave = plan.valid.slice(i, i + WRITE_CONCURRENCY);
    await Promise.all(wave.map(async (r, k) => {
      const contactId = genId();
      try {
        await firestoreSet(saJson, `organizations/${orgId}/contacts/${contactId}`, {
          contactId, orgId,
          name: r.name, email: r.email, emailKey: r.email, identityEmail: '',
          phone: r.phone, countryCode: r.countryCode, phoneCountry: r.phoneCountry,
          company: r.company, notes: r.notes, lastMessage: '',
          tags: [], status: 'active', leadStatus: 'new', source: 'import',
          owner: ownerEmail,
          assignedToUid: ownerUid, assignedToEmail: ownerEmail,
          assignedByUid: uid, assignedByEmail: email, assignedAt: now,
          lastReassignedByEmail: '', lastReassignedAt: '',
          twentyPersonId: '', twentyCompanyId: '',
          linkedQuoteId: '', linkedAuditId: '',
          createdByUid: uid, createdAt: now, lastActivityAt: now, updatedAt: now,
        });
      } catch (err) {
        console.error('[contacts-import] write failed:', err instanceof Error ? err.message : '');
        failed.push({ row: i + k + 1, code: 'WRITE_FAILED', email: r.email });
      }
    }));
  }

  const imported = plan.valid.length - failed.length;
  console.log(`[contacts-import] org=${orgId} submitted=${rows.length} imported=${imported} rejected=${plan.rejected.length + failed.length}`);
  return c.json({ ok: true, imported, rejected: [...plan.rejected, ...failed] });
});

export default imp;
