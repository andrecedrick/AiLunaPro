import { Hono, type Context } from 'hono';
import type { AppEnv } from '../index';
import { verifyIdToken } from '../middleware/auth';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';

/**
 * B2.2 — Demo-request capture (authed dashboard CTA).
 *
 * POST /api/demo-request — persists a demo request to the worker-only
 * `demo_requests/{id}` collection (client read/write denied in firestore.rules,
 * same discipline as public_diagnostics / public_roi_calculations).
 * The user is authenticated and explicitly asking to be contacted — the request
 * itself is the consent; we store only what the form collects plus org/uid
 * context for follow-up. No PII in logs.
 */

interface Bindings {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const demoRequest = new Hono<AppEnv>();

async function gate(c: Context<AppEnv>, orgId: string): Promise<{ uid: string } | Response> {
  const env = c.env as unknown as Bindings;
  c.header('Cache-Control', 'no-store');
  const authHeader = c.req.header('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const uid = await verifyIdToken(bearer, env.FIREBASE_PROJECT_ID);
  if (!uid) return c.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, 401);
  if (!orgId) return c.json({ error: 'orgId required.', code: 'ORG_REQUIRED' }, 400);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 500);
  const member = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/members/${uid}`);
  if (!member) return c.json({ error: 'Not a member of this workspace.', code: 'FORBIDDEN' }, 403);
  return { uid };
}

demoRequest.post('/api/demo-request', async c => {
  const env = c.env as unknown as Bindings;
  let body: Record<string, unknown>;
  try { body = (await c.req.json()) as Record<string, unknown>; }
  catch { c.header('Cache-Control', 'no-store'); return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  const g = await gate(c, orgId);
  if (g instanceof Response) return g;

  // Validate at the boundary; trim + cap lengths so the store stays bounded.
  const name    = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const email   = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const company = typeof body.company === 'string' ? body.company.trim().slice(0, 120) : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
  if (!name) return c.json({ error: 'Name is required.', code: 'INVALID_NAME' }, 400);
  if (!EMAIL_RE.test(email)) return c.json({ error: 'A valid email is required.', code: 'INVALID_EMAIL' }, 400);

  const id = crypto.randomUUID();
  const doc = {
    id,
    name,
    email,
    company: company || null,
    message: message || null,
    orgId,
    uid: g.uid,
    source: 'dashboard-cta',
    status: 'new',
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
  };

  try {
    await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `demo_requests/${id}`, doc as unknown as Parameters<typeof firestoreSet>[2]);
  } catch (err) {
    console.error('[demo-request] firestoreSet failed:', err instanceof Error ? err.message : 'unknown');
    return c.json({ error: 'Could not record your request. Please try again.', code: 'STORE_FAILED' }, 500);
  }

  return c.json({ ok: true, id });
});

export default demoRequest;
