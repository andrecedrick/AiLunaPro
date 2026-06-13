/**
 * White-paper visual primitives (deterministic, vector-only — no images, no
 * randomness, no time). Built on the public PdfBuilder API so byte-output stays
 * reproducible. Shared by the Full-Audit Report PDF and the Audit Express PDF
 * so both deliver the same premium, consulting-grade layout.
 */

import { PdfBuilder, PDF_COLORS as C } from './pdf-doc';
import { measureText, wrapText } from './helvetica-metrics';
import { LOGO_ASSET } from './logo-asset';

/** A dedicated, elegant cover page. Draws on the current (first) page, then
 *  breaks so section 2 starts on a clean page. Absolute-positioned for control. */
export function coverPage(
  doc: PdfBuilder,
  opts: { title: string; subtitle: string; metaRows: Array<[string, string]> },
): void {
  const { pageW, pageH, margin, contentW } = doc.metrics;

  // Top brand hairline + the OFFICIAL AiLunaPro logo (embedded raster image,
  // trimmed + composited onto white at build time). Crisp; deterministic from a
  // committed constant — no network, no redesign.
  doc.gradientBar(0, pageH - 6, pageW, 6);
  const logoW = 156, logoH = (logoW * LOGO_ASSET.height) / LOGO_ASSET.width;
  const logoTop = pageH - 40;
  doc.image(LOGO_ASSET.deflatedRgbB64, LOGO_ASSET.width, LOGO_ASSET.height, margin, logoTop - logoH, logoW, logoH);
  doc.textAbs(margin + 2, logoTop - logoH - 11, 8, 'bold', C.muted, 'C O M P L I A N C E   S U I T E');

  // Title block in the upper-middle third (lots of whitespace above + below).
  let ty = pageH * 0.56;
  for (const line of wrapText(opts.title, 'bold', 26, contentW)) {
    doc.textAbs(margin, ty, 26, 'bold', C.ink, line);
    ty -= 32;
  }
  ty -= 6;
  for (const line of wrapText(opts.subtitle, 'regular', 13, contentW * 0.86)) {
    doc.textAbs(margin, ty, 13, 'regular', C.muted, line);
    ty -= 18;
  }

  // Accent rule + meta rows near the lower third.
  const metaTop = pageH * 0.30;
  doc.lineAbs(margin, metaTop, margin + 180, metaTop, C.violet);
  let my = metaTop - 18;
  for (const [label, value] of opts.metaRows) {
    doc.textAbs(margin, my, 9, 'bold', C.muted, label);
    doc.textAbs(margin + 120, my, 9, 'regular', C.ink, value);
    my -= 15;
  }

  doc.pageBreak();
}

/** "In plain terms" concept box — tinted, with a small label, for non-experts. */
export function conceptBox(doc: PdfBuilder, term: string, definition: string): void {
  const pad = 13, size = 10.5, lineGap = 4;
  const innerW = doc.metrics.contentW - pad * 2;
  const headLines = wrapText(`In plain terms — ${term}`, 'bold', size, innerW);
  const bodyLines = wrapText(definition, 'regular', size, innerW);
  const boxH = pad * 2 + (headLines.length + bodyLines.length) * (size + lineGap);
  const { top, left, width } = doc.reserve(boxH + 8);
  doc.rectAbs(left, top - boxH, width, boxH, C.tintBg);
  doc.rectAbs(left, top - boxH, 3, boxH, C.violet);
  let y = top - pad;
  for (const l of headLines) { y -= size; doc.textAbs(left + pad, y, size, 'bold', C.violet, l); y -= lineGap; }
  for (const l of bodyLines) { y -= size; doc.textAbs(left + pad, y, size, 'regular', C.ink, l); y -= lineGap; }
  doc.advance(boxH + 8);
}

