/**
 * Minimal, dependency-free, DETERMINISTIC PDF writer for the Audit Express
 * report (J15 P1). Base-14 Helvetica only (no font embedding). Produces
 * byte-identical output for identical input + createdAt:
 *   - no document /ID, no random anything
 *   - /Info dates derived solely from the provided createdAt
 *   - fixed /Producer + /Creator
 *   - all coordinates formatted with a fixed, deterministic number format
 *
 * Layout is two-pass so inline [n] reference markers on early pages can link to
 * appendix entries laid out later (forward references resolved at serialize).
 */

import { type PdfFont, measureText, wrapText, asciiSanitize, truncateToWidth } from './helvetica-metrics';

const PAGE_W = 595.28; // A4 portrait
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM = MARGIN;
// Content must stop above the footer band (footer rule at BOTTOM+14, text at
// BOTTOM+4). Reserving this keeps body content from ever overlapping the footer.
const CONTENT_BOTTOM = MARGIN + 24;

interface TextOp { kind: 'text'; x: number; y: number; size: number; font: PdfFont; color: [number, number, number]; text: string }
interface RectOp { kind: 'rect'; x: number; y: number; w: number; h: number; color: [number, number, number] }
interface LineOp { kind: 'line'; x1: number; y1: number; x2: number; y2: number; color: [number, number, number] }
type Op = TextOp | RectOp | LineOp;

interface PendingAnnot { pageIndex: number; rect: [number, number, number, number]; targetId: string }

const VIOLET: [number, number, number] = [0.486, 0.227, 0.929];
const CYAN: [number, number, number] = [0.133, 0.827, 0.933];
const INK: [number, number, number] = [0.06, 0.09, 0.16];
const MUTED: [number, number, number] = [0.39, 0.45, 0.55];
const AMBER_BG: [number, number, number] = [0.996, 0.953, 0.78];
const TINT_BG: [number, number, number] = [0.93, 0.91, 0.996];

export type Rgb = [number, number, number];
/** Shared deterministic palette for chart/composite drawing (pdf-charts.ts). */
export const PDF_COLORS = {
  violet: VIOLET, cyan: CYAN, ink: INK, muted: MUTED,
  amberBg: AMBER_BG, tintBg: TINT_BG,
  white: [1, 1, 1] as Rgb,
  border: [0.85, 0.87, 0.9] as Rgb,
  surface2: [0.97, 0.975, 0.99] as Rgb,
};

export class PdfBuilder {
  private pages: Op[][] = [[]];
  private annots: PendingAnnot[] = [];
  private targets: Record<string, { pageIndex: number; y: number }> = {};
  private pi = 0;       // current page index
  private y = PAGE_H - MARGIN; // cursor (PDF coords, from top)

  private cur(): Op[] { return this.pages[this.pi]; }

  private newPage(): void {
    this.pages.push([]);
    this.pi = this.pages.length - 1;
    this.y = PAGE_H - MARGIN;
  }

  private ensure(h: number): void {
    if (this.y - h < CONTENT_BOTTOM) this.newPage();
  }

  /* ── Public vector primitives + block reservation (used by pdf-charts.ts) ── */

  get metrics(): { pageW: number; pageH: number; margin: number; contentW: number } {
    return { pageW: PAGE_W, pageH: PAGE_H, margin: MARGIN, contentW: CONTENT_W };
  }

  /** Ensure `h` points of vertical space; returns the block's top-left + width.
   *  Does NOT advance the cursor — call advance(h) after drawing. */
  reserve(h: number): { top: number; left: number; width: number } {
    this.ensure(h);
    return { top: this.y, left: MARGIN, width: CONTENT_W };
  }
  advance(h: number): void { this.y -= h; }

  rectAbs(x: number, y: number, w: number, h: number, color: [number, number, number]): void {
    this.cur().push({ kind: 'rect', x, y, w, h, color });
  }
  lineAbs(x1: number, y1: number, x2: number, y2: number, color: [number, number, number]): void {
    this.cur().push({ kind: 'line', x1, y1, x2, y2, color });
  }
  textAbs(x: number, y: number, size: number, font: PdfFont, color: [number, number, number], text: string): void {
    this.cur().push({ kind: 'text', x, y, size, font, color, text });
  }

