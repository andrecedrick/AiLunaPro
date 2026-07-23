/**
 * Usage route — Phase 3 (plan-limit visibility).
 *
 *   GET /api/usage/current  — auth + role gated (owner/admin/billing/member).
 *
 * Returns this month's metered usage vs the plan's included allowance so the UI can
 * show "X / Y audits this month". Read-only — never charges. `enforced` reflects the
 * ENABLE_PLAN_LIMITS flag (false → counts stay 0 because nothing is being counted yet).
 */
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { resolveOrgPlan, readMonthlyUsage, includedFor, planLimitsEnabledFor, monthKey } from '../lib/usage-limits';
import { resolveBillingConfig } from '../lib/billing-config-store';
import type { AppEnv } from '../index';

const usage = new Hono<AppEnv>();
type RoleList = Parameters<typeof requireRole>[0];
const READ_ROLES: RoleList = ['owner', 'admin', 'billing', 'member'];

usage.get('/api/usage/current', requireAuth(), requireRole(READ_ROLES), async c => {
  const env = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const sa = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!sa) return c.json({ error: 'Firestore is not configured', code: 'FIRESTORE_NOT_CONFIGURED' }, 503);

  const orgId = c.get('orgId') as string;
  const month = monthKey();
  // Scope now comes from Firestore config (not env) — see billing-config-store.ts.
  const [plan, used, billingScope] = await Promise.all([
    resolveOrgPlan(sa, orgId),
    readMonthlyUsage(sa, orgId, month),
    resolveBillingConfig(sa),
  ]);

  return c.json({
    enforced: planLimitsEnabledFor(billingScope, orgId),
    month,
    plan,
    audits:          { used: used.auditsUsed,          limit: includedFor(plan, 'audit.full') },
    recommendations: { used: used.recommendationsUsed, limit: includedFor(plan, 'recommendation.run') },
  });
});

export default usage;
