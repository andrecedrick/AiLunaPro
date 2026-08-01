import { Hono, type Context } from 'hono';
import type { AppEnv } from '../index';
import { verifyIdToken } from '../middleware/auth';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { computeAuditResult, type AuditAnswers } from '../lib/audit-scoring';
import { buildReportPdf } from '../lib/report-pdf';
import { loadEnrichmentReport, type EnrichmentReportView } from '../lib/enrichment-report';
import { enforcePdfQuota } from '../lib/audit-express-quota';
import { signShareToken, verifyShareToken } from '../lib/audit-express-share';
import { scrubPii } from '../lib/audit-express-extract';
import { dlog } from '../lib/log';

const SHARE_TTL_SECONDS = 7 * 24 * 3600; // shareable report links live 7 days

/**
 * Reports — server-side lifecycle parity with Saved Audit Express.
 *
 * Reports are client-written to `organizations/{orgId}/reports/{id}` (with a
 * frozen answersSnapshot). The worker reads them via the service account and:
 *   - GET  /detail/:id  → server recompute summary (same engine as the SPA)
 *   - GET  /file/:id    → regenerate the premium PDF on demand (quota-enforced)
 *   - POST /:id/title   → rename (owner/admin)
 *
 * PDFs are regenerated on demand (NOT cached in R2): reports recompute as the
 * scoring rules evolve, so a cached PDF would go stale. Deterministic for a
 * given engine version. All responses are no-store; no PII leaks.
 */

const reports = new Hono<AppEnv>();
type Bindings = AppEnv['Bindings'];
const COLLECTION = (orgId: string) => `organizations/${orgId}/reports`;

const safeId = (raw: unknown): string => {
  const s = typeof raw === 'string' ? raw : '';
  return /^[A-Za-z0-9._-]{1,128}$/.test(s) ? s : '';
};

