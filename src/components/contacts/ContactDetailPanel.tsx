/**
 * Contact detail panel — the CRM record an operator actually works from.
 *
 * The table can only ever show a scannable summary; several stored fields
 * (identityEmail, phoneCountry, owner, lastActivityAt, the Twenty ids) had no
 * surface at all, and the prospect's request was reachable only as a hover
 * tooltip — unusable on touch and impossible to read for a long brief.
 *
 * MESSAGE MODEL, deliberately split in two:
 *   - Original request is READ-ONLY. It is evidence of what the prospect asked
 *     for, and the same text was emailed to the admin address and pushed into the
 *     Twenty note. Making it editable would let those three copies diverge with
 *     no way to tell afterwards which one the prospect actually sent.
 *   - Internal notes are editable and are where operator commentary belongs.
 *     They live in the contact's existing `notes` field, so no schema change and
 *     no new audit surface.
 */

import { useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import type { Contact, AssignableMember } from '../../lib/contacts/contactsClient';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 600, padding: 16,
} as const;

const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' } as const;
const value = { fontSize: 13.5, color: 'var(--text-primary)', wordBreak: 'break-word' } as const;
const mono  = { ...value, fontFamily: 'monospace', fontSize: 11.5 } as const;

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={label}>{k}</div>
      <div style={value}>{v || '—'}</div>
    </div>
  );
}

export function ContactDetailPanel({
  contact, canEdit, canAssign = false, assignable = [], onClose, onSaveNotes, onAssign,
}: {
  contact: Contact;
  canEdit: boolean;
  /** Super admin only. Assigning is the one action a role can never grant. */
  canAssign?: boolean;
  assignable?: readonly AssignableMember[];
  onClose: () => void;
  onSaveNotes: (notes: string) => Promise<void>;
  onAssign?: (assignToUid: string) => Promise<void>;
}) {
  const C = useLocale().contacts;
  const [notes, setNotes] = useState(contact.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [target, setTarget] = useState(contact.assignedToUid ?? '');
  const [assigning, setAssigning] = useState(false);
  const [assignErr, setAssignErr] = useState('');

  const doAssign = async () => {
    if (!onAssign) return;
    setAssigning(true); setAssignErr('');
    try { await onAssign(target); }
    catch (e) { setAssignErr(e instanceof Error ? e.message : 'ASSIGN_FAILED'); }
    finally { setAssigning(false); }
  };

  // Escape closes — a modal that can only be dismissed by hitting a small target
  // is painful on a phone, which is where this panel matters most.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(contact.lastMessage ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked (permissions / insecure context) — no-op */ }
  };

  const save = async () => {
    setSaving(true);
    try { await onSaveNotes(notes); } finally { setSaving(false); }
  };

  const country = contact.countryCode || contact.phoneCountry || '';

  return (
    <div style={overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={C.detailTitle}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          padding: 24, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{contact.name}</h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{contact.company || '—'}</div>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>{C.closeDetail}</Button>
        </header>

        {/* Identity + pipeline. Two columns on desktop, one on a phone. */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
          <Field k={C.colEmail}       v={contact.email} />
          <Field k={C.phone}          v={contact.phone} />
          <Field k={C.colCountry}     v={country} />
          <Field k={C.colLeadStatus}  v={contact.leadStatus ?? ''} />
          <Field k={C.colOwner}       v={contact.owner ?? ''} />
          <Field k={C.colSource}      v={(C.sources as Record<string, string>)[contact.source] ?? contact.source} />
          {/* Shown only when it differs — an identical pair is noise. */}
          {contact.identityEmail && contact.identityEmail !== contact.email && (
            <Field k="Account email" v={contact.identityEmail} />
          )}
          <Field k={C.colCreated}      v={contact.createdAt ? new Date(contact.createdAt).toLocaleString() : ''} />
          <Field k={C.colLastActivity} v={contact.lastActivityAt ? new Date(contact.lastActivityAt).toLocaleString() : ''} />
        </section>

        {/* Ownership ledger. Shown to everyone who can open the record — knowing
            who holds a lead is not privileged information; CHANGING it is. */}
        <section style={{ marginBottom: 18 }}>
          <div style={{ ...label, marginBottom: 6 }}>{C.assignmentSection}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Field k={C.assignedTo} v={contact.assignedToEmail || contact.owner || C.unassigned} />
            <Field k={C.assignedBy} v={contact.assignedByEmail ?? ''} />
            <Field k={C.assignedAt} v={contact.assignedAt ? new Date(contact.assignedAt).toLocaleString() : ''} />
            {/* Only present once a lead has actually changed hands. */}
            {contact.lastReassignedAt && (
              <>
                <Field k={C.lastReassignedBy} v={contact.lastReassignedByEmail ?? ''} />
                <Field k={C.lastReassignedAt} v={new Date(contact.lastReassignedAt).toLocaleString()} />
              </>
            )}
          </div>

          {canAssign && onAssign && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                aria-label={C.assignTo}
                style={{
                  flex: '1 1 200px', minWidth: 160, padding: '8px 10px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {/* '' is a real choice: it returns the lead to the unassigned pool
                    so a misassignment can be undone. */}
                <option value="">{C.unassigned}</option>
                {assignable.map(m => <option key={m.uid} value={m.uid}>{m.email || m.uid} ({m.role})</option>)}
              </select>
              <Button
                variant="primary" size="sm"
                onClick={doAssign}
                disabled={assigning || target === (contact.assignedToUid ?? '')}
              >
                {contact.assignedToUid ? C.transfer : C.assign}
              </Button>
            </div>
          )}
          {assignErr && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--red-text)' }}>{assignErr}</div>}
        </section>

        {contact.tags.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <div style={label}>{C.tagsLabel}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {contact.tags.map(t => (
                <span key={t} style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{t}</span>
              ))}
            </div>
          </section>
        )}

        {/* Original request — READ-ONLY. Full text, wrapped, never truncated. */}
        <section style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <div style={label}>{C.originalRequest}</div>
            {contact.lastMessage && (
              <Button variant="secondary" size="sm" onClick={copyMessage}>{copied ? C.copied : C.copy}</Button>
            )}
          </div>
          <div style={{
            fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-primary)',
            background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10,
            padding: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 260, overflowY: 'auto',
          }}>
            {contact.lastMessage || '—'}
          </div>
        </section>

        {/* Internal notes — editable. Never touches the original request. */}
        <section style={{ marginBottom: 18 }}>
          <div style={{ ...label, marginBottom: 6 }}>{C.internalNotes}</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={!canEdit}
            rows={4}
            style={{
              width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 13.5,
              padding: 10, borderRadius: 10, border: '1px solid var(--border)',
              background: canEdit ? 'var(--surface)' : 'var(--surface-2)', color: 'var(--text-primary)',
            }}
          />
          {canEdit && (
            <div style={{ marginTop: 8 }}>
              <Button variant="primary" size="sm" onClick={save} disabled={saving || notes === (contact.notes ?? '')}>
                {C.saveNotes}
              </Button>
            </div>
          )}
        </section>

        {/* Twenty identifiers — the reconciliation link into the sales CRM. */}
        {(contact.twentyPersonId || contact.twentyCompanyId) && (
          <section>
            <div style={{ ...label, marginBottom: 6 }}>{C.twentySection}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {contact.twentyPersonId && (
                <div>
                  <div style={label}>Person</div>
                  <div style={mono}>{contact.twentyPersonId}</div>
                </div>
              )}
              {contact.twentyCompanyId && (
                <div>
                  <div style={label}>Company</div>
                  <div style={mono}>{contact.twentyCompanyId}</div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
