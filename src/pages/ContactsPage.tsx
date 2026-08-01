/**
 * ContactsPage — CRM-lite contact management (#/contacts).
 *
 * Role-aware, but the server is the authority; the UI only mirrors it:
 *  - super-admin (platform operator) → whole org, plus a cross-org READ-ONLY mode.
 *  - owner / admin / member          → only the contacts ASSIGNED to them.
 *  - billing / client                → no access (nav hidden; API 403s anyway).
 *
 * PAGINATION: the list used to fetch up to 1,000 contacts in one call and render
 * every one of them. It now fetches a page at a time and keeps a cursor; the
 * table and card list are virtualized (ContactsTable / ContactsCards), so DOM
 * size follows the viewport rather than the data.
 *
 * Tag / source / status filters are sent to the SERVER so they narrow the page as
 * it is filled. The free-text search stays client-side and therefore searches the
 * rows LOADED SO FAR — the server has no text index, and pretending otherwise
 * would mean silently missing matches on later pages.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { Button } from '../components/ui/Button';
import { fetchPlatformMe } from '../lib/platform/platformService';
import { contactsToCsv, csvFilename } from '../lib/contacts/contactsExport';
import { ContactDetailPanel } from '../components/contacts/ContactDetailPanel';
import { ContactImportModal } from '../components/contacts/ContactImportModal';
import { ContactsTable } from '../components/contacts/ContactsTable';
import { ContactsCards } from '../components/contacts/ContactsCards';
import { CompaniesPanel } from '../components/contacts/CompaniesPanel';
import { useViewport } from '../lib/ui/useViewport';
import {
  listContacts, listAllContacts, createContact, patchContact, deleteContact,
  listAssignable, assignContact,
  ContactError, type Contact, type ContactInput, type ContactStatus, type ContactSource, type LeadStatus,
  type AssignableMember,
} from '../lib/contacts/contactsClient';

/** Filterable sources — everything the platform can write. */
const SOURCES: ContactSource[] = ['manual', 'quote', 'worksheet', 'visibility', 'import', 'demo_request', 'signup', 'reconcile'];
/**
 * Selectable when creating or editing by hand. `signup` and `reconcile` are
 * system-written: letting an operator claim a contact arrived via signup would
 * corrupt the very funnel the source field exists to measure.
 */
const MANUAL_SOURCES: ContactSource[] = ['manual', 'quote', 'worksheet', 'visibility', 'import', 'demo_request'];
const STATUSES: ContactStatus[] = ['active', 'inactive', 'blocked'];
const PAGE_SIZES = [50, 100, 200];

const STATUS_COLOR: Record<ContactStatus, { bg: string; fg: string }> = {
  active:   { bg: 'rgba(16,185,129,0.12)', fg: 'var(--green-text)' },
  inactive: { bg: 'var(--surface-2)',       fg: 'var(--text-muted)' },
  blocked:  { bg: 'rgba(239,68,68,0.12)',   fg: 'var(--red-text)' },
};

interface Draft { contactId?: string; name: string; email: string; phone: string; company: string; tagsText: string; notes: string; source: ContactSource; status: ContactStatus; leadStatus: LeadStatus; owner: string; }
const emptyDraft = (): Draft => ({ name: '', email: '', phone: '', company: '', tagsText: '', notes: '', source: 'manual', status: 'active', leadStatus: '', owner: '' });
const LEAD_STATUSES: LeadStatus[] = ['', 'new', 'contacted', 'qualified', 'won', 'lost'];

