/**
 * Bank-transfer settings (frontend) — region schema + client for the billing
 * settings form. The worker (worker/src/lib/bank-details.ts) is authoritative on
 * validation + storage; this drives the dynamic form and gives instant feedback.
 * The parity test asserts REGION_FIELDS matches the worker.
 */

import { WORKER_BASE } from './stripeClient';
import { getIdToken } from '../team/teamApiClient';

export type BankRegion = 'eu' | 'us' | 'global';

/** Fields per region, in display order — mirror of the worker. */
export const REGION_FIELDS: Record<BankRegion, readonly string[]> = {
  eu:     ['accountName', 'iban', 'bic'],
  us:     ['accountHolder', 'bankName', 'accountNumber', 'routingNumber'],
  global: ['accountHolder', 'bankName', 'accountNumber', 'swiftCode'],
};

const EU_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV',
  'LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','CH','GB','MC',
]);

export function countryToRegion(country: string | undefined): BankRegion {
  const cc = (country ?? '').trim().toUpperCase();
  if (cc === 'US') return 'us';
  if (EU_COUNTRIES.has(cc)) return 'eu';
  return 'global';
}

export interface BankSettings {
  country: string;
  region:  BankRegion;
  [field: string]: string;
}

const IBAN_RE    = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
const ROUTING_RE = /^\d{9}$/;
const SWIFT_RE   = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const ACCT_RE    = /^[A-Z0-9 -]{4,34}$/i;

/** Client-side per-field check (UX only; the worker re-validates). Returns true
 *  if the value looks valid for the field, false otherwise. Empty = invalid. */
export function isFieldValid(field: string, value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (field === 'iban') return IBAN_RE.test(v.replace(/\s+/g, '').toUpperCase());
  if (field === 'bic' || field === 'swiftCode') return SWIFT_RE.test(v.replace(/\s+/g, '').toUpperCase());
  if (field === 'routingNumber') return ROUTING_RE.test(v.replace(/\s+/g, ''));
  if (field === 'accountNumber') return ACCT_RE.test(v);
  return v.length > 0; // names
}

export async function getBankSettings(orgId: string): Promise<Record<string, string> | null> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/org/billing-settings?orgId=${encodeURIComponent(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as { settings?: Record<string, string> | null } | null;
  return j?.settings ?? null;
}

/** Save bank settings. Throws on a non-OK; on 400 the rejection carries the
 *  worker's field→error map so the form can highlight the bad fields. */
export async function saveBankSettings(orgId: string, payload: Record<string, string>): Promise<void> {
  const idToken = await getIdToken();
  // orgId goes in the query: requireRole reads it from there for PUT (it only
  // falls back to the body for POST). The worker uses the verified orgId.
  const res = await fetch(`${WORKER_BASE}/api/org/billing-settings?orgId=${encodeURIComponent(orgId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null) as { errors?: Record<string, string> } | null;
    const err = new Error(`HTTP_${res.status}`) as Error & { fieldErrors?: Record<string, string> };
    err.fieldErrors = j?.errors;
    throw err;
  }
}