/** Sanitize a user-supplied title: scrub PII, strip markup/control chars, cap length. */
function sanitizeTitle(raw: unknown, fallback: string): string {
  let t = typeof raw === 'string' ? raw : '';
  t = scrubPii(t) ?? '';
  t = t.replace(/<[^>]*>/g, ' ').replace(/[^\x20-\x7E·À-ſ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return t || fallback;
}

interface Gate { uid: string; role: string }
/** Auth + org-membership gate; returns the caller's role too. */
async function gate(c: Context<AppEnv>, orgId: string): Promise<Gate | Response> {
  const env = c.env as Bindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${uid}`);
  if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  return { uid, role: String(member.role ?? 'member') };
}

const isPrivileged = (role: string) => role === 'owner' || role === 'admin';

reports.get('/api/reports/detail/:reportId', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${reportId}`);
  // 404 (not 403) when hidden so members can't probe ids.
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  const status = String(doc.status ?? 'draft');
  if (status !== 'published' && !isPrivileged(g.role)) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  let result;
  try {
    result = computeAuditResult((doc.answersSnapshot ?? {}) as AuditAnswers);
  } catch (err) {
    dlog(env as Record<string, unknown>, '[reports] DETAIL_RECOMPUTE_FAILED', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load this report.', code: 'DETAIL_UNAVAILABLE' }, 500);
  }

  return c.json({
    reportId,
    title: String(doc.title ?? 'AI Compliance Report'),
    createdAt: String(doc.createdAt ?? ''),
    status,
    industry: String(doc.industry ?? ''),
    globalScore: result.globalScore,
    riskLevel: result.riskLevel,
    maturityLevel: result.maturityLevel,
    findingsBySeverity: result.findingsBySeverity,
    sectionScores: result.sectionScores.map(s => ({ key: s.key, title: s.title, score: s.score })),
    shareVersion: typeof doc.shareVersion === 'number' ? doc.shareVersion : 1,
    sharedAt: String(doc.sharedAt ?? ''),
    sharedExpiresAt: String(doc.sharedExpiresAt ?? ''),
    shareRevokedAt: String(doc.shareRevokedAt ?? ''),
    sharingDisabled: doc.sharingDisabled === true,
    // The id only. The evidence view is fetched from /api/enrichment/report so a
    // report list or detail call never drags every stored excerpt with it.
    enrichmentSnapshotId: safeId(doc.enrichmentSnapshotId),
  });
});

/**
 * Load the enrichment view attached to a report, if any.
 *
 * Returns undefined when nothing is attached OR when the attached snapshot is
 * unreadable. A PDF export must not fail because enrichment is unavailable — the
 * compliance report itself is still valid — but an unusable snapshot must not be
 * rendered as if it were intact either, so it is dropped and logged.
 */
async function attachedEnrichment(
  env: Bindings, c: Context<AppEnv>, orgId: string, doc: Record<string, unknown>,
): Promise<EnrichmentReportView | undefined> {
  const snapshotId = safeId(doc.enrichmentSnapshotId);
  if (!snapshotId) return undefined;
  const loaded = await loadEnrichmentReport(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, snapshotId);
  if (loaded.ok) return loaded.view;
  dlog(env as Record<string, unknown>, '[reports] ENRICHMENT_UNAVAILABLE', c.req.header('CF-Ray') ?? 'n/a', loaded.reason);
  return undefined;
}

reports.get('/api/reports/file/:reportId', async c => {
  const env = c.env as Bindings;
  const orgId = safeId(c.req.query('orgId'));
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${reportId}`);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  const status = String(doc.status ?? 'draft');
  if (status !== 'published' && !isPrivileged(g.role)) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  // Fair-usage: 3 free report PDFs/user, then tokens (own pool, idempotent per report).
  const useTokens = c.req.query('useTokens') === '1' || c.req.query('useTokens') === 'true';
  const quota = await enforcePdfQuota(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, g.uid, reportId, useTokens, {
    action: 'report.export.pdf', usageCollection: 'reportPdfUsage', eventPrefix: 'report_pdf', metadataKind: 'report_pdf',
  });
  if (!quota.ok) return c.json({ error: quota.code === 'PDF_LIMIT_REACHED' ? 'Free PDF limit reached.' : 'Not enough tokens.', code: quota.code, balance: quota.balance, required: quota.required }, quota.status);

  const enrichment = await attachedEnrichment(env, c, orgId, doc);

  let bytes: Uint8Array;
  try {
    const answers = (doc.answersSnapshot ?? {}) as AuditAnswers;
    bytes = buildReportPdf({
      title: String(doc.title ?? 'AI Compliance Report'),
      createdAt: String(doc.createdAt ?? ''),
      result: computeAuditResult(answers),
      answers,
      enrichment,
    });
  } catch (err) {
    dlog(env as Record<string, unknown>, '[reports] PDF_RENDER_FAILED', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not render the report.', code: 'PDF_RENDER_FAILED' }, 500);
  }

  return c.body(bytes as unknown as Uint8Array<ArrayBuffer>, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="ai-compliance-report.pdf"',
    'Cache-Control': 'no-store',
  });
});

reports.post('/api/reports/:reportId/title', async c => {
  const env = c.env as Bindings;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const orgId = safeId(body.orgId);
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  if (!isPrivileged(g.role)) return c.json({ error: 'Only owners or admins can rename reports.', code: 'FORBIDDEN' }, 403);

  const path = `${COLLECTION(orgId)}/${reportId}`;
  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  const fallback = (typeof doc.title === 'string' && doc.title) ? doc.title : 'AI Compliance Report';
  const title = sanitizeTitle(body.title, fallback);
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path, { title, updatedAt: new Date().toISOString() }, { merge: true });
  return c.json({ title });
});

/* ── Share lifecycle (mirrors Audit Express; owner/admin only) ──────────────
 * Public links serve a freshly REGENERATED PDF (no R2). Versioned tokens give
 * instant revocation. Minting is quota-counted per version. */

/** Mint a report share link (create or regenerate). `bump` increments shareVersion. */
async function mintReportShare(c: Context<AppEnv>, env: Bindings, orgId: string, reportId: string, uid: string, bump: boolean): Promise<Response> {
  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return c.json({ error: 'Sharing is not enabled.', code: 'SHARE_DISABLED' }, 503);

  const path = `${COLLECTION(orgId)}/${reportId}`;
  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  if (doc.sharingDisabled === true) return c.json({ error: 'Sharing is disabled for this report.', code: 'SHARE_DISABLED' }, 403);

  const current = typeof doc.shareVersion === 'number' ? doc.shareVersion : 1;
  const shareVersion = bump ? current + 1 : current;

  // Minting counts against the report PDF quota (per version) so it can't farm
  // free exports. Opening a valid link later is free.
  const useTokens = c.req.query('useTokens') === '1' || c.req.query('useTokens') === 'true';
  const quota = await enforcePdfQuota(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, uid, `share:${reportId}:v${shareVersion}`, useTokens, {
    action: 'report.export.pdf', usageCollection: 'reportPdfUsage', eventPrefix: 'report_pdf', metadataKind: 'report_pdf',
  });
  if (!quota.ok) return c.json({ error: quota.code === 'PDF_LIMIT_REACHED' ? 'Free PDF limit reached.' : 'Not enough tokens.', code: quota.code, balance: quota.balance, required: quota.required }, quota.status);

  const now = Math.floor(Date.now() / 1000);
  const { token, exp } = await signShareToken(secret, orgId, reportId, shareVersion, SHARE_TTL_SECONDS, now);
  const sharedAt = new Date(now * 1000).toISOString();
  const sharedExpiresAt = new Date(exp * 1000).toISOString();
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path, { shareVersion, sharedAt, sharedExpiresAt, shareRevokedAt: '' }, { merge: true });
  const origin = new URL(c.req.url).origin;
  return c.json({ url: `${origin}/api/reports/shared/${token}`, expiresAt: sharedExpiresAt, shareVersion });
}

reports.post('/api/reports/:reportId/share', async c => {
  const env = c.env as Bindings;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const orgId = safeId(body.orgId);
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  if (!isPrivileged(g.role)) return c.json({ error: 'Only owners or admins can share reports.', code: 'FORBIDDEN' }, 403);
  return mintReportShare(c, env, orgId, reportId, g.uid, false);
});

reports.post('/api/reports/:reportId/regenerate-share', async c => {
  const env = c.env as Bindings;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const orgId = safeId(body.orgId);
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  if (!isPrivileged(g.role)) return c.json({ error: 'Only owners or admins can share reports.', code: 'FORBIDDEN' }, 403);
  return mintReportShare(c, env, orgId, reportId, g.uid, true);
});

reports.post('/api/reports/:reportId/revoke-share', async c => {
  const env = c.env as Bindings;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const orgId = safeId(body.orgId);
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  if (!isPrivileged(g.role)) return c.json({ error: 'Only owners or admins can manage sharing.', code: 'FORBIDDEN' }, 403);

  const path = `${COLLECTION(orgId)}/${reportId}`;
  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  const next = (typeof doc.shareVersion === 'number' ? doc.shareVersion : 1) + 1;
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path, { shareVersion: next, sharedAt: '', sharedExpiresAt: '', shareRevokedAt: new Date().toISOString() }, { merge: true });
  return c.json({ status: 'revoked', shareVersion: next });
});

reports.post('/api/reports/:reportId/sharing', async c => {
  const env = c.env as Bindings;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const orgId = safeId(body.orgId);
  const reportId = safeId(c.req.param('reportId'));
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;
  if (!isPrivileged(g.role)) return c.json({ error: 'Only owners or admins can manage sharing.', code: 'FORBIDDEN' }, 403);

  const path = `${COLLECTION(orgId)}/${reportId}`;
  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);
  const disabled = body.disabled === true;
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, path, { sharingDisabled: disabled }, { merge: true });
  return c.json({ sharingDisabled: disabled });
});

/* Public shared report — NO auth gate. Protected by the HMAC-signed, short-lived
 * token + shareVersion. Serves a freshly regenerated (PII-scrubbed) PDF. */
reports.get('/api/reports/shared/:token', async c => {
  const env = c.env as Bindings;
  c.header('Cache-Control', 'no-store');
  const secret = env.AUDIT_SHARE_SECRET;
  if (!secret) return c.json({ error: 'Sharing is not enabled.', code: 'SHARE_DISABLED' }, 503);

  const v = await verifyShareToken(secret, c.req.param('token'), Math.floor(Date.now() / 1000));
  if (!v.ok) return c.json({ error: v.code === 'SHARE_EXPIRED' ? 'This link has expired.' : 'This link is invalid.', code: v.code }, v.code === 'SHARE_EXPIRED' ? 410 : 401);

  const { orgId, auditId: reportId } = v.payload;
  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON!, `${COLLECTION(orgId)}/${reportId}`);
  if (!doc) return c.json({ error: 'Not found.', code: 'NOT_FOUND' }, 404);

  const currentVersion = typeof doc.shareVersion === 'number' ? doc.shareVersion : 1;
  if (v.payload.shareVersion !== currentVersion) return c.json({ error: 'This link has been revoked.', code: 'SHARE_REVOKED' }, 410);
  if (doc.sharingDisabled === true) return c.json({ error: 'Sharing is disabled for this report.', code: 'SHARE_DISABLED' }, 403);

  let bytes: Uint8Array;
  try {
    const answers = (doc.answersSnapshot ?? {}) as AuditAnswers;
    // NO ENRICHMENT ON A PUBLIC SHARE LINK. Anyone holding the URL can open it,
    // and the evidence set names the organisation's vendors, registry entries and
    // internal system names. That belongs behind authentication, not behind a
    // link that can be forwarded.
    bytes = buildReportPdf({
      title: String(doc.title ?? 'AI Compliance Report'),
      createdAt: String(doc.createdAt ?? ''),
      result: computeAuditResult(answers),
      answers,
    });
  } catch (err) {
    dlog(env as Record<string, unknown>, '[reports] SHARED_RENDER_FAILED', c.req.header('CF-Ray') ?? 'n/a', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not render the report.', code: 'PDF_RENDER_FAILED' }, 500);
  }

  return c.body(bytes as unknown as Uint8Array<ArrayBuffer>, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="ai-compliance-report.pdf"',
    'Cache-Control': 'no-store',
  });
});

export default reports;