  /** Deterministic horizontal brand gradient (violet -> cyan) as N stacked rects. */
  gradientBar(x: number, y: number, w: number, h: number, steps = 48): void {
    const from = VIOLET, to = CYAN;
    for (let i = 0; i < steps; i++) {
      const t = steps <= 1 ? 0 : i / (steps - 1);
      const c: [number, number, number] = [
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      ];
      this.rectAbs(x + (w * i) / steps, y, w / steps + 0.6, h, c);
    }
  }

  /** Full-bleed cover header (gradient band + white title/subtitle) at page top. */
  coverHeader(title: string, subtitle: string): void {
    const bandH = 92;
    const top = PAGE_H; // page 1 starts here
    this.gradientBar(0, top - bandH, PAGE_W, bandH);
    const titleFit = truncateToWidth(title, 'bold', 22, PAGE_W - MARGIN * 2);
    this.cur().push({ kind: 'text', x: MARGIN, y: top - 44, size: 22, font: 'bold', color: [1, 1, 1], text: titleFit });
    this.cur().push({ kind: 'text', x: MARGIN, y: top - 66, size: 10, font: 'regular', color: [1, 1, 1], text: subtitle });
    this.y = top - bandH - 16;
  }

  /** Boxed "Version & integrity" card: label (bold) + value (monospace). */
  monoStamp(title: string, rows: Array<[string, string]>): void {
    const size = 9, lineGap = 5, pad = 12, titleH = 16, valX = MARGIN + pad + 120;
    const valW = CONTENT_W - 120 - pad * 2; // mono value column width (right-padded)
    // Pre-wrap each value so long tokens (inputsHash / URLs) never overflow.
    const wrapped = rows.map(([label, value]) => ({ label, lines: wrapText(value, 'mono', size, valW) }));
    const totalLines = wrapped.reduce((n, r) => n + r.lines.length, 0);
    const boxH = pad * 2 + titleH + totalLines * (size + lineGap);
    this.ensure(boxH + 8);
    const top = this.y;
    this.rectAbs(MARGIN, top - boxH, CONTENT_W, boxH, PDF_COLORS.surface2);
    this.rectAbs(MARGIN, top - boxH, 3, boxH, VIOLET); // accent rail
    let ty = top - pad - 12;
    this.cur().push({ kind: 'text', x: MARGIN + pad, y: ty, size: 12, font: 'bold', color: INK, text: title });
    ty -= 8;
    for (const row of wrapped) {
      for (let i = 0; i < row.lines.length; i++) {
        ty -= size;
        if (i === 0) this.cur().push({ kind: 'text', x: MARGIN + pad, y: ty, size, font: 'bold', color: MUTED, text: row.label });
        this.cur().push({ kind: 'text', x: valX, y: ty, size, font: 'mono', color: INK, text: row.lines[i] });
        ty -= lineGap;
      }
    }
    this.y = top - boxH - 12;
  }

  spacer(h: number): void { this.y -= h; }

  hr(): void {
    this.ensure(10);
    this.y -= 6;
    this.cur().push({ kind: 'line', x1: MARGIN, y1: this.y, x2: PAGE_W - MARGIN, y2: this.y, color: [0.85, 0.87, 0.9] });
    this.y -= 8;
  }

  /** Draw wrapped text; returns nothing. */
  private drawWrapped(text: string, font: PdfFont, size: number, color: [number, number, number], lineGap = 4, indent = 0): void {
    const lines = wrapText(text, font, size, CONTENT_W - indent);
    for (const line of lines) {
      this.ensure(size + lineGap);
      this.y -= size;
      this.cur().push({ kind: 'text', x: MARGIN + indent, y: this.y, size, font, color, text: line });
      this.y -= lineGap;
    }
  }

  h1(text: string): void { this.spacer(2); this.drawWrapped(text, 'bold', 22, VIOLET, 6); }
  h2(text: string): void { this.ensure(26); this.spacer(8); this.drawWrapped(text, 'bold', 14, INK, 5); this.y -= 2; }
  h3(text: string): void { this.ensure(20); this.spacer(5); this.drawWrapped(text, 'bold', 11.5, INK, 4); this.y -= 1; }
  para(text: string): void { this.drawWrapped(text, 'regular', 10, INK, 4); this.y -= 3; }

