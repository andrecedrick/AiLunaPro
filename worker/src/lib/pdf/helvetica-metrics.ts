/**
 * Helvetica / Helvetica-Bold AFM glyph widths (units per 1000 em) for the
 * printable ASCII range 32..126. Used for deterministic text measurement and
 * word wrapping in the hand-rolled PDF writer (no external dependency).
 *
 * Standard Adobe AFM values for the base-14 fonts. Text is sanitized to ASCII
 * before measurement (see asciiSanitize), so codes outside 32..126 never occur.
 */

// Index = charCode - 32 (i.e. 0 == space, 94 == '~').
const HELVETICA: readonly number[] = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, // 32-47
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, // 48-63
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, // 64-79
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, // 80-95
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, // 96-111
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,       // 112-126
];

const HELVETICA_BOLD: readonly number[] = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, // 32-47
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, // 48-63
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, // 64-79
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, // 80-95
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, // 96-111
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,       // 112-126
];

export type PdfFont = 'regular' | 'bold' | 'mono';

// Courier (base-14) is fixed-width: every glyph is 600/1000 em.
const MONO_WIDTH = 600;

/**
 * Replace common non-ASCII typography with ASCII equivalents so every character
 * maps to a known WinAnsi/AFM width and renders predictably. Deterministic.
 */
export function asciiSanitize(text: string): string {
  return text
    .replace(/[‘’‚′]/g, "'")   // single quotes / prime
    .replace(/[“”„″]/g, '"')   // double quotes
    .replace(/[–—−]/g, '-')          // en/em dash, minus
    .replace(/[…]/g, '...')                     // ellipsis
    .replace(/[≈]/g, '~')                       // approx
    .replace(/[ ]/g, ' ')                       // nbsp
    .replace(/[•]/g, '-')                       // bullet
    .replace(/[€]/g, 'EUR')                     // euro
    // Drop anything still outside printable ASCII.
    .replace(/[^\x20-\x7E]/g, '');
}

/** Width of a single already-sanitized char at the given font size (points). */
function charWidth(code: number, font: PdfFont, size: number): number {
  if (code < 32 || code > 126) return 0;
  if (font === 'mono') return (MONO_WIDTH / 1000) * size;
  const table = font === 'bold' ? HELVETICA_BOLD : HELVETICA;
  return (table[code - 32] / 1000) * size;
}

/** Measure an already-sanitized string at the given font size (points). */
export function measureText(text: string, font: PdfFont, size: number): number {
  let w = 0;
  for (let i = 0; i < text.length; i++) w += charWidth(text.charCodeAt(i), font, size);
  return w;
}

/**
 * Greedy word wrap to a max width (points). Returns one or more lines. Pure and
 * deterministic. A single token longer than maxWidth is hard-split by character.
 */
export function wrapText(text: string, font: PdfFont, size: number, maxWidth: number): string[] {
  const clean = asciiSanitize(text).replace(/\s+/g, ' ').trim();
  if (clean === '') return [''];
  const words = clean.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line === '' ? word : line + ' ' + word;
    if (measureText(candidate, font, size) <= maxWidth || line === '') {
      if (measureText(candidate, font, size) <= maxWidth) { line = candidate; continue; }
      // line empty but single word too long -> hard split
      let chunk = '';
      for (const ch of word) {
        if (measureText(chunk + ch, font, size) > maxWidth && chunk !== '') {
          lines.push(chunk); chunk = ch;
        } else { chunk += ch; }
      }
      line = chunk;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line !== '') lines.push(line);
  return lines;
}
