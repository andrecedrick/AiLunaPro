/**
 * Diagnostic Express public route — Phase K1A.
 *
 *   POST /api/public/diagnostic
 *
 * NO requireAuth. Public lead-magnet endpoint. Anti-abuse via Turnstile.
 * Server is authoritative for: answer validation, score, bucket, recommended
 * agent IDs. Frontend submits answers + lead + turnstileToken; nothing else.
 *
 * Persistence:
 *   /public_diagnostics/{id}  (top-level, no orgId)
 *   - 90-day retention via expiresAt field (TTL deletion is a separate
 *     operational concern; field is the source of truth)
 *   - rules: read=false, write=false (worker-only via service account)
 */

import { Hono } from 'hono';
import { firestoreSet, fsTimestamp } from '../lib/firestoreAdmin';
import { verifyTurnstile } from '../lib/turnstile';
import { checkCooldown } from '../lib/rateLimit';
import { dlog } from '../lib/log';
import {
  validateAnswers,
  computeScore,
  recommendationsFor,
  validateLead,
  generateDiagnosticId,
  expiresAtFromNow,
} from '../lib/diagnostic-shared';
import type { AppEnv } from '../index';

const diagnostic = new Hono<AppEnv>();

interface DiagnosticBody {
  answers?:        Record<string, unknown>;
  lead?:           { email?: unknown; companyName?: unknown; consent?: unknown };
  turnstileToken?: unknown;
}

diagnostic.post('/api/public/diagnostic', async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    TURNSTILE_SECRET_KEY?:          string;
  };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  let body: DiagnosticBody;
  try { body = await c.req.json<DiagnosticBody>(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // 1. Turnstile (anti-bot)
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : undefined;
  const remoteIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? undefined;
  const ts = await verifyTurnstile(env, token, remoteIp);
  if (!ts.ok) {
    return c.json({ error: 'Turnstile check failed', code: ts.code ?? 'TURNSTILE_FAILED' }, 400);
  }

  // Per-IP cooldown — Turnstile stops bots, not a human spamming the funnel.
  const rl = await checkCooldown(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'diagnostic', remoteIp, 15_000);
  if (!rl.ok) {
    return c.json({ error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
  }

  // 2. Validate answers shape against canonical question set
  const answersErr = validateAnswers(body.answers ?? {});
  if (answersErr) {
    return c.json({ error: answersErr, code: 'INVALID_ANSWERS' }, 400);
  }
  const answers = body.answers as Record<string, string>;

  // 3. Validate lead
  const leadCheck = validateLead(body.lead ?? {});
  if (!leadCheck.ok) {
    return c.json({ error: leadCheck.error, code: 'INVALID_LEAD' }, 400);
  }
  const lead = leadCheck.lead;

  // 4. Score (server-authoritative)
  const score = computeScore(answers);

  // 5. Static recommendations (D5=A — no K3 dependency).
  //    implementation_priority can prepend its mapped agent (weight 0,
  //    never affects score). Trimmed to max 3.
  const recommendedAgentIds = recommendationsFor(score.bucket, answers);

  // 6. Persist
  const id  = generateDiagnosticId();
  const now = new Date().toISOString();
  const country = c.req.header('CF-IPCountry') ?? null;

  // Hash IP for analytics without storing raw PII.
  let ipHash: string | null = null;
  if (remoteIp) {
    const enc = new TextEncoder().encode(remoteIp);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    ipHash = Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const doc = {
    id,
    answers,
    score:                score.normalizedScore,
    bucket:               score.bucket,
    recommendedAgentIds,
    lead: {
      email:       lead.email,
      companyName: lead.companyName,
      consent:     lead.consent,
      consentAt:   lead.consentAt,
    },
    cf: {
      country: country ?? null,
      ipHash:  ipHash  ?? null,
    },
    schemaVersion: 1,
    createdAt:     now,
    expiresAt:     fsTimestamp(expiresAtFromNow()),  // Timestamp type — required for Firestore TTL
  };

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `public_diagnostics/${id}`, doc as unknown as Parameters<typeof firestoreSet>[2]);
  } catch (err) {
    console.error('[diagnostic] firestoreSet failed:', err);
    return c.json({ error: 'Failed to save diagnostic', code: 'PERSIST_FAILED' }, 500);
  }

  // PII: do NOT log lead.email (lands in persistent Cloudflare tail logs).
  dlog(env, '[diagnostic] saved — id:', id, 'score:', score.normalizedScore, 'bucket:', score.bucket);

  return c.json({
    id,
    score:               score.normalizedScore,
    bucket:              score.bucket,
    recommendedAgentIds,
  });
});

export default diagnostic;
