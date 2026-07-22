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

/** Reads the global worker flag. Default OFF (any value other than the literal 'true'). */
export function planLimitsEnabled(env: { ENABLE_PLAN_LIMITS?: string }): boolean {
  return env.ENABLE_PLAN_LIMITS === 'true';
}

export interface PlanLimitsEnv { ENABLE_PLAN_LIMITS?: string; ENABLE_PLAN_LIMITS_ORGS?: string }

/**
 * Phase 4 — SCOPED activation. Enforcement applies to an org ONLY when:
 *   1. ENABLE_PLAN_LIMITS === 'true', AND
 *   2. the org is in the ENABLE_PLAN_LIMITS_ORGS allowlist (comma-separated orgIds),
 *      or the allowlist contains the literal '*' (explicit GLOBAL rollout).
 *
 * FAIL-SAFE: flag on but an EMPTY allowlist → enforce for NOBODY. This makes
 * accidental global activation impossible: going global requires deliberately
 * setting ENABLE_PLAN_LIMITS_ORGS='*'. Controlled rollout = list the test orgIds.
 */
export function planLimitsEnabledFor(env: PlanLimitsEnv, orgId: string): boolean {
  if (env.ENABLE_PLAN_LIMITS !== 'true') return false;
  const allow = (env.ENABLE_PLAN_LIMITS_ORGS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (allow.length === 0) return false;       // flag on, no scope → enforce nobody (fail-safe)
  if (allow.includes('*')) return true;       // explicit global rollout
  return allow.includes(orgId);               // test scope: only allowlisted orgs
}

export interface RecommendationChargeEnv {
  ENABLE_RECOMMENDATION_CHARGE?:      string;
  ENABLE_RECOMMENDATION_CHARGE_ORGS?: string;
}

/**
 * Phase 6 — CONTROLLED overflow BILLING scope for recommendation.run.
 *
 * Charging an org's paid overflow requires ALL of:
 *   1. ENABLE_RECOMMENDATION_CHARGE === 'true', AND
 *   2. the org is in ENABLE_RECOMMENDATION_CHARGE_ORGS (comma-separated orgIds),
 *      or the list contains the literal '*' (explicit GLOBAL billing), AND
 *   3. (enforced upstream, not here) planLimitsEnabledFor(env, orgId) is true —
 *      enforceUsageLimit short-circuits to mode:'disabled' before the charge
 *      branch when an org isn't enforced, so the EFFECTIVE billed set is always
 *      `enforced ∩ charge-allowlist`. Billing can NEVER exceed enforcement.
 *
 * FAIL-SAFE (mirrors planLimitsEnabledFor): flag on but an EMPTY allowlist →
 * charge NOBODY. Accidental global billing is impossible: going global requires
 * DELIBERATELY setting ENABLE_RECOMMENDATION_CHARGE_ORGS='*'. Controlled rollout =
 * list the test orgIds. With the flag unset (default) this returns false → paid
 * overflow stays mode:'overflow-free' (detected, never billed).
 */
export function recommendationChargeEnabledFor(env: RecommendationChargeEnv, orgId: string): boolean {
  if (env.ENABLE_RECOMMENDATION_CHARGE !== 'true') return false;
  const allow = (env.ENABLE_RECOMMENDATION_CHARGE_ORGS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (allow.length === 0) return false;       // flag on, no scope → charge nobody (fail-safe)
  if (allow.includes('*')) return true;       // explicit global billing rollout
  return allow.includes(orgId);               // controlled scope: only allowlisted orgs
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
  env: PlanLimitsEnv,
  orgId: string,
  action: MeteredAction,
  uid: string,
  eventId: string,
  chargeOnOverflow: boolean,
): Promise<EnforceResult> {
  // SCOPED: inert unless the flag is on AND this org is in the allowlist (or '*').
  if (!planLimitsEnabledFor(env, orgId)) {
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
    const charge = await consumeTokens(saJson, orgId, action, uid, `overflow_${eventId}`, { overflow: true, month }, 'overflow');
    if (!charge.ok) {
      return { enforced: true, allowed: false, mode: 'insufficient', charged: 0, used: count, limit: decision.included, plan, balance: charge.balance, required: charge.required };
    }
    charged = charge.tokensConsumed || TOKEN_COSTS[action];
  }

  // Increment usage once per eventId (marker dedup). Order = marker → increment, a
  // DELIBERATE conservative bias: if the process dies between them, a retry sees the
  // marker and skips the increment → the counter UNDER-counts by 1 (org gets one extra
  // free use later). The token charge stays idempotent on overflow_{eventId}, so this
  // NEVER double-charges and never over-charges. Exactly-once would need a Firestore
  // transaction over (counter + marker), which the REST helpers don't expose — deferred;
  // the under-count bias is the user-safe choice for a controlled rollout.
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
