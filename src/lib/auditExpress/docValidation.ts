/**
 * B5 UX — client-side document validation for the deterministic analyzer.
 * v1 supports plain-text formats only (.txt/.md + pasted text). PDF/Word are
 * rejected with specific messages (PDF parsing needs a dependency that is
 * deliberately not approved yet). Binary sniffing catches mis-named files so
 * unreadable bytes never reach the UI or the worker.
 */

export const MAX_DOC_FILE_BYTES = 1_000_000;  // 1 MB file cap
export const MAX_DOC_TEXT_CHARS = 200_000;    // text sent to the worker

export type DocFileVerdict =
  | { ok: true }
  | { ok: false; code: 'UNSUPPORTED_PDF' | 'UNSUPPORTED_WORD' | 'UNSUPPORTED_TYPE' | 'TOO_LARGE'; message: string };

/** Name + size validation (before reading the file). */
export function validateDocFile(name: string, sizeBytes: number): DocFileVerdict {
  const lower = name.toLowerCase();
  if (/\.pdf$/.test(lower)) {
    return { ok: false, code: 'UNSUPPORTED_PDF', message: 'PDF files aren’t supported yet. Copy the text from your PDF and paste it below instead.' };
  }
  if (/\.(docx?|odt|rtf)$/.test(lower)) {
    return { ok: false, code: 'UNSUPPORTED_WORD', message: 'Word documents aren’t supported yet. Copy the text from your document and paste it below instead.' };
  }
  if (!/\.(txt|md|markdown|text)$/.test(lower)) {
    return { ok: false, code: 'UNSUPPORTED_TYPE', message: 'Unsupported file type. Use a .txt or .md file, or paste the text below.' };
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
