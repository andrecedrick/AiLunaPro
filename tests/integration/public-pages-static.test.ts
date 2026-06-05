import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/*
 * Static public pages — structural guards (J15 visual/UX batch):
 *   - /audit-express: "Analyze" section appears ABOVE "Try the preview"
 *   - all path-based public pages carry the shared /favicon.svg link
 */

const ROOT = process.cwd();
const PAGES = [
  'audit-express', 'eu-ai-act', 'faq', 'shadow-ai', 'methodologie',
  'pricing', 'use-cases/pme', 'use-cases/independant',
];
const read = (p: string) => readFileSync(path.join(ROOT, 'public', p, 'index.html'), 'utf8');

describe('audit-express — section order', () => {
  const html = read('audit-express');
  it('Analyze section is above the Preview section', () => {
    const analyze = html.indexOf('id="ax-extract"');
    const preview = html.indexOf('id="ax-preview"');
    const verify = html.indexOf('id="ax-verify"');
    expect(analyze).toBeGreaterThanOrEqual(0);
    expect(preview).toBeGreaterThanOrEqual(0);
    expect(verify).toBeGreaterThanOrEqual(0);
    expect(verify).toBeLessThan(analyze);   // verification first
    expect(analyze).toBeLessThan(preview);  // then analyze, then preview
  });
  it('keeps a single Turnstile widget and the preview controls intact', () => {
    expect((html.match(/id="ax-ts"/g) || []).length).toBe(1);
    expect(html).toContain('id="ax-run"');
    expect(html).toContain('id="ax-analyze"');
    expect(html).toContain('id="ax-pdf"');
  });
});

describe('public pages — favicon consistency', () => {
  for (const p of PAGES) {
    it(`${p} links /favicon.svg`, () => {
      expect(read(p)).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    });
  }
});
