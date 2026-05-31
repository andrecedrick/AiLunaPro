/**
 * Audit Express preview — public, COMPUTE-ONLY route (Phase 3, §3bis).
 *
 *   POST /api/public/audit-express/preview
 *
 * Privacy contract (NON-NEGOTIABLE):
 *   - NO auth, NO PII: the body carries ONLY tap answers (controlled enums).
 *   - NO persistence: nothing is written to Firestore or any store.
 *   - NO lead capture, NO enrichment, NO Turnstile (added later if needed).
 *   - Deterministic: same taps => identical response (Phase 0 engines).
 *
 * Returns the stamped + traced K1A-lite / K2A-lite preview. Cache-bypassed
 * (no-store) like other /api routes per the NFR cache policy.
 */

import { Hono } from 'hono';
import { computePreview, validateTaps, type PreviewTaps } from '../lib/audit-express-preview';
import type { AppEnv } from '../index';

const auditExpress = new Hono<AppEnv>();

auditExpress.post('/api/public/audit-express/preview', async c => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400);
  }

  // Accept ONLY tap answers. Ignore any other fields entirely (defense against
  // accidental PII): we read solely the validated tap keys, never the raw body.
  const taps = (body && typeof body === 'object'
    ? (body as Record<string, unknown>).taps ?? body
    : body) as unknown;

  const err = validateTaps(taps);
  if (err) {
    return c.json({ error: err, code: 'INVALID_TAPS' }, 400);
  }

  // Compute-only. No persistence, no logging of inputs.
  const preview = computePreview(taps as PreviewTaps);

  // Never cache a compute response.
  c.header('Cache-Control', 'no-store');
  return c.json(preview);
});

export default auditExpress;
