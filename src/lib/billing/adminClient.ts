/**
 * Frontend admin client — Phase J1.3.
 * Calls owner-only worker routes. Never sends or receives secrets.
 */

import type {
  AdminStatus,
  AdminProduct,
  CreatePriceInput,
  CreatePriceResponse,
  CurrencySettings,
  ExchangeRatesResponse,
  PromoCode,
  CreatePromoInput,
  PaymentSettingsBundle,
  PaymentSettings,
  PromotionSettings,
} from '../../types/billingAdmin';
import { WORKER_BASE } from './stripeClient';

async function get<T>(path: string, idToken: string): Promise<T> {
  const res = await fetch(`${WORKER_BASE}${path}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(j.error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, idToken: string): Promise<T> {
  const res = await fetch(`${WORKER_BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(j.error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Status ────────────────────────────────────────────

export async function fetchAdminStatus(orgId: string, idToken: string): Promise<AdminStatus> {
  return get<AdminStatus>(`/api/billing/admin/status?orgId=${encodeURIComponent(orgId)}`, idToken);
}

// ── Products / Prices ─────────────────────────────────

export async function fetchAdminProducts(orgId: string, idToken: string): Promise<AdminProduct[]> {
  const r = await get<{ products: AdminProduct[] }>(
    `/api/billing/admin/products?orgId=${encodeURIComponent(orgId)}`, idToken);
  return r.products;
}

export async function createPrice(input: CreatePriceInput, idToken: string): Promise<CreatePriceResponse> {
  return post<CreatePriceResponse>('/api/billing/admin/prices', input, idToken);
}

// ── Currency settings + exchange rates ───────────────

export async function fetchExchangeRatesAdmin(orgId: string, idToken: string): Promise<ExchangeRatesResponse> {
  return get<ExchangeRatesResponse>(
    `/api/billing/admin/exchange-rates?orgId=${encodeURIComponent(orgId)}`, idToken);
}

export async function saveCurrencySettings(
  orgId: string,
  currencySettings: CurrencySettings,
  idToken: string,
): Promise<{ ok: true; currencySettings: CurrencySettings }> {
  return post('/api/billing/admin/currency-settings', { orgId, currencySettings }, idToken);
}

// ── Promotion codes (J1.3B) ──────────────────────────

export async function fetchPromoCodes(orgId: string, idToken: string): Promise<PromoCode[]> {
  const r = await get<{ codes: PromoCode[] }>(
    `/api/billing/admin/promotion-codes?orgId=${encodeURIComponent(orgId)}`, idToken);
  return r.codes;
}

export async function createPromoCode(input: CreatePromoInput, idToken: string): Promise<PromoCode> {
  const r = await post<{ ok: true; promo: PromoCode }>(
    '/api/billing/admin/promotion-codes', input, idToken);
  return r.promo;
}

export async function disablePromoCode(orgId: string, id: string, idToken: string): Promise<void> {
  await post(`/api/billing/admin/promotion-codes/${encodeURIComponent(id)}/disable`, { orgId }, idToken);
}

// ── Payment settings (J1.3B) ─────────────────────────

export async function fetchPaymentSettings(orgId: string, idToken: string): Promise<PaymentSettingsBundle> {
  return get<PaymentSettingsBundle>(
    `/api/billing/admin/payment-settings?orgId=${encodeURIComponent(orgId)}`, idToken);
}

export async function savePaymentSettings(
  orgId: string,
  patch: { paymentSettings?: PaymentSettings; promotionSettings?: PromotionSettings },
  idToken: string,
): Promise<void> {
  await post('/api/billing/admin/payment-settings', { orgId, ...patch }, idToken);
}

// ── Portal diagnostic (J1.3B) ────────────────────────

export interface PortalDiagnosticResponse {
  portal: {
    configured:           boolean;
    enabled:              boolean;
    managePaymentMethod:  boolean;
    cancelSubscription:   boolean;
    invoiceHistory:       boolean;
    configurationId:      string | null;
  };
  invoices: {
    lastInvoiceCount:        number;
    lastInvoicePdfAvailable: boolean;
    customerLinked:          boolean;
  };
  note: string;
}

export async function fetchPortalDiagnostic(orgId: string, idToken: string): Promise<PortalDiagnosticResponse> {
  return get<PortalDiagnosticResponse>(
    `/api/billing/admin/portal-diagnostic?orgId=${encodeURIComponent(orgId)}`, idToken);
}
