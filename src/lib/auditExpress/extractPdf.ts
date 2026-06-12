import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MAX_DOC_TEXT_CHARS } from './docValidation';

/**
 * B5.1 — browser-side PDF text-layer extraction (deterministic, no LLM, no OCR).
 *
 * This module is imported ONLY via dynamic import() from DocumentAnalyzeCard,
 * so pdfjs lands in its own lazy chunk — zero impact on the main bundle and on
 * B5 v1 (.txt/.md/paste never load it). Raw bytes stay in the browser; only the
 * extracted, capped text is later sent to the worker. Scanned/image PDFs have
 * no text layer → reported as a warning (we never send empty/garbage).
 *
 * The worker URL resolves to a same-origin hashed asset (Vite `?url`), covered
 * by our existing CSP `worker-src 'self' blob:`.
 */
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export const EXTRACTOR_PDF_VERSION = 'pdfjs-6.0.227';
export const MAX_PDF_PAGES = 50; // bound work for very large PDFs (deterministic)

export interface PdfExtractResult {
  text: string;
  pageCount: number;
  warning?: 'no-text-layer' | 'truncated-pages';
}

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  // Text-only: we never render, so no canvas/WASM/eval path is exercised.
  // (pdfjs v6 disables eval internally; `disableFontFace` avoids font CSS work.)
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  try {
    const pageCount = doc.numPages;
    const maxPages = Math.min(pageCount, MAX_PDF_PAGES);
    const parts: string[] = [];
    let chars = 0;
    for (let i = 1; i <= maxPages && chars < MAX_DOC_TEXT_CHARS; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(it => ('str' in it ? it.str : ''))
        .join(' ');
      parts.push(pageText);
      chars += pageText.length;
      page.cleanup();
    }
    const text = parts.join('\n').replace(/[ \t]+/g, ' ').slice(0, MAX_DOC_TEXT_CHARS).trim();
    const warning: PdfExtractResult['warning'] =
      text.length === 0 ? 'no-text-layer' : pageCount > maxPages ? 'truncated-pages' : undefined;
    return { text, pageCount, warning };
  } finally {
    await doc.cleanup();
  }
}
