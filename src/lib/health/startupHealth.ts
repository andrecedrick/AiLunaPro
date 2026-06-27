/**
 * Startup API health probe — non-blocking.
 *
 * Pings the worker /healthz once at app start so a down/slow backend is logged
 * (and optionally surfaced) early. NEVER blocks render and NEVER throws: it has
 * its own abort timeout so a hung backend can't keep the probe pending, and all
 * failures resolve to a status string. No PII.
 */

import { WORKER_BASE } from '../billing/stripeClient';

export type ApiHealth = 'ok' | 'degraded' | 'unreachable';

export async function probeApiHealth(timeoutMs = 6000): Promise<ApiHealth> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${WORKER_BASE}/healthz`, { signal: ctrl.signal, cache: 'no-store' });
    const health: ApiHealth = res.ok ? 'ok' : 'degraded';
    console.info('[boot] API health:', health, res.ok ? '' : `(status ${res.status})`);
    return health;
  } catch (err) {
    const reason = (err as Error)?.name === 'AbortError' ? 'timeout' : 'unreachable';
    console.warn('[boot] API health check failed:', reason);
    return 'unreachable';
  } finally {
    clearTimeout(t);
  }
}
