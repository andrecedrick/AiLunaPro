/**
 * Audit Express — deterministic PDF report route (J15 P1).
 *
 *   POST /api/public/audit-express/pdf  -> application/pdf (download)
 *
 * Contract (NON-NEGOTIABLE):
 *   - AUTH REQUIRED. A valid Firebase ID token (Authorization: Bearer) is the
 *     real gate — anonymous requests are rejected 401 AUTH_REQUIRED. Turnstile is
 *     NOT used here (auth controls abuse); preview/extract stay public + Turnstile.
 *   - Body: { taps, extractSnapshot?, createdAt? }.
 *   - Preview is RECOMPUTED from taps (authoritative); understanding is
 *     RECOMPUTED from the supplied extract snapshot (pure). Only the raw extract
 *     capture is client-supplied (informational; self-described by inputsHash).
 *   - No PII rendered/logged. NO persistence. Cache-Control: no-store.
 *   - Deterministic: identical { taps, extractSnapshot?, createdAt } -> identical bytes.
 */

import { Hono } from 'hono';
import { verifyIdToken } from '../middleware/auth';
import { computePreview, validateTaps, type PreviewTaps } from '../lib/audit-express-preview';
import { understand } from '../lib/audit-express-understanding';
import type { ExtractSnapshot } from '../lib/audit-express-extract';
import type { Understanding } from '../lib/audit-express-understanding';
import { buildAuditExpressPdf } from '../lib/audit-express-pdf';
import { loadEnrichmentReport, type EnrichmentReportView } from '../lib/enrichment-report';
import { firestoreGet } from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import type { AppEnv } from '../index';

const pdf = new Hono<AppEnv>();

type PdfBindings = AppEnv['Bindings'] & {
  APP_ENV?:           string;
  FIREBASE_PROJECT_ID?: string;
};

const safeId = (raw: unknown): string => {
  const s = typeof raw === 'string' ? raw : '';
  return /^[A-Za-z0-9._-]{1,128}$/.test(s) ? s : '';
};

/** Light structural guard so understand() receives a usable snapshot. */
function isExtractSnapshot(v: unknown): v is ExtractSnapshot {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.extractorVersion === 'string' &&
    typeof s.rulesetVersion === 'string' &&
    typeof s.modelId === 'string' &&
    typeof s.inputsHash === 'string' &&
    Array.isArray(s.pages) &&
    Array.isArray(s.detections) &&
    !!s.identity && typeof s.identity === 'object' &&
    !!s.trace && typeof s.trace === 'object'
  );
}

pdf.post('/api/public/audit-express/pdf', async c => {
  const env = c.env as PdfBindings;
  c.header('Cache-Control', 'no-store');

  // 1. AUTH is the gate. Verify the Firebase ID token; anonymous/invalid -> 401.
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) {
    return c.json({ error: 'Sign in to export your report.', code: 'AUTH_REQUIRED' }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400);
  }
  const obj = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {};

  // 2. Validate + recompute preview from taps (authoritative).
  const tapErr = validateTaps(obj.taps);
  if (tapErr) {
    return c.json({ error: tapErr, code: 'INVALID_TAPS' }, 400);
  }
  const preview = computePreview(obj.taps as PreviewTaps);

  // 3. Optional extract snapshot -> recompute understanding (pure). Reject a
  //    present-but-malformed snapshot rather than silently dropping it.
  let extractSnapshot: ExtractSnapshot | undefined;
  if (obj.extractSnapshot !== undefined && obj.extractSnapshot !== null) {
    if (!isExtractSnapshot(obj.extractSnapshot)) {
      return c.json({ error: 'Malformed extract snapshot', code: 'INVALID_SNAPSHOT' }, 400);
    }
    extractSnapshot = obj.extractSnapshot;
  }

  // 4. createdAt: accept a client-provided ISO (makes determinism observable);
  //    otherwise stamp now. Validated as parseable.
  let createdAt = new Date().toISOString();
  if (typeof obj.createdAt === 'string' && !Number.isNaN(Date.parse(obj.createdAt))) {
    createdAt = new Date(obj.createdAt).toISOString();
  }

  // 5. Optional public-source enrichment. The snapshot is read from Firestore by
  //    id, never accepted from the body: a client-supplied evidence set would let
  //    anyone print arbitrary "findings" onto a report that looks authoritative.
  //    Membership is verified so one workspace cannot render another's evidence.
  let enrichment: EnrichmentReportView | undefined;
  const orgId = safeId(obj.orgId);
  const snapshotId = safeId(obj.enrichmentSnapshotId);
  if (orgId && snapshotId) {
    const sa = (env as { FIREBASE_SERVICE_ACCOUNT_JSON?: string }).FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!sa) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
    const member = await firestoreGet(sa, `organizations/${orgId}/members/${uid}`);
    if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
    const loaded = await loadEnrichmentReport(sa, orgId, snapshotId);
    // A requested-but-unusable snapshot is an error, not a silent omission: the
    // export would otherwise look complete while missing what was asked for.
    if (!loaded.ok) {
      return c.json(loaded.reason === 'INTEGRITY_FAILED'
        ? { error: 'This evidence snapshot no longer matches its recorded fingerprint.', code: 'INTEGRITY_FAILED' }
        : { error: 'Evidence snapshot not found.', code: 'SNAPSHOT_NOT_FOUND' }, loaded.reason === 'INTEGRITY_FAILED' ? 409 : 404);
    }
    enrichment = loaded.view;
  }

  // 6. Render deterministic PDF bytes. Understanding is recomputed (pure) from the
  //    supplied snapshot. Any failure becomes a clean, non-PII error code.
  let bytes: Uint8Array;
  try {
    const understanding: Understanding | undefined = extractSnapshot ? understand(extractSnapshot) : undefined;
    bytes = buildAuditExpressPdf({ createdAt, preview, extractSnapshot, understanding, enrichment });
  } catch (err) {
    const reqId = c.req.header('CF-Ray') ?? 'n/a';
    // DEBUG-gated: log only an error code + request id. No PII, no payload.
    dlog(c.env as Record<string, unknown>, '[audit-express-pdf] PDF_RENDER_FAILED', reqId, err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not render the report.', code: 'PDF_RENDER_FAILED' }, 500);
  }

  // Return via c.body so the CORS headers queued by the cors() middleware
  // (Access-Control-Allow-Origin, etc.) are applied — a raw `new Response` would
  // drop them and the browser would block the cross-origin download.
  // Cast: builder returns Uint8Array<ArrayBufferLike>; c.body expects
  // Uint8Array<ArrayBuffer>. Runtime is a valid BodyInit either way.
  return c.body(bytes as unknown as Uint8Array<ArrayBuffer>, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="audit-express-readiness.pdf"',
    'Cache-Control': 'no-store',
  });
});

export default pdf;
