/**
 * Minimal .xlsx reader — enough to turn the first worksheet into a string grid.
 *
 * WHY NOT A LIBRARY: SheetJS is ~400 KB for what an import modal needs, which is
 * "read the cells of one sheet". An .xlsx file is a ZIP of XML, and the platform
 * already ships the hard part — DecompressionStream('deflate-raw') inflates the
 * entries natively. So this costs a few kilobytes instead of a third of the app.
 *
 * SCOPE, deliberately narrow: the first worksheet, cell values only. No formulas
 * (the cached <v> is read, which is the value the user sees), no dates, no styles,
 * no multi-sheet selection. A contact list is a flat table of text; anything
 * richer belongs in a CSV export from the source tool, which is why CSV remains
 * the primary format.
 *
 * Everything here is defensive: an .xlsx is user-supplied input, so a malformed
 * archive must produce a clean error, never a throw that reaches the UI as a
 * blank modal.
 */

const EOCD_SIG = 0x06054b50;
const CEN_SIG  = 0x02014b50;
const LOC_SIG  = 0x04034b50;

export type XlsxError = 'NOT_A_ZIP' | 'NO_WORKSHEET' | 'UNSUPPORTED_COMPRESSION' | 'CORRUPT_FILE';

interface ZipEntry { name: string; method: number; compressedSize: number; localOffset: number }

/**
 * Index the ZIP central directory.
 *
 * The central directory is read rather than the local headers because a local
 * header may declare sizes of 0 and defer them to a trailing data descriptor —
 * streaming writers (which is what most spreadsheet exporters are) do exactly
 * that, and trusting the local sizes yields empty entries.
 */
