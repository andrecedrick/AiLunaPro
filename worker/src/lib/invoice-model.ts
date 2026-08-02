/**
 * Invoice model — accounting-grade totals, parties and tax treatment (§27 P1.1).
 *
 * PURE. No network, no Firestore, no clock. Same inputs always produce the same
 * invoice figures, because an invoice is a financial document that must be
 * reproducible years after it was issued.
 *
 * MONEY IS INTEGER MINOR UNITS. Floating point cannot represent 0.1, so a VAT
 * computation done in floats drifts by cents and an invoice that does not add up
 * is not an invoice. Every amount here is an integer count of the currency's
 * smallest unit, and the only division is a single documented rounding step.
 *
 * VAT NUMBERS ARE FORMAT-CHECKED, NOT VALIDATED. Confirming a VAT number really
 * belongs to a trader requires a live VIES lookup, which is a network call with
 * its own downtime and would make this module non-deterministic. A well-formed
 * number is therefore accepted as the customer's assertion and recorded as such;
 * the invoice states the treatment applied so a bookkeeper can check it.
 */

import type { Currency } from './currency';

export type { Currency };

/** Currencies with no minor unit would break the ×100 assumption; none supported today. */
export const MINOR_UNITS_PER_MAJOR = 100;

export const CURRENCY_CODES: Record<Currency, string> = {
  usd: 'USD', eur: 'EUR', gbp: 'GBP', cad: 'CAD', aud: 'AUD',
};

/**
 * How VAT is applied to this invoice.
 *
 * `reverse_charge` is the one that matters commercially: for cross-border B2B
 * inside the EU the supplier charges no VAT and the customer self-accounts. An
 * invoice that silently charges VAT in that case overcharges a business customer
 * who then cannot reclaim it.
 */
export const TAX_TREATMENTS = ['standard', 'reverse_charge', 'export', 'exempt', 'none'] as const;
export type TaxTreatment = (typeof TAX_TREATMENTS)[number];

/** Legal note printed on the invoice for each treatment. Required, not decorative. */
export const TAX_NOTES: Record<TaxTreatment, string> = {
  standard:       '',
  reverse_charge: 'VAT reverse charged - Article 196 of Council Directive 2006/112/EC. '
                + 'The customer is liable to account for VAT in their member state.',
  export:         'Outside the scope of EU VAT - supply to a customer established outside the European Union.',
  exempt:         'VAT exempt.',
  none:           '',
};

export const EU_VAT_COUNTRIES: ReadonlySet<string> = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

/**
 * VAT number shape per country. FORMAT ONLY — see the module note.
 *
 * A number that does not match is not rejected outright; it is recorded as
 * unverified and the invoice falls back to charging VAT, which is the safe
 * direction: under-charging VAT is the supplier's liability, over-charging is
 * refundable.
 */
