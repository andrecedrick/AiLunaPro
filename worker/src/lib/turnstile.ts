/**
 * Cloudflare Turnstile verification — Phase K1A.
 *
 * Verifies a frontend-submitted Turnstile token against the Siteverify API.
 * Production behavior:
 *   - TURNSTILE_SECRET_KEY required
 *   - Empty / invalid token → reject with TURNSTILE_FAILED
 *
 * Development behavior (APP_ENV !== 'production'):
 *   - If TURNSTILE_SECRET_KEY is unset, allow as bypass for local dev.
 *   - If set, still verify normally.
 *
 * Never bypass in production.
 */

import { isProduction } from './env';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
  ok:    boolean;
  code?: string;        // present when !ok
  errors?: string[];    // raw codes from siteverify
}

interface TurnstileEnv {
  APP_ENV?:               string;
  TURNSTILE_SECRET_KEY?:  string;
}

export async function verifyTurnstile(env: TurnstileEnv, token: string | undefined, remoteIp?: string): Promise<TurnstileResult> {
  if (isProduction(env)) {
    if (!env.TURNSTILE_SECRET_KEY) {
      return { ok: false, code: 'TURNSTILE_NOT_CONFIGURED' };
    }
    if (!token || typeof token !== 'string' || token.length === 0) {
      console.warn('[turnstile] token missing/empty in production — widget did not produce a token');
      return { ok: false, code: 'TURNSTILE_TOKEN_MISSING' };
    }
  } else {
    // Dev/staging: allow bypass when secret unset OR token missing.
    if (!env.TURNSTILE_SECRET_KEY) {
      console.log('[turnstile] dev bypass — secret unset');
      return { ok: true };
    }
    if (!token) {
      console.log('[turnstile] dev bypass — token absent');
      return { ok: true };
    }
  }

  const body = new URLSearchParams();
  body.set('secret', env.TURNSTILE_SECRET_KEY!);
  body.set('response', token!);
  if (remoteIp) body.set('remoteip', remoteIp);

  let res: Response;
  try {
    res = await fetch(VERIFY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch (err) {
    console.warn('[turnstile] verify request failed:', err);
    return { ok: false, code: 'TURNSTILE_VERIFY_REQUEST_FAILED' };
  }

  if (!res.ok) return { ok: false, code: 'TURNSTILE_VERIFY_HTTP_ERROR' };

  const data = await res.json().catch(() => null) as { success?: boolean; 'error-codes'?: string[] } | null;
  if (!data) return { ok: false, code: 'TURNSTILE_VERIFY_INVALID_JSON' };
  if (!data.success) {
    // Diagnostic logging: siteverify error-codes pinpoint the cause
    // (invalid-input-secret, invalid-input-response, timeout-or-duplicate,
    // hostname mismatch, etc). Searchable tag: [turnstile].
    console.warn('[turnstile] siteverify failed — error-codes:', JSON.stringify(data['error-codes'] ?? []));
    return { ok: false, code: 'TURNSTILE_FAILED', errors: data['error-codes'] };
  }
  return { ok: true };
}
