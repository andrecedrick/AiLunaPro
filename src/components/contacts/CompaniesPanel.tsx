/**
 * Company registry panel — SUPER ADMIN ONLY.
 *
 * Rendered as a mode of the Contacts page rather than a separate route: it shares
 * the same guard, the same operator, and the same data, and a new route would add
 * navigation surface for one operator-only screen.
 *
 * Merge is deliberately two-step (select a survivor, then pick the duplicate to
 * fold in) and always names both companies in the confirmation. Merging is the
 * one action here that moves contacts between records, and picking the wrong
 * survivor silently relabels every one of them.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import { useVirtualRows } from '../../lib/ui/useVirtualRows';
import {
  listCompanies, renameCompany, mergeCompanies, reconcileCompanies, syncTwentyCompanies,
  CompanyError, type Company, type ReconcileResult, type TwentySyncResult,
} from '../../lib/companies/companiesClient';

const ROW_HEIGHT = 44;
const MAX_BODY_HEIGHT = 560;

const COLUMNS = [
  { key: 'name',    width: 220 },
  { key: 'org',     width: 150 },
  { key: 'count',   width: 110 },
  { key: 'source',  width: 120 },
  { key: 'twenty',  width: 240 },
  { key: 'created', width: 120 },
  { key: 'updated', width: 120 },
  { key: 'actions', width: 200 },
];
const TABLE_WIDTH = COLUMNS.reduce((n, c) => n + c.width, 0);

const th: React.CSSProperties = { padding: '10px 12px', fontWeight: 700, textAlign: 'left' };
const td: React.CSSProperties = {
  padding: '0 12px', height: ROW_HEIGHT, verticalAlign: 'middle',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 14 };
const field: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit' };

export function CompaniesPanel() {
  const C = useLocale().contacts;
  const [rows, setRows] = useState<Company[] | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [recon, setRecon] = useState<ReconcileResult | null>(null);
  const [twenty, setTwenty] = useState<TwentySyncResult | null>(null);
  /** Survivor selected for the next merge. */
  const [keep, setKeep] = useState<Company | null>(null);

  const reload = useCallback(async () => {
    setError(''); setRows(null);
    try { setRows(await listCompanies()); }
    catch (e) { setRows([]); setError(e instanceof CompanyError ? e.code : 'LOAD_FAILED'); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows ?? [];
    return (rows ?? []).filter(r => r.name.toLowerCase().includes(s) || r.orgId.toLowerCase().includes(s));
  }, [rows, search]);

  const v = useVirtualRows({ count: filtered.length, rowHeight: ROW_HEIGHT });
  const window = filtered.slice(v.start, v.end);

  /**
   * Duplicate detection mirrors the SERVER's key so the UI flags exactly what the
   * server would refuse to create twice. Recomputing it loosely here would either
   * hide real duplicates or accuse innocent pairs.
   */
  const dupeKeys = useMemo(() => {
    const seen = new Map<string, number>();
    for (const r of rows ?? []) {
      const k = `${r.orgId}::${r.nameKey}`;
      seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    return new Set([...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  }, [rows]);

  const act = async (fn: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await fn(); await reload(); }
    catch (e) { setError(e instanceof CompanyError ? e.code : 'SAVE_FAILED'); }
    finally { setBusy(false); }
  };

  const doRename = (co: Company) => {
    const next = globalThis.prompt(C.companyRenamePrompt, co.name);
    if (next === null || !next.trim() || next.trim() === co.name) return;
    void act(() => renameCompany(co.orgId, co.companyId, next.trim()));
  };

  const doMerge = (co: Company) => {
    if (!keep) return;
    if (keep.orgId !== co.orgId) { setError('CROSS_ORG_MERGE'); return; }
    // Names both companies: the survivor is not recoverable by re-merging.
    if (!globalThis.confirm(`${C.companyMergeConfirm}\n\n${co.name}  →  ${keep.name}`)) return;
    void act(async () => { await mergeCompanies(keep.orgId, keep.companyId, co.companyId); setKeep(null); });
  };

  const doReconcile = (dryRun: boolean) => act(async () => { setRecon(await reconcileCompanies(dryRun)); });

  /**
   * Applying writes to Twenty, so the apply path confirms first. The dry run is
   * unguarded — it only reads.
   */
  const doTwentySync = (dryRun: boolean) => {
    if (!dryRun && !globalThis.confirm(C.companyTwentySyncConfirm)) return;
    return act(async () => { setTwenty(await syncTwentyCompanies(dryRun)); });
  };

  const errMsg = (code: string) => (C.errors as Record<string, string>)[code] ?? code;

  return (
    <>
      <section style={{ ...card, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={C.companySearch} style={{ ...field, flex: '1 1 220px', minWidth: 180 }} />
        <Button variant="secondary" size="md" onClick={() => void doReconcile(true)} disabled={busy}>{C.companyReconcileDry}</Button>
        <Button variant="secondary" size="md" onClick={() => void doReconcile(false)} disabled={busy}>{C.companyReconcileApply}</Button>
        {/* Twenty comparison + repair. Run the dry check first: it reads Twenty
            and reports how many people are linked to the wrong company. */}
        <Button variant="secondary" size="md" onClick={() => void doTwentySync(true)} disabled={busy}>{C.companyTwentyCheck}</Button>
        <Button variant="primary" size="md" onClick={() => void doTwentySync(false)} disabled={busy}>{C.companyTwentyRepair}</Button>
      </section>

      {recon && (
        <section style={{ ...card, fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {recon.dryRun ? C.companyReconcileDry : C.companyReconcileApply}
          </div>
          <div>{C.companyReconcileContacts}: {recon.contacts} · {C.companyReconcileRegistry}: {recon.registry}</div>
          <div>{C.companyReconcileUnlinked}: {recon.unlinked} · {C.companyReconcileCreated}: {recon.createdCount}</div>
          <div>{C.companyReconcileDuplicates}: {recon.duplicates} · {C.companyReconcileOrphans}: {recon.orphans} · {C.companyReconcileNoTwenty}: {recon.noTwentyId}</div>
          {!recon.dryRun && <div>{C.companyReconcileWritten}: {recon.written}</div>}
        </section>
      )}

      {twenty && (
        <section style={{ ...card, fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {twenty.dryRun ? C.companyTwentyCheck : C.companyTwentyRepair}
          </div>
          <div>{C.companyTwentyPeople}: {twenty.people} · {C.companyTwentyChecked}: {twenty.checked} · {C.companyTwentySkipped}: {twenty.skipped}</div>
          <div>
            {C.companyTwentyMismatched}:{' '}
            <strong style={{ color: twenty.mismatched ? 'var(--red-text)' : 'var(--green-text)' }}>{twenty.mismatched}</strong>
            {!twenty.dryRun && <> · {C.companyTwentyCorrected}: <strong style={{ color: 'var(--green-text)' }}>{twenty.corrected}</strong></>}
            {' · '}{C.companyTwentyCreated}: {twenty.companiesCreated}
          </div>
          {twenty.failures > 0 && (
            <div style={{ color: 'var(--red-text)' }}>
              {C.companyTwentyFailures}: {twenty.failures}
              {twenty.sample.failures.map((f, i) => <div key={i} style={{ fontSize: 12 }}>· {f.reason}</div>)}
            </div>
          )}
          {twenty.sample.mismatched.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--text-muted)' }}>
              {twenty.sample.mismatched.map(m => m.company).join(', ')}
            </div>
          )}
        </section>
      )}

      {keep && (
        <section style={{ ...card, fontSize: 13, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{C.companyMergeKeeping}: <strong>{keep.name}</strong> — {C.companyMergePick}</span>
          <Button variant="ghost" size="sm" onClick={() => setKeep(null)}>{C.cancel}</Button>
        </section>
      )}

      {error && <div style={{ ...card, color: 'var(--red-text)', fontSize: 13 }}>{errMsg(error)}</div>}

      <section style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div ref={v.ref} style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: MAX_BODY_HEIGHT }}>
          <table style={{ width: TABLE_WIDTH, minWidth: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
            <colgroup>{COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface)' }}>
              <tr style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                <th style={th}>{C.companyName}</th>
                <th style={th}>{C.colOrg}</th>
                <th style={th}>{C.companyContacts}</th>
                <th style={th}>{C.colSource}</th>
                <th style={th}>{C.companyTwentyId}</th>
                <th style={th}>{C.colCreated}</th>
                <th style={th}>{C.companyUpdated}</th>
                <th style={th}>{C.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr><td style={td} colSpan={COLUMNS.length}>{C.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td style={{ ...td, color: 'var(--text-muted)' }} colSpan={COLUMNS.length}>{C.companyEmpty}</td></tr>
              ) : (
                <>
                  {v.padTop > 0 && <tr style={{ height: v.padTop }} aria-hidden="true" />}
                  {window.map(co => {
                    const dupe = dupeKeys.has(`${co.orgId}::${co.nameKey}`);
                    return (
                      <tr key={co.orgId + co.companyId} style={{ borderTop: '1px solid var(--border)', height: ROW_HEIGHT }}>
                        <td style={{ ...td, fontWeight: 600 }}>
                          {co.name}
                          {/* Flagged in the UI because the registry cannot merge
                              on its own — only an operator knows which name wins. */}
                          {dupe && <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 700, color: 'var(--red-text)' }}>{C.companyDuplicate}</span>}
                        </td>
                        <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{co.orgId}</td>
                        <td style={td}>{co.contactCount}</td>
                        <td style={td}>{(C.sources as Record<string, string>)[co.source] ?? co.source}</td>
                        <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: co.twentyCompanyId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {co.twentyCompanyId || C.companyNoTwentyId}
                        </td>
                        <td style={{ ...td, color: 'var(--text-muted)' }}>{co.createdAt ? new Date(co.createdAt).toLocaleDateString() : '—'}</td>
                        <td style={{ ...td, color: 'var(--text-muted)' }}>{co.updatedAt ? new Date(co.updatedAt).toLocaleDateString() : '—'}</td>
                        <td style={td}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <Button variant="secondary" size="sm" onClick={() => doRename(co)} disabled={busy}>{C.companyRename}</Button>
                            {keep && keep.companyId !== co.companyId
                              ? <Button variant="danger" size="sm" onClick={() => doMerge(co)} disabled={busy}>{C.companyMergeInto}</Button>
                              : <Button variant="secondary" size="sm" onClick={() => setKeep(co)} disabled={busy || Boolean(keep)}>{C.companyMerge}</Button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {v.padBottom > 0 && <tr style={{ height: v.padBottom }} aria-hidden="true" />}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 20 }}>
        {filtered.length} {C.companyCount}
      </div>
    </>
  );
}
