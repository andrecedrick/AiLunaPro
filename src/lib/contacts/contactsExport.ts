/**
 * Contacts CSV export.
 *
 * Sales operators work leads outside the app — a call list, a spreadsheet, an
 * import into another tool — and the CRM table had no way out. Copying 12 columns
 * by hand is exactly the manual work this system exists to remove.
 *
 * Exports the rows the operator is CURRENTLY looking at: the caller passes the
 * already-filtered, already-searched array, so what is exported is what is on
 * screen. Exporting the unfiltered set would silently hand over records the
 * operator deliberately filtered away, including other organisations' contacts in
 * the cross-org view.
 */

import type { Contact } from './contactsClient';

/** Column order is the export contract — changing it breaks downstream imports. */
export const CSV_COLUMNS = [
  'Name', 'Email', 'Phone', 'Country', 'Company',
  'Source', 'Lead status', 'Created at', 'Last activity at',
] as const;

/**
 * Escape one CSV field per RFC 4180.
 *
 * Quotes are doubled and any field containing a comma, quote or newline is
 * wrapped — a company name like `Acme, Inc.` or a pasted multi-line message would
 * otherwise shift every following column.
 *
 * A leading =, +, - or @ is prefixed with a single quote: spreadsheets treat those
 * as formulas, so an imported value could execute on open (CSV injection). The
 * data still reads correctly as text.
 */
export function escapeCsvField(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  // `=` and `@` always start a formula. `+` and `-` only do when followed by
  // something non-numeric: a blanket guard on them prefixed every E.164 phone
  // number with a quote ('+33612345678), corrupting the most useful column in a
  // sales export. A purely numeric +/- value evaluates to that same number, so
  // it is harmless to leave alone.
  const isFormula = /^[=@]/.test(raw) || (/^[+-]/.test(raw) && !/^[+-][\d\s().-]*$/.test(raw));
  const guarded = isFormula ? `'${raw}` : raw;
  return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

/** One CSV row per contact, in CSV_COLUMNS order. */
function toRow(c: Contact): string[] {
  return [
    c.name,
    c.email,
    c.phone,
    c.countryCode || c.phoneCountry || '',
    c.company,
    c.source,
    c.leadStatus ?? '',
    c.createdAt,
    c.lastActivityAt ?? '',
  ].map(escapeCsvField);
}

/**
 * Render contacts as a CSV document.
 *
 * Prefixed with a UTF-8 BOM so Excel opens accented names correctly — without it
 * "Corinne Bernier" from a French locale renders as mojibake, which makes the
 * export useless for the operators most likely to need it.
 */
export function contactsToCsv(rows: Contact[]): string {
  const lines = [CSV_COLUMNS.join(','), ...rows.map(r => toRow(r).join(','))];
  return `﻿${lines.join('\r\n')}`;
}

/** Timestamped filename so successive exports do not overwrite each other. */
export function csvFilename(now = new Date()): string {
  return `contacts-${now.toISOString().slice(0, 10)}.csv`;
}
