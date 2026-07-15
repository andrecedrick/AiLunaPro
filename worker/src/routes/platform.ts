/**
 * Platform-operator routes (J5 Batch 3).
 *
 * GET /api/platform/me
 *   Auth required. Returns { isPlatformAdmin, emailVerified } for the caller,
 *   based on the operator allowlist (PLATFORM_ADMIN_EMAILS). This is a CHECK
 *   endpoint — it never 403s; the frontend uses the booleans to gate operator
 *   surfaces and to explain why access is withheld (verified email required).
 *   `emailVerified` is the caller's own token claim — safe to return.
 *   Never echoes the email value or the allowlist contents.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { isPlatformAdmin, isSuperAdmin, requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import { quotePrice } from '../lib/quote-shared';
import type { AppEnv } from '../index';

const platform = new Hono<AppEnv>();

platform.get('/api/platform/me', requireAuth(), c => {
  const email         = c.get('email');
  const emailVerified = c.get('emailVerified') === true;
  return c.json({
    isPlatformAdmin: isPlatformAdmin(c.env, email, emailVerified),
    // Super admin = platform operator OR a quote/invoice admin (ADMIN_EMAILS).
    // Gates the (org-scoped) Admin Center UI; never echoes the email/allowlist.
    isSuperAdmin:    isSuperAdmin(c.env, email, emailVerified),
    emailVerified,
  });
});

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/* ── GET /api/platform/quotes — TRUE cross-org quote visibility (FIX 3) ──────
 *
 * Platform-operator ONLY (requirePlatformAdmin: verified email in PLATFORM_ADMIN_
 * EMAILS, fail-closed). Non-members by design, so this is NOT requireRole-gated — it
 * reads EVERY org via a collectionGroup('quotes') query at the datastore root, then
 * joins each root-level invoice for cross-org payment visibility. READ-ONLY: an operator
 * never governs a tenant quote (no impersonation). The org-scoped /api/quote/list is
 * untouched — tenant isolation there is intact.
 *   No orderBy in the query (a collection-group orderBy would need a composite index);
 *   sorted in-memory by newest activity. Capped at 1000 (far above any near-term volume).
 */
platform.get('/api/platform/quotes', requireAuth(), requirePlatformAdmin(), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env;
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  let rows: Awaited<ReturnType<typeof firestoreRunQuery>>;
  try {
    rows = await firestoreRunQuery(saJson, {
      from: [{ collectionId: 'quotes', allDescendants: true }],   // root → ALL orgs
      limit: 1000,
    }, '');
  } catch (err) {
    console.error('[platform] cross-org quote query failed:', err instanceof Error ? err.message : '');
    return c.json({ error: 'Could not load quotes.', code: 'QUERY_FAILED' }, 500);
  }

  const quotes = rows.map(r => {
    const f = r.fields as Record<string, unknown>;
    // name = projects/.../documents/organizations/{orgId}/quotes/{quoteId}
    const m = /\/organizations\/([^/]+)\/quotes\/([^/]+)$/.exec(r.name);
    const orgId = m?.[1] ?? '';
    const quoteId = m?.[2] ?? (r.name.split('/').pop() ?? '');
    let quoteTitle = '';
    if (typeof f.renderJson === 'string') {
      try { const rj = JSON.parse(f.renderJson) as Record<string, unknown>; if (typeof rj.docTitle === 'string') quoteTitle = rj.docTitle; } catch { /* ignore */ }
    }
    return {
      quoteId, orgId, quoteTitle,
      customerEmail: str(f.customerEmail),
      createdBy: str(f.createdBy),
      source: str(f.source),
      price: quotePrice(f),
      currency: str(f.currency) || 'usd',
      stage: str(f.stage),
      adminState: str(f.adminState),
      decision: str(f.decision),
      createdAt: str(f.createdAt),
      sentAt: str(f.sentAt),
      decidedAt: str(f.decidedAt),
      // Cross-org payment (joined below).
      paymentStatus: '', paidAt: '', stripePaymentId: '', paymentUrl: '',
      invoiceAmount: null as number | null,
    };
  });

  // Cross-org invoice visibility — invoices live in ONE root collection, so a single
  // query covers every org (PERF: replaces up to 1000 per-quote reads; COMPLETENESS:
  // every invoice is returned, even one whose quote fell outside the quote list).
  let invRows: Awaited<ReturnType<typeof firestoreRunQuery>> = [];
  try {
    invRows = await firestoreRunQuery(saJson, { from: [{ collectionId: 'invoices' }], limit: 1000 }, '');
  } catch (err) {
    console.warn('[platform] cross-org invoice query failed:', err instanceof Error ? err.message : '');
  }
  const invById = new Map<string, Record<string, unknown>>();
  for (const r of invRows) {
    const f = r.fields as Record<string, unknown>;
    invById.set(str(f.id) || (r.name.split('/').pop() ?? ''), f);
  }
  // Join payment state onto every quote (no stage precondition; orgId guard rejects a
  // theoretical cross-org quoteId collision).
  for (const q of quotes) {
    const inv = invById.get(`quote_${q.quoteId}`);
    if (!inv || inv.orgId !== q.orgId) continue;
    q.paymentStatus   = str(inv.status);
    q.paidAt          = str(inv.paidAt);
    q.stripePaymentId = str(inv.paymentSessionId);
    q.paymentUrl      = str(inv.paymentUrl);
    q.invoiceAmount   = typeof inv.amount === 'number' ? inv.amount : null;
  }

  const ts = (q: { decidedAt: string; sentAt: string; createdAt: string }) => q.decidedAt || q.sentAt || q.createdAt || '';
  quotes.sort((a, b) => (ts(a) < ts(b) ? 1 : ts(a) > ts(b) ? -1 : 0));

  // Full cross-org invoice list (all payment states) for the platform panel.
  const invoices = invRows.map(r => {
    const f = r.fields as Record<string, unknown>;
    return {
      id:            str(f.id) || (r.name.split('/').pop() ?? ''),
      orgId:         str(f.orgId),
      quoteId:       str(f.quoteId),
      quoteTitle:    str(f.quoteTitle),
      customerEmail: str(f.customerEmail),
      amount:        typeof f.amount === 'number' ? f.amount : null,
      currency:      str(f.currency) || 'usd',
      status:        str(f.status) || 'pending',
      paymentMethod: str(f.paymentMethod) || 'stripe',
      paidAt:        str(f.paidAt),
      createdAt:     str(f.createdAt),
    };
  }).sort((a, b) => ((a.paidAt || a.createdAt) < (b.paidAt || b.createdAt) ? 1 : -1));

  return c.json({ ok: true, quotes, invoices });
});

export default platform;
