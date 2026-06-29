/**
 * usage-limits.ts — PREPARED, INACTIVE (Part 6: plan-limit → token-overflow).
 *
 * Model: usage WITHIN a plan's included monthly allowance is FREE; usage BEYOND it
 * draws tokens (overflow). Subscriptions give base access; tokens are a supplement
 * ONLY — never charged inside plan limits.
 *
 * STATUS: not wired into any route, and gated by the worker env flag
 * ENABLE_PLAN_LIMITS. With the flag unset (default) `decideOverflow` always returns
 * enforced:false / shouldCharge:false → no limits enforced, nothing charged, ZERO
 * behavior change. Activation (count persistence + route wiring + charge) is a later
 * phase, and must NOT precede: limits enforced + value understood + UX validated.
 */

import {
  firestoreGet, firestoreGetWithMeta, firestoreSetIfMatch, firestoreCreateIfNotExists,
} from './firestoreAdmin';
import { consumeTokens } from './tokens';
import { TOKEN_COSTS } from './token-costs';

export type MeteredAction = 'audit.full' | 'recommendation.run';

/**
 * Included allowance per plan per month. -1 = unlimited.
 * Audits mirror PLAN_CONFIGS.maxAuditsPerMonth (3 / 15 / 30 / 90).
 */
export const PLAN_INCLUDED: Record<string, Record<MeteredAction, number>> = {
  free:         { 'audit.full': 3,  'recommendation.run': 1 },
  starter:      { 'audit.full': 15, 'recommendation.run': 10 },
  professional: { 'audit.full': 30, 'recommendation.run': 50 },
  enterprise:   { 'audit.full': 90, 'recommendation.run': -1 },
};

/** Included monthly allowance for a plan+action (Free fallback for unknown plans). */
export function includedFor(plan: string | null | undefined, action: MeteredAction): number {
  const key = (plan ?? 'free').toLowerCase();
  return PLAN_INCLUDED[key]?.[action] ?? PLAN_INCLUDED.free[action];
}

export interface OverflowDecision {
  enforced:     boolean; // false when the flag is OFF → caller treats the action as free
  included:     number;  // monthly allowance (-1 = unlimited)
  withinLimit:  boolean; // this use is covered by the plan
  shouldCharge: boolean; // true ONLY when enforced AND over the included allowance
}

/**
 * Pure decision: given the plan, action, this month's prior count, and whether
 * ENABLE_PLAN_LIMITS is on, decide whether the NEXT use is free (within plan) or
 * must spend tokens (overflow). Persisting the count, incrementing, and calling
 * consumeTokens is the caller's responsibility (future wiring).
 *
 *   IF usage <= plan limit  → FREE      (shouldCharge: false)
 *   IF usage  > plan limit  → USE TOKENS (shouldCharge: true)
 */
export function decideOverflow(
  plan: string | null | undefined,
  action: MeteredAction,
  monthlyCountBefore: number,
  flagEnabled: boolean,
): OverflowDecision {
  const included = includedFor(plan, action);
  if (!flagEnabled) {
    // Inactive: limits not enforced — everything free, nothing charged.
    return { enforced: false, included, withinLimit: true, shouldCharge: false };
  }
  const unlimited  = included === -1;
  const withinLimit = unlimited || monthlyCountBefore < included;
  return { enforced: true, included, withinLimit, shouldCharge: !withinLimit };
}

/** Reads the worker env flag. Default OFF (any value other than the literal 'true'). */
export function planLimitsEnabled(env: { ENABLE_PLAN_LIMITS?: string }): boolean {
  return env.ENABLE_PLAN_LIMITS === 'true';
}

/* ── Enforcement (I/O) — Phase 3 ──────────────────────────────────────────────
 * All of the below is INERT unless ENABLE_PLAN_LIMITS === 'true'. With the flag
 * off, enforceUsageLimit() short-circuits to { allowed:true, mode:'disabled' } and
 * writes nothing — existing flows are byte-for-byte unchanged.
 * ──────────────────────────────────────────────────────────────────────────── */

