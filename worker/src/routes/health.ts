import { Hono } from 'hono';
import type { AppEnv } from '../index';

const health = new Hono<AppEnv>();

/**
 * GET /healthz
 * No auth required. Used by uptime monitors and load balancers.
 */
health.get('/healthz', c => {
  return c.json({ ok: true, timestamp: new Date().toISOString() });
});

export default health;
