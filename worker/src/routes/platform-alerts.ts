/**
 * Platform production alerts (read-only operator visibility).
 *
 *   GET /api/platform/alerts?limit=&severity=&status=
 *   Auth + platform-admin required. Lists persisted `platform_alerts` docs
 *   (written by worker/src/lib/billing-alerts.ts) newest-first.
 *
 * Read-only: this route never writes or resolves an alert.
 *
 * PII: the stored alert docs carry operational ids only (orgId / sessionId /
 * invoiceId) plus a numeric `context` — no email, name, or message content.
 * Those ids are surfaced because they are exactly what an operator needs to
 * reconcile a failed credit or a mismatched invoice.
 *
 * Kind-agnostic: unknown/future alert kinds are passed through untouched, so a
 * new billing-alert type appears here with zero changes to this route.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const platformAlerts = new Hono<AppEnv>();

const MAX_LIMIT = 200;

interface AlertRow {
  id:        string;
  kind:      string;
  severity:  string;
  status:    'open' | 'resolved';
  orgId:     string;
  sessionId: string;
  invoiceId: string;
  message:   string;
  /** Parsed non-PII context (ids/amounts/counts). Never email/name/text. */
  context:   Record<string, unknown>;
  at:        string;
}

function mapAlert(name: string, f: Record<string, unknown>): AlertRow {
  let context: Record<string, unknown> = {};
  const rawCtx = f.context;
  if (typeof rawCtx === 'string') {
    try { context = JSON.parse(rawCtx) as Record<string, unknown>; } catch { context = {}; }
  } else if (rawCtx && typeof rawCtx === 'object') {
    context = rawCtx as Record<string, unknown>;
  }
  return {
    id:        name.split('/').pop() ?? '',
    kind:      f.kind ? String(f.kind) : 'unknown',
    severity:  f.severity ? String(f.severity) : 'warning',
    status:    f.resolved === true ? 'resolved' : 'open',
    orgId:     f.orgId ? String(f.orgId) : '',
    sessionId: f.sessionId ? String(f.sessionId) : '',
    invoiceId: f.invoiceId ? String(f.invoiceId) : '',
    message:   f.message ? String(f.message) : '',
    context,
    at:        f.at ? String(f.at) : '',
  };
}

platformAlerts.get('/api/platform/alerts', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  const limit = Math.min(parseInt(c.req.query('limit') ?? '100', 10) || 100, MAX_LIMIT);
  const severityFilter = c.req.query('severity');   // 'critical' | 'warning' | undefined
  const statusFilter   = c.req.query('status');     // 'open' | 'resolved' | undefined

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'platform_alerts' }],
      orderBy: [{ field: { fieldPath: 'at' }, direction: 'DESCENDING' }],
      limit,
    });

    let alerts = rows.map(r => mapAlert(r.name, r.fields));
    if (severityFilter === 'critical' || severityFilter === 'warning') {
      alerts = alerts.filter(a => a.severity === severityFilter);
    }
    if (statusFilter === 'open' || statusFilter === 'resolved') {
      alerts = alerts.filter(a => a.status === statusFilter);
    }

    const openCritical = alerts.filter(a => a.status === 'open' && a.severity === 'critical').length;

    return c.json({
      alerts,
      total:       alerts.length,
      openCritical,
      limit,
      capped:      rows.length === limit,
      generatedAt: Date.now(),
    });
  } catch (err) {
    // A missing collection (no alert ever written) is not an error — return empty.
    console.warn('[platform-alerts] query failed:', err instanceof Error ? err.message : err);
    return c.json({ alerts: [], total: 0, openCritical: 0, limit, capped: false, generatedAt: Date.now() });
  }
});

export default platformAlerts;