  /** Force a new page (gives the cover its own page; starts sections cleanly). */
  pageBreak(): void { this.newPage(); }
  /** Current cursor Y (for absolute-positioned composites). */
  get cursorY(): number { return this.y; }
  muted(text: string, size = 9): void { this.drawWrapped(text, 'regular', size, MUTED, 3); }

  /** Key/value line (version stamp). */
  kv(label: string, value: string): void {
    this.ensure(14);
    this.y -= 11;
    this.cur().push({ kind: 'text', x: MARGIN, y: this.y, size: 9, font: 'bold', color: MUTED, text: asciiSanitize(label) });
    const lw = measureText(asciiSanitize(label), 'bold', 9);
    this.cur().push({ kind: 'text', x: MARGIN + lw + 6, y: this.y, size: 9, font: 'regular', color: INK, text: asciiSanitize(value) });
    this.y -= 3;
  }

  /** Filled callout box containing wrapped text (e.g. disclaimer). */
  callout(text: string, bg: 'amber' | 'tint' = 'amber'): void {
    const size = 9.5, lineGap = 3, pad = 10;
    const lines = wrapText(text, 'regular', size, CONTENT_W - pad * 2);
    const boxH = pad * 2 + lines.length * (size + lineGap) - lineGap;
    this.ensure(boxH + 8);
    const top = this.y;
    this.cur().push({ kind: 'rect', x: MARGIN, y: top - boxH, w: CONTENT_W, h: boxH, color: bg === 'amber' ? AMBER_BG : TINT_BG });
    let ty = top - pad;
    for (const line of lines) {
      ty -= size;
      this.cur().push({ kind: 'text', x: MARGIN + pad, y: ty, size, font: 'regular', color: bg === 'amber' ? [0.57, 0.25, 0.05] : VIOLET, text: line });
      ty -= lineGap;
    }
    this.y = top - boxH - 8;
  }

  /** Bullet line with optional trailing [n] reference links. */
  bullet(text: string, refIds: string[] = []): void {
    const size = 10, lineGap = 4, indent = 14;
    const lines = wrapText(text, 'regular', size, CONTENT_W - indent);
    for (let i = 0; i < lines.length; i++) {
      this.ensure(size + lineGap);
      this.y -= size;
      if (i === 0) this.cur().push({ kind: 'text', x: MARGIN, y: this.y, size, font: 'bold', color: VIOLET, text: '-' });
      this.cur().push({ kind: 'text', x: MARGIN + indent, y: this.y, size, font: 'regular', color: INK, text: lines[i] });
      if (i === lines.length - 1 && refIds.length) {
        this.appendRefs(MARGIN + indent + measureText(lines[i], 'regular', size), this.y, size, refIds);
      }
      this.y -= lineGap;
    }
  }

  /** Two-column row: left label (regular), right value; optional refs after value. */
  row(left: string, right: string, refIds: string[] = []): void {
    const size = 10; const leftW = CONTENT_W * 0.62;
    const lLines = wrapText(left, 'regular', size, leftW - 6);
    this.ensure(Math.max(lLines.length, 1) * (size + 4));
    const startY = this.y;
    for (let i = 0; i < lLines.length; i++) {
      this.y -= size;
      this.cur().push({ kind: 'text', x: MARGIN, y: this.y, size, font: 'regular', color: INK, text: lLines[i] });
      this.y -= 4;
    }
    // right value on first line — truncated to its column so it never overlaps
    // the [n] refs or the right margin (reserve ~36pt when refs follow).
    const ry = startY - size;
    const rightMax = CONTENT_W - leftW - (refIds.length ? 36 : 4);
    const rightFit = truncateToWidth(right, 'bold', size, rightMax);
    this.cur().push({ kind: 'text', x: MARGIN + leftW, y: ry, size, font: 'bold', color: INK, text: rightFit });
    if (refIds.length) this.appendRefs(MARGIN + leftW + measureText(rightFit, 'bold', size), ry, size, refIds);
  }

