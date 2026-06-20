import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
 * Org bank-transfer settings — GET/PUT /api/org/billing-settings. Owner/admin,
 * org-scoped, region-validated (IBAN / routing / SWIFT). No payment/Stripe.
 */

const state = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>() }));

vi.mock('../../worker/src/middleware/auth', () => ({
  requireAuth: () => async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => { c.set('uid', 'u1'); await next(); },
}));
vi.mock('../../worker/src/middleware/requireRole', () => ({
  requireRole: () => async (c: { req: { query: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('orgId', c.req.query('orgId') ?? 'orgA'); c.set('role', 'owner'); await next();
  },
}));
vi.mock('../../worker/src/lib/firestoreAdmin', () => ({
  firestoreGet: vi.fn(async (_sa: string, path: string) => state.docs.get(path) ?? null),
  firestoreSet: vi.fn(async (_sa: string, path: string, data: Record<string, unknown>) => { state.docs.set(path, data); }),
}));

import billingSettings from '../../worker/src/routes/billing-settings';

const ENV = { FIREBASE_SERVICE_ACCOUNT_JSON: '{}' } as unknown as Record<string, unknown>;
const put = (payload: unknown, org = 'orgA') =>
  billingSettings.request(`/api/org/billing-settings?orgId=${org}`, {
    method: 'PUT', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }, ENV);
const get = (org = 'orgA') =>
  billingSettings.request(`/api/org/billing-settings?orgId=${org}`, { headers: { Authorization: 'Bearer t' } }, ENV);

beforeEach(() => { state.docs.clear(); });

describe('PUT /api/org/billing-settings', () => {
  it('stores valid EU (IBAN) settings under the verified org', async () => {
    const res = await put({ country: 'FR', region: 'eu', accountName: 'Acme SARL', iban: 'FR76 3000 6000 0112 3456 7890 189', bic: 'bnpafrpp' });
    expect(res.status).toBe(200);
    const doc = state.docs.get('organizations/orgA/settings/billing')!;
    expect(doc.region).toBe('eu');
    expect(doc.iban).toBe('FR7630006000011234567890189');   // spaces stripped, upper
    expect(doc.bic).toBe('BNPAFRPP');
  });

  it('rejects an invalid IBAN with a field error', async () => {
    const res = await put({ country: 'FR', region: 'eu', accountName: 'X', iban: 'NOPE', bic: 'BNPAFRPP' });
    expect(res.status).toBe(400);
    expect((await res.json() as { errors: Record<string, string> }).errors.iban).toBe('invalid');
    expect(state.docs.size).toBe(0);
  });

  it('validates US routing number (region derived from country)', async () => {
    expect((await put({ country: 'US', accountHolder: 'John', bankName: 'Chase', accountNumber: '123456789', routingNumber: '12345' })).status).toBe(400);
    const ok = await put({ country: 'US', accountHolder: 'John', bankName: 'Chase', accountNumber: '123456789', routingNumber: '021000021' });
    expect(ok.status).toBe(200);
    expect(state.docs.get('organizations/orgA/settings/billing')!.region).toBe('us');
  });

  it('requires all region fields', async () => {
    expect((await put({ country: 'FR', region: 'eu', accountName: 'X', iban: 'FR7630006000011234567890189' })).status).toBe(400); // missing bic
  });
});

describe('GET /api/org/billing-settings', () => {
  it('returns the stored settings (or null)', async () => {
    expect((await (await get()).json() as { settings: unknown }).settings).toBeNull();
    state.docs.set('organizations/orgA/settings/billing', { region: 'eu', iban: 'X' });
    expect((await (await get()).json() as { settings: { region: string } }).settings.region).toBe('eu');
  });
});
