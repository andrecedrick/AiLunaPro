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

export interface ParseResult {
  rows:   ParsedRow[];
  /** Set when the file cannot be used at all, so the page can say why. */
  error?: 'EMPTY_FILE' | 'NO_EMAIL_COLUMN';
}

/** Parse a whole CSV file into import rows. The first non-empty line is the header. */
export function parseContactsCsv(text: string): ParseResult {
  const grid = parseCsvGrid(text);
  if (grid.length < 2) return { rows: [], error: 'EMPTY_FILE' };

  const idx = mapHeaders(grid[0]);
  // Email is the dedup key on both sides; a file without it cannot be imported
  // at all, and saying so beats rejecting every row one by one.
  if (idx.email < 0) return { rows: [], error: 'NO_EMAIL_COLUMN' };

  const cell = (r: readonly string[], i: number) => (i >= 0 && i < r.length ? r[i].trim() : '');
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

/** Split parsed rows into request-sized batches. */
export function batchRows<T>(rows: readonly T[], size = IMPORT_BATCH): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}
