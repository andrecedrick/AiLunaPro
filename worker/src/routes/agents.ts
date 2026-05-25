/**
 * Agent Catalog routes — Phase K0.
 *
 *   GET  /api/agents
 *   GET  /api/agents/:agentId
 *   POST /api/agents/admin/seed       (owner + TOKEN_DEBUG=true)
 *   POST /api/agents/admin/upsert     (owner)
 *   POST /api/agents/admin/archive    (owner)
 *
 * RBAC:
 *   - GET routes: requireRole(['owner','admin','billing','member'])
 *     Client role explicitly excluded — no catalog access in K0.
 *   - Admin routes: requireRole(ADMIN_ROLES).
 *
 * Writes go through the worker only (service account bypasses Firestore
 * rules). Frontend never writes /agents directly.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  firestoreSet,
  firestoreGet,
  firestoreCreateIfNotExists,
} from '../lib/firestoreAdmin';
import { dlog } from '../lib/log';
import { validateAgent, type AgentCatalogEntry, type AgentStatus } from '../lib/agents-shared';
import { AILUNAPRO_AGENT_SEED } from '../data/agents-seed';
import type { AppEnv } from '../index';

const agents       = new Hono<AppEnv>();
// Separate Hono for the lookup route — keeps chained type inference
// shallow when registering multiple routes with 4-element role arrays.
const agentsLookup = new Hono<AppEnv>();

// Cast role lists to the requireRole parameter type to short-circuit
// chained type instantiation (TS2589 fires when the inferred middleware
// signature accumulates across many route registrations on one Hono).
type RoleList = Parameters<typeof requireRole>[0];
const READ_ROLES: RoleList  = ['owner', 'admin', 'billing', 'member'];
const ADMIN_ROLES: RoleList = ['owner'];

/* ── Helpers ────────────────────────────────────────────────── */

interface ServiceAccount { client_email: string; private_key: string; project_id: string; }

async function getAccessToken(sa: ServiceAccount): Promise<string> {
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
  const data = await tokRes.json() as { access_token: string };
  return data.access_token;
}

/** Decode a Firestore REST document's fields into a typed AgentCatalogEntry.
 *  Use `unknown` boundary + targeted casts to keep TS solver happy. */
type FirestorePrim = { stringValue?: string; integerValue?: string; doubleValue?: number; nullValue?: null };
type FirestoreField = FirestorePrim & {
  booleanValue?: boolean;
  arrayValue?: { values?: FirestorePrim[] };
  mapValue?: { fields?: Record<string, FirestoreField> };
};

function decodeAgentDoc(fieldsIn: Record<string, unknown> | undefined): AgentCatalogEntry | null {
  if (!fieldsIn) return null;
  const f = fieldsIn as Record<string, FirestoreField>;
  const str = (k: string): string => f[k]?.stringValue ?? '';
  const arr = (k: string): string[] => {
    const vals = f[k]?.arrayValue?.values;
    return (vals ?? []).map(v => v.stringValue ?? '').filter(Boolean);
  };
  const mapFields = (k: string): Record<string, FirestoreField> => f[k]?.mapValue?.fields ?? {};

  const fitsRaw    = mapFields('fits');
  const roiRaw     = mapFields('expectedRoi');
  const pricingRaw = mapFields('pricing');

  const nm = (m: Record<string, FirestoreField>, k: string): number | null => {
    const v = m[k];
    if (!v) return null;
    if (v.integerValue !== undefined) { const n = Number(v.integerValue); return Number.isFinite(n) ? n : null; }
    if (v.doubleValue  !== undefined) return v.doubleValue;
    return null;
  };
  const sm = (m: Record<string, FirestoreField>, k: string): string =>
    m[k]?.stringValue ?? '';
  const am = (m: Record<string, FirestoreField>, k: string): string[] =>
    (m[k]?.arrayValue?.values ?? []).map(x => x.stringValue ?? '').filter(Boolean);

  return {
    agentId:                  str('agentId'),
    source:                   str('source')        as AgentCatalogEntry['source'],
    name:                     str('name'),
    tagline:                  str('tagline'),
    description:              str('description'),
    problemSolved:            str('problemSolved'),
    fits: {
      industries:  am(fitsRaw, 'industries'),
      companySize: am(fitsRaw, 'companySize') as AgentCatalogEntry['fits']['companySize'],
      budgetMin:   nm(fitsRaw, 'budgetMin'),
    },
    integrations: arr('integrations'),
    expectedRoi: {
      timeSavedHoursPerMonth: nm(roiRaw, 'timeSavedHoursPerMonth'),
      monthlyCostSaved:       nm(roiRaw, 'monthlyCostSaved'),
      paybackMonths:          nm(roiRaw, 'paybackMonths'),
    },
    pricing: {
      model:           sm(pricingRaw, 'model') as AgentCatalogEntry['pricing']['model'],
      stripeProductId: sm(pricingRaw, 'stripeProductId') || null,
      installPrice:    nm(pricingRaw, 'installPrice'),
      monthlyPrice:    nm(pricingRaw, 'monthlyPrice'),
    },
    minPlan:                  str('minPlan')                  as AgentCatalogEntry['minPlan'],
    tokenUsageProfile:        str('tokenUsageProfile')        as AgentCatalogEntry['tokenUsageProfile'],
    implementationComplexity: str('implementationComplexity') as AgentCatalogEntry['implementationComplexity'],
    badges:                   arr('badges'),
    affiliateUrl:             str('affiliateUrl'),
    status:                   str('status')                   as AgentStatus,
    schemaVersion:            1,
    createdAt:                str('createdAt'),
    updatedAt:                str('updatedAt'),
  };
}

/* ── GET /api/agents ────────────────────────────────────────── */

