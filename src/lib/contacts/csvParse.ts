/**
 * CSV → import rows (client side).
 *
 * Parsing happens in the browser so a 10,000-line file never crosses the network
 * as one request: the page splits the parsed rows into batches and posts them,
 * which is what makes large-file import survivable on a Worker (see
 * worker/src/routes/contacts-import.ts).
 *
 * This is a real CSV reader, not a `split(',')`. Company names contain commas
 * ("Acme, Inc."), notes contain newlines, and Excel escapes a quote by doubling
 * it — a naive split silently shifts every column after the first offending field
 * and imports garbage that looks plausible.
 *
 * Values are NOT validated here. The worker is the authority on what a valid row
 * is (lib/contact-import.ts); duplicating those rules in the client would let the
 * two drift, and a client-side check is not a control anyway.
 */

export interface ParsedRow {
  name:        string;
  email:       string;
  phone:       string;
  company:     string;
  countryCode: string;
  notes:       string;
}

/** Rows per POST. Matches IMPORT_MAX_ROWS in the worker. */
export const IMPORT_BATCH = 500;

/**
 * Split CSV text into a grid, honouring quoted fields, doubled quotes and
 * newlines inside quotes. Handles CRLF and LF.
 */
export function parseCsvGrid(text: string): string[][] {
  const grid: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  // Strip a UTF-8 BOM: Excel writes one, and it would otherwise become part of
  // the first header name so that column never matches.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }  // escaped quote
        else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\r') continue;                           // CRLF → handled at \n
    if (ch === '\n') { row.push(field); grid.push(row); row = []; field = ''; continue; }
    field += ch;
  }
  // Trailing field/row when the file does not end in a newline.
  if (field || row.length) { row.push(field); grid.push(row); }
  return grid.filter(r => r.some(cell => cell.trim() !== ''));
}

/**
 * Header aliases. Operators export from Twenty, HubSpot, Excel and the app's own
 * CSV export, so the same column arrives under several names. An unrecognised
 * header is ignored rather than guessed at.
 */
const ALIASES: Record<keyof ParsedRow, string[]> = {
  name:        ['name', 'full name', 'fullname', 'contact', 'contact name'],
  email:       ['email', 'e-mail', 'email address', 'work email', 'primary email'],
  phone:       ['phone', 'phone number', 'telephone', 'mobile', 'tel'],
  company:     ['company', 'company name', 'organisation', 'organization', 'account'],
  countryCode: ['country', 'country code', 'countrycode', 'iso', 'region'],
  notes:       ['notes', 'note', 'comment', 'comments', 'message'],
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

/** Map header cells to row keys. Returns -1 for a column the file does not carry. */
export function mapHeaders(header: readonly string[]): Record<keyof ParsedRow, number> {
  const cells = header.map(norm);
  // The aliases are normalised too. Comparing a normalised header ("e mail")
  // against a raw alias ("e-mail") matched nothing, so every hyphenated or
  // underscored column silently went missing.
  const at = (names: string[]) => { const n = names.map(norm); return cells.findIndex(h => n.includes(h)); };
  return {
    name:        at(ALIASES.name),
    email:       at(ALIASES.email),
    phone:       at(ALIASES.phone),
    company:     at(ALIASES.company),
    countryCode: at(ALIASES.countryCode),
    notes:       at(ALIASES.notes),
  };
}

export type ParseError =
  | 'EMPTY_FILE' | 'NO_EMAIL_COLUMN' | 'UNSUPPORTED_FORMAT'
  | 'NOT_A_ZIP' | 'NO_WORKSHEET' | 'UNSUPPORTED_COMPRESSION' | 'CORRUPT_FILE';

export interface ParseResult {
  rows:   ParsedRow[];
  /** Set when the file cannot be used at all, so the page can say why. */
  error?: ParseError;
}

/**
 * Grid → import rows. Shared by CSV and XLSX: both formats reduce to a table of
 * strings, and the header mapping must not be able to differ between them.
 */
export function rowsFromGrid(grid: readonly string[][]): ParseResult {
  if (grid.length < 2) return { rows: [], error: 'EMPTY_FILE' };

  const idx = mapHeaders(grid[0]);
  // Email is the dedup key on both sides; a file without it cannot be imported
  // at all, and saying so beats rejecting every row one by one.
  if (idx.email < 0) return { rows: [], error: 'NO_EMAIL_COLUMN' };

  const cell = (r: readonly string[], i: number) => (i >= 0 && i < r.length ? (r[i] ?? '').trim() : '');
  const rows = grid.slice(1).map(r => ({
    name:        cell(r, idx.name),
    email:       cell(r, idx.email),
    phone:       cell(r, idx.phone),
    company:     cell(r, idx.company),
    countryCode: cell(r, idx.countryCode),
    notes:       cell(r, idx.notes),
  }));
  return { rows };
}

/** Parse a whole CSV file into import rows. The first non-empty line is the header. */
export function parseContactsCsv(text: string): ParseResult {
  return rowsFromGrid(parseCsvGrid(text));
}

/**
 * Parse any supported contact file.
 *
 * CSV is the PRIMARY format: it is what every CRM and every spreadsheet exports,
 * it is what this app's own export produces (so a round trip works), and it needs
 * no decoding step that can fail. Google Sheets is covered by the same path —
 * "File → Download → CSV" is a plain CSV.
 *
 * .xlsx is accepted because operators genuinely receive lists that way, but its
 * reader is lazily imported so the ZIP/XML code is downloaded only by the people
 * who actually pick a spreadsheet.
 */
export async function parseContactsFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx')) {
    const { parseXlsx } = await import('./xlsxParse');
    const { grid, error } = await parseXlsx(await file.arrayBuffer());
    if (error) return { rows: [], error };
    return rowsFromGrid(grid);
  }
  // .xls is the old binary format (BIFF), not a ZIP — it would fail confusingly
  // inside the xlsx reader, so it is refused by name with a format message.
  if (name.endsWith('.xls')) return { rows: [], error: 'UNSUPPORTED_FORMAT' };
  return parseContactsCsv(await file.text());
}

/** Columns the importer requires, and the ones it will use if present. */
export const REQUIRED_COLUMNS = ['Name', 'Email', 'Company'] as const;
export const OPTIONAL_COLUMNS = ['Phone', 'Country', 'Notes'] as const;

/**
 * Downloadable template.
 *
 * Real example rows, not `foo@bar.com` placeholders: the two things operators get
 * wrong are the country format (ISO-3166 alpha-2, not "France") and the phone
 * format (E.164 with the country code), and a sample that demonstrates both is
 * worth more than a paragraph of instructions.
 */
export function sampleCsv(): string {
  const header = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(',');
  const rows = [
    'Ada Lovelace,ada.lovelace@example.com,"Analytical Engines, Ltd",+33612345678,FR,Met at the Paris AI summit',
    'Grace Hopper,grace.hopper@example.com,Compiler Works,+12025550143,US,Asked about the EU AI Act deadline',
    'Kenji Tanaka,kenji.tanaka@example.com,Sakura Robotics,,JP,No phone number on file',
  ];
  // UTF-8 BOM so Excel opens accented names correctly, matching the app's export.
  return `﻿${[header, ...rows].join('\r\n')}`;
}

export const SAMPLE_FILENAME = 'ailunapro-contacts-template.csv';

/** Split parsed rows into request-sized batches. */
export function batchRows<T>(rows: readonly T[], size = IMPORT_BATCH): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}
