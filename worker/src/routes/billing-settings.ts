/**
 * Org bank-transfer settings (invoice fallback payment details).
 *
 *   GET /api/org/billing-settings?orgId=…   → current settings (or null)
 *   PUT /api/org/billing-settings            → validate + store
 *
 * Owner/admin only; orgId is the requireRole-verified org (no cross-org access).
 * Stored at organizations/{orgId}/settings/billing. No payment, no Stripe — this
 * is just the bank details the invoice email shows as a transfer option.
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { validateBankSettings } from '../lib/bank-details';
import type { AppEnv } from '../index';

const billingSettings = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const SETTINGS_ROLES: RoleList = ['owner', 'admin'];

const PATH = (orgId: string) => `organizations/${orgId}/settings/billing`;

billingSettings.get('/api/org/billing-settings', requireAuth(), requireRole(SETTINGS_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const doc = await firestoreGet(saJson, PATH(orgId)) as Record<string, unknown> | null;
  return c.json({ ok: true, settings: doc ?? null });
});

billingSettings.put('/api/org/billing-settings', requireAuth(), requireRole(SETTINGS_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;

  let body: Record<string, unknown>;
  try { body = await c.req.json() as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const result = validateBankSettings(body);
  if (!result.ok) return c.json({ error: 'Validation failed.', code: 'INVALID_BANK', errors: result.errors }, 400);

  await firestoreSet(saJson, PATH(orgId), {
    ...result.value,
    updatedAt: new Date().toISOString(),
  } as unknown as Parameters<typeof firestoreSet>[2]);

  return c.json({ ok: true, settings: result.value });
});

export default billingSettings;
