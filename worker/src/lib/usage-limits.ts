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
