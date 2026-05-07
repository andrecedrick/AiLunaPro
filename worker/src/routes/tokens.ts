/**
 * Tokens routes — Phase J1.4A.
 *
 *   GET  /api/tokens/balance?orgId=...
 *   POST /api/tokens/topup
 *   GET  /api/tokens/usage?orgId=...&from=&to=&module=
 *
 * Optional debug:
 *   POST /api/tokens/_debug/consume   (only if TOKEN_DEBUG=true, owner-only)
 *
 * No /api/tokens/consume exposed to frontend. Internal helper only.
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { getStripe } from '../lib/stripe';
import { firestoreGet } from '../lib/firestoreAdmin';
import { ensureTokenCycleFresh, consumeTokens } from '../lib/tokens';
import { TOKEN_PACKS, isValidPack, isValidAction, allocationForPlan } from '../lib/token-costs';
import type { AppEnv } from '../index';

const tokens = new Hono<AppEnv>();

const APP_BASE_URL_FALLBACK = 'http://localhost:5173';

/* ── GET /api/tokens/balance ──────────────────────────── */

tokens.get('/api/tokens/balance', requireAuth(), requireRole(['owner', 'admin', 'billing', 'member']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId = c.get('orgId') as string;
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Service account not configured' }, 503);

  // Bootstrap allocation for orgs with no tokens/current doc yet (existing
  // pre-J1.4A subscribers). Priority:
  //   1. subscriptions/current.tokensMonthlyAllocation (explicit override)
  //   2. allocationForPlan(subscriptions/current.plan) — normalized lowercase
  //   3. Free=100 fallback
  let fallback = 100;
  try {
    const sub = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/subscriptions/current`);
    const explicit = sub?.tokensMonthlyAllocation;
    if (typeof explicit === 'number' && explicit >= 0) {
      fallback = explicit;
    } else {
      fallback = allocationForPlan(sub?.plan as string | undefined);
    }
  } catch { /* ignore */ }

  const balance = await ensureTokenCycleFresh(env.FIREBASE_SERVICE_ACCOUNT_JSON, orgId, fallback);
  return c.json(balance);
});

/* ── POST /api/tokens/topup ───────────────────────────── */

interface TopupBody { orgId: string; pack: string; }

tokens.post('/api/tokens/topup', requireAuth(), requireRole(['owner', 'admin', 'billing']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?:             string;
    STRIPE_TOKEN_PRICE_STARTER?:    string;
    STRIPE_TOKEN_PRICE_PRO?:        string;
    STRIPE_TOKEN_PRICE_MAX?:        string;
    APP_BASE_URL?:                  string;
  };

  if (!env.STRIPE_SECRET_KEY) return c.json({ error: 'Stripe not configured' }, 503);
  if (env.STRIPE_SECRET_KEY.startsWith('sk_live_')) return c.json({ error: 'Live key blocked' }, 403);

  let body: TopupBody;
  try { body = await c.req.json<TopupBody>(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  if (!isValidPack(body.pack)) return c.json({ error: 'Invalid pack' }, 400);

  const def = TOKEN_PACKS[body.pack];
  const priceId = (env as unknown as Record<string, string | undefined>)[def.envVar];
  if (!priceId) return c.json({ error: `Token price not configured: ${def.envVar}` }, 503);

  const orgId    = c.get('orgId') as string;
  const baseUrl  = env.APP_BASE_URL ?? APP_BASE_URL_FALLBACK;
  const stripe   = getStripe(env.STRIPE_SECRET_KEY);

  const successUrl = `${baseUrl}/#/billing/tokens?topup=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${baseUrl}/#/billing/tokens?topup=cancel`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode:                 'payment',
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          successUrl,
      cancel_url:           cancelUrl,
      client_reference_id:  orgId,
      metadata: {
        orgId,
        type:        'tokens_topup',
        tokensPack:  def.pack,
        tokensAdded: String(def.tokensAdded),
      },
    });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return c.json({ error: err.message, code: err.code ?? err.type }, 400);
    }
    throw err;
  }

  if (!session.url) return c.json({ error: 'Stripe session created but URL is empty' }, 502);
  console.log('[tokens] topup checkout created — orgId:', orgId, 'pack:', def.pack, 'session:', session.id);
  return c.json({ url: session.url, pack: def.pack, tokensAdded: def.tokensAdded });
});

/* ── GET /api/tokens/usage ────────────────────────────── */

tokens.get('/api/tokens/usage', requireAuth(), requireRole(['owner', 'admin', 'billing', 'member']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId      = c.get('orgId') as string;
  const viewerRole = c.get('role')  as string;
  const viewerUid  = c.get('uid')   as string;
  const limit      = Math.min(parseInt(c.req.query('limit') ?? '50', 10) || 50, 200);

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) return c.json({ error: 'Service account not configured' }, 503);

  // List via REST listDocuments
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as { client_email: string; private_key: string; project_id: string };
  const tokRes = await getAccessToken(sa);
  const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current/usage?pageSize=${limit}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tokRes}` } });
  if (!res.ok) return c.json({ events: [] });
  const data = await res.json() as { documents?: Array<{ name: string; fields?: Record<string, { stringValue?: string; integerValue?: string; booleanValue?: boolean }> }> };

  let events = (data.documents ?? []).map(doc => {
    const id = doc.name.split('/').pop() ?? '';
    const f  = doc.fields ?? {};
    return {
      eventId: id,
      module:  f.module?.stringValue,
      action:  f.action?.stringValue,
      tokens:  f.tokens?.integerValue ? parseInt(f.tokens.integerValue, 10) : 0,
      uid:     f.uid?.stringValue,
      status:  f.status?.stringValue,
      at:      f.at?.stringValue,
    };
  });

  // Privacy: member sees only own usage. Owner/admin/billing see all.
  if (viewerRole === 'member') {
    events = events.filter(e => e.uid === viewerUid);
  }

  return c.json({ events, total: events.length });
});

/* Inline JWT helper (mirror geo lib) */
async function getAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header  = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };
  const encode = (o: unknown) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const pemBody = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signBytes = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signBytes)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${unsigned}.${sig}`;
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const tokData = await tokRes.json() as { access_token: string };
  return tokData.access_token;
}

/* ── Debug consume (owner-only, env-gated) ────────────── */

tokens.post('/api/tokens/_debug/consume', requireAuth(), requireRole(['owner']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    TOKEN_DEBUG?:                   string;
  };
  if (env.TOKEN_DEBUG !== 'true') return c.json({ error: 'Debug disabled' }, 404);

  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid')   as string;

  let body: { action: string; eventId?: string };
  try { body = await c.req.json(); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  if (!isValidAction(body.action)) return c.json({ error: 'Invalid action' }, 400);
  const eventId = body.eventId ?? `dbg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = await consumeTokens(env.FIREBASE_SERVICE_ACCOUNT_JSON!, orgId, body.action, uid, eventId);
  if (!result.ok) return c.json(result, 402);
  return c.json(result);
});

export default tokens;