  /** Append " [n]" markers as clickable links to appendix targets. */
  private appendRefs(x: number, y: number, size: number, refIds: string[]): void {
    let cx = x;
    const draw = (s: string, font: PdfFont, color: [number, number, number]) => {
      this.cur().push({ kind: 'text', x: cx, y, size: size - 1.5, font, color, text: s });
      cx += measureText(s, font, size - 1.5);
    };
    draw(' [', 'regular', MUTED);
    for (let i = 0; i < refIds.length; i++) {
      if (i > 0) draw(',', 'regular', MUTED);
      const id = refIds[i];
      const num = this.refNumber(id);
      const label = String(num);
      const x1 = cx;
      draw(label, 'bold', VIOLET);
      this.annots.push({ pageIndex: this.pi, rect: [x1 - 0.5, y - 1.5, cx + 0.5, y + size - 2], targetId: id });
    }
    draw(']', 'regular', MUTED);
  }

  // Stable numbering of appendix entries, assigned in first-encounter order.
  private refOrder: string[] = [];
  private refNumber(id: string): number {
    let idx = this.refOrder.indexOf(id);
    if (idx === -1) { this.refOrder.push(id); idx = this.refOrder.length - 1; }
    return idx + 1;
  }
  /** Returns appendix ids in stable (first-encountered) order. */
  orderedRefIds(): string[] { return [...this.refOrder]; }

  /** Mark an appendix entry target (records page+y for link /Dest). */
  appendixEntry(id: string, label: string): void {
    const size = 9.5;
    const num = this.refNumber(id);
    const lines = wrapText(`${num}. ${label}`, 'regular', size, CONTENT_W - 4);
    this.ensure(lines.length * (size + 3) + 2);
    // record target at the top of this entry
    this.targets[id] = { pageIndex: this.pi, y: this.y };
    for (const line of lines) {
      this.y -= size;
      this.cur().push({ kind: 'text', x: MARGIN, y: this.y, size, font: 'regular', color: INK, text: line });
      this.y -= 3;
    }
  }

  /** Small monospaced muted note (e.g. the raw rule id under an appendix entry).
   *  Wraps long ids so they never overflow the right margin. */
  monoNote(text: string): void {
    const size = 7.5, indent = 14;
    for (const line of wrapText(text, 'mono', size, CONTENT_W - indent)) {
      this.ensure(size + 4);
      this.y -= size;
      this.cur().push({ kind: 'text', x: MARGIN + indent, y: this.y, size, font: 'mono', color: MUTED, text: line });
      this.y -= 4;
    }
  }

  /** Footer on every page: disclaimer + page number. Call once before serialize. */
  private footers(versionLine: string): void {
    for (let p = 0; p < this.pages.length; p++) {
      const ftext = `${versionLine}   -   Page ${p + 1} of ${this.pages.length}`;
      this.pages[p].push({ kind: 'line', x1: MARGIN, y1: BOTTOM + 14, x2: PAGE_W - MARGIN, y2: BOTTOM + 14, color: [0.9, 0.91, 0.93] });
      this.pages[p].push({ kind: 'text', x: MARGIN, y: BOTTOM + 4, size: 7.5, font: 'regular', color: MUTED, text: asciiSanitize(ftext) });
    }
  }

  /* ── Serialization ─────────────────────────────────────────────── */

