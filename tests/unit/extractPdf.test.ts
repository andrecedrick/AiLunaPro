import { describe, it, expect, vi, beforeEach } from 'vitest';

/* B5.1 — pdfjs is mocked: we test our extraction logic (text assembly, page
 * cap, scanned-PDF detection, determinism), not Mozilla's parser. */

const getDocument = vi.hoisted(() => vi.fn());
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument,
}));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'worker.mjs' }));

import { extractPdfText, MAX_PDF_PAGES } from '../../src/lib/auditExpress/extractPdf';

function fakeDoc(pages: string[]) {
  return {
    promise: Promise.resolve({
      numPages: pages.length,
      getPage: async (n: number) => ({
        getTextContent: async () => ({ items: pages[n - 1].split(' ').map(str => ({ str })) }),
        cleanup: () => {},
      }),
      cleanup: async () => {},
    }),
  };
}

function fakeFile(): File {
  const f = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' });
  // jsdom File may lack arrayBuffer in some envs — provide a stub.
  if (typeof f.arrayBuffer !== 'function') {
    Object.defineProperty(f, 'arrayBuffer', { value: async () => new ArrayBuffer(4) });
  }
  return f;
}

beforeEach(() => { getDocument.mockReset(); });

describe('extractPdfText (B5.1)', () => {
  it('joins page text and reports the page count', async () => {
    getDocument.mockReturnValue(fakeDoc(['Acme logistics handbook', 'Customer onboarding and invoices']));
    const r = await extractPdfText(fakeFile());
    expect(r.pageCount).toBe(2);
    expect(r.text).toContain('Acme logistics handbook');
    expect(r.text).toContain('Customer onboarding and invoices');
    expect(r.warning).toBeUndefined();
  });

  it('flags a scanned PDF (no text layer) instead of returning garbage', async () => {
    getDocument.mockReturnValue(fakeDoc(['', '   ']));
    const r = await extractPdfText(fakeFile());
    expect(r.text).toBe('');
    expect(r.warning).toBe('no-text-layer');
  });

  it('caps very large PDFs at MAX_PDF_PAGES and flags truncation', async () => {
    getDocument.mockReturnValue(fakeDoc(Array.from({ length: MAX_PDF_PAGES + 10 }, (_, i) => `page ${i} content`)));
    const r = await extractPdfText(fakeFile());
    expect(r.pageCount).toBe(MAX_PDF_PAGES + 10);
    expect(r.warning).toBe('truncated-pages');
  });

  it('is deterministic — same document yields identical text', async () => {
    getDocument.mockReturnValue(fakeDoc(['alpha beta', 'gamma delta']));
    const a = await extractPdfText(fakeFile());
    getDocument.mockReturnValue(fakeDoc(['alpha beta', 'gamma delta']));
    const b = await extractPdfText(fakeFile());
    expect(a.text).toBe(b.text);
  });
});
