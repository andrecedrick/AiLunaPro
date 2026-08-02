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
import { validateInvoiceSettings } from '../lib/invoice-settings';
import type { AppEnv } from '../index';

const billingSettings = new Hono<AppEnv>();

type RoleList = Parameters<typeof requireRole>[0];
const SETTINGS_ROLES: RoleList = ['owner', 'admin'];

const PATH = (orgId: string) => `organizations/${orgId}/settings/billing`;

/** The supplier block round-trips through a JSON string. Never throws on bad data. */
function parseSupplier(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw !== 'string' || !raw) return {};
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
}

billingSettings.get('/api/org/billing-settings', requireAuth(), requireRole(SETTINGS_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;
  const doc = await firestoreGet(saJson, PATH(orgId)) as Record<string, unknown> | null;
  if (!doc) return c.json({ ok: true, settings: null, missingSupplier: [] });
  // The stored supplier is a JSON string (Firestore fields are flat here); hand
  // the client the parsed form so it never has to know that.
  const invoicing = validateInvoiceSettings({ ...doc, supplier: parseSupplier(doc.supplier) });
  return c.json({
    ok: true,
    settings: { ...doc, ...invoicing.value },
    missingSupplier: invoicing.missingSupplier,
  });
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

  // MERGE, never replace. This route only owns the bank fields; writing the whole
  // document would blank the invoicing identity, which is submitted by a different
  // form and would silently vanish every time someone edited their IBAN.
  await firestoreSet(saJson, PATH(orgId), {
    ...result.value,
    updatedAt: new Date().toISOString(),
  } as unknown as Parameters<typeof firestoreSet>[2], { merge: true });

  return c.json({ ok: true, settings: result.value });
});

/**
 * PUT /api/org/invoice-settings — issuer identity and tax configuration.
 *
 * Deliberately separate from the bank route. They share a document but not a
 * form: the bank validator rejects a payload with no IBAN, so an org could never
 * save its VAT number first, and a combined write from either form would erase
 * the other's fields.
 *
 * Never rejects on incomplete identity. An org fills this in over time, and the
 * response reports what is still missing so the UI can warn BEFORE an invoice is
 * issued rather than after a deficient one has been sent.
 */
billingSettings.put('/api/org/invoice-settings', requireAuth(), requireRole(SETTINGS_ROLES), async c => {
  c.header('Cache-Control', 'no-store');
  const env = c.env as AppEnv['Bindings'];
  const saJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return c.json({ error: 'Server misconfigured.', code: 'CONFIG_ERROR' }, 503);

  const orgId = c.get('orgId') as string;

  let body: Record<string, unknown>;
  try { body = await c.req.json() as Record<string, unknown>; }
  catch { return c.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, 400); }

  const invoicing = validateInvoiceSettings(body);

  await firestoreSet(saJson, PATH(orgId), {
    supplier:         JSON.stringify(invoicing.value.supplier),
    taxRateBp:        invoicing.value.taxRateBp,
    taxLabel:         invoicing.value.taxLabel,
    currency:         invoicing.value.currency,
    paymentTermsDays: invoicing.value.paymentTermsDays,
    invoiceFooter:    invoicing.value.invoiceFooter,
    updatedAt:        new Date().toISOString(),
  } as unknown as Parameters<typeof firestoreSet>[2], { merge: true });

  return c.json({
    ok: true,
    settings: invoicing.value,
    warnings: invoicing.errors,
    missingSupplier: invoicing.missingSupplier,
  });
});

export default billingSettings;
