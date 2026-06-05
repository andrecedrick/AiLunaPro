/**
 * Audit Express — Save + Hosted PDF (R2) + auth-gated download (J15 P1.1).
 *
 * Routes (ALL auth-required + org-membership verified; no PII; Cache-Control: no-store):
 *   POST   /api/audit-express/save            -> { auditId }   (store snapshot + PDF in R2)
 *   GET    /api/audit-express/list?orgId=     -> { items[] }   (metadata only)
 *   GET    /api/audit-express/file/:auditId   -> application/pdf (streams from R2)
 *   DELETE /api/audit-express/:auditId        -> { ok }        (delete doc + R2 object)
 *
 * Isolation: every route requires orgId + verifies organizations/{orgId}/members/{uid}
 * (no IDOR; cross-tenant => 403). R2 keys are org-prefixed. Auth via verifyIdToken
 * (anonymous/invalid => 401 AUTH_REQUIRED). Determinism: the PDF is regenerated from
 * the stored snapshot + createdAt (same inputs => identical bytes).
 */

import { Hono, type Context } from 'hono';
import { verifyIdToken } from '../middleware/auth';
import { firestoreGet, firestoreSet, firestoreDelete, firestoreRunQuery } from '../lib/firestoreAdmin';
import { computePreview, validateTaps, type PreviewTaps } from '../lib/audit-express-preview';
import { understand } from '../lib/audit-express-understanding';
import { buildAuditExpressPdf } from '../lib/audit-express-pdf';
import { stableHash, type ExtractSnapshot } from '../lib/audit-express-extract';
import type { Understanding } from '../lib/audit-express-understanding';
import { enforcePdfQuota } from '../lib/audit-express-quota';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const store = new Hono<AppEnv>();

type StoreBindings = AppEnv['Bindings'];

const COLLECTION = (orgId: string) => `organizations/${orgId}/auditExpress`;
const r2Key = (orgId: string, auditId: string) => `pdf/${orgId}/${auditId}.pdf`;

/** Sanitize an id segment: lowercase alnum + dash, bounded. Prevents path tricks. */
function safeId(v: unknown): string {
  return typeof v === 'string' ? v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : '';
}

function isExtractSnapshot(v: unknown): v is ExtractSnapshot {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return typeof s.extractorVersion === 'string' && typeof s.rulesetVersion === 'string' &&
    typeof s.modelId === 'string' && typeof s.inputsHash === 'string' &&
    Array.isArray(s.pages) && Array.isArray(s.detections) &&
    !!s.identity && typeof s.identity === 'object' && !!s.trace && typeof s.trace === 'object';
}

/** Auth + org-membership gate. Returns uid or a Response to short-circuit. */
async function gate(c: Context<AppEnv>, orgId: string): Promise<{ uid: string } | Response> {
  const env = c.env as StoreBindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${uid}`);
  if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  return { uid };
}

store.post('/api/audit-express/save', async c => {
  const env = c.env as StoreBindings;
  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; } catch { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = safeId(body.orgId);
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const tapErr = validateTaps(body.taps);
  if (tapErr) return c.json({ error: tapErr, code: 'INVALID_TAPS' }, 400);

  let extractSnapshot: ExtractSnapshot | undefined;
  if (body.extractSnapshot != null) {
    if (!isExtractSnapshot(body.extractSnapshot)) return c.json({ error: 'Malformed snapshot', code: 'INVALID_SNAPSHOT' }, 400);
    extractSnapshot = body.extractSnapshot;
  }
  const createdAt = (typeof body.createdAt === 'string' && !Number.isNaN(Date.parse(body.createdAt)))
    ? new Date(body.createdAt).toISOString() : new Date().toISOString();

  if (!env.AUDIT_PDFS) return c.json({ error: 'Storage unavailable.', code: 'STORAGE_UNAVAILABLE' }, 500);

  let bytes: Uint8Array;
  let understanding: Understanding | undefined;
  try {
    const preview = computePreview(body.taps as PreviewTaps);
    understanding = extractSnapshot ? understand(extractSnapshot) : undefined;
    bytes = buildAuditExpressPdf({ createdAt, preview, extractSnapshot, understanding });
  } catch (err) {
    dlog(env as Record<string, unknown>, '[audit-express-store] RENDER_FAILED', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not render the report.', code: 'PDF_RENDER_FAILED' }, 500);
  }

  // Deterministic id => dedupe: the same audit (inputsHash + engineVersion +
  // createdAt) maps to the same doc + R2 key, so auto-save is idempotent.
  const engineVersion = extractSnapshot?.engineVersion ?? understanding?.engineVersion ?? '';
  const inputsHash = extractSnapshot?.inputsHash ?? '';
  const auditId = stableHash(`${inputsHash}|${engineVersion}|${createdAt}`);
  const key = r2Key(orgId, auditId);
  await env.AUDIT_PDFS.put(key, bytes, { httpMetadata: { contentType: 'application/pdf' } });

  // Store only non-PII metadata + the (already-scrubbed) inputs needed to
  // regenerate deterministically. snapshotJson is a flat string field.
  const doc: Record<string, string> = {
    auditId,
    pdfKey: key,
    createdByUid: g.uid,
    createdAt,
    updatedAt: new Date().toISOString(),
    engineVersion: extractSnapshot?.engineVersion ?? '',
    inputsHash: extractSnapshot?.inputsHash ?? '',
    businessType: understanding?.businessProfile.businessType ?? 'unknown',
    audience: understanding?.businessProfile.audience ?? 'unknown',
    confidence: understanding?.businessProfile.confidence ?? 'low',
    canonicalUrl: extractSnapshot?.canonicalUrl ?? '',
    snapshotJson: JSON.stringify({ taps: body.taps, extractSnapshot: extractSnapshot ?? null, createdAt }),
  };
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${auditId}`, doc);

  return c.json({ auditId });
});

