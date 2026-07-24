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
 *   GET  /api/reports/detail|file/:id · POST /api/reports/:id/title — auth+org
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
import quoteRoutes           from './routes/quote';
import invoicesRoutes        from './routes/invoices';
import billingSettingsRoutes from './routes/billing-settings';
import recommendRoutes       from './routes/recommend';
import usageRoutes           from './routes/usage';
import platformRoutes        from './routes/platform';
import platformOpsRoutes     from './routes/platform-ops';
import platformMetricsRoutes from './routes/platform-metrics';
import platformTokenUsageRoutes from './routes/platform-token-usage';
import platformAlertsRoutes from './routes/platform-alerts';
import platformFeedbackRoutes from './routes/platform-feedback';
import notificationsRoutes from './routes/notifications';
import auditExpressRoutes    from './routes/audit-express';
import auditExpressExtractRoutes from './routes/audit-express-extract';
import auditExpressPdfRoutes from './routes/audit-express-pdf';
import auditExpressStoreRoutes from './routes/audit-express-store';
import demoRequestRoutes     from './routes/demo-request';
import auditExpressDocumentRoutes from './routes/audit-express-document';
import feedbackPublicRoutes  from './routes/feedback-public';
import supportRoutes         from './routes/support';
import lunaRoutes            from './routes/luna';
import worksheetRoutes       from './routes/worksheet';
import contactsRoutes, { contactsPlatform } from './routes/contacts';

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
    // Phase 6 — small self-serve overage pack (300 tokens). Operator-set price ID.
    STRIPE_TOKEN_PRICE_OVERAGE?:   string;
    // Plan-limit enforcement + controlled overflow billing scopes (vars, not secrets).
    // Both default OFF; '*' = explicit global. See lib/usage-limits.ts.
    ENABLE_PLAN_LIMITS?:               string;
    ENABLE_PLAN_LIMITS_ORGS?:          string;
    ENABLE_RECOMMENDATION_CHARGE?:     string;
    ENABLE_RECOMMENDATION_CHARGE_ORGS?: string;
    APP_BASE_URL?:                 string;
    TOKEN_DEBUG?:                  string;
    // J1.4A-Hardening — environment marker (development | staging | production).
    // Resolves via resolveAppEnv() in lib/env.ts. Defaults to 'development' if
    // unset or invalid. Production must set this via Cloudflare secret or
    // env-specific [env.production] vars — never via global [vars].
    APP_ENV?:                      string;
    // K1A — Cloudflare Turnstile secret for /api/public/diagnostic
    TURNSTILE_SECRET_KEY?:         string;
    // Phase 4 — Cloudflare Turnstile PUBLIC site key, served to the static
    // /audit-express page via GET /api/public/audit-express/config so the page
    // can render the widget. Public value (safe to expose); pairs with
    // TURNSTILE_SECRET_KEY. Operator sets it via `wrangler secret put` or vars.
    TURNSTILE_SITE_KEY?:           string;
    // J5 Batch 3 — operator allowlist. Comma-separated platform-admin emails.
    // Set via `wrangler secret put PLATFORM_ADMIN_EMAILS --env production`.
    // Platform admins are NOT org members; this gates operator-only surfaces.
    PLATFORM_ADMIN_EMAILS?:        string;
    // J15 P1.1 — R2 bucket for saved Audit Express PDFs (org-scoped keys).
    AUDIT_PDFS?:                   R2Bucket;
    // Shareable PDF links — HMAC secret (operator sets via `wrangler secret put`).
    // Reused for quote PDF email links (Q4); HMAC payload is id-scoped + gated by
    // quote-doc existence, so cross-feature replay is benign (404).
    AUDIT_SHARE_SECRET?:           string;
    // Q4 — Sequenzy transactional email (operator secret) + optional admin BCC.
    SEQUENZY_API_KEY?:             string;
    ADMIN_EMAIL?:                  string;
    // Multi-admin notifications — comma-separated emails that receive quote/invoice
    // admin notifications (accept/discuss). De-duped with ADMIN_EMAIL; also used
    // (with PLATFORM_ADMIN_EMAILS) to gate the Admin Center. `wrangler secret put`.
    ADMIN_EMAILS?:                 string;
    // S3 Phase 2 — Luna AI chat (Anthropic Messages API, claude-haiku-4-5).
    // Operator sets via `wrangler secret put ANTHROPIC_API_KEY --env production`.
    // Absent → Luna falls back to the deterministic responder (no error).
    ANTHROPIC_API_KEY?:            string;
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
        e.STRIPE_TOKEN_PRICE_OVERAGE ? 1 : 0,
        e.STRIPE_TOKEN_PRICE_STARTER ? 1 : 0,
        e.STRIPE_TOKEN_PRICE_PRO     ? 1 : 0,
        e.STRIPE_TOKEN_PRICE_MAX     ? 1 : 0,
      ].reduce((a, b) => a + b, 0);
      // Billing scope moved to Firestore (platform_config/billing) — no longer in
      // env, so the boot log points to the authoritative source instead of a value.
      console.log(
        `[boot] env=${appEnv} keyMode=${keyMode} packs=${packs}/4 ` +
        `billingScope=firestore:platform_config/billing ` +
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
app.route('/', quoteRoutes);
app.route('/', invoicesRoutes);
app.route('/', billingSettingsRoutes);
app.route('/', recommendRoutes);
app.route('/', usageRoutes);
app.route('/', platformRoutes);
app.route('/', platformOpsRoutes);
app.route('/', platformMetricsRoutes);
app.route('/', platformTokenUsageRoutes);
app.route('/', platformAlertsRoutes);
app.route('/', platformFeedbackRoutes);
app.route('/', notificationsRoutes);
app.route('/', auditExpressRoutes);
app.route('/', auditExpressExtractRoutes);
app.route('/', auditExpressPdfRoutes);
app.route('/', auditExpressStoreRoutes);
app.route('/', demoRequestRoutes);
app.route('/', auditExpressDocumentRoutes);
app.route('/', feedbackPublicRoutes);
app.route('/', supportRoutes);
app.route('/', lunaRoutes);
app.route('/', worksheetRoutes);
app.route('/', contactsRoutes);
app.route('/', contactsPlatform);

// 404 fallback
app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
