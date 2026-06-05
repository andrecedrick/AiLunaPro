/**
 * Deterministic vector charts/schematics for the Audit Express PDF (J15 P1
 * visual upgrade). PURE: no randomness, no time, no images — only rectangles,
 * lines, and text via the PdfBuilder primitives, so output stays byte-stable.
 *
 * All placement is a fixed function of the inputs (enum -> fixed coordinate,
 * index -> fixed offset), guaranteeing identical bytes for identical input.
 */

import { PdfBuilder, PDF_COLORS, type Rgb } from './pdf-doc';
import { measureText, wrapText, type PdfFont } from './helvetica-metrics';

const C = PDF_COLORS;

/** 1px-border box via two stacked rects (fill inset inside border). */
function box(b: PdfBuilder, x: number, yTop: number, w: number, h: number, fill: Rgb, border: Rgb): void {
  b.rectAbs(x, yTop - h, w, h, border);
  b.rectAbs(x + 1, yTop - h + 1, w - 2, h - 2, fill);
}

function centerText(b: PdfBuilder, cx: number, y: number, size: number, font: PdfFont, color: Rgb, text: string): void {
  b.textAbs(cx - measureText(text, font, size) / 2, y, size, font, color, text);
}

/** Readiness: 0-100 horizontal bar with low/med/high zone ticks + gradient fill. */
export function drawReadinessBar(b: PdfBuilder, score: number, bucket: string): void {
  const H = 46;
  const { left, width, top } = b.reserve(H);
  const barY = top - 30, barH = 12;
  const s = Math.max(0, Math.min(100, score));
  // track
  b.rectAbs(left, barY, width, barH, C.border);
  // gradient fill to score
  if (s > 0) b.gradientBar(left, barY, (width * s) / 100, barH);
  // zone ticks at the documented cutoffs (39 / 69)
  for (const cut of [39, 69]) {
    const x = left + (width * cut) / 100;
    b.lineAbs(x, barY - 2, x, barY + barH + 2, C.muted);
  }
  // labels
  b.textAbs(left, top, 10, 'bold', C.ink, `Readiness ${s}/100`);
  const badge = `band: ${bucket}`;
  b.textAbs(left + width - measureText(badge, 'bold', 10), top, 10, 'bold', C.violet, badge);
  b.textAbs(left, barY - 12, 7.5, 'regular', C.muted, 'low');
  centerText(b, left + width * 0.54, barY - 12, 7.5, 'regular', C.muted, 'medium');
  b.textAbs(left + width - measureText('high', 'regular', 7.5), barY - 12, 7.5, 'regular', C.muted, 'high');
  b.advance(H + 8);
}

/** Two KPI tiles side by side. */
export function drawKpiTiles(b: PdfBuilder, tiles: Array<{ value: string; label: string }>): void {
  const H = 58;
  const { left, width, top } = b.reserve(H);
  const gap = 12, n = tiles.length || 1;
  const tw = (width - gap * (n - 1)) / n;
  for (let i = 0; i < tiles.length; i++) {
    const x = left + i * (tw + gap);
    box(b, x, top, tw, H, C.surface2, C.border);
    b.rectAbs(x + 1, top - 4, tw - 2, 3, i === 0 ? C.violet : C.cyan);
    centerText(b, x + tw / 2, top - 30, 19, 'bold', C.ink, tiles[i].value);
    centerText(b, x + tw / 2, top - 46, 8.5, 'regular', C.muted, tiles[i].label);
  }
  b.advance(H + 10);
}

/** Horizontal bar chart. Values normalized to the max; display string at end. */
export function drawBarChart(b: PdfBuilder, items: Array<{ label: string; value: number; display: string }>): void {
  const rowH = 20, H = items.length * rowH + 6;
  const { left, width, top } = b.reserve(H);
  const max = Math.max(1, ...items.map(i => i.value));
  const labelW = 130, barMax = width - labelW - 70;
  for (let i = 0; i < items.length; i++) {
    const y = top - i * rowH - 14;
    b.textAbs(left, y, 9, 'regular', C.ink, items[i].label);
    const bw = Math.max(2, (barMax * items[i].value) / max);
    b.rectAbs(left + labelW, y - 1, barMax, 9, C.surface2);
    b.gradientBar(left + labelW, y - 1, bw, 9);
    b.textAbs(left + labelW + bw + 6, y, 9, 'bold', C.ink, items[i].display);
  }
  b.advance(H + 10);
}

const IMPACT_POS: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8 };
const EFFORT_POS: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8 };

/** Opportunity matrix: Impact (y) vs Effort (x), 2x2 grid + plotted points. */
export function drawOpportunityMatrix(b: PdfBuilder, points: Array<{ impact: string; effort: string; label: string }>): void {
  const size = 210, H = size + 16;
  const { left, top } = b.reserve(H);
  const ox = left + 60, oy = top - size; // plot origin (bottom-left of square)
  // square + quadrant grid
  box(b, ox, top, size, size, C.white, C.border);
  b.lineAbs(ox + size / 2, oy, ox + size / 2, oy + size, C.border);
  b.lineAbs(ox, oy + size / 2, ox + size, oy + size / 2, C.border);
  // axis labels
  centerText(b, ox + size / 2, oy - 12, 8, 'bold', C.muted, 'Effort  (low -> high)');
  b.textAbs(left, oy + size / 2, 8, 'bold', C.muted, 'Impact');
  // plotted points (deterministic per-index offset to de-overlap shared cells)
  for (let i = 0; i < points.length; i++) {
    const fx = EFFORT_POS[points[i].effort] ?? 0.5;
    const fy = IMPACT_POS[points[i].impact] ?? 0.5;
    const dx = ((i % 2) * 2 - 1) * 7;
    const dy = ((Math.floor(i / 2) % 2) * 2 - 1) * 7;
    const px = ox + size * fx + dx;
    const py = oy + size * fy + dy;
    b.rectAbs(px - 5, py - 5, 10, 10, C.violet);
    centerText(b, px, py - 3.2, 7, 'bold', C.white, String(i + 1));
  }
  b.advance(H + 8);
}

/** 4-step "how it works" schematic: numbered boxes + arrows. */
export function drawSchematic(b: PdfBuilder, steps: string[]): void {
  const H = 64;
  const { left, width, top } = b.reserve(H);
  const arrow = 16, n = steps.length || 1;
  const bw = (width - arrow * (n - 1)) / n, bh = 48;
  for (let i = 0; i < steps.length; i++) {
    const x = left + i * (bw + arrow);
    box(b, x, top, bw, bh, C.surface2, C.border);
    b.rectAbs(x, top - bh, 3, bh, i === 0 ? C.violet : C.cyan);
    // step number
    centerText(b, x + bw / 2, top - 16, 11, 'bold', C.violet, String(i + 1));
    // wrapped label
    const lines = wrapText(steps[i], 'regular', 7.5, bw - 10).slice(0, 2);
    let ty = top - 28;
    for (const ln of lines) { centerText(b, x + bw / 2, ty, 7.5, 'regular', C.ink, ln); ty -= 9; }
    // arrow to next
    if (i < steps.length - 1) {
      const ax = x + bw, ay = top - bh / 2;
      b.lineAbs(ax + 2, ay, ax + arrow - 2, ay, C.muted);
      b.lineAbs(ax + arrow - 6, ay + 3, ax + arrow - 2, ay, C.muted);
      b.lineAbs(ax + arrow - 6, ay - 3, ax + arrow - 2, ay, C.muted);
    }
  }
  b.advance(H + 8);
}
