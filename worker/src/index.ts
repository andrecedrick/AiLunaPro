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
import stripeRoutes from './routes/stripe';

// ─── Env bindings type ────────────────────────────────────────────────────────

export type AppEnv = {
  Bindings: {
    FIREBASE_PROJECT_ID: string;
    ALLOWED_ORIGINS:     string;
  };
  Variables: {
    uid: string;
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

// 404 fallback
app.notFound(c => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export default app;
