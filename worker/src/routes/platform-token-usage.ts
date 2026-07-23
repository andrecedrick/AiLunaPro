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
import { rollupMonthKey } from '../lib/token-rollups';
import type { AppEnv } from '../index';

const platformTokenUsage = new Hono<AppEnv>();

/** Raw-scan fallback cap (only hit for pre-rollup months). */
const SCAN_CAP = 5000;
/** Rollup docs = one per org per month; cap is an org-count backstop, not events. */
const ROLLUP_SCAN_CAP = 10_000;
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
  source:      'rollup' | 'scan';
  month?:      string;
  generatedAt: number;
}

const cache = new Map<string, { value: TokenUsagePayload; exp: number }>();

/** organizations/{orgId}/tokens/current/{usage|rollups}/{id} → orgId ('' if unparseable). */
function orgIdFromDocName(name: string): string {
  const parts = name.split('/');
  const i = parts.lastIndexOf('organizations');
  return i >= 0 && parts.length > i + 1 ? parts[i + 1] : '';
}

function modeOf(raw: unknown): Mode {
  return isUsageMode(raw) ? raw : 'unknown';
}

/**
 * ROLLUP path — one doc per org for the month, so cost scales with ORG count,
 * not event count. Reads organizations/*​/tokens/current/rollups/{month} via a
 * collection-group query filtered by the `month` field. Returns null when no
 * rollup exists for the month (pre-rollup data) so the caller can fall back to
 * the raw scan and never lose history.
 */
async function computeFromRollups(saJson: string, month: string): Promise<TokenUsagePayload | null> {
  const docs = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'rollups', allDescendants: true }],
    where: { fieldFilter: { field: { fieldPath: 'month' }, op: 'EQUAL', value: { stringValue: month } } },
    limit: ROLLUP_SCAN_CAP,
  });

  const relevant = docs.filter(d => d.name.includes('/tokens/current/rollups/'));
  if (relevant.length === 0) return null;

  const buckets = new Map<string, ActionBucket>();
  const orgsPerAction = new Map<string, Set<string>>();
  const allOrgs = new Set<string>();
  const totals = { count: 0, tokens: 0, free: 0, included: 0, overflow: 0, unknown: 0, orgs: 0 };

  for (const d of relevant) {
    const orgId = orgIdFromDocName(d.name);
    const actions = (d.fields.actions ?? {}) as Record<string, Record<string, unknown>>;
    for (const [action, a] of Object.entries(actions)) {
      const count    = Number(a.count ?? 0) || 0;
      const tokens   = Number(a.tokens ?? 0) || 0;
      const free     = Number(a.free ?? 0) || 0;
      const included = Number(a.included ?? 0) || 0;
      const overflow = Number(a.overflow ?? 0) || 0;

      let b = buckets.get(action);
      if (!b) {
        b = { action, count: 0, tokens: 0, free: 0, included: 0, overflow: 0, unknown: 0, orgs: 0 };
        buckets.set(action, b);
        orgsPerAction.set(action, new Set<string>());
      }
      b.count += count; b.tokens += tokens; b.free += free; b.included += included; b.overflow += overflow;
      if (orgId && count > 0) orgsPerAction.get(action)!.add(orgId);

      totals.count += count; totals.tokens += tokens;
      totals.free += free; totals.included += included; totals.overflow += overflow;
    }
    if (orgId) allOrgs.add(orgId);
  }

  for (const [action, set] of orgsPerAction) {
    const b = buckets.get(action);
    if (b) b.orgs = set.size;
  }
  totals.orgs = allOrgs.size;

  return {
    byAction: [...buckets.values()].sort((a, b) => b.tokens - a.tokens || b.count - a.count),
    totals,
    scanned:     relevant.length,      // docs read = org count, not event count
    capped:      relevant.length === ROLLUP_SCAN_CAP,
    source:      'rollup',
    month,
    generatedAt: Date.now(),
  };
}

/** Legacy RAW-SCAN path — retained as the fallback for months with no rollups. */
async function computeFromScan(saJson: string): Promise<TokenUsagePayload> {
  const docs = await firestoreRunQuery(saJson, {
    from:  [{ collectionId: 'usage', allDescendants: true }],
    limit: SCAN_CAP,
  });

  const buckets = new Map<string, ActionBucket>();
  const orgsPerAction = new Map<string, Set<string>>();
  const allOrgs = new Set<string>();
  const totals = { count: 0, tokens: 0, free: 0, included: 0, overflow: 0, unknown: 0, orgs: 0 };

  for (const d of docs) {
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
    b.count += 1; b.tokens += tokens; b[mode] += 1;
    if (orgId) { orgsPerAction.get(action)!.add(orgId); allOrgs.add(orgId); }

    totals.count += 1; totals.tokens += tokens; totals[mode] += 1;
  }

  for (const [action, set] of orgsPerAction) {
    const b = buckets.get(action);
    if (b) b.orgs = set.size;
  }
  totals.orgs = allOrgs.size;

  return {
    byAction: [...buckets.values()].sort((a, b) => b.tokens - a.tokens || b.count - a.count),
    totals,
    scanned:     totals.count,
    capped:      docs.length === SCAN_CAP,
    source:      'scan',
    generatedAt: Date.now(),
  };
}

async function computeTokenUsage(saJson: string, month: string): Promise<TokenUsagePayload> {
  // Rollup-first (O(orgs), no event cap). Fall back to the raw scan only when the
  // month has no rollups yet (pre-rollup history), so nothing is ever lost.
  const rollup = await computeFromRollups(saJson, month);
  return rollup ?? await computeFromScan(saJson);
}

platformTokenUsage.get('/api/platform/token-usage', requireAuth(), requirePlatformAdmin(), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };

  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);
  }

  // Default to the current UTC month; ?month=YYYY-MM for a specific month.
  const monthParam = c.req.query('month');
  const month = /^\d{4}-\d{2}$/.test(monthParam ?? '') ? monthParam! : rollupMonthKey();

  const now = Date.now();
  const hit = cache.get(month);
  if (hit && hit.exp > now) return c.json(hit.value);

  try {
    const value = await computeTokenUsage(env.FIREBASE_SERVICE_ACCOUNT_JSON, month);
    cache.set(month, { value, exp: now + CACHE_TTL_MS });
    return c.json(value);
  } catch (err) {
    console.warn('[platform-token-usage] aggregation failed:', err);
    return c.json({ error: 'Aggregation failed', code: 'AGGREGATION_FAILED' }, 502);
  }
});

export default platformTokenUsage;
