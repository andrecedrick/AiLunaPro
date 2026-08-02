/**
 * Invoice issuer identity + tax configuration (frontend client).
 *
 * The worker (worker/src/lib/invoice-settings.ts) is authoritative on validation,
 * clamping and storage. This module only shapes the form payload and translates
 * between the form's units and the wire's.
 *
 * RATES TRAVEL AS BASIS POINTS. The form takes a human percentage ("20" or
 * "19.6"), the wire and the engine use integer basis points, because a VAT rate
 * carried as a float eventually produces a total that is a cent off and an
 * invoice that does not add up.
 */

import { WORKER_BASE } from './stripeClient';
import { getIdToken } from '../team/teamApiClient';

/** Fields a legal invoice cannot omit. Mirrors the worker's supplier check. */
export const SUPPLIER_REQUIRED = ['legalName', 'addressLines', 'city', 'country'] as const;

/** Flat, all-string form state — one input per key. */
export interface InvoiceSettingsPayload {
  legalName:          string;
  addressLine1:       string;
  addressLine2:       string;
  postalCode:         string;
  city:               string;
  country:            string;
  vatNumber:          string;
  registrationNumber: string;
  email:              string;
  /** Human percentage, e.g. "20" or "19.6". Converted to basis points on the wire. */
  taxRatePercent:     string;
  taxLabel:           string;
  currency:           string;
  paymentTermsDays:   string;
  invoiceFooter:      string;
}

/** "19.6" → 1960. Rejects nonsense to 0 rather than producing NaN basis points. */
export function percentToBp(percent: string): number {
  const n = Number.parseFloat((percent ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

/** 1960 → "19.6". Trailing zeros trimmed so the field reads the way it was typed. */
export function bpToPercent(bp: number): string {
  if (!Number.isFinite(bp) || bp <= 0) return '0';
  return String(Math.round(bp) / 100);
}

interface SettingsResponse {
  settings?: Record<string, unknown> | null;
  missingSupplier?: string[];
  warnings?: Record<string, string>;
}

const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Read current settings and flatten them into form state. */
export async function getInvoiceSettings(
  orgId: string,
): Promise<{ values: InvoiceSettingsPayload; missingSupplier: string[] } | null> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/org/billing-settings?orgId=${encodeURIComponent(orgId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as SettingsResponse | null;
  if (!j?.settings) return null;

  const raw = j.settings;
  const supplier = (raw.supplier && typeof raw.supplier === 'object' ? raw.supplier : {}) as Record<string, unknown>;
  const lines = Array.isArray(supplier.addressLines) ? supplier.addressLines.map(s) : [];

  return {
    values: {
      legalName:          s(supplier.legalName),
      addressLine1:       lines[0] ?? '',
      addressLine2:       lines[1] ?? '',
      postalCode:         s(supplier.postalCode),
      city:               s(supplier.city),
      country:            s(supplier.country),
      vatNumber:          s(supplier.vatNumber),
      registrationNumber: s(supplier.registrationNumber),
      email:              s(supplier.email),
      taxRatePercent:     bpToPercent(typeof raw.taxRateBp === 'number' ? raw.taxRateBp : 0),
      taxLabel:           s(raw.taxLabel) || 'VAT',
      currency:           s(raw.currency) || 'usd',
      paymentTermsDays:   String(typeof raw.paymentTermsDays === 'number' ? raw.paymentTermsDays : 14),
      invoiceFooter:      s(raw.invoiceFooter),
    },
    missingSupplier: j.missingSupplier ?? [],
  };
}

/**
 * Save. Never throws for an incomplete identity — the worker returns what is
 * still missing so the form can warn instead of blocking a partial save.
 */
export async function saveInvoiceSettings(
  orgId: string, v: InvoiceSettingsPayload,
): Promise<{ missingSupplier: string[]; warnings: Record<string, string> }> {
  const idToken = await getIdToken();
  const res = await fetch(`${WORKER_BASE}/api/org/invoice-settings?orgId=${encodeURIComponent(orgId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      supplier: {
        legalName: v.legalName,
        addressLines: [v.addressLine1, v.addressLine2].filter(Boolean),
        postalCode: v.postalCode,
        city: v.city,
        country: v.country,
        vatNumber: v.vatNumber,
        registrationNumber: v.registrationNumber,
        email: v.email,
      },
      taxRateBp:        percentToBp(v.taxRatePercent),
      taxLabel:         v.taxLabel,
      currency:         v.currency,
      paymentTermsDays: Number.parseInt(v.paymentTermsDays, 10) || 0,
      invoiceFooter:    v.invoiceFooter,
    }),
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const j = await res.json().catch(() => null) as SettingsResponse | null;
  return { missingSupplier: j?.missingSupplier ?? [], warnings: j?.warnings ?? {} };
}
