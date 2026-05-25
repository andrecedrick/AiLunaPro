/**
 * Platform-operator routes (J5 Batch 3).
 *
 * GET /api/platform/me
 *   Auth required. Returns { isPlatformAdmin: boolean } for the caller, based
 *   on the operator allowlist (PLATFORM_ADMIN_EMAILS). This is a CHECK endpoint
 *   — it never 403s; the frontend uses the boolean to gate operator surfaces.
 *   Does NOT echo the email or the allowlist.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { isPlatformAdmin } from '../lib/platformAdmin';
import type { AppEnv } from '../index';

const platform = new Hono<AppEnv>();

platform.get('/api/platform/me', requireAuth(), c => {
  const email         = c.get('email');
  const emailVerified = c.get('emailVerified');
  return c.json({ isPlatformAdmin: isPlatformAdmin(c.env, email, emailVerified) });
});

export default platform;
