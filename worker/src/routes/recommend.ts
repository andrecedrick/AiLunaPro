/**
 * Recommendation Engine route — Phase K3A.
 *
 *   POST /api/recommend
 *
 * Auth required. Role-gated to owner/admin/billing/member (client → 403).
 * Pure compute — no Firestore writes. Reads active agents from
 * /agents collection via service account.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  validateProfile,
  computeRecommendations,
  type AgentForRecommendation,
  type RecommendationResult,
} from '../lib/recommendation';
import type { AppEnv } from '../index';

const recommend = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const READ_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];

/* ── Inline JWT helper (mirror agents.ts) ─────────────────── */

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
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
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

type FsField = { stringValue?: string; integerValue?: string; arrayValue?: { values?: Array<{ stringValue?: string }> }; mapValue?: { fields?: Record<string, FsField> } };

function decodeAgentForRecommendation(fields: Record<string, unknown> | undefined): AgentForRecommendation | null {
  if (!fields) return null;
  const f = fields as Record<string, FsField>;
  const str = (k: string): string => f[k]?.stringValue ?? '';
  const arr = (k: string): string[] => (f[k]?.arrayValue?.values ?? []).map(v => v.stringValue ?? '').filter(Boolean);
  const mapFields = (k: string): Record<string, FsField> => f[k]?.mapValue?.fields ?? {};

  const fits = mapFields('fits');
  const fitsArr = (k: string): string[] => {
    const v = fits[k];
    return (v?.arrayValue?.values ?? []).map(x => x.stringValue ?? '').filter(Boolean);
  };

  return {
    agentId:      str('agentId'),
    source:       str('source')  as AgentForRecommendation['source'],
    name:         str('name'),
    status:       str('status'),
    minPlan:      str('minPlan') as AgentForRecommendation['minPlan'],
    fits: {
      industries:  fitsArr('industries'),
      companySize: fitsArr('companySize') as AgentForRecommendation['fits']['companySize'],
    },
    integrations: arr('integrations'),
  };
}

interface RecommendBody {
  profile?: unknown;
}

/* ── POST /api/recommend ──────────────────────────────────── */

recommend.post('/api/recommend', requireAuth(), requireRole(READ_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  let body: RecommendBody;
  try { body = await c.req.json<RecommendBody>(); }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  // 1. Validate profile (each field optional; reject if all empty)
  const check = validateProfile(body.profile ?? {});
  if (!check.ok) {
    return c.json({ error: check.error, code: check.code }, 400);
  }
  if (!check.hasAnyField) {
    return c.json({
      error: 'Add at least one preference to personalize recommendations.',
      code:  'INVALID_PROFILE',
    }, 400);
  }

  // 2. Fetch active agents from /agents collection (service account)
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccount;
  const accessToken = await getAccessToken(sa);
  const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/agents?pageSize=200`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    console.error('[recommend] Firestore agents list failed:', res.status);
    return c.json({ error: 'Failed to load agents', code: 'AGENTS_FETCH_FAILED' }, 502);
  }
  const data = await res.json() as { documents?: Array<{ name: string; fields?: Record<string, unknown> }> };

  const agents: AgentForRecommendation[] = [];
  for (const doc of data.documents ?? []) {
    const decoded = decodeAgentForRecommendation(doc.fields);
    if (decoded && decoded.status === 'active') agents.push(decoded);
  }

  // 3. Compute (pure)
  const rankings = computeRecommendations(check.profile, agents);
  const result: RecommendationResult = { rankings };

  // No Firestore writes. No persistence.
  return c.json(result);
});

export default recommend;
