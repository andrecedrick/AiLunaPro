/**
 * Audit Express — V1-lite URL extraction route (Phase 5, §7quinquies).
 *
 *   POST /api/public/audit-express/extract  -> deterministic extraction snapshot
 *
 * Contract (NON-NEGOTIABLE):
 *   - Public, NO auth. Body carries ONLY { url, turnstileToken } — no PII.
 *   - Turnstile verified server-side BEFORE any outbound fetch (deny-by-default
 *     in production; remoteIp omitted so no IP is sent to siteverify).
 *   - Per-IP cooldown (hashed IP) BEFORE any outbound fetch.
 *   - Public-data-only, robots-respecting, SSRF-guarded, capped (see lib).
 *   - NO persistence. Cache-Control: no-store.
 */

import { Hono } from 'hono';
import { verifyTurnstile } from '../lib/turnstile';
import { checkCooldown } from '../lib/rateLimit';
import { runExtraction } from '../lib/audit-express-extract-fetch';
import type { ExtractErrorCode } from '../lib/audit-express-extract';
import type { AppEnv } from '../index';

const extract = new Hono<AppEnv>();

type ExtractBindings = AppEnv['Bindings'] & {
  APP_ENV?:                       string;
  TURNSTILE_SECRET_KEY?:          string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
};

const HTTP_STATUS: Record<ExtractErrorCode, 400 | 403> = {
  INVALID_URL:          400,
  PRIVATE_HOST_BLOCKED: 400,
  ROBOTS_DISALLOWED:    403,
  UNREACHABLE:          400,
  NOT_HTML:             400,
};

const MESSAGE: Record<ExtractErrorCode, string> = {
  INVALID_URL:          'Provide a valid public https URL.',
  PRIVATE_HOST_BLOCKED: 'That address is not allowed.',
  ROBOTS_DISALLOWED:    'This site asks crawlers not to read it (robots.txt).',
  UNREACHABLE:          'The site could not be reached.',
  NOT_HTML:             'The URL did not return a readable web page.',
};

extract.post('/api/public/audit-express/extract', async c => {
  const env = c.env as ExtractBindings;

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400);
  }
  const obj = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {};

  // 1. Turnstile BEFORE any outbound fetch. remoteIp intentionally omitted.
  const token = typeof obj.turnstileToken === 'string' ? obj.turnstileToken : undefined;
  const ts = await verifyTurnstile(env, token);
  if (!ts.ok) {
    c.header('Cache-Control', 'no-store');
    return c.json({ error: 'Bot/abuse check failed', code: ts.code ?? 'TURNSTILE_FAILED' }, 400);
  }

  // 2. Per-IP cooldown BEFORE any outbound fetch (hashed IP; fail-open if no SA).
  const remoteIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? undefined;
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const rl = await checkCooldown(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'audit_express_extract', remoteIp, 15_000);
    if (!rl.ok) {
      c.header('Cache-Control', 'no-store');
      return c.json({ error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
    }
  }

  // 3. Validate presence of url (full validation/SSRF happens in runExtraction).
  const url = typeof obj.url === 'string' ? obj.url : '';
  c.header('Cache-Control', 'no-store');
  if (!url) {
    return c.json({ error: MESSAGE.INVALID_URL, code: 'INVALID_URL' }, 400);
  }

  // 4. Run the capped, deterministic, compute-only extraction.
  const result = await runExtraction(url);
  if (!result.ok) {
    return c.json({ error: MESSAGE[result.code], code: result.code }, HTTP_STATUS[result.code]);
  }

  // createdAt is metadata only — NOT part of inputsHash (snapshot stays replayable).
  return c.json({ ...result.snapshot, createdAt: new Date().toISOString() });
});

export default extract;
