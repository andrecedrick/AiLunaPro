/**
 * Audit Express preview — public, COMPUTE-ONLY route (Phase 3) + Turnstile
 * bot/abuse protection (Phase 4, §3bis / §7bis).
 *
 *   GET  /api/public/audit-express/config   -> { turnstileSiteKey }
 *   POST /api/public/audit-express/preview  -> deterministic preview
 *
 * Privacy contract (NON-NEGOTIABLE):
 *   - NO auth, NO PII: the POST body carries ONLY tap answers + a Turnstile
 *     token (an opaque anti-bot string, not user data).
 *   - NO persistence: nothing is written to any store.
 *   - NO lead capture, NO enrichment, NO IP logging (remoteIp is NOT sent to
 *     siteverify — we omit it on purpose).
 *   - Deterministic: same taps => identical response (Phase 0 engines).
 *
 * Turnstile is verified server-side with TURNSTILE_SECRET_KEY (Worker env, never
 * in the frontend). Production never bypasses (see lib/turnstile). Responses are
 * cache-bypassed (no-store) per the NFR cache policy.
 */

import { Hono } from 'hono';
import { computePreview, validateTaps, type PreviewTaps } from '../lib/audit-express-preview';
import { verifyTurnstile } from '../lib/turnstile';
import type { AppEnv } from '../index';

const auditExpress = new Hono<AppEnv>();

type TurnstileBindings = AppEnv['Bindings'] & {
  APP_ENV?:              string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?:   string;
};

// Public config: the static /audit-express page fetches the PUBLIC site key so
// it can render the Turnstile widget. No secret is ever exposed here.
auditExpress.get('/api/public/audit-express/config', c => {
  const env = c.env as TurnstileBindings;
  c.header('Cache-Control', 'no-store');
  return c.json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? null });
});

auditExpress.post('/api/public/audit-express/preview', async c => {
  const env = c.env as TurnstileBindings;

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400);
  }

  const obj = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {};

  // 1. Bot/abuse protection — verify Turnstile token BEFORE any compute.
  //    remoteIp intentionally omitted to avoid transmitting/handling IPs.
  const token = typeof obj.turnstileToken === 'string' ? obj.turnstileToken : undefined;
  const ts = await verifyTurnstile(env, token);
  if (!ts.ok) {
    return c.json({ error: 'Bot/abuse check failed', code: ts.code ?? 'TURNSTILE_FAILED' }, 400);
  }

  // 2. Accept ONLY tap answers (controlled enums). Never read PII fields.
  const taps = (obj.taps ?? obj) as unknown;
  const err = validateTaps(taps);
  if (err) {
    return c.json({ error: err, code: 'INVALID_TAPS' }, 400);
  }

  // 3. Compute-only. No persistence, no logging of inputs.
  const preview = computePreview(taps as PreviewTaps);

  c.header('Cache-Control', 'no-store');
  return c.json(preview);
});

export default auditExpress;
