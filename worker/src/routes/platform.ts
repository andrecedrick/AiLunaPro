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
import { firestoreRunQuery, firestoreGet } from '../lib/firestoreAdmin';
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

  // Cross-org invoice join (payment visibility) — invoices are root-level `invoices/quote_
  // {quoteId}`; the orgId guard rejects a (theoretical) cross-org quoteId collision.
  await Promise.all(quotes.map(async q => {
    if (!q.decidedAt && q.stage !== 'finalized' && q.stage !== 'invoice_sent') return;
    try {
      const inv = await firestoreGet(saJson, `invoices/quote_${q.quoteId}`) as Record<string, unknown> | null;
      if (!inv || inv.orgId !== q.orgId) return;
      q.paymentStatus   = str(inv.status);
      q.paidAt          = str(inv.paidAt);
      q.stripePaymentId = str(inv.paymentSessionId);
      q.paymentUrl      = str(inv.paymentUrl);
      q.invoiceAmount   = typeof inv.amount === 'number' ? inv.amount : null;
    } catch { /* best-effort join */ }
  }));

  const ts = (q: { decidedAt: string; sentAt: string; createdAt: string }) => q.decidedAt || q.sentAt || q.createdAt || '';
  quotes.sort((a, b) => (ts(a) < ts(b) ? 1 : ts(a) > ts(b) ? -1 : 0));

  return c.json({ ok: true, quotes });
});

export default platform;
