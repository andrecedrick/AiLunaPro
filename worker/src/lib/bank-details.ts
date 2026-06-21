/**
 * Region-aware bank-transfer details (invoice fallback payment method).
 *
 * Three banking regions with different field sets:
 *   eu     — IBAN / BIC (+ account name)
 *   us     — account + routing number (+ bank name, account holder)
 *   global — account number + SWIFT (+ bank name, account holder)
 *
 * The region is chosen from the org country (primary); anything outside the EU
 * / US falls back to `global`. Stored at organizations/{orgId}/settings/billing.
 * Authoritative validation + the invoice email block both live here.
 */

export type BankRegion = 'eu' | 'us' | 'global';

/** Which fields each region uses, in display order. Mirrored on the frontend
 *  (src/lib/billing/bankSettings.ts) — the parity test asserts they match. */
export const REGION_FIELDS: Record<BankRegion, readonly string[]> = {
  eu:     ['accountName', 'iban', 'bic'],
  us:     ['accountHolder', 'bankName', 'accountNumber', 'routingNumber'],
  global: ['accountHolder', 'bankName', 'accountNumber', 'swiftCode'],
};

const EU_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV',
  'LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','CH','GB','MC',
]);

/** Country (ISO-2) → banking region. Unknown/empty → global. */
export function countryToRegion(country: string | undefined): BankRegion {
  const cc = (country ?? '').trim().toUpperCase();
  if (cc === 'US') return 'us';
  if (EU_COUNTRIES.has(cc)) return 'eu';
  return 'global';
}

export function isBankRegion(v: unknown): v is BankRegion {
  return v === 'eu' || v === 'us' || v === 'global';
}

const IBAN_RE    = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
const ROUTING_RE = /^\d{9}$/;
const SWIFT_RE   = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const ACCT_RE    = /^[A-Z0-9 -]{4,34}$/i;

export interface BankSettings {
  country:       string;
  region:        BankRegion;
  accountName?:  string;
  iban?:         string;
  bic?:          string;
  accountHolder?: string;
  bankName?:     string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?:    string;
}

/** Scrub a free-text field: strip control chars + angle brackets, trim, cap. */
function clean(raw: unknown, max = 120): string {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) continue;
    if (ch === '<' || ch === '>') continue;
    out += ch;
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, max);
}

/**
 * Validate + normalize a bank-settings payload against its region. Returns the
 * cleaned settings on success, or a field→error map on failure. All region
 * fields are required (an invoice with half the details is worse than none).
 */
export function validateBankSettings(input: Record<string, unknown>): { ok: true; value: BankSettings } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const country = clean(input.country, 4).toUpperCase();
  const region: BankRegion = isBankRegion(input.region) ? input.region : countryToRegion(country);

  const v: BankSettings = { country, region };
  const fields = REGION_FIELDS[region];

  for (const f of fields) {
    const raw = clean((input as Record<string, unknown>)[f], f === 'iban' ? 40 : 100);
    if (!raw) { errors[f] = 'required'; continue; }
    if (f === 'iban' && !IBAN_RE.test(raw.replace(/\s+/g, '').toUpperCase())) errors[f] = 'invalid';
    else if ((f === 'bic' || f === 'swiftCode') && !SWIFT_RE.test(raw.replace(/\s+/g, '').toUpperCase())) errors[f] = 'invalid';
    else if (f === 'routingNumber' && !ROUTING_RE.test(raw.replace(/\s+/g, ''))) errors[f] = 'invalid';
    else if (f === 'accountNumber' && !ACCT_RE.test(raw)) errors[f] = 'invalid';
    (v as unknown as Record<string, unknown>)[f] =
      f === 'iban' || f === 'bic' || f === 'swiftCode' ? raw.replace(/\s+/g, '').toUpperCase() : raw;
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: v };
}

/** Build the plain-text bank block for the invoice email ({{BANK_DETAILS}}).
 *  English labels (single invoice template). Returns '' if nothing usable. */
export function formatBankDetails(s: Record<string, unknown> | null | undefined): string {
  if (!s || !isBankRegion(s.region)) return '';
  const g = (k: string) => (typeof s[k] === 'string' ? (s[k] as string) : '');
  const lines: string[] = [];
  if (s.region === 'eu') {
    if (g('accountName')) lines.push(`Account name: ${g('accountName')}`);
    if (g('iban')) lines.push(`IBAN: ${g('iban')}`);
    if (g('bic')) lines.push(`BIC: ${g('bic')}`);
  } else if (s.region === 'us') {
    if (g('accountHolder')) lines.push(`Account holder: ${g('accountHolder')}`);
    if (g('bankName')) lines.push(`Bank: ${g('bankName')}`);
    if (g('accountNumber')) lines.push(`Account number: ${g('accountNumber')}`);
    if (g('routingNumber')) lines.push(`Routing number: ${g('routingNumber')}`);
  } else {
    if (g('accountHolder')) lines.push(`Account holder: ${g('accountHolder')}`);
    if (g('bankName')) lines.push(`Bank: ${g('bankName')}`);
    if (g('accountNumber')) lines.push(`Account number: ${g('accountNumber')}`);
    if (g('swiftCode')) lines.push(`SWIFT/BIC: ${g('swiftCode')}`);
  }
  return lines.join('\n');
}
