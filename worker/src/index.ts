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
import agentsRoutes          from './routes/agents';
import diagnosticRoutes      from './routes/diagnostic';
import roiRoutes             from './routes/roi';
import recommendRoutes       from './routes/recommend';
import platformRoutes        from './routes/platform';
import platformOpsRoutes     from './routes/platform-ops';

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
    // J1.4A-Hardening — environment marker (development | staging | production).
    // Resolves via resolveAppEnv() in lib/env.ts. Defaults to 'development' if
    // unset or invalid. Production must set this via Cloudflare secret or
    // env-specific [env.production] vars — never via global [vars].
    APP_ENV?:                      string;
    // K1A — Cloudflare Turnstile secret for /api/public/diagnostic
    TURNSTILE_SECRET_KEY?:         string;
    // J5 Batch 3 — operator allowlist. Comma-separated platform-admin emails.
    // Set via `wrangler secret put PLATFORM_ADMIN_EMAILS --env production`.
    // Platform admins are NOT org members; this gates operator-only surfaces.
    PLATFORM_ADMIN_EMAILS?:        string;
  };
  Variables: {
    uid:    string;
    orgId?: string;
    role?:  'owner' | 'admin' | 'member' | 'billing' | 'client';
    // J5 Batch 3 — email claims from the verified Firebase token (auth middleware).
    email?:         string;
    emailVerified?: boolean;
  };
};

// ─── App ──────────────────────────────────────────────────────────────────────

const app = new Hono<AppEnv>();

// Global middleware — order matters: error wrapper first, then CORS
app.use('*', errorHandler());
app.use('*', cors());

// J1.4A-Hardening: one-shot config log per worker isolate. Booleans + last4
// only — never logs full price IDs, secret keys, webhook secret, or service
// account JSON. Helps confirm prod env wiring at deploy time.
let _bootLogged = false;
app.use('*', async (c, next) => {
  if (!_bootLogged) {
    _bootLogged = true;
    try {
      const e = c.env as AppEnv['Bindings'];
      const key = e.STRIPE_SECRET_KEY ?? '';
      const keyMode = key.startsWith('sk_live_') ? 'live' : key.startsWith('sk_test_') ? 'test' : 'unset';
      const appEnv = (e.APP_ENV ?? '').toLowerCase() || 'development(default)';
      const packs = [
        e.STRIPE_TOKEN_PRICE_STARTER ? 1 : 0,
        e.STRIPE_TOKEN_PRICE_PRO     ? 1 : 0,
        e.STRIPE_TOKEN_PRICE_MAX     ? 1 : 0,
      ].reduce((a, b) => a + b, 0);
      console.log(
        `[boot] env=${appEnv} keyMode=${keyMode} packs=${packs}/3 ` +
        `webhookSecret=${e.STRIPE_WEBHOOK_SECRET ? 'set' : 'unset'} ` +
        `firestoreSA=${e.FIREBASE_SERVICE_ACCOUNT_JSON ? 'set' : 'unset'} ` +
        `appBaseUrl=${e.APP_BASE_URL ? 'set' : 'unset(fallback)'}`
      );
    } catch { /* ignore log errors */ }
  }
  await next();
});

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
app.route('/', agentsRoutes);
app.route('/', diagnosticRoutes);
app.route('/', roiRoutes);
app.route('/', recommendRoutes);
app.route('/', platformRoutes);
app.route('/', platformOpsRoutes);

// 404 fallback
app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