agents.get('/api/agents', requireAuth(), requireRole(READ_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  const industry    = c.req.query('industry');
  const integration = c.req.query('integration');
  const minPlan     = c.req.query('minPlan');
  const source      = c.req.query('source');
  const limit       = Math.min(parseInt(c.req.query('limit') ?? '50', 10) || 50, 200);

  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccount;
  const accessToken = await getAccessToken(sa);
  const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/agents?pageSize=${limit}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return c.json({ agents: [], total: 0 });
  const data = await res.json() as { documents?: Array<{ name: string; fields?: Record<string, unknown> }> };

  let list: AgentCatalogEntry[] = [];
  for (const doc of data.documents ?? []) {
    const decoded = decodeAgentDoc(doc.fields);
    if (decoded && decoded.status === 'active') list.push(decoded);
  }

  if (industry)    list = list.filter(a => a.fits.industries.includes(industry) || a.fits.industries.includes('all'));
  if (integration) list = list.filter(a => a.integrations.includes(integration));
  if (minPlan)     list = list.filter(a => a.minPlan === minPlan);
  if (source)      list = list.filter(a => a.source  === source);

  return c.json({ agents: list, total: list.length });
});

/* ── GET /api/agents/lookup?id=... ──────────────────────────
   Single-agent lookup uses query string. Handler extracted to a named
   const so the inline `async c =>` arrow doesn't compound chained type
   inference. */

const lookupHandler = async (c: import('hono').Context<AppEnv>) => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  const id = c.req.query('id') ?? '';
  if (!id) return c.json({ error: 'id query parameter required', code: 'INVALID_BODY' }, 400);
  if (!/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(id)) {
    return c.json({ error: 'Invalid agentId', code: 'INVALID_AGENT_ID' }, 400);
  }
  const doc = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `agents/${id}`);
  if (!doc) return c.json({ error: 'Agent not found', code: 'NOT_FOUND' }, 404);
  if (doc.status !== 'active') return c.json({ error: 'Agent not found', code: 'NOT_FOUND' }, 404);
  return c.json(doc);
};

// TS2589 workaround: Hono's chained route-type inference accumulates
// across registrations on this file (4-element role arrays + multiple
// middleware + Hono v4 router type). Suppressing the compile-time depth
// error here is safe — runtime route registration works identically and
// requireRole still enforces the role gate at request time.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error TS2589 — intentional: see comment above
agentsLookup.get('/api/agents/lookup', requireAuth(), requireRole(READ_ROLES), lookupHandler);
agents.route('/', agentsLookup);

/* ── POST /api/agents/admin/seed (owner + TOKEN_DEBUG) ──────── */

agents.post('/api/agents/admin/seed', requireAuth(), requireRole(ADMIN_ROLES), async c => {
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
  const force = c.req.query('force') === 'true';
  const now = new Date().toISOString();

  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];
  const errors:  Array<{ agentId: string; reason: string }> = [];

  for (const seed of AILUNAPRO_AGENT_SEED) {
    const validationError = validateAgent(seed);
    if (validationError) {
      errors.push({ agentId: seed.agentId, reason: validationError });
      continue;
    }
    const path = `agents/${seed.agentId}`;
    const payload = { ...seed, createdAt: now, updatedAt: now } as unknown as Parameters<typeof firestoreSet>[2];
    try {
      await firestoreCreateIfNotExists(env.FIREBASE_SERVICE_ACCOUNT_JSON, path, payload);
      created.push(seed.agentId);
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_EXISTS') {
        if (force) {
          await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, path, {
            ...(seed as unknown as Parameters<typeof firestoreSet>[2]),
            updatedAt: now,
          }, { merge: true });
          updated.push(seed.agentId);
        } else {
          skipped.push(seed.agentId);
        }
      } else {
        errors.push({ agentId: seed.agentId, reason: err instanceof Error ? err.message : 'unknown' });
      }
    }
  }

  dlog(env, '[agents] seed —', { created: created.length, updated: updated.length, skipped: skipped.length, errors: errors.length });
  return c.json({ ok: true, created, updated, skipped, errors });
});

/* ── POST /api/agents/admin/upsert (owner) ──────────────────── */

agents.post('/api/agents/admin/upsert', requireAuth(), requireRole(ADMIN_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const validationError = validateAgent(body);
  if (validationError) return c.json({ error: validationError, code: 'INVALID_AGENT' }, 400);

  const a = body as AgentCatalogEntry;
  const now = new Date().toISOString();
  const existing = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `agents/${a.agentId}`);
  const payload = {
    ...a,
    createdAt: typeof existing?.createdAt === 'string' ? existing.createdAt : now,
    updatedAt: now,
  };
  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, `agents/${a.agentId}`, payload as unknown as Parameters<typeof firestoreSet>[2]);
  return c.json({ ok: true, agent: payload, created: !existing });
});

/* ── POST /api/agents/admin/archive (owner) ────────────────── */

agents.post('/api/agents/admin/archive', requireAuth(), requireRole(ADMIN_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }
  let body: { agentId?: string };
  try { body = await c.req.json(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  if (!body.agentId || typeof body.agentId !== 'string') {
    return c.json({ error: 'agentId required', code: 'INVALID_BODY' }, 400);
  }
  const path = `agents/${body.agentId}`;
  const existing = await firestoreGet(env.FIREBASE_SERVICE_ACCOUNT_JSON, path);
  if (!existing) return c.json({ error: 'Agent not found', code: 'NOT_FOUND' }, 404);

  await firestoreSet(env.FIREBASE_SERVICE_ACCOUNT_JSON, path, {
    status:    'archived',
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return c.json({ ok: true });
});

export default agents;
