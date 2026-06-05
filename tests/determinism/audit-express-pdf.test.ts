import { describe, it, expect } from 'vitest';
import { buildAuditExpressPdf, PDF_DISCLAIMER } from '../../worker/src/lib/audit-express-pdf';
import { computePreview, type PreviewTaps } from '../../worker/src/lib/audit-express-preview';
import { understand } from '../../worker/src/lib/audit-express-understanding';
import { assembleSnapshot, extractPageSignals, type PageCapture } from '../../worker/src/lib/audit-express-extract';
import { ENGINE_VERSION } from '../../worker/src/lib/determinism';

/*
 * J15 P1 — deterministic PDF report. Verifies:
 *   - byte-identical output for identical { taps, snapshot, createdAt }
 *   - createdAt participates (different stamp -> different bytes)
 *   - version stamp + exact disclaimer present; valid PDF structure
 *   - traceability: appendix header + [n] markers present
 *   - no-PII: scrubbed email/phone never appear in the rendered bytes
 */

const TAPS: PreviewTaps = {
  workflow: 'support',
  monthlyHours: 'high',
  hourlyCost: 'medium',
  aiUsage: 'team',
  shadowAi: 'no_visibility',
};

// Fixture HTML embeds an email + phone in the meta to prove PII never surfaces.
const HTML = `<!doctype html><html lang="en"><head>
  <title>Acme Store — contact john.doe@acme.example or 555-123-4567</title>
  <meta name="description" content="Buy now. Add to cart. Email john.doe@acme.example, call 555-123-4567.">
  <script src="https://js.intercom.io/widget.js"></script>
  <script src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script>
  </head><body><a href="/shop">Shop</a><a href="/contact">Contact</a></body></html>`;

const CREATED = '2026-06-04T12:00:00.000Z';

function snapshot() {
  const caps: PageCapture[] = [
    { url: 'https://acme.example/', status: 200, contentType: 'text/html', signals: extractPageSignals(HTML) },
  ];
  return assembleSnapshot('https://acme.example/', caps);
}

function buildFull(createdAt = CREATED) {
  const preview = computePreview(TAPS);
  const ex = snapshot();
  const un = understand(ex);
  return buildAuditExpressPdf({ createdAt, preview, extractSnapshot: ex, understanding: un });
}

const latin1 = (b: Uint8Array) => { let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return s; };
const bytesEqual = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((v, i) => v === b[i]);

describe('audit-express PDF — determinism', () => {
  it('is byte-identical for identical input + createdAt', () => {
    expect(bytesEqual(buildFull(), buildFull())).toBe(true);
  });

  it('preview-only is also byte-identical', () => {
    const p = computePreview(TAPS);
    const a = buildAuditExpressPdf({ createdAt: CREATED, preview: p });
    const b = buildAuditExpressPdf({ createdAt: CREATED, preview: p });
    expect(bytesEqual(a, b)).toBe(true);
  });

  it('createdAt participates in the bytes', () => {
    const a = buildFull('2026-06-04T12:00:00.000Z');
    const b = buildFull('2026-06-05T12:00:00.000Z');
    expect(bytesEqual(a, b)).toBe(false);
  });
});

describe('audit-express PDF — structure & content', () => {
  const s = latin1(buildFull());

  it('is a valid PDF envelope', () => {
    expect(s.startsWith('%PDF-1.4')).toBe(true);
    expect(s).toContain('xref');
    expect(s).toContain('trailer');
    expect(s.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('contains the exact disclaimer', () => {
    expect(s).toContain(PDF_DISCLAIMER);
  });

  it('contains the version stamp', () => {
    expect(s).toContain(ENGINE_VERSION);
    expect(s).toContain('Inputs hash');
    expect(s).toContain('Created at');
  });

  it('contains the sources & reasons appendix and link annotations', () => {
    expect(s).toContain('Sources & reasons');
    expect(s).toContain('/Subtype /Link');
    expect(s).toContain('/Dest');
  });
});

describe('audit-express PDF — visuals & charts', () => {
  const s = latin1(buildFull());

  it('emits vector primitives (filled rects + lines)', () => {
    expect(s).toContain(' re f');   // filled rectangle operator
    expect(s).toContain(' l S');    // stroked line operator
  });
  it('renders the readiness bar, KPI tiles and ROI bar chart', () => {
    expect(s).toContain('Readiness ');
    expect(s).toContain('Time saved / month');
    expect(s).toContain('Estimated payback');
    expect(s).toContain('Monthly cost saved');
  });
  it('renders the how-it-works schematic steps', () => {
    // PDF escapes parentheses, and labels may wrap across lines, so assert on
    // contiguous paren-free tokens.
    expect(s).toContain('Inputs');
    expect(s).toContain('Capture');
    expect(s).toContain('Rule-based');
  });
  it('renders the opportunity matrix axes', () => {
    expect(s).toContain('Effort');
    expect(s).toContain('Impact');
  });
  it('uses the Courier (mono) font for the version stamp', () => {
    expect(s).toContain('/F3');   // Courier font resource referenced
    expect(s).toContain('/BaseFont /Courier');
  });
});

describe('audit-express PDF — sources appendix', () => {
  const s = latin1(buildFull());
  it('shows a human label plus the raw rule id', () => {
    expect(s).toContain('Readiness score');          // human label
    expect(s).toContain('diagnostic.normalizedScore'); // raw id (mono note)
  });
  it('has a stable, deduped appendix count across runs', () => {
    const count = (x: string) => (x.match(/\[(rule|benchmark)\]/g) || []).length;
    const a = count(s);
    expect(a).toBeGreaterThanOrEqual(8);
    expect(count(latin1(buildFull()))).toBe(a); // stable
  });
});

describe('audit-express PDF — layout stability', () => {
  const pageCount = (b: Uint8Array) => (latin1(b).match(/\/Type \/Page[^s]/g) || []).length;
  it('page count is stable across identical builds', () => {
    const a = pageCount(buildFull());
    expect(a).toBeGreaterThanOrEqual(1);
    expect(pageCount(buildFull())).toBe(a);
  });
  it('keeps the version stamp (long values wrapped, not overflowing)', () => {
    const s = latin1(buildFull());
    expect(s).toContain('Inputs hash');
    expect(s).toContain('Engine');
  });
});

describe('audit-express PDF — privacy', () => {
  const s = latin1(buildFull());
  it('never renders scrubbed email or phone', () => {
    expect(s).not.toContain('john.doe@acme.example');
    expect(s).not.toContain('555-123-4567');
  });
  it('has no generic email/phone patterns in content text', () => {
    // Scan text drawn via (..) Tj operators only.
    const drawn = (s.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/g) || []).join(' ');
    expect(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(drawn)).toBe(false);
    expect(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(drawn)).toBe(false);
  });
});
