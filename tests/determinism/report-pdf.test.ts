import { describe, it, expect } from 'vitest';
import { buildReportPdf, REPORT_PDF_ENGINE } from '../../worker/src/lib/report-pdf';
import { computeAuditResult, type AuditAnswers } from '../../worker/src/lib/audit-scoring';

/*
 * Batch A — deterministic Report PDF. Verifies:
 *   - byte-identical for identical { title, createdAt, answers } EVEN when the
 *     result is freshly recomputed (engine `computedAt` must never leak into bytes)
 *   - createdAt + title participate in the bytes
 *   - valid PDF envelope + premium sections + engine stamp present
 *   - no free-text PII ever reaches the rendered bytes
 */

// Free-text fields carry an email/phone to prove they never surface in the PDF.
const ANSWERS: AuditAnswers = {
  'profile.industry': 'health',
  'data.types': ['pii', 'health'],
  'tools.scope': 'customer',
  'train.maturity': '3',
  'profile.describe': 'contact me at leak@example.com or 555-123-4567',
};

const CREATED = '2026-06-06T12:00:00.000Z';

const latin1 = (b: Uint8Array) => { let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return s; };
const bytesEqual = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((v, i) => v === b[i]);

function mk(createdAt = CREATED, title = 'Technology AI Compliance Report') {
  // Recompute the result each call: its non-deterministic `computedAt` must NOT
  // change the bytes (we never render it).
  return buildReportPdf({ title, createdAt, result: computeAuditResult(ANSWERS), answers: ANSWERS });
}

describe('report PDF — determinism', () => {
  it('is byte-identical for identical inputs (recomputed result, computedAt never leaks)', () => {
    expect(bytesEqual(mk(), mk())).toBe(true);
  });
  it('createdAt participates in the bytes', () => {
    expect(bytesEqual(mk('2026-06-06T12:00:00.000Z'), mk('2026-06-07T12:00:00.000Z'))).toBe(false);
  });
  it('title participates in the bytes', () => {
    expect(bytesEqual(mk(CREATED, 'Alpha'), mk(CREATED, 'Beta'))).toBe(false);
  });
});

describe('report PDF — structure & content', () => {
  const s = latin1(mk());
  it('is a valid PDF envelope', () => {
    expect(s.startsWith('%PDF-1.4')).toBe(true);
    expect(s).toContain('xref');
    expect(s).toContain('trailer');
    expect(s.trimEnd().endsWith('%%EOF')).toBe(true);
  });
  it('renders the premium sections + engine stamp + disclaimer', () => {
    expect(s).toContain('Executive summary');
    expect(s).toContain('Risk overview');
    expect(s).toContain('Action plan');
    expect(s).toContain('Section scores');
    expect(s).toContain('AI usage context');
    expect(s).toContain('AI risk');                 // governance section
    expect(s).toContain('Human oversight');
    expect(s).toContain('certification'); // disclaimer present (text wraps across Tj lines)
    expect(s).toContain(REPORT_PDF_ENGINE);
  });
});

describe('report PDF — privacy', () => {
  const s = latin1(mk());
  it('never renders free-text PII', () => {
    expect(s).not.toContain('leak@example.com');
    expect(s).not.toContain('555-123-4567');
    const drawn = (s.match(/\(((?:[^()\\]|\\.)*)\)\s*Tj/g) || []).join(' ');
    expect(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(drawn)).toBe(false);
    expect(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(drawn)).toBe(false);
  });
});
