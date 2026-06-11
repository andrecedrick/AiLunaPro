import { useRef, useState, type CSSProperties } from 'react';
import { validateDocFile, looksLikeBinaryText, MAX_DOC_TEXT_CHARS } from '../../lib/auditExpress/docValidation';

/**
 * B5 UX — "Analyze a document" card (deterministic pipeline, no LLM).
 * Clean two-path input: upload a .txt/.md file (shown as a tidy chip — raw
 * content is NEVER dumped into the UI) or paste text. PDF/Word and binary
 * files are rejected with specific, human messages. The Analyze button is the
 * card's single primary CTA.
 */
export function DocumentAnalyzeCard({ busy, onAnalyze }: {
  busy: boolean;
  onAnalyze: (text: string, name: string) => void;
}) {
  const [docFile, setDocFile] = useState<{ name: string; text: string } | null>(null);
  const [pasted, setPasted]   = useState('');
  const [docError, setDocError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const clearFile = () => { setDocFile(null); if (fileRef.current) fileRef.current.value = ''; };

  async function onPickFile(file: File | null) {
    if (!file) return;
    setDocError(null);
    const verdict = validateDocFile(file.name, file.size);
    if (!verdict.ok) { clearFile(); setDocError(verdict.message); return; }
    try {
      const text = (await file.text()).slice(0, MAX_DOC_TEXT_CHARS);
      if (looksLikeBinaryText(text)) {
        clearFile();
        setDocError('That file doesn’t look like readable text. Use a plain .txt or .md file, or paste the text below.');
        return;
      }
      if (!text.trim()) { clearFile(); setDocError('That file is empty. Choose another file or paste text below.'); return; }
      setDocFile({ name: file.name, text });
      setPasted('');
    } catch {
      clearFile();
      setDocError('Could not read that file. Try pasting the text below instead.');
    }
  }

  const text = (docFile?.text ?? pasted).trim().slice(0, MAX_DOC_TEXT_CHARS);
  const canAnalyze = text.length > 0 && !busy;

  const submit = () => {
    if (!canAnalyze) { if (!text) setDocError('Add a file or paste some text first.'); return; }
    setDocError(null);
    onAnalyze(text, docFile?.name ?? 'pasted-text.txt');
  };

  const label: CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', padding: 22, marginTop: 14 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text-primary)', margin: '0 0 6px' }}>
        Analyze a document (optional)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.55, margin: '0 0 4px' }}>
        Enrich “What this business does” from a document. We derive signals only — your document is never stored.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12.5, lineHeight: 1.5, margin: '0 0 14px' }}>
        Supported: <strong>.txt</strong>, <strong>.md</strong>, or pasted text. PDF and Word files aren’t supported yet.
      </p>

      {/* File path: styled picker + tidy chip (raw content never shown) */}
      <input ref={fileRef} type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" style={{ display: 'none' }}
        aria-label="Choose a .txt or .md document" onChange={e => { void onPickFile(e.target.files?.[0] ?? null); }} />
      {docFile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 10, background: 'var(--brand-tint-bg)', border: '1px solid var(--violet)' }}>
          <span aria-hidden>📄</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{docFile.name}</span>
          <span style={{ fontSize: 12, color: 'var(--violet-text)', fontWeight: 700 }}>✓ ready ({Math.max(1, Math.round(docFile.text.length / 1000))} KB of text)</span>
          <button type="button" onClick={clearFile}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}>
            Remove
          </button>
        </div>
      ) : (
        <>
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--border-strong)', background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Choose a file (.txt, .md)
          </button>

          <div style={{ margin: '14px 0 0' }}>
            <label style={label} htmlFor="doc-paste">…or paste document content</label>
            <textarea
              id="doc-paste"
              value={pasted}
              onChange={e => { setDocError(null); setPasted(e.target.value.slice(0, MAX_DOC_TEXT_CHARS)); }}
              placeholder="Paste text about the business — services, processes, tools…"
              rows={5}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13.5, lineHeight: 1.55, fontFamily: 'var(--font-body)', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </>
      )}

      {docError && (
        <p role="alert" style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--amber-text, #B45309)', lineHeight: 1.5 }}>
          {docError}
        </p>
      )}

      {/* Single primary CTA */}
      <button type="button" onClick={submit} disabled={!canAnalyze}
        style={{
          marginTop: 14, padding: '12px 26px', borderRadius: 12, border: 'none',
          background: 'var(--brand-gradient, var(--violet))', color: '#fff',
          fontWeight: 800, fontSize: 14.5, fontFamily: 'var(--font-body)',
          cursor: canAnalyze ? 'pointer' : 'not-allowed', opacity: canAnalyze ? 1 : 0.5,
          boxShadow: canAnalyze ? 'var(--card-shadow)' : 'none',
        }}>
        {busy ? 'Analyzing…' : 'Analyze document →'}
      </button>
    </div>
  );
}
