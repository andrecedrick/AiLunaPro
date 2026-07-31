/**
 * CSV contact import — row validation.
 *
 * Pure: no Firestore, no network, no clock. The route does the I/O; everything
 * that decides whether a row is acceptable lives here so it can be tested
 * exhaustively without a database.
 *
 * A partial import is the correct outcome, not a failure. An operator pasting a
 * hundred rows from a trade-show list will have three bad ones, and rejecting the
 * whole file over them means the ninety-seven good leads never land. So every row
 * is judged independently and the caller receives both halves: what to write, and
 * a per-row reason for everything skipped.
 *
 * DEDUPLICATION is two-layered, because the two collisions are different bugs:
 *   - within the file  → decided here (first occurrence wins, later ones report
 *     DUPLICATE_IN_FILE). The route cannot see this; it writes row by row.
 *   - against the org  → decided by the route, which knows the existing emails.
 *     Passed in as `existingEmails` so this function stays pure.
 */

import { normalizePhone, isValidPhone } from './support-shared';
import { phoneCountryIso } from './phone-country';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO2_RE  = /^[A-Z]{2}$/;

export const IMPORT_MAX_ROWS = 500;
const NAME_MAX = 120, COMPANY_MAX = 120, PHONE_MAX = 40, NOTES_MAX = 2000;

export interface ImportRow {
  name?:        unknown;
  email?:       unknown;
  phone?:       unknown;
  company?:     unknown;
  countryCode?: unknown;
  notes?:       unknown;
}

export interface ValidRow {
  name:        string;
  email:       string;
  phone:       string;
  company:     string;
  countryCode: string;
  /** Dial-code region derived from the number itself; '' when not international. */
  phoneCountry: string;
  notes:       string;
}

export interface RejectedRow {
  /** 1-based index in the submitted batch, so the operator can find the line. */
  row:    number;
  code:   string;
  /** Echoed back so a rejected line is identifiable without the original file. */
  email:  string;
}

export interface ImportPlan {
  valid:    ValidRow[];
  rejected: RejectedRow[];
}

const s = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Validate a batch against the org's existing emails.
 *
 * `existingEmails` must be lowercase. Every prospect needs a name, a company and
 * a reachable email — the same three fields signup enforces — so a row missing
 * any of them is rejected rather than written as a half-record that no one can
 * qualify or call.
 */
export function planImport(rows: readonly ImportRow[], existingEmails: ReadonlySet<string>): ImportPlan {
  const valid: ValidRow[] = [];
  const rejected: RejectedRow[] = [];
  const seen = new Set<string>();

  rows.forEach((raw, i) => {
    const row = i + 1;
    const email = s(raw.email).toLowerCase().slice(0, 200);
    const reject = (code: string) => rejected.push({ row, code, email });

    if (!EMAIL_RE.test(email)) { reject('INVALID_EMAIL'); return; }
    if (seen.has(email))            { reject('DUPLICATE_IN_FILE'); return; }
    if (existingEmails.has(email))  { reject('DUPLICATE_EXISTING'); return; }

    const name = s(raw.name).slice(0, NAME_MAX);
    if (!name) { reject('MISSING_NAME'); return; }

    // Company is mandatory for the same reason it is mandatory at signup: a lead
    // with no company cannot be qualified or routed to a sales owner.
    const company = s(raw.company).slice(0, COMPANY_MAX);
    if (!company) { reject('MISSING_COMPANY'); return; }

    // Phone is optional, but a phone that IS supplied must be dialable — storing
    // an unusable number is worse than storing none, because sales trusts it.
    const rawPhone = s(raw.phone).slice(0, PHONE_MAX);
    if (rawPhone && !isValidPhone(rawPhone)) { reject('INVALID_PHONE'); return; }
    const phone = rawPhone ? normalizePhone(rawPhone) : '';

    // Validate the WHOLE value before taking it. Slicing first turned "France"
    // into "FR" — a wrong country that passes every later check and looks correct
    // in the CRM, which is worse than rejecting the row.
    const countryCode = s(raw.countryCode).toUpperCase();
    if (countryCode && !ISO2_RE.test(countryCode)) { reject('INVALID_COUNTRY'); return; }

    seen.add(email);
    valid.push({
      name, email, phone, company, countryCode,
      phoneCountry: phoneCountryIso(phone),
      notes: s(raw.notes).slice(0, NOTES_MAX),
    });
  });

  return { valid, rejected };
}
