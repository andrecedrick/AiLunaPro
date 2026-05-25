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

platform.get('/api/platform/me', requireAuth(), c => {
  const email         = c.get('email');
  const emailVerified = c.get('emailVerified') === true;
  return c.json({
    isPlatformAdmin: isPlatformAdmin(c.env, email, emailVerified),
    emailVerified,
  });
});

export default platform;
