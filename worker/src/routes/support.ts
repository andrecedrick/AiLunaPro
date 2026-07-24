/**
 * Support tickets route — S2.
 *
 *   POST /api/support/ticket
 *
 * Hybrid: anonymous users must provide an email; authenticated users (valid
 * Bearer token) get their VERIFIED token email — a client-supplied email is
 * ignored when authed. Server is authoritative for validation + sanitisation.
 * Per-IP cooldown (same primitive as feedback). Writes support_tickets/{id}
 * (top-level, worker-only). If ADMIN_EMAIL is set, sends a best-effort admin
 * notification via Sequenzy (template support-ticket-admin).
 *
 * Decoupled from feedback (S1) and Luna (S3): own endpoint, own collection.
 * No PII beyond the submitter email. No file upload. No billing/Stripe changes.
 */

import { Hono } from 'hono';
import { firestoreSet } from '../lib/firestoreAdmin';
import { checkCooldown } from '../lib/rateLimit';
import { verifyIdTokenClaims } from '../middleware/auth';
import { sendTransactional } from '../lib/sequenzy';
import { dlog } from '../lib/log';
import { validateSupport, generateSupportId } from '../lib/support-shared';
import type { AppEnv } from '../index';

const support = new Hono<AppEnv>();

support.post('/api/support/ticket', async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // Hybrid auth: a present Bearer token must be valid; absent = anonymous.
  const authHeader = c.req.header('Authorization');
  let uid: string | null = null;
  let authedEmail: string | undefined;
  if (authHeader?.startsWith('Bearer ')) {
    const claims = await verifyIdTokenClaims(authHeader.slice(7), env.FIREBASE_PROJECT_ID);
    if (!claims) return c.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, 401);
    uid = claims.uid;
    authedEmail = claims.email;
  }

  // Per-IP cooldown (15s) — anti-spam, same pattern as the public lead forms.
  const remoteIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? undefined;
  const rl = await checkCooldown(env.FIREBASE_SERVICE_ACCOUNT_JSON, 'support', remoteIp, 15_000);
  if (!rl.ok) {
    return c.json({ error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec }, 429);
  }

  const check = validateSupport((body ?? {}) as Parameters<typeof validateSupport>[0], authedEmail);
  if (!check.ok) {
    return c.json({ error: check.error, code: 'INVALID_TICKET' }, 400);
  }
  const t = check.ticket;

  const id      = generateSupportId();
  const now     = new Date().toISOString();
  const country = c.req.header('CF-IPCountry') ?? null;

  const doc = {
    id,
    type:          t.type,
    description:   t.description,
    email:         t.email,
    phone:         t.phone,          // mandatory callback number (validated)
    priority:      t.priority,
    context:       t.context,
    uid:           uid ?? null,             // opaque id when authed; not PII
    cf:            { country: country ?? null },
    status:        'open',
    schemaVersion: 1,
    createdAt:     now,
  };

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `support_tickets/${id}`, doc as unknown as Parameters<typeof firestoreSet>[2]);
  } catch (err) {
    console.error('[support] firestoreSet failed:', err);
    return c.json({ error: 'Failed to save ticket', code: 'PERSIST_FAILED' }, 500);
  }

  // PII: do NOT log the email or description.
  dlog(env, '[support] saved — id:', id, 'type:', t.type, 'priority:', t.priority ?? '-', 'authed:', uid !== null);

  // Best-effort admin notification (non-fatal). Only when ADMIN_EMAIL is set AND
  // the Sequenzy template support-ticket-admin exists operator-side.
  if (env.ADMIN_EMAIL) {
    const ctx = t.context
      ? `route=${t.context.route ?? '-'} · locale=${t.context.locale ?? '-'} · v=${t.context.appVersion ?? '-'}`
      : '-';
    await sendTransactional(env.SEQUENZY_API_KEY, {
      to:   env.ADMIN_EMAIL,
      slug: 'support-ticket-admin',
      variables: {
        TYPE:        t.type,
        PRIORITY:    t.priority ?? '-',
        DESCRIPTION: t.description,
        EMAIL:       t.email,
        PHONE:       t.phone,
        CONTEXT:     ctx,
      },
      replyTo: t.email,   // admin can reply straight to the submitter
    });
  }

  return c.json({ ok: true, id });
});

export default support;
