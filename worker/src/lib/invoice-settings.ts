/**
 * Org invoicing settings — supplier identity, tax configuration, defaults (§27 P1.1).
 *
 * PURE validation. Stored alongside the bank details at
 * `organizations/{orgId}/settings/billing`, because they describe the same thing
 * from the customer's point of view: who is billing me, and how do I pay them.
 *
 * SEPARATE FROM THE BANK VALIDATOR ON PURPOSE. `validateBankSettings` rejects the
 * whole payload when a bank field is missing, which is right for bank details —
 * a half-filled IBAN is useless. Supplier identity has to behave differently: an
 * org that has not filled it in yet must still be able to save bank details, and
 * an invoice must be able to say WHICH field is missing rather than silently
 * printing a blank issuer block. So this validator collects problems and reports
 * them; the invoice path decides whether they are fatal.
 */

import { toParty, missingSupplierFields, isWellFormedVatNumber, type InvoiceParty } from './invoice-model';
import { isSupportedCurrency, type Currency } from './currency';

/** Ceiling on a configurable VAT rate. Nothing in the EU exceeds 27%. */
export const MAX_TAX_RATE_BP = 3000;

export interface InvoiceSettings {
  supplier:        InvoiceParty;
  /** Standard VAT rate in basis points (2000 = 20.00%). */
  taxRateBp:       number;
  /** Label printed next to the tax line, e.g. "VAT", "TVA", "MwSt". */
  taxLabel:        string;
  /** Currency new invoices are issued in. */
  currency:        Currency;
  /** Net payment terms in days, printed as the due date. */
  paymentTermsDays: number;
  /** Free-text footer: legal form, share capital, court of registration. */
  invoiceFooter:   string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  supplier:         toParty({}),
  taxRateBp:        0,
  taxLabel:         'VAT',
  currency:         'usd',
  paymentTermsDays: 14,
  invoiceFooter:    '',
};

const int = (v: unknown, fallback: number): number => {
  const n = typeof v === 'number' ? v : Number.parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? Math.round(n) : fallback;
};

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export interface InvoiceSettingsResult {
  value:  InvoiceSettings;
  /** Field → reason. Non-fatal here; the invoice path decides. */
  errors: Record<string, string>;
  /** Supplier fields a legal invoice cannot omit. */
  missingSupplier: string[];
}

/**
 * Coerce and check invoicing settings. Never throws, never rejects wholesale.
 *
 * Out-of-range values are CLAMPED rather than rejected, and the clamp is
 * reported: a typo of `200` for a 20% rate would otherwise either fail the save
 * or bill someone at 200% VAT.
 */
export function validateInvoiceSettings(input: Record<string, unknown>): InvoiceSettingsResult {
  const errors: Record<string, string> = {};

  const supplier = toParty(input.supplier ?? input);

  if (supplier.vatNumber && !isWellFormedVatNumber(supplier.vatNumber, supplier.country)) {
    errors.supplierVatNumber = 'malformed';
  }

  let taxRateBp = int(input.taxRateBp, DEFAULT_INVOICE_SETTINGS.taxRateBp);
  if (taxRateBp < 0) { taxRateBp = 0; errors.taxRateBp = 'clamped_to_zero'; }
  if (taxRateBp > MAX_TAX_RATE_BP) { taxRateBp = MAX_TAX_RATE_BP; errors.taxRateBp = 'clamped_to_max'; }

  let paymentTermsDays = int(input.paymentTermsDays, DEFAULT_INVOICE_SETTINGS.paymentTermsDays);
  if (paymentTermsDays < 0) { paymentTermsDays = 0; errors.paymentTermsDays = 'clamped_to_zero'; }
  if (paymentTermsDays > 180) { paymentTermsDays = 180; errors.paymentTermsDays = 'clamped_to_max'; }

  const rawCurrency = str(input.currency, 8).toLowerCase();
  let currency: Currency = DEFAULT_INVOICE_SETTINGS.currency;
  if (rawCurrency) {
    if (isSupportedCurrency(rawCurrency)) currency = rawCurrency;
    else errors.currency = 'unsupported';
  }

  return {
    value: {
      supplier,
      taxRateBp,
      taxLabel:         str(input.taxLabel, 16) || DEFAULT_INVOICE_SETTINGS.taxLabel,
      currency,
      paymentTermsDays,
      invoiceFooter:    str(input.invoiceFooter, 400),
    },
    errors,
    missingSupplier: missingSupplierFields(supplier),
  };
}

/**
 * Read settings back out of a stored billing document.
 *
 * The supplier block is persisted as a JSON STRING because the billing settings
 * document is flat. Passing that string straight to `toParty` would yield an
 * empty issuer and print a blank "Issued by" block on every invoice, so it is
 * parsed here — one place, so both the API and the invoice path agree.
 */
export function readInvoiceSettings(doc: Record<string, unknown> | null | undefined): InvoiceSettings {
  if (!doc) return DEFAULT_INVOICE_SETTINGS;
  let supplier: unknown = doc.supplier;
  if (typeof supplier === 'string' && supplier) {
    try { supplier = JSON.parse(supplier) as unknown; } catch { supplier = {}; }
  }
  return validateInvoiceSettings({ ...doc, supplier: supplier ?? {} }).value;
}

/** Due date from the issue date and the org's terms. Pure — the clock is the caller's. */
export function dueDateIso(issuedAtIso: string, termsDays: number): string {
  const t = Date.parse(issuedAtIso);
  if (!Number.isFinite(t)) return '';
  return new Date(t + Math.max(0, termsDays) * 24 * 60 * 60 * 1000).toISOString();
}
