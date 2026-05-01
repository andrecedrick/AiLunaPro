import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../index';

const team = new Hono<AppEnv>();

/**
 * POST /api/team/invite
 * Auth required. Placeholder — email invitation dispatch goes here (Phase G+).
 * Phase G: skeleton only, no business logic.
 */
team.post('/api/team/invite', requireAuth(), c => {
  const uid = c.get('uid');
  return c.json({
    ok: true,
    message: 'not yet implemented',
    uid,
  });
});

export default team;