const VAT_PATTERNS: Record<string, RegExp> = {
  AT: /^ATU\d{8}$/,            BE: /^BE0\d{9}$/,           BG: /^BG\d{9,10}$/,
  HR: /^HR\d{11}$/,            CY: /^CY\d{8}[A-Z]$/,       CZ: /^CZ\d{8,10}$/,
  DK: /^DK\d{8}$/,             EE: /^EE\d{9}$/,            FI: /^FI\d{8}$/,
  FR: /^FR[A-Z0-9]{2}\d{9}$/,  DE: /^DE\d{9}$/,            GR: /^EL\d{9}$/,
  HU: /^HU\d{8}$/,             IE: /^IE\d[A-Z0-9+*]\d{5}[A-Z]{1,2}$/,
  IT: /^IT\d{11}$/,            LV: /^LV\d{11}$/,           LT: /^LT(\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,             MT: /^MT\d{8}$/,            NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,            PT: /^PT\d{9}$/,            RO: /^RO\d{2,10}$/,
  SK: /^SK\d{10}$/,            SI: /^SI\d{8}$/,            ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  SE: /^SE\d{12}$/,            GB: /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/,
};

/** Strip spaces/dots and upper-case. Greece files under EL but writes GR. */
export function normaliseVatNumber(raw: string): string {
  return (raw ?? '').replace(/[\s.\-]/g, '').toUpperCase();
}

/** Does this VAT number look well-formed for its country? Format only. */
export function isWellFormedVatNumber(raw: string, country: string): boolean {
  const vat = normaliseVatNumber(raw);
  if (!vat) return false;
  const cc = (country ?? '').trim().toUpperCase();
  const pattern = VAT_PATTERNS[cc === 'GR' ? 'GR' : cc];
  // No pattern for the country: accept a plausible generic shape rather than
  // reject a valid number we simply do not have a rule for.
  if (!pattern) return /^[A-Z]{2}[A-Z0-9]{5,15}$/.test(vat);
  return pattern.test(vat);
}

/** A party on the invoice — the supplier issuing it or the customer billed. */
export interface InvoiceParty {
  legalName:          string;
  addressLines:       string[];
  postalCode:         string;
  city:               string;
  /** ISO-3166 alpha-2, upper case. Drives the tax treatment. */
  country:            string;
  vatNumber:          string;
  registrationNumber: string;
  email:              string;
}

export const EMPTY_PARTY: InvoiceParty = {
  legalName: '', addressLines: [], postalCode: '', city: '',
  country: '', vatNumber: '', registrationNumber: '', email: '',
};

const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Coerce stored/submitted data into a party. Never throws. */
export function toParty(raw: unknown): InvoiceParty {
  const f = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const lines = Array.isArray(f.addressLines)
    ? f.addressLines.map(l => str(l, 120)).filter(Boolean).slice(0, 4)
    : [str(f.addressLine1, 120), str(f.addressLine2, 120)].filter(Boolean);
  return {
    legalName:          str(f.legalName) || str(f.companyName),
    addressLines:       lines,
    postalCode:         str(f.postalCode, 20),
    city:               str(f.city, 80),
    country:            str(f.country, 2).toUpperCase(),
    vatNumber:          normaliseVatNumber(str(f.vatNumber, 20)),
    registrationNumber: str(f.registrationNumber, 40),
    email:              str(f.email, 160),
  };
}

/**
 * Is this party complete enough to appear on a legal invoice?
 *
 * The supplier block is the strict one: an invoice without an identifiable issuer
 * and address is not a valid invoice in any EU member state.
 */
export function missingSupplierFields(p: InvoiceParty): string[] {
  const missing: string[] = [];
  if (!p.legalName) missing.push('legalName');
  if (p.addressLines.length === 0) missing.push('addressLines');
  if (!p.city) missing.push('city');
  if (!p.country) missing.push('country');
  return missing;
}

export interface TaxDecision {
  treatment:   TaxTreatment;
  /** Basis points: 2000 = 20.00%. Integer, so no float creeps into the total. */
  rateBp:      number;
  note:        string;
  /** True when the customer supplied a VAT number that matches its country shape. */
  customerVatWellFormed: boolean;
}

/**
 * Decide how VAT applies.
 *
 * Order matters and each branch is a real rule, not a preference:
 *   1. Supplier outside the EU        → no EU VAT to charge.
 *   2. Same country                   → domestic supply, supplier's standard rate.
 *   3. EU B2B with a VAT number       → reverse charge, zero-rated.
 *   4. EU customer without a VAT number → treated as B2C, standard rate. Charging
 *      is the safe default: an unclaimed VAT number is more likely a consumer
 *      than a business that forgot, and over-charged VAT is refundable while
 *      under-charged VAT is the supplier's own liability.
 *   5. Customer outside the EU        → export, outside scope.
 */
export function decideTax(
  supplier: InvoiceParty, customer: InvoiceParty, standardRateBp: number,
): TaxDecision {
  const sc = supplier.country.toUpperCase();
  const cc = customer.country.toUpperCase();
  const rate = Number.isFinite(standardRateBp) && standardRateBp > 0 ? Math.round(standardRateBp) : 0;
  const customerVatWellFormed = Boolean(customer.vatNumber) && isWellFormedVatNumber(customer.vatNumber, cc);

  if (!EU_VAT_COUNTRIES.has(sc)) {
    return { treatment: 'none', rateBp: rate, note: TAX_NOTES.none, customerVatWellFormed };
  }
  if (cc && cc === sc) {
    return { treatment: 'standard', rateBp: rate, note: TAX_NOTES.standard, customerVatWellFormed };
  }
  if (EU_VAT_COUNTRIES.has(cc)) {
    return customerVatWellFormed
      ? { treatment: 'reverse_charge', rateBp: 0, note: TAX_NOTES.reverse_charge, customerVatWellFormed }
      : { treatment: 'standard', rateBp: rate, note: TAX_NOTES.standard, customerVatWellFormed };
  }
  if (cc) {
    return { treatment: 'export', rateBp: 0, note: TAX_NOTES.export, customerVatWellFormed };
  }
  // Unknown customer country: charge the standard rate. Same reasoning as (4).
  return { treatment: 'standard', rateBp: rate, note: TAX_NOTES.standard, customerVatWellFormed };
}

export interface InvoiceTotals {
  currency:     Currency;
  /** Net amount before tax, minor units. */
  subtotalMinor: number;
  taxRateBp:    number;
  taxMinor:     number;
  /** subtotal + tax, minor units. What the customer pays. */
  totalMinor:   number;
  treatment:    TaxTreatment;
  taxNote:      string;
}

/**
 * Compute the totals.
 *
 * The single rounding step is half-up on the tax line, applied once to the whole
 * net amount — not per line — which is what keeps subtotal + tax === total by
 * construction rather than by luck.
 */
export function computeTotals(
  subtotalMinor: number, currency: Currency, tax: TaxDecision,
): InvoiceTotals {
  const net = Math.max(0, Math.round(subtotalMinor));
  const taxMinor = tax.rateBp > 0 ? Math.round((net * tax.rateBp) / 10_000) : 0;
  return {
    currency,
    subtotalMinor: net,
    taxRateBp:     tax.rateBp,
    taxMinor,
    totalMinor:    net + taxMinor,
    treatment:     tax.treatment,
    taxNote:       tax.note,
  };
}

/** Major units → minor. Rejects non-finite input rather than producing NaN money. */
export const toMinor = (major: number): number =>
  Number.isFinite(major) ? Math.round(major * MINOR_UNITS_PER_MAJOR) : 0;

/**
 * Format money for display and for the PDF.
 *
 * Deliberately NOT `toLocaleString`: locale data differs between the Worker
 * runtime and a browser, and an invoice total that renders differently in two
 * places is a support ticket. Fixed grouping, fixed two decimals, ASCII only so
 * the PDF core fonts can draw every glyph.
 */
export function formatMoney(minor: number, currency: Currency): string {
  const negative = minor < 0;
  const abs = Math.abs(Math.round(minor));
  const major = Math.floor(abs / MINOR_UNITS_PER_MAJOR);
  const cents = abs % MINOR_UNITS_PER_MAJOR;
  const grouped = String(major).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${grouped}.${String(cents).padStart(2, '0')} ${CURRENCY_CODES[currency]}`;
}

/** "20.00%" from basis points, without float formatting surprises. */
export function formatRate(rateBp: number): string {
  const bp = Math.max(0, Math.round(rateBp));
  return `${Math.floor(bp / 100)}.${String(bp % 100).padStart(2, '0')}%`;
}

/** Address block as display lines, empty entries dropped. */
export function partyLines(p: InvoiceParty): string[] {
  const out: string[] = [];
  if (p.legalName) out.push(p.legalName);
  out.push(...p.addressLines);
  const cityLine = [p.postalCode, p.city].filter(Boolean).join(' ');
  if (cityLine) out.push(cityLine);
  if (p.country) out.push(p.country);
  if (p.vatNumber) out.push(`VAT: ${p.vatNumber}`);
  if (p.registrationNumber) out.push(`Reg: ${p.registrationNumber}`);
  if (p.email) out.push(p.email);
  return out;
}
