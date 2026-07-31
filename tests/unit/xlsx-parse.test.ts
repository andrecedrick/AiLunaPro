import { describe, it, expect } from 'vitest';
import { parseXlsx, parseSharedStrings, parseSheet, columnIndex } from '../../src/lib/contacts/xlsxParse';
import { rowsFromGrid } from '../../src/lib/contacts/csvParse';

/**
 * The .xlsx reader is hand-written (a ZIP of XML, inflated with the platform's
 * DecompressionStream) rather than a 400 KB dependency, so it carries its own
 * proof: real archives are BUILT here and parsed back.
 */

/* ── Minimal ZIP writer, enough to produce a valid .xlsx ─────────────────────── */

const enc = (s: string) => new TextEncoder().encode(s);

function u16(n: number) { return [n & 0xff, (n >> 8) & 0xff]; }
function u32(n: number) { return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]; }

// Node's zlib, not CompressionStream: this only has to PRODUCE a fixture, and
// jsdom does not implement Blob.stream(). The reader under test still inflates it
// with the real DecompressionStream.
async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const { deflateRawSync } = await import('node:zlib');
  return new Uint8Array(deflateRawSync(bytes));
}

/** Build a ZIP. `compress` selects deflate (method 8) over stored (method 0). */
async function makeZip(files: Record<string, string>, compress = false): Promise<ArrayBuffer> {
  const local: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const raw = enc(content);
    const data = compress ? await deflateRaw(raw) : raw;
    const method = compress ? 8 : 0;
    const nameBytes = [...enc(name)];

    const header = [
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(method),
      ...u16(0), ...u16(0),                 // time, date
      ...u32(0),                            // crc32 — not validated by the reader
      ...u32(data.length), ...u32(raw.length),
      ...u16(nameBytes.length), ...u16(0),
      ...nameBytes,
    ];
    local.push(...header, ...data);

    central.push(
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(method),
      ...u16(0), ...u16(0), ...u32(0),
      ...u32(data.length), ...u32(raw.length),
      ...u16(nameBytes.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0),
      ...u32(offset),
      ...nameBytes,
    );
    offset = local.length;
  }

  const cdOffset = local.length;
  const count = Object.keys(files).length;
  const eocd = [
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(count), ...u16(count),
    ...u32(central.length), ...u32(cdOffset), ...u16(0),
  ];
  return new Uint8Array([...local, ...central, ...eocd]).buffer;
}

const sheetXml = (rows: string) =>
  `<?xml version="1.0"?><worksheet><sheetData>${rows}</sheetData></worksheet>`;

const sharedXml = (strings: string[]) =>
  `<?xml version="1.0"?><sst>${strings.map(s => `<si><t>${s}</t></si>`).join('')}</sst>`;

/* ── Unit pieces ─────────────────────────────────────────────────────────────── */

describe('xlsx — column references', () => {
  it('decodes base-26 column letters', () => {
    expect(columnIndex('A1')).toBe(0);
    expect(columnIndex('Z9')).toBe(25);
    expect(columnIndex('AA1')).toBe(26);
    expect(columnIndex('BC12')).toBe(54);
  });
});

describe('xlsx — shared strings', () => {
  it('concatenates the runs inside one <si>', () => {
    // Mixed formatting splits a single cell across several <t> elements.
    expect(parseSharedStrings('<sst><si><r><t>Acme</t></r><r><t>, Inc.</t></r></si></sst>'))
      .toEqual(['Acme, Inc.']);
  });

  it('decodes XML entities, ampersand last', () => {
    expect(parseSharedStrings('<sst><si><t>A &amp; B &lt;x&gt;</t></si></sst>')).toEqual(['A & B <x>']);
    expect(parseSharedStrings('<sst><si><t>&amp;lt;</t></si></sst>')).toEqual(['&lt;']);
  });
});

