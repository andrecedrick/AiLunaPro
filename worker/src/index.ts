/**
 * AiLunaPro — Cloudflare Worker (Phase J1).
 *
 * Stack:  Hono v4 + jose (JWT) + Cloudflare Workers runtime
 * Auth:   Firebase ID token verification (uid-only, no firebase-admin)
 *
 * Routes (J1):
 *   GET  /healthz
 *   GET  /api/me
 *   POST /api/audits/:id/submit
 *   POST /api/reports/:id/export
 *   POST /api/team/invite
 *   POST /api/billing/checkout
 *   POST /api/billing/portal
 *   POST /api/billing/sync-session
 *   GET  /api/billing/invoices
 *   POST /api/stripe/webhook
 */

import { Hono } from 'hono';
import { errorHandler } from './middleware/error';
import { cors } from './middleware/cors';
import healthRoutes from './routes/health';
import meRoutes     from './routes/me';
import auditRoutes  from './routes/audits';
import reportRoutes from './routes/reports';
import teamRoutes   from './routes/team';
import stripeRoutes          from './routes/stripe';
import billingConfigRoutes   from './routes/billing-config';
import billingCheckoutRoutes from './routes/billing-checkout';
import billingPortalRoutes   from './routes/billing-portal';
import billingSyncRoutes     from './routes/billing-sync';
import billingInvoicesRoutes from './routes/billing-invoices';

// ─── Env bindings type ────────────────────────────────────────────────────────

export type AppEnv = {
  Bindings: {
    FIREBASE_PROJECT_ID:           string;
    ALLOWED_ORIGINS:               string;
    // Set via `wrangler secret put` — never in wrangler.toml
    STRIPE_SECRET_KEY?:            string;
    STRIPE_WEBHOOK_SECRET?:        string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
  Variables: {
    uid:    string;
    orgId?: string;
  };
};

// ─── App ──────────────────────────────────────────────────────────────────────

const app = new Hono<AppEnv>();

// Global middleware — order matters: error wrapper first, then CORS
app.use('*', errorHandler());
app.use('*', cors());

// Routes
app.route('/', healthRoutes);
app.route('/', meRoutes);
app.route('/', auditRoutes);
app.route('/', reportRoutes);
app.route('/', teamRoutes);
app.route('/', stripeRoutes);
app.route('/', billingConfigRoutes);
app.route('/', billingCheckoutRoutes);
app.route('/', billingPortalRoutes);
app.route('/', billingSyncRoutes);
app.route('/', billingInvoicesRoutes);

// 404 fallback
app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
