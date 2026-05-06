/**
 * Billing Admin types — Phase J1.3.
 * Owner-only admin surface. Multi-currency.
 * Shared between frontend admin client and worker route response shapes.
 */

// Re-export currency runtime constants + types from the lighter chunk.
// Keeps backward compat with admin panels while letting BillingPage
// import directly from `lib/billing/currencyConstants` to avoid pulling
// admin types into the billing-core bundle.
export type { Currency, Interval, Plan, CurrencySettings } from '../lib/billing/currencyConstants';
export { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, DEFAULT_CURRENCY_SETTINGS } from '../lib/billing/currencyConstants';

import type { Currency, Interval, Plan } from '../lib/billing/currencyConstants';

/* ── Status ──────────────────────────────────────────── */

export interface AdminStatus {
  ok:                  boolean;
  stripeMode:          'test' | 'live' | 'unset' | 'unknown';
  stripeConfigured:    boolean;
  webhookConfigured:   boolean;
  firestoreConfigured: boolean;
  lastWebhookEvent: {
    id:     string;
    type?:  string;
    ok:     boolean;
    error?: string;
    at:     string;
  } | null;
  lastInvoiceCount:    number;
  currencyDefault:     Currency;
}

/* ── Products / Prices (multi-currency) ──────────────── */

export interface AdminPriceCell {
  priceId:  string;
  amount:   number;     // minor units (cents)
  currency: Currency;
  interval: Interval;
  active:   boolean;
}

export interface AdminProduct {
  plan:             Plan;
  productId:        string;
  name:             string;
  active:           boolean;
  pricesByCurrency: Partial<Record<Currency, AdminPriceCell>>;
}

export interface CreatePriceInput {
  orgId:       string;
  plan:        Plan;
  amountCents: number;
  currency:    Currency;
  interval:    Interval;
}

export interface CreatePriceResponse {
  priceId:      string;
  amount:       number;
  currency:     Currency;
  interval:     Interval;
  displayPrice: AdminPriceCell;
}

/* ── Exchange rates ──────────────────────────────────── */
// CurrencySettings re-exported from currencyConstants above.

export interface ExchangeRatesResponse {
  rates:    Partial<Record<Currency, number>>;
  syncedAt: string | null;
  provider: 'manual' | 'live';
  /** Set true when last live fetch failed; UI shows fallback notice. */
  fallback: boolean;
}

/* ── Promotion codes ─────────────────────────────────── */

export interface PromoCode {
  id:               string;
  code:             string;
  active:           boolean;
  percentOff:       number;
  duration:         'once' | 'repeating' | 'forever';
  durationInMonths: number | null;
  maxRedemptions:   number | null;
  timesRedeemed:    number;
  expiresAt:        string | null;
  appliesTo:        Plan | 'all';
  createdAt:        string;
}

export interface CreatePromoInput {
  orgId:             string;
  code?:             string;
  percentOff:        number;
  duration:          'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?:   number;
  expiresAt?:        string;        // ISO
  appliesTo:         Plan | 'all';
}

/* ── Payment settings ────────────────────────────────── */

export interface PaymentSettings {
  automaticPaymentMethods:  boolean;
  billingAddressCollection: 'auto' | 'required';
  taxIdCollection:          'off' | 'required';
  allowPromotionCodes:      boolean;
}

export interface PortalSettings {
  enabled?:             boolean;
  managePaymentMethod?: boolean;
  cancelSubscription?:  boolean;
  invoiceHistory?:      boolean;
}

export interface PromotionSettings {
  enabled: boolean;
}

export interface PaymentSettingsBundle {
  paymentSettings:    PaymentSettings;
  portalSettings:     PortalSettings;
  promotionSettings:  PromotionSettings;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  automaticPaymentMethods:  true,
  billingAddressCollection: 'auto',
  taxIdCollection:          'off',
  allowPromotionCodes:      true,
};
// DEFAULT_CURRENCY_SETTINGS re-exported from currencyConstants above.