describe('xlsx — sheet cells', () => {
  it('resolves t="s" cells through the shared strings table', () => {
    const grid = parseSheet(sheetXml('<row><c r="A1" t="s"><v>1</v></c></row>'), ['zero', 'Ada']);
    expect(grid).toEqual([['Ada']]);
  });

  it('reads inline strings', () => {
    expect(parseSheet(sheetXml('<row><c r="A1" t="inlineStr"><is><t>Hi</t></is></c></row>'), []))
      .toEqual([['Hi']]);
  });

  it('keeps columns aligned when a SPARSE row omits empty cells', () => {
    // B is missing entirely — appending in order would shift C into B.
    const grid = parseSheet(sheetXml('<row><c r="A1"><v>a</v></c><c r="C1"><v>c</v></c></row>'), []);
    expect(grid).toEqual([['a', '', 'c']]);
  });

  it('drops fully blank rows', () => {
    expect(parseSheet(sheetXml('<row><c r="A1"><v></v></c></row>'), [])).toEqual([]);
  });
});

/* ── Whole archives ──────────────────────────────────────────────────────────── */

const WORKBOOK = {
  'xl/sharedStrings.xml': sharedXml(['Name', 'Email', 'Company', 'Ada Lovelace', 'ada@example.com', 'Acme, Inc.']),
  'xl/worksheets/sheet1.xml': sheetXml(
    '<row><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>' +
    '<row><c r="A2" t="s"><v>3</v></c><c r="B2" t="s"><v>4</v></c><c r="C2" t="s"><v>5</v></c></row>',
  ),
};

describe('xlsx — full archive', () => {
  it('reads a STORED (uncompressed) workbook', async () => {
    const { grid, error } = await parseXlsx(await makeZip(WORKBOOK));
    expect(error).toBeUndefined();
    expect(grid).toEqual([
      ['Name', 'Email', 'Company'],
      ['Ada Lovelace', 'ada@example.com', 'Acme, Inc.'],
    ]);
  });

  it('reads a DEFLATED workbook — the format real exporters produce', async () => {
    const { grid, error } = await parseXlsx(await makeZip(WORKBOOK, true));
    expect(error).toBeUndefined();
    expect(grid[1]).toEqual(['Ada Lovelace', 'ada@example.com', 'Acme, Inc.']);
  });

  it('feeds the SAME header mapping as CSV', async () => {
    const { grid } = await parseXlsx(await makeZip(WORKBOOK, true));
    const { rows, error } = rowsFromGrid(grid);
    expect(error).toBeUndefined();
    expect(rows).toEqual([{
      name: 'Ada Lovelace', email: 'ada@example.com', company: 'Acme, Inc.',
      phone: '', countryCode: '', notes: '',
    }]);
  });

  it('falls back to the first worksheet when it is not named sheet1', async () => {
    const { grid, error } = await parseXlsx(await makeZip({
      'xl/worksheets/data.xml': sheetXml('<row><c r="A1" t="inlineStr"><is><t>Email</t></is></c></row>'),
    }));
    expect(error).toBeUndefined();
    expect(grid).toEqual([['Email']]);
  });

  it('works without a sharedStrings part', async () => {
    const { error } = await parseXlsx(await makeZip({
      'xl/worksheets/sheet1.xml': sheetXml('<row><c r="A1" t="inlineStr"><is><t>Email</t></is></c></row>'),
    }));
    expect(error).toBeUndefined();
  });
});

describe('xlsx — malformed input produces a clean error, never a throw', () => {
  it('rejects a file that is not a ZIP', async () => {
    expect((await parseXlsx(enc('this is a csv, not a workbook').buffer as ArrayBuffer)).error).toBe('NOT_A_ZIP');
  });

  it('rejects an empty buffer', async () => {
    expect((await parseXlsx(new ArrayBuffer(0))).error).toBe('NOT_A_ZIP');
  });

  it('rejects a ZIP with no worksheet', async () => {
    expect((await parseXlsx(await makeZip({ 'docProps/app.xml': '<x/>' }))).error).toBe('NO_WORKSHEET');
  });
});