function readCentralDirectory(buf: DataView): ZipEntry[] | XlsxError {
  const len = buf.byteLength;
  if (len < 22) return 'NOT_A_ZIP';

  // The EOCD sits at the end, after a comment of up to 64 KB.
  let eocd = -1;
  for (let i = len - 22; i >= Math.max(0, len - 22 - 0xffff); i--) {
    if (buf.getUint32(i, true) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) return 'NOT_A_ZIP';

  const count = buf.getUint16(eocd + 10, true);
  let p = buf.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];

  for (let i = 0; i < count; i++) {
    if (p + 46 > len || buf.getUint32(p, true) !== CEN_SIG) return 'CORRUPT_FILE';
    const method    = buf.getUint16(p + 10, true);
    const compSize  = buf.getUint32(p + 20, true);
    const nameLen   = buf.getUint16(p + 28, true);
    const extraLen  = buf.getUint16(p + 30, true);
    const commentLen = buf.getUint16(p + 32, true);
    const localOffset = buf.getUint32(p + 42, true);
    const nameBytes = new Uint8Array(buf.buffer, buf.byteOffset + p + 46, nameLen);
    entries.push({
      name: new TextDecoder().decode(nameBytes),
      method, compressedSize: compSize, localOffset,
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/**
 * Inflate a raw DEFLATE payload — the compression every .xlsx writer uses.
 *
 * The source is an explicit ReadableStream rather than `new Blob([…]).stream()`:
 * Blob.stream() is missing in some non-browser runtimes (jsdom, for one), and the
 * constructed stream is the same two lines with no dependency on Blob at all.
 */
async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  // Typed as BufferSource: DecompressionStream's writable side accepts any
  // BufferSource, and pinning the source stream to Uint8Array makes the two
  // generic parameters disagree.
  // Copied into a freshly allocated buffer: `bytes` is a view onto the caller's
  // ArrayBufferLike, which TypeScript will not narrow to the ArrayBuffer that
  // BufferSource requires. The copy is one entry per ZIP part, not per row.
  const chunk = new Uint8Array(bytes.byteLength);
  chunk.set(bytes);
  const source = new ReadableStream<BufferSource>({
    start(controller) { controller.enqueue(chunk); controller.close(); },
  });
  const out = source.pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** Extract one entry's text. Handles stored (0) and deflate (8). */
async function readEntry(buf: DataView, e: ZipEntry): Promise<string | XlsxError> {
  const base = buf.byteOffset + e.localOffset;
  if (buf.getUint32(e.localOffset, true) !== LOC_SIG) return 'CORRUPT_FILE';
  // Name/extra lengths come from the LOCAL header: they may legitimately differ
  // from the central directory's, and they decide where the data starts.
  const nameLen  = buf.getUint16(e.localOffset + 26, true);
  const extraLen = buf.getUint16(e.localOffset + 28, true);
  const start = base + 30 + nameLen + extraLen;
  const raw = new Uint8Array(buf.buffer, start, e.compressedSize);

  if (e.method === 0) return new TextDecoder().decode(raw);
  if (e.method !== 8) return 'UNSUPPORTED_COMPRESSION';
  try { return new TextDecoder().decode(await inflate(raw)); }
  catch { return 'CORRUPT_FILE'; }
}

const decodeXmlEntities = (s: string) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
  .replace(/&amp;/g, '&');   // last, so "&amp;lt;" does not become "<"

/**
 * Shared strings table. Most cells in a real spreadsheet are indexes into this,
 * not literal text. A single <si> may hold several <t> runs (mixed formatting),
 * which must be concatenated or the cell loses half its value.
 */
export function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  for (const si of xml.match(/<si\b[\s\S]*?<\/si>/g) ?? []) {
    const parts = [...si.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(m => decodeXmlEntities(m[1]));
    out.push(parts.join(''));
  }
  return out;
}

/** "BC" → 54. Column letters are base-26 with no zero. */
export function columnIndex(ref: string): number {
  let n = 0;
  for (const ch of ref.replace(/\d+/g, '').toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Worksheet XML → grid. Blank cells are preserved so columns stay aligned. */
export function parseSheet(xml: string, shared: readonly string[]): string[][] {
  const grid: string[][] = [];
  for (const rowXml of xml.match(/<row\b[\s\S]*?(?:\/>|<\/row>)/g) ?? []) {
    const row: string[] = [];
    for (const m of rowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = m[1], body = m[2];
      const ref = /r="([A-Z]+\d+)"/.exec(attrs)?.[1] ?? '';
      const type = /t="([^"]+)"/.exec(attrs)?.[1] ?? '';
      let value = '';
      if (type === 'inlineStr') {
        value = [...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(t => decodeXmlEntities(t[1])).join('');
      } else {
        const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? '';
        // t="s" means the <v> is an INDEX into sharedStrings, not the text. Reading
        // it literally would fill the CRM with row numbers.
        value = type === 's' ? (shared[Number(v)] ?? '') : decodeXmlEntities(v);
      }
      // Honour the cell reference: a sparse row omits empty cells entirely, so
      // appending in order would shift every value left into the wrong column.
      const at = ref ? columnIndex(ref) : row.length;
      while (row.length < at) row.push('');
      row[at] = value;
    }
    grid.push(row);
  }
  return grid.filter(r => r.some(cell => cell.trim() !== ''));
}

export interface XlsxResult { grid: string[][]; error?: XlsxError }

/** Read the first worksheet of an .xlsx file into a string grid. */
export async function parseXlsx(data: ArrayBuffer): Promise<XlsxResult> {
  const buf = new DataView(data);
  const dir = readCentralDirectory(buf);
  if (!Array.isArray(dir)) return { grid: [], error: dir };

  // sheet1.xml is the conventional name, but the part is only guaranteed to live
  // under xl/worksheets/, so fall back to the first worksheet present.
  const sheetEntry = dir.find(e => e.name === 'xl/worksheets/sheet1.xml')
    ?? dir.find(e => /^xl\/worksheets\/[^/]+\.xml$/.test(e.name));
  if (!sheetEntry) return { grid: [], error: 'NO_WORKSHEET' };

  const sharedEntry = dir.find(e => e.name === 'xl/sharedStrings.xml');
  const sharedXml = sharedEntry ? await readEntry(buf, sharedEntry) : '';
  const shared = typeof sharedXml === 'string' ? parseSharedStrings(sharedXml) : [];

  const sheetXml = await readEntry(buf, sheetEntry);
  if (typeof sheetXml !== 'string') return { grid: [], error: sheetXml };

  return { grid: parseSheet(sheetXml, shared) };
}
