/**
 * ContactsPage — CRM-lite contact management (#/contacts).
 *
 * Role-aware (server is the authority; the UI only mirrors it):
 *  - super-admin (platform operator) → cross-org READ-ONLY table (orgId shown, no actions).
 *  - owner / admin                   → full org CRUD + block/activate.
 *  - member                          → own contacts; create + edit/delete own; NO block.
 *  - billing / client                → no access (nav hidden; API 403s anyway).
 *
 * Consistent with Admin Center styling. All writes go through the authed worker
 * routes which re-enforce RBAC + org scoping; contact PII never touches the client SDK.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { Button } from '../components/ui/Button';
import { fetchPlatformMe } from '../lib/platform/platformService';
import { contactsToCsv, csvFilename } from '../lib/contacts/contactsExport';
import { ContactDetailPanel } from '../components/contacts/ContactDetailPanel';
import { useViewport } from '../lib/ui/useViewport';
import { messagePreview } from '../lib/contacts/messagePreview';
import {
  listContacts, listAllContacts, createContact, patchContact, deleteContact,
  ContactError, type Contact, type ContactInput, type ContactStatus, type ContactSource, type LeadStatus,
} from '../lib/contacts/contactsClient';

const SOURCES: ContactSource[] = ['manual', 'quote', 'worksheet', 'visibility', 'import', 'demo_request'];
const STATUSES: ContactStatus[] = ['active', 'inactive', 'blocked'];

const STATUS_COLOR: Record<ContactStatus, { bg: string; fg: string }> = {
  active:   { bg: 'rgba(16,185,129,0.12)', fg: 'var(--green-text)' },
  inactive: { bg: 'var(--surface-2)',       fg: 'var(--text-muted)' },
  blocked:  { bg: 'rgba(239,68,68,0.12)',   fg: 'var(--red-text)' },
};

interface Draft { contactId?: string; name: string; email: string; phone: string; company: string; tagsText: string; notes: string; source: ContactSource; status: ContactStatus; leadStatus: LeadStatus; owner: string; }
const emptyDraft = (): Draft => ({ name: '', email: '', phone: '', company: '', tagsText: '', notes: '', source: 'manual', status: 'active', leadStatus: '', owner: '' });
/** Sales funnel stages an operator can set. Mirrors LEAD_STATUS_VALUES server-side. */
const LEAD_STATUSES: LeadStatus[] = ['', 'new', 'contacted', 'qualified', 'won', 'lost'];

