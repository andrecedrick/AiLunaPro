/**
 * CSV / XLSX contact import modal.
 *
 * WHY THIS WAS REWRITTEN: importing took THREE interactions — choose a file, then
 * press "Start import", and the button gave no feedback until the first batch
 * came back, which on a large file was tens of seconds of a dead-looking dialog.
 * Choosing a file now starts the import, and the state machine below reports what
 * it is doing from the first frame.
 *
 * STAGES are real, not decorative: reading a 10,000-row spreadsheet off disk,
 * decoding it, and posting it are three genuinely different waits, and an
 * operator who sees "Validating" knows the file was read and the delay is not a
 * hung upload.
 *
 * A batch that throws stops the run. Continuing after a 403 or a network failure
 * would drive a progress bar to 100% while writing nothing.
 */

import { useCallback, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import {
  parseContactsFile, batchRows, sampleCsv, SAMPLE_FILENAME,
  REQUIRED_COLUMNS, OPTIONAL_COLUMNS, IMPORT_BATCH, type ParsedRow,
} from '../../lib/contacts/csvParse';
import { importContacts, ContactError, type ImportRejection } from '../../lib/contacts/contactsClient';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 600, padding: 16,
} as const;

const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' } as const;

/** idle → reading → validating → importing → done. `failed` is terminal. */
type Stage = 'idle' | 'reading' | 'validating' | 'importing' | 'done' | 'failed';

export function ContactImportModal({ orgId, onClose, onDone }: {
  orgId: string;
  onClose: () => void;
  onDone: () => Promise<void> | void;
}) {
  const C = useLocale().contacts;
  const fileRef = useRef<HTMLInputElement>(null);
  // A ref, not state: the guard must be true SYNCHRONOUSLY within the same click.
  // A state flag is only visible after a re-render, so a double click fires the
  // handler twice before React repaints and the file imports twice.
  const running = useRef(false);

  const [stage, setStage]       = useState<Stage>('idle');
  const [fileName, setFileName] = useState('');
  const [total, setTotal]       = useState(0);
  const [done, setDone]         = useState(0);
  const [imported, setImported] = useState(0);
  const [rejected, setRejected] = useState<ImportRejection[]>([]);
  const [failedRows, setFailed] = useState(0);
  const [err, setErr]           = useState('');

  const busy = stage === 'reading' || stage === 'validating' || stage === 'importing';

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([sampleCsv()], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = SAMPLE_FILENAME; a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Choosing a file IS the import. One interaction, and the stage is set before
   * any await so the dialog reacts on the same frame as the click.
   */
  const start = useCallback(async (file: File) => {
    if (running.current) return;
    running.current = true;
    setStage('reading'); setErr(''); setFileName(file.name);
    setTotal(0); setDone(0); setImported(0); setRejected([]); setFailed(0);

    try {
      const parsed = await parseContactsFile(file);
      if (parsed.error) { setErr(parsed.error); setStage('failed'); return; }

      setStage('validating');
      const rows: ParsedRow[] = parsed.rows;
      const batches = batchRows(rows, IMPORT_BATCH);
      setTotal(rows.length);
      if (!rows.length) { setErr('EMPTY_FILE'); setStage('failed'); return; }

      setStage('importing');
      let ok = 0, bad = 0;
      const skipped: ImportRejection[] = [];
      for (let i = 0; i < batches.length; i++) {
        const res = await importContacts(orgId, batches[i] as unknown as Record<string, string>[]);
        ok += res.imported;
        // Row numbers come back per-batch; re-base them onto the file so the
        // operator can find the actual line in their spreadsheet.
        for (const r of res.rejected) {
          const row = { ...r, row: r.row + i * IMPORT_BATCH };
          if (r.code === 'WRITE_FAILED') bad++; else skipped.push(row);
        }
        setDone((i + 1) * batches[i].length);
        setImported(ok); setRejected([...skipped]); setFailed(bad);
      }
      setStage('done');
      await onDone();
    } catch (e) {
      setErr(e instanceof ContactError ? e.code : 'IMPORT_FAILED');
      setStage('failed');
    } finally {
      running.current = false;
      // Clear the input so re-picking the SAME file fires change again.
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [orgId, onDone]);

  const stageText: Record<Stage, string> = {
    idle: '', reading: C.importStageReading, validating: C.importStageValidating,
    importing: C.importStageImporting, done: C.importStageDone, failed: '',
  };
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const msg = (code: string) => (C.importErrors as Record<string, string>)[code] ?? (C.errors as Record<string, string>)[code] ?? code;

  return (
    <div style={overlay} onClick={() => !busy && onClose()} role="dialog" aria-modal="true" aria-label={C.importTitle}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>{C.importTitle}</h3>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{C.importHelp}</p>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>
          {C.importFormats}
        </p>

        {/* Column contract, stated rather than discovered by trial and error. */}
        <div style={{ ...label, marginBottom: 4 }}>{C.importColumns}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
          <div><strong>{C.importRequired}:</strong> {REQUIRED_COLUMNS.join(', ')}</div>
          <div><strong>{C.importOptional}:</strong> {OPTIONAL_COLUMNS.join(', ')}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <Button variant="primary" size="md" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? '…' : C.importChooseFile}
          </Button>
          <Button variant="secondary" size="md" onClick={downloadSample} disabled={busy}>{C.importSample}</Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={e => { const f = e.target.files?.[0]; if (f) void start(f); }}
            style={{ display: 'none' }}
          />
        </div>

        {stage !== 'idle' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {fileName}{stageText[stage] ? ` — ${stageText[stage]}` : ''}
              </span>
              {stage === 'importing' && total > 0 && <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>}
            </div>
            {/* Indeterminate until the row count is known, then real progress. */}
            <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: stage === 'done' ? '100%' : stage === 'importing' ? `${pct}%` : '35%',
                background: stage === 'done' ? 'var(--green-text)' : 'var(--violet)',
                transition: 'width 0.25s ease',
                opacity: stage === 'reading' || stage === 'validating' ? 0.55 : 1,
              }} />
            </div>
          </div>
        )}

        {(stage === 'importing' || stage === 'done') && (
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 14, fontSize: 13 }}>
            <span><strong style={{ color: 'var(--green-text)' }}>{imported}</strong> {C.importImported}</span>
            <span><strong style={{ color: 'var(--text-muted)' }}>{rejected.length}</strong> {C.importRejected}</span>
            <span><strong style={{ color: failedRows ? 'var(--red-text)' : 'var(--text-muted)' }}>{failedRows}</strong> {C.importFailed}</span>
          </div>
        )}

        {err && <div style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{msg(err)}</div>}

        {rejected.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={label}>{C.importRejected}</div>
            <div style={{
              marginTop: 6, maxHeight: 180, overflowY: 'auto', fontSize: 12.5,
              background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 10,
            }}>
              {rejected.slice(0, 100).map(r => (
                <div key={`${r.row}-${r.email}`} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>#{r.row}</span>
                  <span style={{ flex: 1, wordBreak: 'break-all' }}>{r.email || '—'}</span>
                  <span style={{ color: 'var(--red-text)' }}>{msg(r.code)}</span>
                </div>
              ))}
              {rejected.length > 100 && <div style={{ color: 'var(--text-muted)', paddingTop: 4 }}>…</div>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="ghost" size="md" onClick={onClose} disabled={busy}>
            {stage === 'done' ? C.closeDetail : C.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
