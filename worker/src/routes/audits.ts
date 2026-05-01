import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../index';

const audits = new Hono<AppEnv>();

/**
 * POST /api/audits/:id/submit
 * Auth required. Placeholder — server-side audit submission logic goes here.
 * Phase G: skeleton only, no business logic.
 */
audits.post('/api/audits/:id/submit', requireAuth(), c => {
  const auditId = c.req.param('id');
  const uid = c.get('uid');
  return c.json({
    ok: true,
    message: 'not yet implemented',
    auditId,
    uid,
  });
});

export default audits;
