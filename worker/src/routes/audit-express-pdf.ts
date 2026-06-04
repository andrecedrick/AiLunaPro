/**
 * Audit Express — deterministic PDF report route (J15 P1).
 *
 *   POST /api/public/audit-express/pdf  -> application/pdf (download)
 *
 * Contract (NON-NEGOTIABLE):
 *   - Public, NO auth. Body: { turnstileToken, taps, extractSnapshot?, createdAt? }.
 *   - Turnstile verified server-side (deny-by-default in production).
 *   - Preview is RECOMPUTED from taps (authoritative); understanding is
 *     RECOMPUTED from the supplied extract snapshot (pure). Only the raw extract
 *     capture is client-supplied (informational; self-described by inputsHash).
 *   - No PII rendered. NO persistence. Cache-Control: no-store.
 *   - Deterministic: identical { taps, extractSnapshot?, createdAt } -> identical bytes.
 */

import { Hono } from 'hono';
import { verifyTurnstile } from '../lib/turnstile';
import { computePreview, validateTaps, type PreviewTaps } from '../lib/audit-express-preview';
import { understand } from '../lib/audit-express-understanding';
import type { ExtractSnapshot } from '../lib/audit-express-extract';
import type { Understanding } from '../lib/audit-express-understanding';
import { buildAuditExpressPdf } from '../lib/audit-express-pdf';
import type { AppEnv } from '../index';

const pdf = new Hono<AppEnv>();

type PdfBindings = AppEnv['Bindings'] & {
  APP_ENV?:              string;
  TURNSTILE_SECRET_KEY?: string;
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

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400);
  }
  const obj = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {};

  // 1. Turnstile (no IP forwarded to siteverify).
  const token = typeof obj.turnstileToken === 'string' ? obj.turnstileToken : undefined;
  const ts = await verifyTurnstile(env, token);
  c.header('Cache-Control', 'no-store');
  if (!ts.ok) {
    return c.json({ error: 'Bot/abuse check failed', code: ts.code ?? 'TURNSTILE_FAILED' }, 400);
  }

  // 2. Validate + recompute preview from taps (authoritative).
  const tapErr = validateTaps(obj.taps);
  if (tapErr) {
    return c.json({ error: tapErr, code: 'INVALID_TAPS' }, 400);
  }
  const preview = computePreview(obj.taps as PreviewTaps);

  // 3. Optional extract snapshot -> recompute understanding (pure). Reject a
  //    present-but-malformed snapshot rather than silently dropping it.
  let extractSnapshot: ExtractSnapshot | undefined;
  let understanding: Understanding | undefined;
  if (obj.extractSnapshot !== undefined && obj.extractSnapshot !== null) {
    if (!isExtractSnapshot(obj.extractSnapshot)) {
      return c.json({ error: 'Malformed extract snapshot', code: 'INVALID_SNAPSHOT' }, 400);
    }
    extractSnapshot = obj.extractSnapshot;
    understanding = understand(extractSnapshot);
  }

  // 4. createdAt: accept a client-provided ISO (makes determinism observable);
  //    otherwise stamp now. Validated as parseable.
  let createdAt = new Date().toISOString();
  if (typeof obj.createdAt === 'string' && !Number.isNaN(Date.parse(obj.createdAt))) {
    createdAt = new Date(obj.createdAt).toISOString();
  }

  // 5. Render deterministic PDF bytes.
  const bytes = buildAuditExpressPdf({ createdAt, preview, extractSnapshot, understanding });

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="audit-express-readiness.pdf"',
      'Cache-Control': 'no-store',
    },
  });
});

export default pdf;
