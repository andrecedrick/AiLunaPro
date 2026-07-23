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
import { enforceUsageLimit, recommendationChargeEnabledFor } from '../lib/usage-limits';
import { resolveBillingConfig } from '../lib/billing-config-store';
import type { AppEnv } from '../index';

const recommend = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const READ_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];

/** Stable, deterministic id from the profile so identical re-submits don't double-charge. */
function hashProfile(profile: unknown): string {
  const s = JSON.stringify(profile ?? {});
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

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

  // Phase 3: plan-limit → token-overflow enforcement. INERT unless ENABLE_PLAN_LIMITS
  // === 'true' (then enforce.mode === 'disabled', allowed, no count, no charge → the
  // existing free behavior is byte-for-byte preserved). When enforced: within the
  // plan's monthly allowance = FREE; Free plan over limit = upgrade-required (NO
  // charge); paid plan over limit = tokens — but recommendation overflow BILLING is
  // additionally gated by ENABLE_RECOMMENDATION_CHARGE (prepared, default OFF → over
  // limit stays free for now). Idempotent per eventId.
  const uid   = c.get('uid')   as string;
  const orgId = c.get('orgId') as string;
  const supplied = (body as { eventId?: unknown }).eventId;
  const eventId = (typeof supplied === 'string' && supplied)
    ? supplied.replace(/[^a-zA-Z0-9_:-]/g, '').slice(0, 80)
    : `reco_${uid}_${hashProfile(check.profile)}`;
  // Phase 6 — overflow billing is CONTROLLED per-org: requires the flag AND this org
  // in the charge allowlist (or '*'). Empty allowlist = charge nobody (fail-safe).
  // Even '*' only bills orgs that are also enforced (enforced ∩ charge).
  //
  // Scope now comes from the Firestore-authoritative billing config (survives worker
  // rollbacks), NOT wrangler.toml. Self-seeds from committed defaults on first read.
  const billingScope = await resolveBillingConfig(env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  const chargeOnOverflow = recommendationChargeEnabledFor(billingScope, orgId);
  const enforce = await enforceUsageLimit(env.FIREBASE_SERVICE_ACCOUNT_JSON!, billingScope, orgId, 'recommendation.run', uid, eventId, chargeOnOverflow);
  if (!enforce.allowed) {
    const upgrade = enforce.mode === 'upgrade-required';
    return c.json({
      error: upgrade ? 'Monthly recommendation limit reached — upgrade to continue.' : 'Not enough tokens for overflow.',
      code:  upgrade ? 'UPGRADE_REQUIRED' : 'INSUFFICIENT_TOKENS',
      mode:  enforce.mode, used: enforce.used, limit: enforce.limit,
      ...(enforce.balance !== undefined ? { balance: enforce.balance, required: enforce.required } : {}),
    }, upgrade ? 403 : 402);
  }

  return c.json({ ...result, usage: { mode: enforce.mode, charged: enforce.charged, used: enforce.used, limit: enforce.limit } });
});

export default recommend;
