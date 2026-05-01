import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../index';

const me = new Hono<AppEnv>();

/**
 * GET /api/me
 * Auth required. Returns the verified uid from the Firebase token.
 * Used by the frontend to confirm the Worker auth path is functional.
 */
me.get('/api/me', requireAuth(), c => {
  const uid = c.get('uid');
  return c.json({ uid });
});

export default me;
