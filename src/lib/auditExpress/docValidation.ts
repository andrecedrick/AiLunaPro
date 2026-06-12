/**
 * B5 / B5.1 — client-side document validation for the deterministic analyzer.
 *
 * Supported: plain text (.txt/.md) + pasted text (B5 v1) and PDF text-layer
 * (B5.1, extracted in-browser via pdfjs). Word/Excel are rejected with specific
 * messages (later phases). Binary sniffing catches mis-named files so
 * unreadable bytes never reach the UI or the worker. v1 text behavior unchanged.
 */

export const MAX_DOC_FILE_BYTES = 1_000_000;  // 1 MB cap for text files (text == file)
export const MAX_PDF_FILE_BYTES = 8_000_000;  // 8 MB cap for PDFs (compressed; text still capped below)
export const MAX_DOC_TEXT_CHARS = 200_000;    // text sent to the worker

export type DocFileVerdict =
  | { ok: true }
  | { ok: false; code: 'UNSUPPORTED_WORD' | 'UNSUPPORTED_EXCEL' | 'UNSUPPORTED_TYPE' | 'TOO_LARGE'; message: string };

/** True for a PDF by name — the card routes these through the pdfjs extractor. */
export function isPdfFile(name: string): boolean {
  return /\.pdf$/i.test(name);
}

/** Name + size validation (before reading the file). */
export function validateDocFile(name: string, sizeBytes: number): DocFileVerdict {
  const lower = name.toLowerCase();

  if (isPdfFile(lower)) {
    if (sizeBytes > MAX_PDF_FILE_BYTES) {
      return { ok: false, code: 'TOO_LARGE', message: 'PDF too large (max 8 MB). Paste the relevant text below instead.' };
    }
    return { ok: true };
  }
  if (/\.(docx?|odt|rtf)$/.test(lower)) {
    return { ok: false, code: 'UNSUPPORTED_WORD', message: 'Word documents aren’t supported yet. Copy the text from your document and paste it below instead.' };
  }
  if (/\.(xlsx?|ods)$/.test(lower)) {
    return { ok: false, code: 'UNSUPPORTED_EXCEL', message: 'Excel files aren’t supported yet. Copy the relevant cells and paste them below instead.' };
  }
  if (!/\.(txt|md|markdown|text)$/.test(lower)) {
    return { ok: false, code: 'UNSUPPORTED_TYPE', message: 'Unsupported file type. Use a .txt, .md or .pdf file, or paste the text below.' };
  }
  if (sizeBytes > MAX_DOC_FILE_BYTES) {
    return { ok: false, code: 'TOO_LARGE', message: 'File too large (max 1 MB). Paste the relevant part of the text below instead.' };
  }
  return { ok: true };
}

/**
 * Content sniff after decoding: binary files decoded as UTF-8 are full of
 * replacement (�) and control characters — readable text is not.
 */
export function looksLikeBinaryText(text: string): boolean {
  if (!text) return false;
  if (text.startsWith('%PDF')) return true;
  const sample = text.slice(0, 4000);
  let suspicious = 0;
  for (const ch of sample) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 0xFFFD || (c < 32 && c !== 9 && c !== 10 && c !== 13)) suspicious++;
  }
  return suspicious / Math.max(1, sample.length) > 0.01; // >1% junk ⇒ binary
}
