import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithLocale as render } from "../utils/renderWithLocale";
import { validateDocFile, looksLikeBinaryText, isPdfFile } from '../../src/lib/auditExpress/docValidation';

/* B5 / B5.1 UX — clean inputs: PDFs extracted in-browser (lazy pdfjs, here
 * mocked), Word/Excel/binary rejected with human messages, file content shown
 * as a tidy chip (never raw text), prominent single CTA. */

// Mock the lazy PDF extractor so the card test never loads pdfjs/worker.
const pdfResult = vi.hoisted(() => ({ value: { text: 'Logistics and onboarding processes.', pageCount: 3, warning: undefined as string | undefined } }));
vi.mock('../../src/lib/auditExpress/extractPdf', () => ({
  extractPdfText: vi.fn(async () => pdfResult.value),
}));

import { DocumentAnalyzeCard } from '../../src/components/auditExpress/DocumentAnalyzeCard';

function makeFile(name: string, content: string, sizeOverride?: number): File {
  const f = new File([content], name, { type: name.endsWith('.pdf') ? 'application/pdf' : 'text/plain' });
  if (sizeOverride !== undefined) Object.defineProperty(f, 'size', { value: sizeOverride });
  return f;
}
function pickFile(file: File) {
  const input = screen.getByLabelText(/Choose a \.txt, \.md or \.pdf document/i) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  vi.clearAllMocks();
  pdfResult.value = { text: 'Logistics and onboarding processes.', pageCount: 3, warning: undefined };
});

describe('docValidation (B5.1)', () => {
  it('accepts txt/md/pdf; rejects Word/Excel/other with specific guidance', () => {
    expect(validateDocFile('handbook.md', 100)).toEqual({ ok: true });
    expect(validateDocFile('notes.txt', 100)).toEqual({ ok: true });
    expect(validateDocFile('report.pdf', 100)).toEqual({ ok: true });          // now supported
    expect(validateDocFile('notes.DOCX', 100)).toMatchObject({ ok: false, code: 'UNSUPPORTED_WORD' });
    expect(validateDocFile('data.xlsx', 100)).toMatchObject({ ok: false, code: 'UNSUPPORTED_EXCEL' });
    expect(validateDocFile('app.exe', 100)).toMatchObject({ ok: false, code: 'UNSUPPORTED_TYPE' });
    expect(validateDocFile('big.txt', 2_000_000)).toMatchObject({ ok: false, code: 'TOO_LARGE' });
    expect(validateDocFile('huge.pdf', 9_000_000)).toMatchObject({ ok: false, code: 'TOO_LARGE' });
    expect(isPdfFile('X.PDF')).toBe(true);
  });

  it('sniffs binary content (mojibake / %PDF) but passes real text', () => {
    expect(looksLikeBinaryText('%PDF-1.7   stream')).toBe(true);
    expect(looksLikeBinaryText('���z�go�k normal'.repeat(10))).toBe(true);
    expect(looksLikeBinaryText('Our support team handles invoices and onboarding.\nWe use spreadsheets.')).toBe(false);
  });
});

describe('DocumentAnalyzeCard (B5.1)', () => {
  it('states the supported formats clearly (.txt/.md/.pdf; Word/Excel not yet)', () => {
    render(<DocumentAnalyzeCard busy={false} onAnalyze={() => {}} />);
    expect(screen.getByText(/Word and Excel files aren’t supported yet/)).toBeTruthy();
    expect(screen.getByText('.pdf')).toBeTruthy();
  });

  it('rejects a Word doc with a clear message', async () => {
    render(<DocumentAnalyzeCard busy={false} onAnalyze={() => {}} />);
    pickFile(makeFile('contract.docx', 'PK binary'));
    expect((await screen.findByRole('alert')).textContent).toContain('Word documents aren’t supported yet');
  });

  it('PDF → extracted in-browser → chip shows page count; raw bytes never shown', async () => {
    render(<DocumentAnalyzeCard busy={false} onAnalyze={() => {}} />);
    pickFile(makeFile('dossier.pdf', '%PDF-1.4 binary bytes'));
    expect(await screen.findByText('dossier.pdf')).toBeTruthy();
    expect(screen.getByText(/3 pages · ✓ ready/)).toBeTruthy();
    expect(document.body.textContent).not.toContain('%PDF');
  });

  it('scanned PDF (no text layer) → friendly message, no chip, no analysis', async () => {
    pdfResult.value = { text: '', pageCount: 5, warning: 'no-text-layer' };
    const onAnalyze = vi.fn();
    render(<DocumentAnalyzeCard busy={false} onAnalyze={onAnalyze} />);
    pickFile(makeFile('scan.pdf', '%PDF image only'));
    expect((await screen.findByRole('alert')).textContent).toContain('scanned PDF (no text layer)');
    expect(screen.queryByText('scan.pdf')).toBeNull();
  });

  it('extracted PDF text flows to analyze with the file name', async () => {
    const onAnalyze = vi.fn();
    render(<DocumentAnalyzeCard busy={false} onAnalyze={onAnalyze} />);
    pickFile(makeFile('dossier.pdf', '%PDF-1.4'));
    await screen.findByText('dossier.pdf');
    fireEvent.click(screen.getByRole('button', { name: /Analyze document/ }));
    expect(onAnalyze).toHaveBeenCalledWith('Logistics and onboarding processes.', 'dossier.pdf');
  });

  it('rejects binary content even with a .txt name (sniffing)', async () => {
    render(<DocumentAnalyzeCard busy={false} onAnalyze={() => {}} />);
    pickFile(makeFile('fake.txt', '���'.repeat(200)));
    expect((await screen.findByRole('alert')).textContent).toContain('doesn’t look like readable text');
  });

  it('valid .md → tidy chip, content NOT dumped; analyze sends text + name', async () => {
    const onAnalyze = vi.fn();
    render(<DocumentAnalyzeCard busy={false} onAnalyze={onAnalyze} />);
    pickFile(makeFile('handbook.md', '# Acme\nOur support team handles invoices daily.'));
    expect(await screen.findByText('handbook.md')).toBeTruthy();
    expect(document.body.textContent).not.toContain('Our support team handles invoices');
    fireEvent.click(screen.getByRole('button', { name: /Analyze document/ }));
    expect(onAnalyze).toHaveBeenCalledWith('# Acme\nOur support team handles invoices daily.', 'handbook.md');
  });

  it('paste path: CTA disabled when empty; sends pasted text when provided', async () => {
    const onAnalyze = vi.fn();
    render(<DocumentAnalyzeCard busy={false} onAnalyze={onAnalyze} />);
    const cta = screen.getByRole('button', { name: /Analyze document/ }) as HTMLButtonElement;
    expect(cta.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/paste document content/i), { target: { value: 'We process invoices and compliance records.' } });
    expect(cta.disabled).toBe(false);
    fireEvent.click(cta);
    await waitFor(() => expect(onAnalyze).toHaveBeenCalledWith('We process invoices and compliance records.', 'pasted-text.txt'));
  });
});
