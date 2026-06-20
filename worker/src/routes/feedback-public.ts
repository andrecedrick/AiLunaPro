/**
 * User feedback public route — S1.
 *
 *   POST /api/public/feedback
 *
 * NO requireAuth. Anonymous, no-PII product feedback captured after a tool
 * result. Server is authoritative for validation + sanitisation. No Turnstile:
 * the payload carries no lead/PII and has low spam value, so a per-IP cooldown
 * is the proportionate anti-abuse control (vs. the diagnostic lead form, which
 * gates a captured email behind Turnstile). The endpoint never echoes data back
 * and never stores uid / email / orgId.
 *
 * Persistence:
 *   /public_feedback/{id}  (top-level, no orgId)
 *   - 90-day retention via expiresAt (TTL field is the source of truth)
 *   - rules: read=false, write=false (worker-only via service account)
 */

import { Hono } from 'hono';
import { firestoreSet, fsTimestamp } from '../lib/firestoreAdmin';
import { checkCooldown } from '../lib/rateLimit';
import { dlog } from '../lib/log';
import { validateFeedback, generateFeedbackId, feedbackExpiresAt } from '../lib/feedback-shared';
import type { AppEnv } from '../index';

const feedback = new Hono<AppEnv>();

feedback.post('/api/public/feedback', async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // Per-IP cooldown (10s) — no Turnstile (no PII, low spam value).
  const remoteIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? undefined;
  const rl = await checkCooldown(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'feedback', remoteIp, 10_000);
  if (!rl.ok) {
    return c.json({ error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
  }

  const check = validateFeedback((body ?? {}) as Parameters<typeof validateFeedback>[0]);
  if (!check.ok) {
    return c.json({ error: check.error, code: 'INVALID_FEEDBACK' }, 400);
  }
  const fb = check.feedback;

  const id      = generateFeedbackId();
  const now     = new Date().toISOString();
  const country = c.req.header('CF-IPCountry') ?? null;

  const doc = {
    id,
    source:        fb.source,
    satisfaction:  fb.satisfaction,
    difficulty:    fb.difficulty,
    blocker:       fb.blocker,
    suggestion:    fb.suggestion,
    cf:            { country: country ?? null },
    schemaVersion: 1,
    createdAt:     now,
    expiresAt:     fsTimestamp(feedbackExpiresAt()),
  };

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `public_feedback/${id}`, doc as unknown as Parameters<typeof firestoreSet>[2]);
  } catch (err) {
    console.error('[feedback] firestoreSet failed:', err);
    return c.json({ error: 'Failed to save feedback', code: 'PERSIST_FAILED' }, 500);
  }

  // No PII to log — source + satisfaction only.
  dlog(env, '[feedback] saved — id:', id, 'source:', fb.source, 'sat:', fb.satisfaction);

  return c.json({ ok: true, id });
});

export default feedback;