  serialize(opts: { createdAt: string; footerVersion: string }): Uint8Array {
    this.footers(opts.footerVersion);
    // Objects 1..6 fixed; pages start at 7. F1=Helvetica, F2=Helvetica-Bold, F3=Courier.
    const pageObjNum = (i: number) => 7 + i * 2;

    const objects: string[] = [];
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    const kids = this.pages.map((_, i) => `${pageObjNum(i)} 0 R`).join(' ');
    objects[2] = `<< /Type /Pages /Kids [ ${kids} ] /Count ${this.pages.length} >>`;
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>';
    const d = pdfDate(opts.createdAt);
    objects[6] = `<< /Producer (AiLunaPro PDF v1) /Creator (AiLunaPro) /CreationDate (${d}) /ModDate (${d}) >>`;

    for (let i = 0; i < this.pages.length; i++) {
      const content = renderContent(this.pages[i]);
      const annots = this.annots
        .filter(a => a.pageIndex === i)
        .map(a => {
          const t = this.targets[a.targetId];
          const destPage = t ? pageObjNum(t.pageIndex) : pageObjNum(i);
          const destY = t ? fmt(t.y + 4) : fmt(PAGE_H - MARGIN);
          const r = a.rect.map(fmt).join(' ');
          return `<< /Type /Annot /Subtype /Link /Rect [ ${r} ] /Border [0 0 0] /Dest [ ${destPage} 0 R /XYZ ${fmt(MARGIN)} ${destY} null ] >>`;
        });
      const annotStr = annots.length ? ` /Annots [ ${annots.join(' ')} ]` : '';
      objects[pageObjNum(i)] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(PAGE_W)} ${fmt(PAGE_H)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >>${annotStr} /Contents ${pageObjNum(i) + 1} 0 R >>`;
      objects[pageObjNum(i) + 1] = `<< /Length ${byteLen(content)} >>\nstream\n${content}\nendstream`;
    }

    return assemble(objects);
  }
}

/* ── Low-level helpers ─────────────────────────────────────────────── */

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  let s = r.toFixed(2);
  s = s.replace(/\.?0+$/, '');
  return s === '' || s === '-0' ? '0' : s;
}

function escapeText(s: string): string {
  return asciiSanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function renderContent(ops: Op[]): string {
  const out: string[] = [];
  for (const op of ops) {
    if (op.kind === 'rect') {
      out.push(`${fmt(op.color[0])} ${fmt(op.color[1])} ${fmt(op.color[2])} rg`);
      out.push(`${fmt(op.x)} ${fmt(op.y)} ${fmt(op.w)} ${fmt(op.h)} re f`);
    } else if (op.kind === 'line') {
      out.push(`${fmt(op.color[0])} ${fmt(op.color[1])} ${fmt(op.color[2])} RG 0.7 w`);
      out.push(`${fmt(op.x1)} ${fmt(op.y1)} m ${fmt(op.x2)} ${fmt(op.y2)} l S`);
    } else {
      const f = op.font === 'bold' ? '/F2' : op.font === 'mono' ? '/F3' : '/F1';
      out.push('BT');
      out.push(`${fmt(op.color[0])} ${fmt(op.color[1])} ${fmt(op.color[2])} rg`);
      out.push(`${f} ${fmt(op.size)} Tf`);
      out.push(`1 0 0 1 ${fmt(op.x)} ${fmt(op.y)} Tm`);
      out.push(`(${escapeText(op.text)}) Tj`);
      out.push('ET');
    }
  }
  return out.join('\n');
}

function byteLen(s: string): number {
  // Content is ASCII after sanitize/escape -> 1 byte per char.
  let n = 0;
  for (let i = 0; i < s.length; i++) n += s.charCodeAt(i) > 0xff ? 2 : 1;
  return n;
}

/** Format an ISO timestamp as a PDF date string D:YYYYMMDDHHmmSSZ (UTC). */
function pdfDate(iso: string): string {
  const d = new Date(iso);
  const t = Number.isNaN(d.getTime()) ? new Date('2026-01-01T00:00:00Z') : d;
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `D:${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}${p(t.getUTCSeconds())}Z`;
}

/** Assemble objects (1..N contiguous) into a PDF byte stream with xref. */
function assemble(objects: string[]): Uint8Array {
  const bytes: number[] = [];
  const pushStr = (s: string) => { for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i) & 0xff); };

  // Header with binary comment (high bytes) so tools treat it as binary.
  pushStr('%PDF-1.4\n');
  bytes.push(0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a);

  const count = objects.length; // index 0 unused
  const offsets: number[] = new Array(count).fill(0);
  for (let n = 1; n < count; n++) {
    offsets[n] = bytes.length;
    pushStr(`${n} 0 obj\n${objects[n]}\nendobj\n`);
  }

  const xrefStart = bytes.length;
  pushStr(`xref\n0 ${count}\n`);
  pushStr('0000000000 65535 f \n');
  for (let n = 1; n < count; n++) {
    pushStr(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size ${count} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return Uint8Array.from(bytes);
}

export const PDF_PAGE = { W: PAGE_W, H: PAGE_H, MARGIN };