export function ContactsPage() {
  const { session } = useAuth();
  const C = useLocale().contacts;
  const orgId = session?.orgId ?? '';
  const role = session?.role ?? '';
  const isContentRole = role === 'owner' || role === 'admin' || role === 'member';
  const isManager = role === 'owner' || role === 'admin';

  // Below desktop the 13-column table is unusable, so the page renders cards.
  const viewport = useViewport();
  const isDesktop = viewport === 'desktop';

  const [isSuperAdmin, setSuper] = useState(false);
  const [mode, setMode] = useState<'org' | 'all'>('org');
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

  const reload = useCallback(async () => {
    setError(null); setRows(null);
    try {
      const data = mode === 'all' ? await listAllContacts() : await listContacts(orgId);
      setRows(data);
    } catch (e) { setRows([]); setError(e instanceof ContactError ? e.code : 'LOAD_FAILED'); }
  }, [mode, orgId]);
  useEffect(() => { void reload(); }, [reload]);

  // All tags present (for the filter dropdown).
  const allTags = useMemo(() => Array.from(new Set((rows ?? []).flatMap(r => r.tags))).sort(), [rows]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (rows ?? []).filter(r =>
      (!s || r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s) || r.company.toLowerCase().includes(s)) &&
      (!fTag || r.tags.includes(fTag)) &&
      (!fSource || r.source === fSource) &&
      (!fStatus || r.status === fStatus),
    );
  }, [rows, search, fTag, fSource, fStatus]);

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
      // status only sent by managers (members cannot change it).
      ...(isManager ? { status: draft.status } : {}),
    };
    try {
      if (draft.contactId) await patchContact(orgId, draft.contactId, input);
      else await createContact(orgId, input);
      setDraft(null); await reload();
    } catch (e) { setFormErr(e instanceof ContactError ? e.code : 'SAVE_FAILED'); }
    finally { setSaving(false); }
  };

  // Detail panel: the full record, the read-only prospect request and the
  // editable internal notes. The table can only show a scannable summary.
  const [detail, setDetail] = useState<Contact | null>(null);
  const saveNotes = async (notes: string) => {
    if (!detail) return;
    await patchContact(detail.orgId ?? orgId, detail.contactId, { notes });
    setDetail({ ...detail, notes });
    await reload();
  };

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
   * Export what the operator is actually looking at. `filtered` already has the
   * search, tag, source and status filters applied, so the CSV matches the
   * screen — exporting `rows` would hand over records deliberately filtered
   * away, including other organisations' contacts in the cross-org view.
   */
  const exportCsv = () => {
    const blob = new Blob([contactsToCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvFilename();
    a.click();
    URL.revokeObjectURL(url);
  };

  const canEditRow = (c: Contact) => !readOnly && (isManager || c.createdByUid === (session?.userId ?? ''));
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isSuperAdmin && isContentRole && (
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setMode('org')} style={{ ...toggleBtn, ...(mode === 'org' ? toggleOn : {}) }}>{C.modeOrg}</button>
              <button onClick={() => setMode('all')} style={{ ...toggleBtn, ...(mode === 'all' ? toggleOn : {}) }}>{C.modeAll}</button>
            </div>
          )}
          {/* Export is Super Admin only. It bundles customer PII (name, email,
              phone) into a file that leaves the app, so it is not offered to
              ordinary org roles even though they can already read those same
              contacts in the table. */}
          {isSuperAdmin && (
            <Button variant="secondary" size="md" onClick={exportCsv} disabled={!filtered.length}>{C.exportCsv}</Button>
          )}
          {!readOnly && isContentRole && (
            <Button variant="primary" size="md" onClick={openCreate}>{C.create}</Button>
          )}
        </div>
      </header>

      {readOnly && <div style={{ ...card, fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>{C.readOnlyNotice}</div>}

      {/* Filters */}
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
      </section>

      {error && <div style={{ ...card, color: 'var(--red-text)', fontSize: 13 }}>{errMsg(error)}</div>}

      {/* Table */}
      <section style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {/* Cards below desktop. A 13-column table at a 860px minimum means
            dragging sideways to read one row on a phone, so the table is not
            rendered at all there — no hidden columns, no horizontal scroll, and
            no wasted DOM for a list that could hold a thousand contacts. */}
        {!isDesktop && (
          <div style={{ display: 'grid', gap: 10 }}>
            {rows === null ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{C.loading}</div>
            ) : filtered.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{C.empty}</div>
            ) : filtered.map(c => (
              <div key={(c.orgId ?? '') + c.contactId} style={contactCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', wordBreak: 'break-word' }}>{c.company || '—'}</div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: STATUS_COLOR[c.status].bg, color: STATUS_COLOR[c.status].fg }}>
                    {(C.statuses as Record<string, string>)[c.status]}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: 4, marginTop: 8, fontSize: 12.5 }}>
                  <a href={`mailto:${c.email}`} style={{ color: 'var(--violet-text)', wordBreak: 'break-all' }}>{c.email}</a>
                  {c.phone && <a href={`tel:${c.phone}`} style={{ color: 'var(--violet-text)' }}>{c.phone}</a>}
                  <div style={{ color: 'var(--text-muted)' }}>
                    {[(C.sources as Record<string, string>)[c.source] ?? c.source,
                      c.countryCode || c.phoneCountry,
                      c.leadStatus].filter(Boolean).join(' · ')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <Button variant="secondary" size="sm" onClick={() => setDetail(c)}>{C.viewDetail}</Button>
                  {canEditRow(c) && (
                    <Button variant="secondary" size="sm" onClick={() => openEdit(c)} disabled={busyId === c.contactId}>{C.edit}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isDesktop && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 860 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                <th style={th}>{C.colName}</th>
                <th style={th}>{C.colEmail}</th>
                <th style={th}>{C.colCompany}</th>
                {readOnly && <th style={th}>{C.colOrg}</th>}
                {/* Phone/country/lead-status were STORED by the demo-request bridge
                    but had no column, so a sales operator could not see the number
                    to call without opening Firestore. */}
                <th style={th}>{C.phone}</th>
                <th style={th}>{C.colCountry}</th>
                <th style={th}>{C.colLeadStatus}</th>
                {/* What the prospect actually asked for. Without this an operator
                    had to open Firestore to know what the call was about. */}
                <th style={th}>{C.colLastMessage}</th>
                <th style={th}>{C.colTags}</th>
                <th style={th}>{C.colSource}</th>
                <th style={th}>{C.colStatus}</th>
                <th style={th}>{C.colCreated}</th>
                {!readOnly && <th style={{ ...th, textAlign: 'right' }}>{C.colActions}</th>}
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr><td style={td} colSpan={13}>{C.loading}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td style={{ ...td, color: 'var(--text-muted)' }} colSpan={13}>{C.empty}</td></tr>
              ) : filtered.map(c => (
                <tr key={(c.orgId ?? '') + c.contactId} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{c.name}</td>
                  <td style={td}>{c.email}</td>
                  <td style={td}>{c.company || '—'}</td>
                  {readOnly && <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{c.orgId}</td>}
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {/* One click to call the lead back. */}
                    {c.phone ? <a href={`tel:${c.phone}`} style={{ color: 'var(--violet-text)' }}>{c.phone}</a> : '—'}
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{c.countryCode || c.phoneCountry || '—'}</td>
                  <td style={td}>{c.leadStatus || '—'}</td>
                  {/* Preview ONLY — capped at 80 characters in the string, not
                      merely clipped by CSS. The full request lives solely in the
                      detail panel; a hover tooltip is unreachable on touch and
                      unreadable for a long brief. */}
                  <td style={{ ...td, maxWidth: 240 }}>
                    <button
                      type="button"
                      onClick={() => setDetail(c)}
                      style={{
                        display: 'block', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0,
                        font: 'inherit', color: 'var(--violet-text)', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {messagePreview(c.lastMessage) || C.viewDetail}
                    </button>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.tags.length ? c.tags.map(t => <span key={t} style={tagPill}>{t}</span>) : '—'}
                    </div>
                  </td>
                  <td style={td}>{(C.sources as Record<string, string>)[c.source] ?? c.source}</td>
                  <td style={td}>
                    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: STATUS_COLOR[c.status].bg, color: STATUS_COLOR[c.status].fg }}>
                      {(C.statuses as Record<string, string>)[c.status]}
                    </span>
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                  {!readOnly && (
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                        {canEditRow(c) && <Button variant="secondary" size="sm" onClick={() => openEdit(c)} disabled={busyId === c.contactId}>{C.edit}</Button>}
                        {isManager && <Button variant="secondary" size="sm" onClick={() => void toggleBlock(c)} disabled={busyId === c.contactId}>{c.status === 'blocked' ? C.unblock : C.block}</Button>}
                        {canEditRow(c) && <Button variant="danger" size="sm" onClick={() => void remove(c)} disabled={busyId === c.contactId}>{C.delete}</Button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </section>

      {/* Create / edit modal */}
      {draft && (
        <div style={overlay} onClick={() => !saving && setDraft(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>{draft.contactId ? C.editTitle : C.createTitle}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Labeled label={C.colName} req><input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.colEmail} req><input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.phone}><input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.colCompany}><input value={draft.company} onChange={e => setDraft({ ...draft, company: e.target.value })} style={field} /></Labeled>
              <Labeled label={C.colSource}>
                <select value={draft.source} onChange={e => setDraft({ ...draft, source: e.target.value as ContactSource })} style={field}>
                  {SOURCES.map(s => <option key={s} value={s}>{(C.sources as Record<string, string>)[s]}</option>)}
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
              {/* Sales pipeline. Same org roles that may already edit name/phone —
                  this widens WHAT is editable, never WHO may edit. */}
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
          onClose={() => setDetail(null)}
          onSaveNotes={saveNotes}
        />
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
const th: React.CSSProperties = { padding: '10px 12px', fontWeight: 700 };
const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'middle' };
const toggleBtn: React.CSSProperties = { padding: '7px 14px', border: 'none', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' };
const toggleOn: React.CSSProperties = { background: 'var(--violet)', color: '#fff' };
const contactCard: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 };
const tagPill: React.CSSProperties = { padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modal: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--card-shadow)' };
