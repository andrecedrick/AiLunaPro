/**
 * Admin payment settings — Phase J1.3B (owner-only).
 *
 *   GET  /api/billing/admin/payment-settings?orgId=...
 *   POST /api/billing/admin/payment-settings
 *
 * Stored at organizations/{orgId}/billing_config/current.paymentSettings + .promotionSettings
 * Read by /api/billing/checkout to apply at session creation.
 *
 * portalSettings is read-only diagnostic from Stripe portal config (separate route).
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { firestoreGet, firestoreSet } from '../lib/firestoreAdmin';
import { stripSecrets } from '../lib/billing-admin-shared';
import type { AppEnv } from '../index';

const settings = new Hono<AppEnv>();

interface PaymentSettings {
  automaticPaymentMethods:  boolean;
  billingAddressCollection: 'auto' | 'required';
  taxIdCollection:          'off' | 'required';
  allowPromotionCodes:      boolean;
}

interface PromotionSettings {
  enabled: boolean;
}

const DEFAULT_PAYMENT: PaymentSettings = {
  automaticPaymentMethods:  true,
  billingAddressCollection: 'auto',
  taxIdCollection:          'off',
  allowPromotionCodes:      true,
};

const DEFAULT_PROMO: PromotionSettings = { enabled: true };

function isValidPaymentSettings(v: unknown): v is PaymentSettings {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return typeof s.automaticPaymentMethods === 'boolean'
      && (s.billingAddressCollection === 'auto' || s.billingAddressCollection === 'required')
      && (s.taxIdCollection === 'off' || s.taxIdCollection === 'required')
      && typeof s.allowPromotionCodes === 'boolean';
}

// ── GET ───────────────────────────────────────────────

settings.get('/api/billing/admin/payment-settings', requireAuth(), requireOwner(), async c => {
  const env   = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId = c.get('orgId') as string;

  const config = await firestoreGet(
    env.FIREBASE_SERVICE_ACCOUNT_JSON!,
    `organizations/${orgId}/billing_config/current`,
  );

  const paymentSettings   = (config?.paymentSettings   as PaymentSettings   | undefined) ?? DEFAULT_PAYMENT;
  const promotionSettings = (config?.promotionSettings as PromotionSettings | undefined) ?? DEFAULT_PROMO;
  const portalSettings    = (config?.portalSettings    as Record<string, unknown> | undefined) ?? {};

  return c.json({
    paymentSettings,
    promotionSettings,
    portalSettings,
  });
});

// ── POST ──────────────────────────────────────────────

interface UpdateBody {
  orgId:              string;
  paymentSettings?:   PaymentSettings;
  promotionSettings?: PromotionSettings;
}

settings.post('/api/billing/admin/payment-settings', requireAuth(), requireOwner(), async c => {
  const env   = c.env as AppEnv['Bindings'] & { FIREBASE_SERVICE_ACCOUNT_JSON?: string };
  const orgId = c.get('orgId') as string;
  const uid   = c.get('uid')   as string;

  let body: UpdateBody;
  try { body = stripSecrets(await c.req.json<UpdateBody>()); }
  catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  let hasUpdate = false;
  let psToWrite: PaymentSettings | undefined;
  let prToWrite: PromotionSettings | undefined;

  if (body.paymentSettings !== undefined) {
    if (!isValidPaymentSettings(body.paymentSettings)) {
      return c.json({ error: 'Invalid paymentSettings shape' }, 400);
    }
    psToWrite = body.paymentSettings;
    hasUpdate = true;
  }
  if (body.promotionSettings !== undefined) {
    if (typeof body.promotionSettings.enabled !== 'boolean') {
      return c.json({ error: 'Invalid promotionSettings shape' }, 400);
    }
    prToWrite = body.promotionSettings;
    hasUpdate = true;
  }
  if (!hasUpdate) {
    return c.json({ error: 'Nothing to update' }, 400);
  }

  try {
    await firestoreSet(
      env.FIREBASE_SERVICE_ACCOUNT_JSON!,
      `organizations/${orgId}/billing_config/current`,
      {
        ...(psToWrite ? { paymentSettings:   { ...psToWrite } } : {}),
        ...(prToWrite ? { promotionSettings: { ...prToWrite } } : {}),
        updatedAt: new Date().toISOString(),
        updatedBy: uid,
      },
      { merge: true },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firestore write failed';
    return c.json({ error: msg }, 500);
  }

  return c.json({ ok: true });
});

export default settings;