const FIELD: Record<MeteredAction, 'auditsUsed' | 'recommendationsUsed'> = {
  'audit.full':         'auditsUsed',
  'recommendation.run': 'recommendationsUsed',
};

/** Current usage month key, e.g. "2026-06" (worker runtime — Date is available). */
export function monthKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

const USAGE_PATH = (orgId: string, month: string) =>
  `organizations/${orgId}/usage/${month}`;
const EVENT_PATH = (orgId: string, month: string, eventId: string) =>
  `organizations/${orgId}/usageEvents/${month}__${eventId}`;
const BALANCE_PATH = (orgId: string) => `organizations/${orgId}/tokens/current`;

/** Reverse-map the persisted monthlyAllocation (set by syncBalanceAllocation) → plan tier. */
export function planFromAllocation(allocation: number): string {
  if (allocation >= 100_000) return 'enterprise';
  if (allocation >= 10_000)  return 'professional';
  if (allocation >= 1_000)   return 'starter';
  return 'free';
}

/** Resolve an org's plan from its token balance doc (Free fallback — the strictest). */
export async function resolveOrgPlan(saJson: string, orgId: string): Promise<string> {
  try {
    const doc = await firestoreGet(saJson, BALANCE_PATH(orgId));
    const alloc = doc && typeof doc.monthlyAllocation !== 'undefined' ? Number(doc.monthlyAllocation) : 100;
    return planFromAllocation(Number.isFinite(alloc) ? alloc : 100);
  } catch {
    return 'free';
  }
}

export interface MonthlyUsage { auditsUsed: number; recommendationsUsed: number; }

export async function readMonthlyUsage(saJson: string, orgId: string, month = monthKey()): Promise<MonthlyUsage> {
  const doc = await firestoreGet(saJson, USAGE_PATH(orgId, month));
  const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };
  return { auditsUsed: n(doc?.auditsUsed), recommendationsUsed: n(doc?.recommendationsUsed) };
}