store.get('/api/audit-express/list', async c => {
  const env = c.env as StoreBindings;
  const orgId = safeId(c.req.query('orgId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON!, {
    from: [{ collectionId: 'auditExpress' }],
    orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
    limit: 100,
  }, `organizations/${orgId}`);

  // Metadata only — never return snapshotJson / pdfKey to the client.
  const items = rows.map(r => {
    const f = r.fields;
    return {
      auditId: String(f.auditId ?? ''),
      createdAt: String(f.createdAt ?? ''),
      businessType: String(f.businessType ?? 'unknown'),
      audience: String(f.audience ?? 'unknown'),
      confidence: String(f.confidence ?? 'low'),
      engineVersion: String(f.engineVersion ?? ''),
      canonicalUrl: String(f.canonicalUrl ?? ''),
    };
  });
  return c.json({ items });
});

store.get('/api/audit-express/file/:auditId', async c => {
  const env = c.env as StoreBindings;
  const orgId = safeId(c.req.query('orgId'));
  const auditId = safeId(c.req.param('auditId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${auditId}`);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  const key = typeof doc.pdfKey === 'string' ? doc.pdfKey : r2Key(orgId, auditId);
  if (!env.AUDIT_PDFS) return c.json({ error: 'Storage unavailable.', code: 'STORAGE_UNAVAILABLE' }, 500);
  const obj = await env.AUDIT_PDFS.get(key);
  if (!obj) return c.json({ error: 'File not found.', code: 'NOT_FOUND' }, 404);

  // Fair-usage: 3 free PDF downloads, then token consumption (server-enforced).
  const useTokens = c.req.query('useTokens') === '1' || c.req.query('useTokens') === 'true';
  const quota = await enforcePdfQuota(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, g.uid, auditId, useTokens);
  if (!quota.ok) {
    return c.json({ error: quota.code === 'PDF_LIMIT_REACHED' ? 'Free PDF limit reached.' : 'Not enough tokens.', code: quota.code, balance: quota.balance, required: quota.required }, quota.status);
  }

  return c.body(obj.body as unknown as ReadableStream, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="audit-express-readiness.pdf"',
    'Cache-Control': 'no-store',
  });
});

store.delete('/api/audit-express/:auditId', async c => {
  const env = c.env as StoreBindings;
  const orgId = safeId(c.req.query('orgId'));
  const auditId = safeId(c.req.param('auditId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${auditId}`);
  if (!doc) return c.json({ ok: true }); // idempotent
  const key = typeof doc.pdfKey === 'string' ? doc.pdfKey : r2Key(orgId, auditId);
  if (env.AUDIT_PDFS) { try { await env.AUDIT_PDFS.delete(key); } catch { /* best-effort */ } }
  await firestoreDelete(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${auditId}`);
  return c.json({ ok: true });
});

export default store;
