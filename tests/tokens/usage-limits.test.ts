import { describe, it, expect } from 'vitest';
import { decideOverflow, includedFor, planLimitsEnabled } from '../../worker/src/lib/usage-limits';

/*
 * Part 6 — plan-limit → token-overflow decision logic (PREPARED, INACTIVE).
 * Guards the core rule: within plan = FREE, beyond plan = tokens; and that with the
 * flag OFF nothing is ever charged (system ready but inactive).
 */
describe('usage-limits: plan-limit → token-overflow decision', () => {
  it('flag OFF → never enforced, never charges (inactive default)', () => {
    const d = decideOverflow('starter', 'audit.full', 9999, false);
    expect(d.enforced).toBe(false);
    expect(d.shouldCharge).toBe(false);
    expect(d.withinLimit).toBe(true);
  });

  it('flag ON, within plan → free', () => {
    const d = decideOverflow('starter', 'audit.full', 14, true); // 15 included, 14 used → 15th is free
    expect(d.enforced).toBe(true);
    expect(d.withinLimit).toBe(true);
    expect(d.shouldCharge).toBe(false);
  });

  it('flag ON, at/over plan → charge tokens (overflow)', () => {
    const d = decideOverflow('starter', 'audit.full', 15, true); // 15 used, 16th → overflow
    expect(d.withinLimit).toBe(false);
    expect(d.shouldCharge).toBe(true);
  });

  it('unlimited plan (-1) never charges even when enforced', () => {
    const d = decideOverflow('enterprise', 'recommendation.run', 100000, true);
    expect(d.included).toBe(-1);
    expect(d.withinLimit).toBe(true);
    expect(d.shouldCharge).toBe(false);
  });

  it('included allowances match the plan model (3/15/30/90 audits)', () => {
    expect(includedFor('free', 'audit.full')).toBe(3);
    expect(includedFor('starter', 'audit.full')).toBe(15);
    expect(includedFor('professional', 'audit.full')).toBe(30);
    expect(includedFor('enterprise', 'audit.full')).toBe(90);
    expect(includedFor('unknown-plan', 'audit.full')).toBe(3); // Free fallback
  });

  it('planLimitsEnabled reads the env flag, default OFF', () => {
    expect(planLimitsEnabled({})).toBe(false);
    expect(planLimitsEnabled({ ENABLE_PLAN_LIMITS: 'false' })).toBe(false);
    expect(planLimitsEnabled({ ENABLE_PLAN_LIMITS: 'true' })).toBe(true);
  });
});
