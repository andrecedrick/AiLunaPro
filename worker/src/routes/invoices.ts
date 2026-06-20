/**
 * Invoices route — read-only listing for the quote → accept → invoice flow.
 *
 *   GET /api/invoices?orgId=…
 *
 * Auth + role gated (owner/admin/billing/member; client → 403). orgId is the
 * membership-verified org from requireRole, so there is no cross-org access.
 * Lists the org's invoices (draft today; pending/paid later). No payment, no
 * Stripe, no email — purely a read of the worker-only `invoices` collection.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import type { AppEnv } from '../index';

const invoices = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const INVOICE_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];

invoices.get('/api/invoices', requireAuth(), requireRole(INVOICE_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string; // membership-verified by requireRole

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    // Equality filter only (no orderBy) → no composite index needed; sort in JS.
    rows = await firestoreRunQuery(saJson, {
      from:  [{ collectionId: 'invoices' }],
      where: { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
      limit: 200,
    });
  } catch (err) {
    console.error('[invoices] query failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load invoices.', code: 'QUERY_FAILED' }, 500);
  }

  const items = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    return {
      id:            typeof f.id === 'string' ? f.id : (r.name.split('/').pop() ?? ''),
      quoteId:       typeof f.quoteId === 'string' ? f.quoteId : '',
      customerEmail: typeof f.customerEmail === 'string' ? f.customerEmail : '',
      amount:        typeof f.amount === 'number' ? f.amount : null,
      currency:      typeof f.currency === 'string' ? f.currency : 'usd',
      rangeMinUsd:   typeof f.rangeMinUsd === 'number' ? f.rangeMinUsd : null,
      rangeMaxUsd:   typeof f.rangeMaxUsd === 'number' ? f.rangeMaxUsd : null,
      status:        typeof f.status === 'string' ? f.status : 'draft',
      createdAt:     typeof f.createdAt === 'string' ? f.createdAt : '',
    };
  });
  // Newest first.
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  return c.json({ ok: true, invoices: items });
});

export default invoices;
