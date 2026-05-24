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
import { dlog } from '../lib/log';
import { ensureTokenCycleFresh, consumeTokens } from '../lib/tokens';
import { firestoreSet as firestoreSetWrite } from '../lib/firestoreAdmin';
import { TOKEN_PACKS, isValidPack, isValidAction, allocationForPlan } from '../lib/token-costs';
import { assertStripeKeyAllowed } from '../lib/env';
import type { AppEnv } from '../index';

const tokens = new Hono<AppEnv>();

const APP_BASE_URL_FALLBACK = 'http://localhost:5173';

/* ── GET /api/tokens/balance ──────────────────────────── */

tokens.get('/api/tokens/balance', requireAuth(), requireRole(['owner', 'admin', 'billing', 'member']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId = c.get('orgId') as string;
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

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

tokens.post('/api/tokens/topup', requireAuth(), requireRole(['owner', 'billing']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    STRIPE_SECRET_KEY?:             string;
    STRIPE_TOKEN_PRICE_STARTER?:    string;
    STRIPE_TOKEN_PRICE_PRO?:        string;
    STRIPE_TOKEN_PRICE_MAX?:        string;
    APP_BASE_URL?:                  string;
  };

  if (!env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe is not configured', code: 'STRIPE_NOT_CONFIGURED' }, 503);
  }
  const blocked = assertStripeKeyAllowed(env);
  if (blocked) return c.json(blocked.body, blocked.status);

  let body: TopupBody;
  try { body = await c.req.json<TopupBody>(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  if (!isValidPack(body.pack)) return c.json({ error: 'Invalid pack', code: 'INVALID_PACK', pack: body.pack }, 400);

  const def = TOKEN_PACKS[body.pack];
  const priceId = (env as unknown as Record<string, string | undefined>)[def.envVar];
  if (!priceId) {
    // Server log keeps the env var name for ops debugging; client response hides it.
    console.warn('[tokens] PACK_NOT_CONFIGURED — missing env var:', def.envVar);
    return c.json({
      error: 'Token pack is not configured',
      code:  'PACK_NOT_CONFIGURED',
      pack:  def.pack,
    }, 503);
  }

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
  dlog(env, '[tokens] topup checkout created — orgId:', orgId, 'pack:', def.pack, 'session:', session.id);
  return c.json({ url: session.url, pack: def.pack, tokensAdded: def.tokensAdded });
});

/* ── GET /api/tokens/usage ────────────────────────────── */

tokens.get('/api/tokens/usage', requireAuth(), requireRole(['owner', 'admin', 'billing', 'member']), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId      = c.get('orgId') as string;
  const viewerRole = c.get('role')  as string;
  const viewerUid  = c.get('uid')   as string;
  const limit      = Math.min(parseInt(c.req.query('limit') ?? '50', 10) || 50, 200);

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

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

/* ── Diagnostics (owner-only, env-gated) ────────────────────
   Inspect tokens/current + subcollection sums without exposing secrets.
   Used by the frontend Repair UI to decide whether to surface the
   "Repair token balance" button. Never returns full secret values. */

const SANE_NUMERIC_CAP = 1e10; // tokens never legitimately exceed 10B

tokens.get('/api/tokens/_debug/diagnostics', requireAuth(), requireRole(['owner']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    TOKEN_DEBUG?:                   string;
  };
  if (env.TOKEN_DEBUG !== 'true') {
    return c.json({ error: 'Debug disabled', code: 'DEBUG_DISABLED' }, 404);
  }
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  const orgId = c.get('orgId') as string;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as { client_email: string; private_key: string; project_id: string };
  const accessToken = await getAccessToken(sa);

  const balanceUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current`;
  const balRes = await fetch(balanceUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

  type DiagField = { type: 'integer' | 'string' | 'double' | 'absent'; rawLength: number; parsed: number; finite: boolean; saneRange: boolean };
  const inspect = (v?: { stringValue?: string; integerValue?: string; doubleValue?: number }): DiagField => {
    if (!v) return { type: 'absent', rawLength: 0, parsed: 0, finite: false, saneRange: false };
    if (v.integerValue !== undefined) {
      const n = Number(v.integerValue);
      return { type: 'integer', rawLength: v.integerValue.length, parsed: n, finite: Number.isFinite(n), saneRange: Number.isFinite(n) && n >= 0 && n <= SANE_NUMERIC_CAP };
    }
    if (v.stringValue !== undefined) {
      const n = Number(v.stringValue);
      return { type: 'string', rawLength: v.stringValue.length, parsed: n, finite: Number.isFinite(n), saneRange: Number.isFinite(n) && n >= 0 && n <= SANE_NUMERIC_CAP };
    }
    if (v.doubleValue !== undefined) {
      const n = v.doubleValue;
      return { type: 'double', rawLength: String(n).length, parsed: n, finite: Number.isFinite(n), saneRange: Number.isFinite(n) && n >= 0 && n <= SANE_NUMERIC_CAP };
    }
    return { type: 'absent', rawLength: 0, parsed: 0, finite: false, saneRange: false };
  };

  let balanceDoc: Record<string, DiagField> = {};
  let docExists = false;
  if (balRes.ok) {
    docExists = true;
    const j = await balRes.json() as { fields?: Record<string, { stringValue?: string; integerValue?: string; doubleValue?: number }> };
    const f = j.fields ?? {};
    for (const key of ['balance', 'monthlyAllocation', 'consumed', 'rollover', 'topupTotal']) {
      balanceDoc[key] = inspect(f[key]);
    }
  }

  // Topup sum
  const topupsUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current/topups?pageSize=200`;
  const topupsRes = await fetch(topupsUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  let topupCount = 0;
  let topupTotalCredited = 0;
  if (topupsRes.ok) {
    const data = await topupsRes.json() as { documents?: Array<{ fields?: Record<string, { stringValue?: string; integerValue?: string }> }> };
    for (const doc of data.documents ?? []) {
      const ff = doc.fields ?? {};
      if (ff.status?.stringValue !== 'credited') continue;
      const raw = ff.tokensAdded?.integerValue ?? ff.tokensAdded?.stringValue ?? '0';
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) {
        topupCount += 1;
        topupTotalCredited += n;
      }
    }
  }

  // Usage sum
  const usageUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current/usage?pageSize=500`;
  const usageRes = await fetch(usageUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  let usageCount = 0;
  let usageTotal = 0;
  if (usageRes.ok) {
    const data = await usageRes.json() as { documents?: Array<{ fields?: Record<string, { stringValue?: string; integerValue?: string }> }> };
    for (const doc of data.documents ?? []) {
      const ff = doc.fields ?? {};
      if (ff.status?.stringValue === 'failed') continue;
      const raw = ff.tokens?.integerValue ?? ff.tokens?.stringValue ?? '0';
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) {
        usageCount += 1;
        usageTotal += n;
      }
    }
  }

  const looksCorrupted = !docExists || Object.values(balanceDoc).some(f => !f.saneRange);

  return c.json({
    docExists,
    balanceDoc,
    subcollections: {
      topups: { count: topupCount, totalCredited: topupTotalCredited },
      usage:  { count: usageCount, total: usageTotal },
    },
    looksCorrupted,
    saneCap: SANE_NUMERIC_CAP,
  });
});

/* ── Repair (owner-only, env-gated) ─────────────────────────
   Recompute tokens/current from monthlyAllocation + sum(topups.tokensAdded)
   - sum(usage.tokens). Used to recover from the integerValue-string-concat
   bug that produced corrupted balances. Idempotent. */

tokens.post('/api/tokens/_debug/repair', requireAuth(), requireRole(['owner']), async c => {
  const env = c.env as AppEnv['Bindings'] & {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    TOKEN_DEBUG?:                   string;
  };
  if (env.TOKEN_DEBUG !== 'true') return c.json({ error: 'Debug disabled', code: 'DEBUG_DISABLED' }, 404);
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  const orgId = c.get('orgId') as string;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as { client_email: string; private_key: string; project_id: string };
  const accessToken = await getAccessToken(sa);

  // Read current balance doc to keep monthlyAllocation
  const balanceUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current`;
  const balRes = await fetch(balanceUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!balRes.ok) return c.json({ error: 'tokens/current not found', code: 'NO_BALANCE_DOC' }, 404);
  const balDoc = await balRes.json() as { fields?: Record<string, { stringValue?: string; integerValue?: string }> };
  const f = balDoc.fields ?? {};

  const numField = (key: string, fb: number): number => {
    const v = f[key];
    if (!v) return fb;
    if (v.integerValue !== undefined) {
      const n = Number(v.integerValue);
      return Number.isFinite(n) ? n : fb;
    }
    if (v.stringValue !== undefined) {
      const n = Number(v.stringValue);
      return Number.isFinite(n) ? n : fb;
    }
    return fb;
  };
  const monthlyAllocation = numField('monthlyAllocation', 0);

  // Sum credited topups
  const topupsUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current/topups?pageSize=200`;
  const topupsRes = await fetch(topupsUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  let topupTotal = 0;
  let topupCount = 0;
  if (topupsRes.ok) {
    const data = await topupsRes.json() as { documents?: Array<{ fields?: Record<string, { stringValue?: string; integerValue?: string }> }> };
    for (const doc of data.documents ?? []) {
      const ff = doc.fields ?? {};
      const status = ff.status?.stringValue;
      if (status !== 'credited') continue;
      const raw = ff.tokensAdded?.integerValue ?? ff.tokensAdded?.stringValue ?? '0';
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) {
        topupTotal += n;
        topupCount += 1;
      }
    }
  }

  // Sum consumed usage
  const usageUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/organizations/${orgId}/tokens/current/usage?pageSize=500`;
  const usageRes = await fetch(usageUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  let consumed = 0;
  let usageCount = 0;
  if (usageRes.ok) {
    const data = await usageRes.json() as { documents?: Array<{ fields?: Record<string, { stringValue?: string; integerValue?: string }> }> };
    for (const doc of data.documents ?? []) {
      const ff = doc.fields ?? {};
      const status = ff.status?.stringValue;
      if (status === 'failed') continue;
      const raw = ff.tokens?.integerValue ?? ff.tokens?.stringValue ?? '0';
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) {
        consumed += n;
        usageCount += 1;
      }
    }
  }

  const balance = Math.max(0, monthlyAllocation + topupTotal - consumed);
  const now = new Date().toISOString();

  await firestoreSetWrite(env.FIREBASE_SERVICE_ACCOUNT_JSON, `organizations/${orgId}/tokens/current`, {
    balance,
    monthlyAllocation,
    consumed,
    rollover:    0,
    topupTotal,
    updatedAt:   now,
  }, { merge: true });

  dlog(env, '[tokens] repair — orgId:', orgId, 'balance:', balance, 'allocation:', monthlyAllocation, 'topups:', topupTotal, 'consumed:', consumed);

  return c.json({
    ok: true,
    repaired: {
      balance,
      monthlyAllocation,
      consumed,
      rollover:   0,
      topupTotal,
      counts: { topupCount, usageCount },
    },
  });
});

export default tokens;
