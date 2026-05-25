/**
 * ROI Calculator public route — Phase K2A.
 *
 *   POST /api/public/roi-calculation
 *
 * NO requireAuth. Public lead-magnet endpoint. Anti-abuse via Turnstile
 * (reuses K1A worker helper + env). Server-authoritative formula —
 * client-submitted score fields would be ignored even if present.
 *
 * Persistence:
 *   /public_roi_calculations/{id}  (top-level, no orgId)
 *   - 90-day retention via expiresAt field (Firestore TTL = manual
 *     Firebase Console step on the field, same model as K1A)
 *   - rules: read=false, write=false (worker service account only)
 */

import { Hono } from 'hono';
import { firestoreSet, fsTimestamp } from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import { verifyTurnstile } from '../lib/turnstile';
import { checkCooldown } from '../lib/rateLimit';
import { validateLead, expiresAtFromNow } from '../lib/diagnostic-shared';
import { validateInputs, computeRoi, generateRoiId, type RoiInputs } from '../lib/roi-shared';
import type { AppEnv } from '../index';

const roi = new Hono<AppEnv>();

interface RoiBody {
  inputs?:         unknown;
  lead?:           { email?: unknown; companyName?: unknown; consent?: unknown };
  turnstileToken?: unknown;
}

roi.post('/api/public/roi-calculation', async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    TURNSTILE_SECRET_KEY?:          string;
  };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  let body: RoiBody;
  try { body = await c.req.json<RoiBody>(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // 1. Turnstile (anti-bot). Production strict; dev bypass when secret/token unset.
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : undefined;
  const remoteIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? undefined;
  const ts = await verifyTurnstile(env, token, remoteIp);
  if (!ts.ok) {
    return c.json({ error: 'Turnstile check failed', code: ts.code ?? 'TURNSTILE_FAILED' }, 400);
  }

  // Per-IP cooldown — Turnstile stops bots, not a human spamming the funnel.
  const rl = await checkCooldown(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'roi', remoteIp, 15_000);
  if (!rl.ok) {
    return c.json({ error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
  }

  // 2. Validate inputs (numeric ranges + workflow enum)
  const inputsErr = validateInputs(body.inputs);
  if (inputsErr) {
    return c.json({ error: inputsErr, code: 'INVALID_INPUTS' }, 400);
  }
  const inputs = body.inputs as RoiInputs;

  // 3. Validate lead (email + optional companyName + consent — reused from
  //    diagnostic-shared, generic shape)
  const leadCheck = validateLead(body.lead ?? {});
  if (!leadCheck.ok) {
    return c.json({ error: leadCheck.error, code: 'INVALID_LEAD' }, 400);
  }
  const lead = leadCheck.lead;

  // 4. Compute server-authoritative result
  const result = computeRoi(inputs);

  // 5. Persist
  const id  = generateRoiId();
  const now = new Date().toISOString();
  const country = c.req.header('CF-IPCountry') ?? null;

  let ipHash: string | null = null;
  if (remoteIp) {
    const enc = new TextEncoder().encode(remoteIp);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    ipHash = Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const doc = {
    id,
    inputs,
    result,
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
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `public_roi_calculations/${id}`, doc as unknown as Parameters<typeof firestoreSet>[2]);
  } catch (err) {
    console.error('[roi] firestoreSet failed:', err);
    return c.json({ error: 'Failed to save ROI estimate', code: 'PERSIST_FAILED' }, 500);
  }

  // PII: do NOT log lead.email (lands in persistent Cloudflare tail logs).
  dlog(env,
    '[roi] saved — id:', id,
    'workflow:', inputs.targetWorkflow,
    'monthlySaved:', result.estimatedMonthlyCostSaved,
    'payback:', result.estimatedPaybackMonths,
  );

  return c.json({ id, result });
});

export default roi;
