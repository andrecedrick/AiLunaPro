/**
 * Platform-operator routes (J5 Batch 3).
 *
 * GET /api/platform/me
 *   Auth required. Returns { isPlatformAdmin, emailVerified } for the caller,
 *   based on the operator allowlist (PLATFORM_ADMIN_EMAILS). This is a CHECK
 *   endpoint — it never 403s; the frontend uses the booleans to gate operator
 *   surfaces and to explain why access is withheld (verified email required).
 *   `emailVerified` is the caller's own token claim — safe to return.
 *   Does NOT echo the email value or the allowlist contents.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { isPlatformAdmin } from '../lib/platformAdmin';
import type { AppEnv } from '../index';

const platform = new Hono<AppEnv>();

/** Mask an email for safe diagnostics: "patrick…@gmail.com". Never full value. */
function maskEmail(email: string | undefined): string | null {
  if (!email) return null;
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}…@${domain}`;
}

/** Does the caller's email match the allowlist (ignoring verified state)? */
function emailInAllowlist(env: AppEnv['Bindings'], email: string | undefined): boolean {
  if (!email) return false;
  const raw = env.PLATFORM_ADMIN_EMAILS ?? '';
  const allow = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return allow.includes(email.toLowerCase());
}

platform.get('/api/platform/me', requireAuth(), c => {
  const email         = c.get('email');
  const emailVerified = c.get('emailVerified') === true;
  const allowRaw      = c.env.PLATFORM_ADMIN_EMAILS ?? '';
  const allowCount    = allowRaw.split(',').map(s => s.trim()).filter(Boolean).length;
  return c.json({
    isPlatformAdmin: isPlatformAdmin(c.env, email, emailVerified),
    emailVerified,
    // Safe diagnostics (J5 Batch 3 debug). Masked email only; no full value,
    // no allowlist contents — only the count + match boolean.
    diag: {
      emailPresent:     typeof email === 'string' && email.length > 0,
      emailMasked:      maskEmail(email),
      matchesAllowlist: emailInAllowlist(c.env, email),
      allowlistCount:   allowCount,
    },
  });
});

export default platform;
