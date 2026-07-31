/**
 * Contacts card list (below desktop) — virtualized.
 *
 * Cards carry more markup per contact than table rows, so the phone view was the
 * FIRST to stall on a long list, not the last. Same windowing, same fixed height:
 * every card is clipped to CARD_HEIGHT so the spacers stay honest.
 */

import { Button } from '../ui/Button';
import { useVirtualRows } from '../../lib/ui/useVirtualRows';
import type { Contact, ContactStatus } from '../../lib/contacts/contactsClient';

/** Card box + the gap beneath it — the stride the window maths steps by. */
export const CARD_HEIGHT = 168;
const GAP = 10;
const STRIDE = CARD_HEIGHT + GAP;
const MAX_BODY_HEIGHT = 620;

const cardBox: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
  padding: 14, height: CARD_HEIGHT, overflow: 'hidden', boxSizing: 'border-box',
};

export interface ContactsCardsProps {
  rows: Contact[] | null;
  busyId: string | null;
  statusColor: Record<ContactStatus, { bg: string; fg: string }>;
  t: Record<string, unknown>;
  canEditRow: (c: Contact) => boolean;
  onDetail: (c: Contact) => void;
  onEdit: (c: Contact) => void;
}

export function ContactsCards(p: ContactsCardsProps) {
  const C = p.t as Record<string, string> & { statuses: Record<string, string>; sources: Record<string, string> };
  const list = p.rows ?? [];
  const v = useVirtualRows({ count: list.length, rowHeight: STRIDE, threshold: 30 });
  const window = list.slice(v.start, v.end);

  if (p.rows === null) return <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: 12 }}>{C.loading}</div>;
  if (list.length === 0) return <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: 12 }}>{C.empty}</div>;

  return (
    <div ref={v.ref} style={{ overflowY: 'auto', maxHeight: MAX_BODY_HEIGHT }}>
      <div style={{ height: v.padTop }} aria-hidden="true" />
      <div style={{ display: 'grid', gap: GAP }}>
        {window.map(c => (
          <div key={(c.orgId ?? '') + c.contactId} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company || '—'}</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: p.statusColor[c.status].bg, color: p.statusColor[c.status].fg }}>
                {C.statuses[c.status]}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 3, marginTop: 8, fontSize: 12.5 }}>
              <a href={`mailto:${c.email}`} style={{ color: 'var(--violet-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</a>
              {c.phone && <a href={`tel:${c.phone}`} style={{ color: 'var(--violet-text)' }}>{c.phone}</a>}
              <div style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {[C.sources[c.source] ?? c.source, c.countryCode || c.phoneCountry, c.leadStatus].filter(Boolean).join(' · ')}
              </div>
              <div style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {C.colOwner}: {c.assignedToEmail || c.owner || C.unassigned}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Button variant="secondary" size="sm" onClick={() => p.onDetail(c)}>{C.viewDetail}</Button>
              {p.canEditRow(c) && (
                <Button variant="secondary" size="sm" onClick={() => p.onEdit(c)} disabled={p.busyId === c.contactId}>{C.edit}</Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: v.padBottom }} aria-hidden="true" />
    </div>
  );
}
