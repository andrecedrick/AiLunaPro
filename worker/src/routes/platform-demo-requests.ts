/**
 * Platform demo-request visibility (read-only operator surface).
 *
 *   GET /api/platform/demo-requests — demo_requests, newest first
 *
 * Auth + platform-admin gated and STRICTLY READ-ONLY: nothing here writes or
 * mutates a record.
 *
 * P0 CONTEXT: `demo_requests` was written by POST /api/demo-request and read by
 * NOTHING. Commercial leads landed in a worker-only collection with no operator
 * surface at all — invisible in the Admin Center, the bell, and email. This route
 * is the read side that was missing.
 *
 * PII posture: a demo request IS a contact request — name, email and company are
 * the whole point, an operator cannot follow up without them. They are returned
 * to platform admins only, never logged, and never leave this gated surface.
 * Same discipline as support tickets in platform-feedback.ts.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import { recordBillingAlert } from '../lib/billing-alerts';
import type { AppEnv } from '../index';

const platformDemoRequests = new Hono<AppEnv>();

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;

interface DemoRow {
  id:            string;
  name:          string;
  email:         string;
  company:       string;
  message:       string;
  orgId:         string;
  source:        string;
  status:        string;
  owner:         string;
  lastContactAt: string;
  createdAt:     string;
}

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

function mapDemo(name: string, f: Record<string, unknown>): DemoRow {
  return {
    id:            str(f.id) || (name.split('/').pop() ?? ''),
    name:          str(f.name),
    email:         str(f.email),
    company:       str(f.company),
    message:       str(f.message),
    orgId:         str(f.orgId),
    source:        str(f.source),
    // Lead-management fields. Pre-schemaV2 leads carry neither, so both default
    // here rather than rendering as undefined in the panel.
    status:        str(f.status) || 'new',
    owner:         str(f.owner),
    lastContactAt: str(f.lastContactAt),
    createdAt:     str(f.createdAt),
  };
}

platformDemoRequests.get('/api/platform/demo-requests', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  const limit = Math.min(parseInt(c.req.query('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);

  try {
    const rows = await firestoreRunQuery(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      from:    [{ collectionId: 'demo_requests' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    });
    const items = rows.map(r => mapDemo(r.name, r.fields));
    return c.json({
      items,
      total: items.length,
      // "New" = never actioned by an operator. Drives the Admin Center badge.
      newCount: items.filter(d => d.status === 'new').length,
    });
  } catch (err) {
    // This used to return an empty list, which made a BROKEN read look exactly
    // like "no leads yet" — the operator would see a reassuring empty panel while
    // real leads sat unread in Firestore. A missing collection does not throw
    // (Firestore returns no rows), so reaching here is a genuine failure: raise a
    // durable alert and fail loudly instead of rendering a comfortable lie.
    const reason = err instanceof Error ? err.message : 'unknown';
    console.error('[platform-demo-requests] query failed:', reason);
    await recordBillingAlert(env.FIREBASE_SERVICE_ACCOUNT_JSON, {
      kind: 'demo_visibility_failed', severity: 'critical', refId: `demovis_${new Date().toISOString().slice(0, 13)}`,
      message: 'Demo Requests panel could not read its leads — commercial leads may be unread',
      context: { reason: reason.slice(0, 140) },
    });
    return c.json({ error: 'Could not load demo requests.', code: 'QUERY_FAILED' }, 500);
  }
});

export default platformDemoRequests;
