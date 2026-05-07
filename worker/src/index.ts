/**
 * AiLunaPro — Cloudflare Worker (Phase G skeleton).
 *
 * Stack:  Hono v4 + jose (JWT) + Cloudflare Workers runtime
 * Auth:   Firebase ID token verification (uid-only, no firebase-admin)
 * Scope:  Routing + CORS + auth middleware + error handler + placeholder routes
 *
 * Routes:
 *   GET  /healthz                   — no auth, uptime probe
 *   GET  /api/me                    — auth required, returns verified uid
 *   POST /api/audits/:id/submit     — auth required, skeleton
 *   POST /api/reports/:id/export    — auth required, skeleton
 *   POST /api/team/invite           — auth required, skeleton
 *   POST /api/stripe/webhook        — no auth (Stripe-Signature), skeleton
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
import billingAdminStatus    from './routes/billing-admin-status';
import billingAdminCurrency  from './routes/billing-admin-currency';
import billingAdminProducts  from './routes/billing-admin-products';
import billingAdminPromos    from './routes/billing-admin-promos';
import billingAdminSettings  from './routes/billing-admin-settings';
import billingAdminPortal    from './routes/billing-admin-portal';
import teamInvitesRoutes     from './routes/team-invites';
import teamMembersRoutes     from './routes/team-members';
import tokensRoutes          from './routes/tokens';

// ─── Env bindings type ────────────────────────────────────────────────────────

export type AppEnv = {
  Bindings: {
    FIREBASE_PROJECT_ID:           string;
    ALLOWED_ORIGINS:               string;
    // Set via `wrangler secret put` — never in wrangler.toml
    STRIPE_SECRET_KEY?:            string;
    STRIPE_WEBHOOK_SECRET?:        string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    // J1.4A token packs (Stripe price IDs)
    STRIPE_TOKEN_PRICE_STARTER?:   string;
    STRIPE_TOKEN_PRICE_PRO?:       string;
    STRIPE_TOKEN_PRICE_MAX?:       string;
    APP_BASE_URL?:                 string;
    TOKEN_DEBUG?:                  string;
  };
  Variables: {
    uid:    string;
    orgId?: string;
    role?:  'owner' | 'admin' | 'member' | 'billing' | 'client';
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
app.route('/', billingAdminStatus);
app.route('/', billingAdminCurrency);
app.route('/', billingAdminProducts);
app.route('/', billingAdminPromos);
app.route('/', billingAdminSettings);
app.route('/', billingAdminPortal);
app.route('/', teamInvitesRoutes);
app.route('/', teamMembersRoutes);
app.route('/', tokensRoutes);

// 404 fallback
app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
