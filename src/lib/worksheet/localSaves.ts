/**
 * Local (offline) worksheet saves — localStorage fallback so Save/Load works even
 * when the worker backend is unreachable (e.g. not deployed → HTTP 502) or the
 * user has no workspace. Deterministic, device-only, no network.
 *
 * The page tries the server first (when an org is available) and always also
 * writes locally, so a save never hard-fails and the tool stays usable anywhere.
 */

import { computeWorksheet, type WorksheetInput } from './auditWorksheet';

const KEY = 'ailunapro-worksheet-saves-v1';

export interface LocalSave {
  id:        string;          // 'local_...'
  title:     string;
  createdAt: string;
  input:     WorksheetInput;
}

function read(): LocalSave[] {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as LocalSave[]) : []; }
  catch { return []; }
}

function write(list: LocalSave[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50))); } catch { /* quota */ }
}

let seq = 0;
function localId(): string {
  // No Date.now() in shared engines, but UI-side this is fine and unique enough.
  return `local_${Date.now().toString(36)}${(seq++).toString(36)}`;
}

export function localListSaves(): LocalSave[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function localSaveWorksheet(input: WorksheetInput, createdAtIso: string): LocalSave {
  const n = input.tasks.length;
  const entry: LocalSave = {
    id: localId(),
    // English on purpose: the worker derives the SAME title for server-side saves
    // (worker/src/routes/worksheet.ts deriveTitle) and both sources are merged into
    // one saved-audits list. It is a persisted field, so the language rule keeps it
    // English rather than leaving that list half-translated.
    title: `Time → Money Audit (${n})`,
    createdAt: createdAtIso,
    input,
  };
  write([entry, ...read()]);
  return entry;
}

export function localGetSave(id: string): LocalSave | null {
  return read().find(s => s.id === id) ?? null;
}

export function localDeleteSave(id: string): void {
  write(read().filter(s => s.id !== id));
}

/** Convenience: recompute totals for a local save (for list display). */
export function localTotals(save: LocalSave) {
  return computeWorksheet(save.input).totals;
}