export function ContactsPage() {
  const { session } = useAuth();
  const C = useLocale().contacts;
  const orgId = session?.orgId ?? '';
  const role = session?.role ?? '';
  const isContentRole = role === 'owner' || role === 'admin' || role === 'member';
  const isManager = role === 'owner' || role === 'admin';

  const viewport = useViewport();
  const isDesktop = viewport === 'desktop';

  const [isSuperAdmin, setSuper] = useState(false);
  // 'companies' is the operator-only registry view. It is a MODE rather than a
  // route because it shares this page's guard, operator check and data.
  const [mode, setMode] = useState<'org' | 'all' | 'companies'>('org');
  useEffect(() => {
    let alive = true;
    fetchPlatformMe()
      .then(m => { if (alive) { setSuper(m.isSuperAdmin); if (m.isSuperAdmin && !isContentRole) setMode('all'); } })
      .catch(() => {});
    return () => { alive = false; };
  }, [isContentRole]);

  const readOnly = mode === 'all'; // cross-org view is always read-only
  const [rows, setRows] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [fTag, setFTag] = useState('');
  const [fSource, setFSource] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [cursor, setCursor] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [scanned, setScanned] = useState(0);

  /** Fetch one page. `append` distinguishes "load more" from a fresh query. */
  const fetchPage = useCallback(async (nextCursor: string, append: boolean) => {
    // The registry view loads its own data; fetching contacts for it would be a
    // wasted page of Firestore reads on every toggle.
    if (mode === 'companies') { setRows([]); setCursor(''); return; }
    const filters = { tag: fTag, source: fSource, status: fStatus };
    const page = mode === 'all'
      ? await listAllContacts({ limit: pageSize, cursor: nextCursor })
      : await listContacts(orgId, filters, { limit: pageSize, cursor: nextCursor });
    setRows(prev => (append && prev ? [...prev, ...page.contacts] : page.contacts));
    setCursor(page.nextCursor);
    setScanned(s => (append ? s + page.scanned : page.scanned));
  }, [mode, orgId, pageSize, fTag, fSource, fStatus]);

  const reload = useCallback(async () => {
    setError(null); setRows(null); setCursor('');
    try { await fetchPage('', false); }
    catch (e) { setRows([]); setError(e instanceof ContactError ? e.code : 'LOAD_FAILED'); }
  }, [fetchPage]);
  useEffect(() => { void reload(); }, [reload]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try { await fetchPage(cursor, true); }
    catch (e) { setError(e instanceof ContactError ? e.code : 'LOAD_FAILED'); }
    finally { setLoadingMore(false); }
  };

  const allTags = useMemo(() => Array.from(new Set((rows ?? []).flatMap(r => r.tags))).sort(), [rows]);

  // Only the text search runs client-side now; the rest is applied server-side.
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows ?? [];
    return (rows ?? []).filter(r =>
      r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s) || r.company.toLowerCase().includes(s));
  }, [rows, search]);

  // ── Create / edit modal ──
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const openCreate = () => { setFormErr(null); setDraft(emptyDraft()); };
  const openEdit = (c: Contact) => {
    setFormErr(null);
    setDraft({ contactId: c.contactId, name: c.name, email: c.email, phone: c.phone, company: c.company, tagsText: c.tags.join(', '), notes: c.notes, source: c.source, status: c.status, leadStatus: c.leadStatus ?? '', owner: c.owner ?? '' });
  };

  const submit = async () => {
    if (!draft) return;
    setSaving(true); setFormErr(null);
    const input: ContactInput = {
      name: draft.name, email: draft.email, phone: draft.phone, company: draft.company,
      tags: draft.tagsText.split(',').map(t => t.trim()).filter(Boolean),
      notes: draft.notes, source: draft.source,
      leadStatus: draft.leadStatus, owner: draft.owner,
      ...(isManager ? { status: draft.status } : {}),
    };
    try {
      if (draft.contactId) await patchContact(orgId, draft.contactId, input);
      else await createContact(orgId, input);
      setDraft(null); await reload();
    } catch (e) { setFormErr(e instanceof ContactError ? e.code : 'SAVE_FAILED'); }
    finally { setSaving(false); }
  };

  // ── Detail panel ──
  const [detail, setDetail] = useState<Contact | null>(null);
  const saveNotes = async (notes: string) => {
    if (!detail) return;
    await patchContact(detail.orgId ?? orgId, detail.contactId, { notes });
    setDetail({ ...detail, notes });
    await reload();
  };

  // Assignment. Fetched per open record: in the cross-org view each contact
  // belongs to a DIFFERENT workspace, so the eligible holders change with it.
  const [assignable, setAssignable] = useState<AssignableMember[]>([]);
  const detailOrg = detail?.orgId ?? orgId;
  useEffect(() => {
    if (!detail || !isSuperAdmin) { setAssignable([]); return; }
    let alive = true;
    listAssignable(detailOrg).then(m => { if (alive) setAssignable(m); }).catch(() => { if (alive) setAssignable([]); });
    return () => { alive = false; };
  }, [detail, detailOrg, isSuperAdmin]);

  const doAssign = async (assignToUid: string) => {
    if (!detail) return;
    await assignContact(detailOrg, detail.contactId, assignToUid);
    const holder = assignable.find(m => m.uid === assignToUid);
    setDetail({ ...detail, assignedToUid: assignToUid, assignedToEmail: holder?.email ?? '', owner: holder?.email ?? '' });
    await reload();
  };

  const [showImport, setShowImport] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggleBlock = async (c: Contact) => {
    setBusyId(c.contactId);
    try { await patchContact(orgId, c.contactId, { status: c.status === 'blocked' ? 'active' : 'blocked' }); await reload(); }
    catch (e) { setError(e instanceof ContactError ? e.code : 'SAVE_FAILED'); }
    finally { setBusyId(null); }
  };
  const remove = async (c: Contact) => {
    setBusyId(c.contactId);
    try { await deleteContact(orgId, c.contactId); await reload(); }
    catch (e) { setError(e instanceof ContactError ? e.code : 'SAVE_FAILED'); }
    finally { setBusyId(null); }
  };

  /**
   * Export what the operator is looking at — the LOADED, filtered rows. It cannot
   * export what has not been fetched, so the count is shown next to the button.
   */
  const exportCsv = () => {
    const blob = new Blob([contactsToCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = csvFilename(); a.click();
    URL.revokeObjectURL(url);
  };

  /** Mirrors the server rule (worker lib/contact-access.ts). Role does not widen it. */
  const canEditRow = (c: Contact) => {
    if (readOnly) return false;
    if (isSuperAdmin) return true;
    return (c.assignedToUid || c.createdByUid) === (session?.userId ?? '');
  };
  const errMsg = (code: string) => (C.errors as Record<string, string>)[code] ?? code;

  if (!isContentRole && !isSuperAdmin) {
    return <div style={{ padding: 28 }}><div style={card}>{C.noAccess}</div></div>;
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1180, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{C.title}</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0 }}>{readOnly ? C.subtitleAll : C.subtitleOrg}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {isSuperAdmin && (
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {isContentRole && <button onClick={() => setMode('org')} style={{ ...toggleBtn, ...(mode === 'org' ? toggleOn : {}) }}>{C.modeOrg}</button>}
              <button onClick={() => setMode('all')} style={{ ...toggleBtn, ...(mode === 'all' ? toggleOn : {}) }}>{C.modeAll}</button>
              {/* The company registry — operator only, server re-enforced. */}
              <button onClick={() => setMode('companies')} style={{ ...toggleBtn, ...(mode === 'companies' ? toggleOn : {}) }}>{C.modeCompanies}</button>
            </div>
          )}
          {/* Export is Super Admin only: it bundles customer PII into a file that
              leaves the app. Server-side the route is operator-gated too. */}
          {isSuperAdmin && (
            <Button variant="secondary" size="md" onClick={exportCsv} disabled={!filtered.length}>{C.exportCsv}</Button>
          )}
          {!readOnly && isContentRole && (
            <Button variant="secondary" size="md" onClick={() => setShowImport(true)}>{C.importCsv}</Button>
          )}
          {!readOnly && isContentRole && (
            <Button variant="primary" size="md" onClick={openCreate}>{C.create}</Button>
          )}
        </div>
      </header>

      {readOnly && <div style={{ ...card, fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>{C.readOnlyNotice}</div>}

      {/* The registry replaces the contact list entirely — it has its own filters,
          its own table and its own actions, and stacking both would leave two
          scrolling tables competing for the same screen. */}
      {mode === 'companies' ? <CompaniesPanel /> : <>

      <section style={{ ...card, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={C.searchPlaceholder} style={{ ...field, flex: '1 1 220px', minWidth: 180 }} />
        <select value={fTag} onChange={e => setFTag(e.target.value)} style={field}>
          <option value="">{C.allTags}</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={fSource} onChange={e => setFSource(e.target.value)} style={field}>
          <option value="">{C.allSources}</option>
          {SOURCES.map(s => <option key={s} value={s}>{(C.sources as Record<string, string>)[s]}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={field}>
          <option value="">{C.allStatuses}</option>
          {STATUSES.map(s => <option key={s} value={s}>{(C.statuses as Record<string, string>)[s]}</option>)}
        </select>
        {/* Page size is an operator control: a sales rep working ten leads should
            not pay for two hundred rows. */}
        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} aria-label={C.pageSize} style={field}>
          {PAGE_SIZES.map(n => <option key={n} value={n}>{n} / {C.pageSize}</option>)}
        </select>
      </section>

      {error && <div style={{ ...card, color: 'var(--red-text)', fontSize: 13 }}>{errMsg(error)}</div>}

      <section style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {isDesktop ? (
          <ContactsTable
            rows={rows === null ? null : filtered}
            readOnly={readOnly} isManager={isManager} busyId={busyId}
            statusColor={STATUS_COLOR} t={C as unknown as Record<string, unknown>}
            canEditRow={canEditRow}
            onDetail={setDetail} onEdit={openEdit}
            onToggleBlock={c => void toggleBlock(c)} onDelete={c => void remove(c)}
          />
        ) : (
          <ContactsCards
            rows={rows === null ? null : filtered}
            busyId={busyId} statusColor={STATUS_COLOR} t={C as unknown as Record<string, unknown>}
            canEditRow={canEditRow} onDetail={setDetail} onEdit={openEdit}
          />
        )}
      </section>

      {/* Paging footer. `scanned` is shown because it is the number that actually
          costs Firestore reads, and an operator narrowing a filter should be able
          to see the effect. */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 20 }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          {(rows ?? []).length} {C.loadedCount}{scanned > 0 ? ` · ${scanned} ${C.scannedCount}` : ''}
        </span>
        {cursor && (
          <Button variant="secondary" size="md" onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? '…' : C.loadMore}
          </Button>
        )}
      </div>
      </>}

      {draft && (
        <div style={overlay} onClick={() => !saving && setDraft(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>{draft.contactId ? C.editTitle : C.createTitle}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Labeled label={C.colName} req><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.colEmail} req><input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.phone}><input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} style={field} /></Labeled>
              {/* Mandatory, like every other prospect surface. Server rejects blanks. */}
              <Labeled label={C.colCompany} req><input value={draft.company} onChange={e => setDraft({ ...draft, company: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.colSource}>
                <select value={draft.source} onChange={e => setDraft({ ...draft, source: e.target.value as ContactSource })} style={field}>
                  {/* A system source already on the record stays selectable, so
                      editing a signup contact cannot silently relabel it. */}
                  {(MANUAL_SOURCES.includes(draft.source) ? MANUAL_SOURCES : [draft.source, ...MANUAL_SOURCES])
                    .map(s => <option key={s} value={s}>{(C.sources as Record<string, string>)[s] ?? s}</option>)}
                </select>
              </Labeled>
              {isManager && (
                <Labeled label={C.colStatus}>
                  <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as ContactStatus })} style={field}>
                    {STATUSES.map(s => <option key={s} value={s}>{(C.statuses as Record<string, string>)[s]}</option>)}
                  </select>
                </Labeled>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <Labeled label={C.colLeadStatus}>
                <select value={draft.leadStatus} onChange={e => setDraft({ ...draft, leadStatus: e.target.value as LeadStatus })} style={field}>
                  {LEAD_STATUSES.map(s => <option key={s || 'none'} value={s}>{s || '—'}</option>)}
                </select>
              </Labeled>
              <Labeled label={C.colOwner}><input value={draft.owner} onChange={e => setDraft({ ...draft, owner: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.tagsLabel}><input value={draft.tagsText} onChange={e => setDraft({ ...draft, tagsText: e.target.value })} placeholder={C.tagsPlaceholder} style={{ ...field, width: '100%' }} /></Labeled>
            </div>
            <div style={{ marginTop: 12 }}>
              <Labeled label={C.notesLabel}><textarea value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} rows={3} style={{ ...field, width: '100%', resize: 'vertical' }} /></Labeled>
            </div>
            {formErr && <div style={{ marginTop: 10, color: 'var(--red-text)', fontSize: 13 }}>{errMsg(formErr)}</div>}
            <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="md" onClick={() => setDraft(null)} disabled={saving}>{C.cancel}</Button>
              <Button variant="primary" size="md" onClick={() => void submit()} disabled={saving}>{saving ? '…' : C.save}</Button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <ContactDetailPanel
          contact={detail}
          canEdit={canEditRow(detail)}
          // Assigning stays available in the cross-org view: leads land in the
          // PROSPECT's workspace, so handing one to a rep is a cross-org write.
          canAssign={isSuperAdmin}
          assignable={assignable}
          onAssign={doAssign}
          onClose={() => setDetail(null)}
          onSaveNotes={saveNotes}
        />
      )}

      {showImport && (
        <ContactImportModal orgId={orgId} onClose={() => setShowImport(false)} onDone={reload} />
      )}
    </div>
  );
}

function Labeled({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', marginBottom: 4 }}>
        {label}{req && <span style={{ color: 'var(--red-text)' }}> *</span>}
      </div>
      {children}
    </label>
  );
}

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius, 14px)', boxShadow: 'var(--card-shadow)', padding: 16, marginBottom: 14 };
const field: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit' };
const toggleBtn: React.CSSProperties = { padding: '7px 14px', border: 'none', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' };
const toggleOn: React.CSSProperties = { background: 'var(--violet)', color: '#fff' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modal: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--card-shadow)' };
