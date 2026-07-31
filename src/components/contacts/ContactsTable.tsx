/**
 * Desktop contacts table — virtualized.
 *
 * Extracted from ContactsPage so the page stays under the file-size limit once
 * pagination and virtualization landed, and so the windowing maths lives next to
 * the markup whose row height it depends on.
 *
 * ROW_HEIGHT must match what a row actually renders at. It is enforced rather
 * than assumed: every cell is height-fixed and clipped, because one wrapping cell
 * would desynchronise the spacer heights from the real rows and make the scroll
 * position drift.
 */

import { Button } from '../ui/Button';
import { useVirtualRows } from '../../lib/ui/useVirtualRows';
import { messagePreview } from '../../lib/contacts/messagePreview';
import type { Contact, ContactStatus } from '../../lib/contacts/contactsClient';

export const ROW_HEIGHT = 44;
/** Viewport cap for the scroll container. Beyond this the window does the work. */
const MAX_BODY_HEIGHT = 620;

const th: React.CSSProperties = { padding: '10px 12px', fontWeight: 700 };
const td: React.CSSProperties = {
  padding: '0 12px', height: ROW_HEIGHT, verticalAlign: 'middle',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220,
};
const tagPill: React.CSSProperties = { padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };

export interface ContactsTableProps {
  rows: Contact[] | null;
  readOnly: boolean;
  isManager: boolean;
  busyId: string | null;
  statusColor: Record<ContactStatus, { bg: string; fg: string }>;
  t: Record<string, unknown>;
  canEditRow: (c: Contact) => boolean;
  onDetail: (c: Contact) => void;
  onEdit: (c: Contact) => void;
  onToggleBlock: (c: Contact) => void;
  onDelete: (c: Contact) => void;
}

export function ContactsTable(p: ContactsTableProps) {
  const C = p.t as Record<string, string> & { statuses: Record<string, string>; sources: Record<string, string> };
  const list = p.rows ?? [];
  const v = useVirtualRows({ count: list.length, rowHeight: ROW_HEIGHT });
  const window = list.slice(v.start, v.end);
  const colCount = p.readOnly ? 14 : 14;

  return (
    <div
      ref={v.ref}
      style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: MAX_BODY_HEIGHT }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900, tableLayout: 'fixed' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface)' }}>
          <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            <th style={th}>{C.colName}</th>
            <th style={th}>{C.colEmail}</th>
            <th style={th}>{C.colCompany}</th>
            {p.readOnly && <th style={th}>{C.colOrg}</th>}
            <th style={th}>{C.phone}</th>
            <th style={th}>{C.colCountry}</th>
            <th style={th}>{C.colLeadStatus}</th>
            <th style={th}>{C.colOwner}</th>
            <th style={th}>{C.colLastMessage}</th>
            <th style={th}>{C.colTags}</th>
            <th style={th}>{C.colSource}</th>
            <th style={th}>{C.colStatus}</th>
            <th style={th}>{C.colCreated}</th>
            {!p.readOnly && <th style={{ ...th, textAlign: 'right' }}>{C.colActions}</th>}
          </tr>
        </thead>
        <tbody>
          {p.rows === null ? (
            <tr><td style={td} colSpan={colCount}>{C.loading}</td></tr>
          ) : list.length === 0 ? (
            <tr><td style={{ ...td, color: 'var(--text-muted)' }} colSpan={colCount}>{C.empty}</td></tr>
          ) : (
            <>
              {/* Spacers stand in for the rows outside the window so the scrollbar
                  still represents the whole list. */}
              {v.padTop > 0 && <tr style={{ height: v.padTop }} aria-hidden="true" />}
              {window.map(c => (
                <tr key={(c.orgId ?? '') + c.contactId} style={{ borderTop: '1px solid var(--border)', height: ROW_HEIGHT }}>
                  <td style={{ ...td, fontWeight: 600 }}>{c.name}</td>
                  <td style={td}>{c.email}</td>
                  <td style={td}>{c.company || '—'}</td>
                  {p.readOnly && <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{c.orgId}</td>}
                  <td style={td}>
                    {c.phone ? <a href={`tel:${c.phone}`} style={{ color: 'var(--violet-text)' }}>{c.phone}</a> : '—'}
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{c.countryCode || c.phoneCountry || '—'}</td>
                  <td style={td}>{c.leadStatus || '—'}</td>
                  <td style={{ ...td, color: (c.assignedToEmail || c.owner) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {c.assignedToEmail || c.owner || C.unassigned}
                  </td>
                  {/* Preview ONLY — capped at 80 characters in the string. The full
                      request lives solely in the detail panel. */}
                  <td style={td}>
                    <button
                      type="button"
                      onClick={() => p.onDetail(c)}
                      style={{
                        display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0,
                        font: 'inherit', color: 'var(--violet-text)', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {messagePreview(c.lastMessage) || C.viewDetail}
                    </button>
                  </td>
                  <td style={td}>
                    {c.tags.length ? c.tags.map(t => <span key={t} style={tagPill}>{t}</span>) : '—'}
                  </td>
                  <td style={td}>{C.sources[c.source] ?? c.source}</td>
                  <td style={td}>
                    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: p.statusColor[c.status].bg, color: p.statusColor[c.status].fg }}>
                      {C.statuses[c.status]}
                    </span>
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                  {!p.readOnly && (
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                        {p.canEditRow(c) && <Button variant="secondary" size="sm" onClick={() => p.onEdit(c)} disabled={p.busyId === c.contactId}>{C.edit}</Button>}
                        {p.isManager && <Button variant="secondary" size="sm" onClick={() => p.onToggleBlock(c)} disabled={p.busyId === c.contactId}>{c.status === 'blocked' ? C.unblock : C.block}</Button>}
                        {p.canEditRow(c) && <Button variant="danger" size="sm" onClick={() => p.onDelete(c)} disabled={p.busyId === c.contactId}>{C.delete}</Button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {v.padBottom > 0 && <tr style={{ height: v.padBottom }} aria-hidden="true" />}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