/** Input -> Process -> Output -> Impact flow as connected boxes with arrows. */
export function flowDiagram(doc: PdfBuilder, steps: [string, string, string, string]): void {
  const gap = 16, boxH = 50, labelH = 14;
  const { top, left, width } = doc.reserve(boxH + labelH + 14);
  const boxW = (width - gap * 3) / 4;
  const labels = ['INPUT', 'PROCESS', 'OUTPUT', 'IMPACT'];
  doc.textAbs(left, top, 9.5, 'bold', C.violet, 'How it plays out');
  const rowTop = top - 16;
  for (let i = 0; i < 4; i++) {
    const x = left + i * (boxW + gap);
    const isImpact = i === 3;
    const fill = isImpact ? C.tintBg : C.surface2;
    doc.rectAbs(x, rowTop - boxH, boxW, boxH, fill);
    doc.rectAbs(x, rowTop - boxH, boxW, 3.5, isImpact ? C.violet : C.cyan); // thicker top accent
    if (isImpact) doc.rectAbs(x, rowTop - boxH, 2.5, boxH, C.violet);       // emphasise the payoff box
    doc.textAbs(x + 7, rowTop - 14, 8, 'bold', isImpact ? C.violet : C.muted, labels[i]);
    const stepTxt = steps[i].replace(/\s*→\s*/g, ' -> '); // arrow -> ASCII (writer is ASCII-only)
    for (const [j, ln] of wrapText(stepTxt, 'regular', 8.5, boxW - 12).slice(0, 3).entries()) {
      doc.textAbs(x + 7, rowTop - 26 - j * 10, 8.5, 'regular', C.ink, ln);
    }
    if (i < 3) {
      const ax = x + boxW + 3, ay = rowTop - boxH / 2;
      doc.lineAbs(ax, ay, ax + gap - 5, ay, C.violet);
      doc.lineAbs(ax, ay + 0.6, ax + gap - 5, ay + 0.6, C.violet);          // double stroke = bolder arrow
      doc.lineAbs(ax + gap - 9, ay + 4, ax + gap - 5, ay, C.violet);
      doc.lineAbs(ax + gap - 9, ay - 4, ax + gap - 5, ay, C.violet);
    }
  }
  doc.advance(boxH + labelH + 14);
}

/** Maturity ladder: 5 rungs (Initial -> Optimised), current level highlighted. */
export function maturityLadder(doc: PdfBuilder, level: number): void {
  const RUNGS = ['Initial', 'Developing', 'Defined', 'Managed', 'Optimised'];
  const rowH = 22, gap = 5;
  const total = RUNGS.length * (rowH + gap);
  const { top, left, width } = doc.reserve(total + 6);
  for (let i = 0; i < RUNGS.length; i++) {
    const lvl = i + 1;
    const y = top - i * (rowH + gap);
    const active = lvl === level;
    const reached = lvl <= level;
    const barW = (width * 0.5 * lvl) / RUNGS.length + width * 0.12;
    doc.rectAbs(left, y - rowH, width, rowH, active ? C.tintBg : C.surface2);
    if (reached) { doc.rectAbs(left, y - rowH, barW, rowH, C.surface2); doc.gradientBar(left, y - rowH + 4, barW, rowH - 8); }
    doc.rectAbs(left, y - rowH, 3, rowH, active ? C.violet : C.border);
    doc.textAbs(left + 12, y - 14, 10.5, active ? 'bold' : 'regular', active ? C.violet : C.ink, `Level ${lvl} - ${RUNGS[i]}`);
    if (active) doc.textAbs(left + width - measureText('you are here', 'bold', 9) - 10, y - 14, 9, 'bold', C.violet, 'you are here');
  }
  doc.advance(total + 6);
}

/** Two columns: green "what's working" beside amber "what to improve". */
export function twoColumn(
  doc: PdfBuilder,
  left: { title: string; items: string[] },
  right: { title: string; items: string[] },
): void {
  const green: [number, number, number] = [0.08, 0.5, 0.24];
  const amber: [number, number, number] = [0.57, 0.25, 0.05];
  const size = 10, lineGap = 5, pad = 12, gap = 14;
  const colW = (doc.metrics.contentW - gap) / 2;
  const innerW = colW - pad * 2 - 8;
  const layout = (items: string[]) => items.map(it => wrapText(`- ${it}`, 'regular', size, innerW));
  const lW = layout(left.items.length ? left.items : ['No standout strengths flagged yet.']);
  const rW = layout(right.items.length ? right.items : ['No major gaps flagged.']);
  const lines = (w: string[][]) => w.reduce((n, l) => n + l.length, 0);
  const bodyH = Math.max(lines(lW), lines(rW)) * (size + lineGap);
  const boxH = pad * 2 + 22 + bodyH;
  const { top, left: x0, width } = doc.reserve(boxH + 8);
  const draw = (x: number, title: string, color: [number, number, number], wrapped: string[][]) => {
    doc.rectAbs(x, top - boxH, colW, boxH, C.surface2);
    doc.rectAbs(x, top - boxH, colW, 3, color);
    doc.textAbs(x + pad, top - pad - 9, 11, 'bold', color, title);
    let y = top - pad - 24;
    for (const para of wrapped) for (const ln of para) { doc.textAbs(x + pad, y, size, 'regular', C.ink, ln); y -= size + lineGap; }
  };
  draw(x0, left.title, green, lW);
  draw(x0 + colW + gap, right.title, amber, rW);
  void width;
  doc.advance(boxH + 8);
}
