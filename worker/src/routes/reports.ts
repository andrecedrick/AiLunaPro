import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../index';

const reports = new Hono<AppEnv>();

/**
 * POST /api/reports/:id/export
 * Auth required. Placeholder — real PDF generation goes here (Phase G+).
 * Phase G: skeleton only, no business logic.
 */
reports.post('/api/reports/:id/export', requireAuth(), c => {
  const reportId = c.req.param('id');
  const uid = c.get('uid');
  return c.json({
    ok: true,
    message: 'not yet implemented',
    reportId,
    uid,
  });
});

export default reports;