/** Atomic +1 on a usage field with optimistic concurrency (mirrors incrementBalance). */
async function incrementUsage(saJson: string, orgId: string, month: string, action: MeteredAction): Promise<void> {
  const path = USAGE_PATH(orgId, month);
  const field = FIELD[action];
  for (let attempt = 0; attempt < 3; attempt++) {
    const meta = await firestoreGetWithMeta(saJson, path);
    if (!meta) {
      try {
        await firestoreCreateIfNotExists(saJson, path, {
          auditsUsed: action === 'audit.full' ? 1 : 0,
          recommendationsUsed: action === 'recommendation.run' ? 1 : 0,
          month, updatedAt: new Date().toISOString(),
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.message === 'ALREADY_EXISTS') continue;
        throw err;
      }
    }
    const cur = Number((meta.data as Record<string, unknown>)[field]) || 0;
    try {
      await firestoreSetIfMatch(saJson, path, { [field]: cur + 1, updatedAt: new Date().toISOString() }, meta.updateTime, { merge: true });
      return;
    } catch (err) {
      if (err instanceof Error && err.message === 'PRECONDITION_FAILED') continue;
      throw err;
    }
  }
  throw new Error('incrementUsage: optimistic concurrency exhausted');
}

export type UsageMode =
  | 'disabled'          // flag off — not enforced
  | 'included'          // within plan allowance → free
  | 'overflow-free'     // over limit, paid plan, charge not yet active → still free
  | 'overflow-charge'   // over limit, paid plan, charged tokens
  | 'upgrade-required'  // over limit, Free plan → must upgrade (no token overflow)
  | 'insufficient';     // over limit, charge attempted, not enough tokens

/**
 * PURE classification: given whether the use is within the plan, the plan, and
 * whether overflow billing is active for this action, decide what should happen.
 * (No I/O — fully unit-tested.)
 */
export function classifyOverflow(
  plan: string,
  withinLimit: boolean,
  chargeOnOverflow: boolean,
): { mode: Exclude<UsageMode, 'disabled' | 'insufficient'>; allowed: boolean; shouldCharge: boolean } {
  if (withinLimit) return { mode: 'included', allowed: true, shouldCharge: false };
  if ((plan ?? 'free').toLowerCase() === 'free') {
    return { mode: 'upgrade-required', allowed: false, shouldCharge: false }; // Free: no overflow, must upgrade
  }
  if (chargeOnOverflow) return { mode: 'overflow-charge', allowed: true, shouldCharge: true };
  return { mode: 'overflow-free', allowed: true, shouldCharge: false }; // charge prepared but inactive
}

export interface EnforceResult {
  enforced: boolean;
  allowed:  boolean;
  mode:     UsageMode;
  charged:  number;
  used:     number;   // count for this action AFTER this call (if allowed)
  limit:    number;   // -1 = unlimited
  plan:     string;
  balance?: number;   // present on 'insufficient'
  required?: number;
}

/**
 * Enforce the plan-limit → token-overflow rule for one metered action.
 *
 *   IF usage <= plan limit → FREE (increment usage)
 *   IF usage  > plan limit → Free plan blocked (upgrade); paid plan → tokens (if
 *                            chargeOnOverflow), else still free (charge inactive)
 *
 * Idempotent per eventId: the token charge (consumeTokens) and the usage increment
 * are each deduped, so a retry of the same eventId never double-charges or
 * double-counts. INERT when ENABLE_PLAN_LIMITS is off.
 */
export async function enforceUsageLimit(
  saJson: string,
  env: { ENABLE_PLAN_LIMITS?: string },
  orgId: string,
  action: MeteredAction,
  uid: string,
  eventId: string,
  chargeOnOverflow: boolean,
): Promise<EnforceResult> {
  if (!planLimitsEnabled(env)) {
    return { enforced: false, allowed: true, mode: 'disabled', charged: 0, used: 0, limit: includedFor('free', action), plan: 'free' };
  }
  const month = monthKey();
  const plan  = await resolveOrgPlan(saJson, orgId);
  const usage = await readMonthlyUsage(saJson, orgId, month);
  const count = usage[FIELD[action]];
  const decision = decideOverflow(plan, action, count, true);
  const cls = classifyOverflow(plan, decision.withinLimit, chargeOnOverflow);

  // Blocked (Free over limit) — no charge, no increment.
  if (!cls.allowed) {
    return { enforced: true, allowed: false, mode: cls.mode, charged: 0, used: count, limit: decision.included, plan };
  }

  // Paid overflow charge — charge FIRST (idempotent), bail on insufficient before counting.
  let charged = 0;
  if (cls.shouldCharge) {
    const charge = await consumeTokens(saJson, orgId, action, uid, `overflow_${eventId}`, { overflow: true, month });
    if (!charge.ok) {
      return { enforced: true, allowed: false, mode: 'insufficient', charged: 0, used: count, limit: decision.included, plan, balance: charge.balance, required: charge.required };
    }
    charged = charge.tokensConsumed || TOKEN_COSTS[action];
  }

  // Increment usage once per eventId (marker dedup).
  let firstTime = true;
  try {
    await firestoreCreateIfNotExists(saJson, EVENT_PATH(orgId, month, eventId), { action, at: new Date().toISOString() });
  } catch (err) {
    if (err instanceof Error && err.message === 'ALREADY_EXISTS') firstTime = false;
    else throw err;
  }
  if (firstTime) await incrementUsage(saJson, orgId, month, action);

  return { enforced: true, allowed: true, mode: cls.mode, charged, used: count + (firstTime ? 1 : 0), limit: decision.included, plan };
}
