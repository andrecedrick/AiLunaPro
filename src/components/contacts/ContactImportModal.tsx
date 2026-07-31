/**
 * CSV contact import modal.
 *
 * The file is parsed in the browser and posted in batches (see lib/contacts/
 * csvParse.ts for why). Progress is reported per batch because a large file is
 * several requests, and a modal that shows nothing for forty seconds looks hung.
 *
 * PARTIAL SUCCESS IS THE NORMAL OUTCOME and is displayed as such: a real list has
 * blank companies, malformed addresses and people already in the CRM. The modal
 * reports how many landed and why each rejected row was rejected, rather than
 * collapsing the whole thing into "import failed" — the operator needs to know
 * which lines to fix, and the ones that succeeded are already saved.
 *
 * A batch that throws stops the run. Continuing after a 403 or a network failure
 * would produce a progress bar that reaches 100% while writing nothing.
 */

import { useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import { parseContactsCsv, batchRows, IMPORT_BATCH, type ParsedRow } from '../../lib/contacts/csvParse';
import { importContacts, ContactError, type ImportRejection } from '../../lib/contacts/contactsClient';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 600, padding: 16,
} as const;

const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' } as const;

export function ContactImportModal({ orgId, onClose, onDone }: {
  orgId: string;
  onClose: () => void;
  onDone: () => Promise<void> | void;
}) {
  const C = useLocale().contacts;
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows]         = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [parseErr, setParseErr] = useState('');
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(0);
  const [imported, setImported] = useState(0);
  const [rejected, setRejected] = useState<ImportRejection[]>([]);
  const [finished, setFinished] = useState(false);
  const [runErr, setRunErr]     = useState('');

  const pick = async (file: File) => {
    setParseErr(''); setRows(null); setFinished(false);
    setImported(0); setRejected([]); setDone(0); setRunErr('');
    setFileName(file.name);
    const text = await file.text();
    const result = parseContactsCsv(text);
    if (result.error) { setParseErr(result.error); return; }
    setRows(result.rows);
  };

  const run = async () => {
    if (!rows?.length) return;
    setRunning(true); setRunErr('');
    const batches = batchRows(rows, IMPORT_BATCH);
    let ok = 0;
    const bad: ImportRejection[] = [];
    try {
      for (let i = 0; i < batches.length; i++) {
        const res = await importContacts(orgId, batches[i] as unknown as Record<string, string>[]);
        ok += res.imported;
        // Row numbers are per-batch server-side; re-base them onto the file so the
        // operator can find the actual line in their spreadsheet.
        bad.push(...res.rejected.map(r => ({ ...r, row: r.row + i * IMPORT_BATCH })));
        setDone(i + 1); setImported(ok); setRejected([...bad]);
      }
      setFinished(true);
      await onDone();
    } catch (e) {
      setRunErr(e instanceof ContactError ? e.code : 'IMPORT_FAILED');
    } finally {
      setRunning(false);
    }
  };

  const batchCount = rows ? batchRows(rows, IMPORT_BATCH).length : 0;

  return (
    <div style={overlay} onClick={() => !running && onClose()} role="dialog" aria-modal="true" aria-label={C.importTitle}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>{C.importTitle}</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{C.importHelp}</p>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={e => { const f = e.target.files?.[0]; if (f) void pick(f); }}
          disabled={running}
          style={{ fontSize: 13, marginBottom: 12 }}
        />

        {parseErr && <div style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{(C.importErrors as Record<string, string>)[parseErr] ?? parseErr}</div>}

        {rows && !finished && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {fileName} — {rows.length} {C.importRowsFound}
            {batchCount > 1 && ` (${batchCount} ${C.importBatches})`}
          </div>
        )}

        {running && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {C.importProgress} {done}/{batchCount} — {imported} {C.importImported}
          </div>
        )}

        {finished && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-text)' }}>
              {imported} {C.importImported}
            </div>
            {rejected.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={label}>{rejected.length} {C.importRejected}</div>
                <div style={{
                  marginTop: 6, maxHeight: 200, overflowY: 'auto', fontSize: 12.5,
                  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 10,
                }}>
                  {rejected.slice(0, 100).map(r => (
                    <div key={`${r.row}-${r.email}`} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>#{r.row}</span>
                      <span style={{ flex: 1, wordBreak: 'break-all' }}>{r.email || '—'}</span>
                      <span style={{ color: 'var(--red-text)' }}>{(C.importErrors as Record<string, string>)[r.code] ?? r.code}</span>
                    </div>
                  ))}
                  {rejected.length > 100 && <div style={{ color: 'var(--text-muted)', paddingTop: 4 }}>…</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {runErr && <div style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{(C.errors as Record<string, string>)[runErr] ?? runErr}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="ghost" size="md" onClick={onClose} disabled={running}>{finished ? C.closeDetail : C.cancel}</Button>
          {!finished && (
            <Button variant="primary" size="md" onClick={() => void run()} disabled={running || !rows?.length}>
              {running ? '…' : C.importStart}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
