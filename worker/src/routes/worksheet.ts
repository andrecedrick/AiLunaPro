/**
 * Worksheet (AUDIT TEMPS → ARGENT) — authed, org-scoped save/list/detail/delete.
 *
 * ALL routes auth-required + org-membership verified (no IDOR; cross-tenant => 403).
 * Server recomputes the result with scoreWorksheet (client-submitted result is
 * ignored). Deterministic engine + version stamp. No PII beyond the user's own
 * org financial inputs, which stay worker-only (firestore.rules deny client reads).
 *
 *   POST   /api/worksheet/save              -> { worksheetId }
 *   GET    /api/worksheet/list?orgId=        -> { items[] }   (metadata only)
 *   GET    /api/worksheet/detail/:id?orgId=  -> { input, result, ... }
 *   DELETE /api/worksheet/:id?orgId=         -> { ok }
 */

import { Hono, type Context } from 'hono';
import { verifyIdToken } from '../middleware/auth';
import { firestoreGet, firestoreSet, firestoreDelete, firestoreRunQuery } from '../lib/firestoreAdmin';
import { validateWorksheet, scoreWorksheet, generateWorksheetId, type WorksheetInput } from '../lib/audit-worksheet';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const worksheet = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];

const COLLECTION = (orgId: string) => `organizations/${orgId}/worksheets`;
const safeId = (v: unknown): string => (typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '');

/**
 * Roles allowed to read/write worksheets. A worksheet holds the org's net-income
 * financial inputs, so the content roles only — `billing` and `client` are members
 * of the org but must NOT reach this data (mirror of the content-member model).
 */
const WORKSHEET_ROLES: readonly string[] = ['owner', 'admin', 'member'];

/** Non-PII title from the input (task count); never stores raw labels here. */
function deriveTitle(input: WorksheetInput): string {
  const n = input.tasks.length;
  return `Audit Temps → Argent (${n} tâche${n > 1 ? 's' : ''})`;
}

async function gate(c: Context<AppEnv>, orgId: string): Promise<{ uid: string; role: string } | Response> {
  const env = c.env as Bindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${uid}`);
  const role = typeof member?.role === 'string' ? member.role : '';
  if (!member || !role) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  // RBAC: financial worksheet is content-role only — billing/client are denied.
  if (!WORKSHEET_ROLES.includes(role)) return c.json({ error: 'Your role cannot access worksheets.', code: 'FORBIDDEN_ROLE' }, 403);
  return { uid, role };
}

worksheet.post('/api/worksheet/save', async c => {
  const env = c.env as Bindings;
  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = safeId(body.orgId);
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const err = validateWorksheet(body.input);
  if (err) return c.json({ error: err, code: 'INVALID_INPUT' }, 400);
  const input = body.input as WorksheetInput;

  const scored = scoreWorksheet(input);

  // Provenance integrity: never trust a client-supplied id/createdAt/owner.
  //  - create  → server generates the id, stamps createdAt now, owner = caller.
  //  - update  → only the original creator (or owner/admin) may overwrite an
  //    existing doc; its createdAt + createdByUid are preserved (anti-clobber/forge).
  const providedId = safeId(body.worksheetId);
  let worksheetId = generateWorksheetId();
  let createdAt   = new Date().toISOString();
  let createdByUid = g.uid;
  if (providedId) {
    const existing = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${providedId}`);
    if (existing) {
      const ownerUid = typeof existing.createdByUid === 'string' ? existing.createdByUid : '';
      if (ownerUid && ownerUid !== g.uid && g.role !== 'owner' && g.role !== 'admin') {
        return c.json({ error: 'Not your worksheet.', code: 'FORBIDDEN' }, 403);
      }
      worksheetId  = providedId;
      createdAt    = typeof existing.createdAt === 'string' ? existing.createdAt : createdAt;
      createdByUid = ownerUid || g.uid;
    }
    // providedId for a non-existent doc → fall through to a server-generated create.
  }
  const title = deriveTitle(input);

  const doc: Record<string, string | number> = {
    worksheetId,
    title,
    createdByUid,
    createdAt,
    updatedAt: new Date().toISOString(),
    rulesetVersion: scored.rulesetVersion,
    engineVersion: scored.engineVersion,
    taskCount: input.tasks.length,
    totalAnnualCost: scored.result.totals.totalAnnualCost,
    annualValueRecovered: scored.result.totals.annualValueRecovered,
    inputJson: JSON.stringify(input),
  };
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${worksheetId}`, doc);

  dlog(env as Record<string, unknown>, '[worksheet] saved', worksheetId, 'tasks:', input.tasks.length);
  c.header('Cache-Control', 'no-store');
  return c.json({ worksheetId });
});

worksheet.get('/api/worksheet/list', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON!, {
    from: [{ collectionId: 'worksheets' }],
    orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
    limit: 100,
  }, `organizations/${orgId}`);

  const items = rows.map(r => {
    const f = r.fields;
    return {
      worksheetId: String(f.worksheetId ?? ''),
      title: String(f.title ?? 'Audit Temps → Argent'),
      createdAt: String(f.createdAt ?? ''),
      taskCount: Number(f.taskCount ?? 0),
      totalAnnualCost: Number(f.totalAnnualCost ?? 0),
      annualValueRecovered: Number(f.annualValueRecovered ?? 0),
    };
  });
  c.header('Cache-Control', 'no-store');
  return c.json({ items });
});

worksheet.get('/api/worksheet/detail/:id', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const id = safeId(c.req.param('id'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${id}`);
  if (!doc) { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404); }

  let input: WorksheetInput | null = null;
  try { input = JSON.parse(typeof doc.inputJson === 'string' ? doc.inputJson : '{}') as WorksheetInput; }
  catch { input = null; }
  // Recompute server-side so the client never trusts a stored result blob.
  const result = input && !validateWorksheet(input) ? scoreWorksheet(input).result : null;

  c.header('Cache-Control', 'no-store');
  return c.json({
    worksheetId: id,
    title: String(doc.title ?? ''),
    createdAt: String(doc.createdAt ?? ''),
    rulesetVersion: String(doc.rulesetVersion ?? ''),
    input,
    result,
  });
});

worksheet.delete('/api/worksheet/:id', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const id = safeId(c.req.param('id'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${id}`);
  if (!doc) return c.json({ ok: true }); // idempotent
  await firestoreDelete(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${id}`);
  return c.json({ ok: true });
});

export default worksheet;
