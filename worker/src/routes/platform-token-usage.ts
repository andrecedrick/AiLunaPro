/**
 * Platform token-usage aggregates (Phase 4 — token economy observability).
 *
 *   GET /api/platform/token-usage
 *   Auth + platform-admin required. Returns READ-ONLY CROSS-ORG AGGREGATES:
 *     - byAction: per action → events, tokens, free/included/overflow/legacy split,
 *                 distinct org count
 *     - totals:   same shape across all actions + distinct orgs overall
 *
 * PRIVACY: aggregates only. NO emails, NO names, NO uids, and no per-org rows —
 * organizations are counted, never listed. Mirrors the no-PII policy already used
 * by /api/platform/metrics.
 *
 * Bounded scan (SCAN_CAP) so one call can never walk an unbounded collection
 * group; `capped: true` tells the operator the numbers are a lower bound.
 * 60s in-memory cache per isolate.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePlatformAdmin } from '../lib/platformAdmin';
import { firestoreRunQuery } from '../lib/firestoreAdmin';
import { isUsageMode } from '../lib/token-costs';
import type { AppEnv } from '../index';

const platformTokenUsage = new Hono<AppEnv>();

/** Hard cap on usage docs scanned per call (bounds Firestore read cost). */
const SCAN_CAP = 5000;
const CACHE_TTL_MS = 60_000;

type Mode = 'free' | 'included' | 'overflow' | 'unknown';

interface ActionBucket {
  action:   string;
  count:    number;
  tokens:   number;
  free:     number;
  included: number;
  overflow: number;
  unknown:  number;
  orgs:     number;
}

interface TokenUsagePayload {
  byAction:    ActionBucket[];
  totals:      { count: number; tokens: number; free: number; included: number; overflow: number; unknown: number; orgs: number };
  scanned:     number;
  capped:      boolean;
  generatedAt: number;
}

let cache: { value: TokenUsagePayload; exp: number } | null = null;

/** organizations/{orgId}/tokens/current/usage/{eventId} → orgId ('' if unparseable). */
function orgIdFromDocName(name: string): string {
  const parts = name.split('/');
  const i = parts.lastIndexOf('organizations');
  return i >= 0 && parts.length > i + 1 ? parts[i + 1] : '';
}

function modeOf(raw: unknown): Mode {
  return isUsageMode(raw) ? raw : 'unknown';
}

async function computeTokenUsage(saJson: string): Promise<TokenUsagePayload> {
  // CollectionGroup over every organizations/*/tokens/current/usage subcollection.
  const docs = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'usage', allDescendants: true }],
    limit: SCAN_CAP,
  });

  const buckets = new Map<string, ActionBucket>();
  const orgsPerAction = new Map<string, Set<string>>();
  const allOrgs = new Set<string>();
  const totals = { count: 0, tokens: 0, free: 0, included: 0, overflow: 0, unknown: 0, orgs: 0 };

  for (const d of docs) {
    // Defensive: the collection group could match a same-named subcollection
    // elsewhere; only count docs on the canonical token-ledger path.
    if (!d.name.includes('/tokens/current/usage/')) continue;

    const f      = d.fields;
    const action = f.action ? String(f.action) : 'unknown';
    const tokens = Number(f.tokens ?? 0) || 0;
    const mode   = modeOf(f.mode);
    const orgId  = orgIdFromDocName(d.name);

    let b = buckets.get(action);
    if (!b) {
      b = { action, count: 0, tokens: 0, free: 0, included: 0, overflow: 0, unknown: 0, orgs: 0 };
      buckets.set(action, b);
      orgsPerAction.set(action, new Set<string>());
    }
    b.count  += 1;
    b.tokens += tokens;
    b[mode]  += 1;
    if (orgId) {
      orgsPerAction.get(action)!.add(orgId);
      allOrgs.add(orgId);
    }

    totals.count  += 1;
    totals.tokens += tokens;
    totals[mode]  += 1;
  }

  for (const [action, set] of orgsPerAction) {
    const b = buckets.get(action);
    if (b) b.orgs = set.size;
  }
  totals.orgs = allOrgs.size;

  return {
    // Sorted desc by tokens then events — the head of this list IS "top actions".
    byAction: [...buckets.values()].sort((a, b) => b.tokens - a.tokens || b.count - a.count),
    totals,
    scanned:     totals.count,
    capped:      docs.length === SCAN_CAP,
    generatedAt: Date.now(),
  };
}

platformTokenUsage.get('/api/platform/token-usage', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  const now = Date.now();
  if (cache && cache.exp > now) return c.json(cache.value);

  try {
    const value = await computeTokenUsage(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    cache = { value, exp: now + CACHE_TTL_MS };
    return c.json(value);
  } catch (err) {
    console.warn('[platform-token-usage] aggregation failed:', err);
    return c.json({ error: 'Aggregation failed', code: 'AGGREGATION_FAILED' }, 502);
  }
});

export default platformTokenUsage;
