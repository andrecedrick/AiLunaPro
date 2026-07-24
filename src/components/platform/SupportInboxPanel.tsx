/**
 * Support Inbox — operator ticket queue with reply + close (Phases 4–5).
 *
 * Previously read-only; now closes the loop. An operator can expand a ticket to
 * see the full conversation timeline (question → replies → close event), send a
 * reply (persisted + emailed to the contact), and close the ticket.
 *
 * Contact details (email + phone) are shown — an operator cannot call back
 * without them. Platform-admin gated; values never logged.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  fetchPlatformSupport, replyToTicket, setTicketStatus,
  type PlatformSupport, type SupportTicketItem,
} from '../../lib/platform/platformService';

const card = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 16 } as const;
const th = { textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', padding: '6px 8px' } as const;
const td = { fontSize: 12.5, color: 'var(--text-primary)', padding: '8px', borderTop: '1px solid var(--border)', verticalAlign: 'top' } as const;
const mono = { fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, wordBreak: 'break-all' } as const;
const btn = (bg: string, fg: string) => ({ padding: '6px 12px', borderRadius: 8, border: 'none', background: bg, color: fg, fontWeight: 700, fontSize: 12, cursor: 'pointer' } as const);
const btnOutline = { padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer' } as const;

function statusChip(s: string) {
  const map: Record<string, [string, string]> = {
    open:     ['#b45309', 'rgba(180,83,9,0.10)'],
    answered: ['#7c3aed', 'rgba(124,58,237,0.10)'],
    closed:   ['#059669', 'rgba(5,150,105,0.10)'],
  };
  const [color, background] = map[s] ?? ['var(--text-muted)', 'transparent'];
  return { color, background, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' } as const;
}

const fmt = (iso: string) => (iso ? new Date(iso).toLocaleString() : '—');

/** Read-only conversation timeline: question → each reply → close event. */
function Timeline({ t }: { t: SupportTicketItem }) {
  return (
    <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
      <div style={{ borderLeft: '3px solid var(--border)', paddingLeft: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>CUSTOMER · {fmt(t.createdAt)}</div>
        <div style={{ fontSize: 12.5 }}>{t.description || '—'}</div>
      </div>
      {t.replies.map((r, i) => (
        <div key={i} style={{ borderLeft: '3px solid var(--violet)', paddingLeft: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--violet-text)', fontWeight: 700 }}>REPLY · {r.repliedBy} · {fmt(r.repliedAt)}</div>
          <div style={{ fontSize: 12.5 }}>{r.message}</div>
        </div>
      ))}
      {t.status === 'closed' && (
        <div style={{ borderLeft: '3px solid var(--green-text, #059669)', paddingLeft: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--green-text, #059669)', fontWeight: 700 }}>CLOSED · {t.closedBy || 'operator'} · {fmt(t.closedAt)}</div>
        </div>
      )}
    </div>
  );
}

function TicketCard({ t, onChanged }: { t: SupportTicketItem; onChanged: () => void }) {
  const [open, setOpen]     = useState(false);
  const [reply, setReply]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [note, setNote]     = useState<string | null>(null);

  const send = async () => {
    if (busy || reply.trim().length === 0) return;
    setBusy(true); setNote(null);
    const r = await replyToTicket(t.id, reply.trim());
    setBusy(false);
    if (r.ok) { setReply(''); setNote(r.emailed ? 'Reply sent + emailed.' : 'Reply saved (email not sent).'); onChanged(); }
    else setNote('Failed to send reply.');
  };
  const close = async () => {
    if (busy) return;
    setBusy(true); setNote(null);
    const ok = await setTicketStatus(t.id, 'closed');
    setBusy(false);
    if (ok) onChanged(); else setNote('Failed to close.');
  };

  return (
    <tr>
      <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmt(t.createdAt)}</td>
      <td style={td}>{t.type || '—'}</td>
      <td style={td}><span style={statusChip(t.status)}>{t.status}</span></td>
      <td style={td}>
        <div style={mono}>{t.email || '—'}</div>
        <div style={{ ...mono, color: 'var(--text-muted)' }}>{t.phone || 'no phone'}</div>
      </td>
      <td style={{ ...td, minWidth: 320 }}>
        <div style={{ marginBottom: 6 }}>{t.description || '—'}</div>
        <button type="button" onClick={() => setOpen(o => !o)} style={btnOutline}>
          {open ? 'Hide' : `History (${t.replies.length})`}
        </button>
        {open && (
          <div style={{ marginTop: 10 }}>
            <Timeline t={t} />
            {t.status !== 'closed' && (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Write a reply to the customer…"
                  rows={3}
                  style={{ width: '100%', fontSize: 12.5, padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" disabled={busy || reply.trim().length === 0} onClick={() => void send()} style={btn('var(--violet)', '#fff')}>{busy ? '…' : 'Reply'}</button>
                  <button type="button" disabled={busy} onClick={() => void close()} style={btn('var(--green-text, #059669)', '#fff')}>Close</button>
                </div>
              </div>
            )}
            {note && <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>{note}</div>}
          </div>
        )}
      </td>
    </tr>
  );
}

export function SupportInboxPanel() {
  const [data, setData]       = useState<PlatformSupport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    let alive = true;
    fetchPlatformSupport().then(d => { if (alive) setData(d); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  useEffect(() => load(), [load]);
  const reload = () => { fetchPlatformSupport().then(d => d && setData(d)).catch(() => {}); };

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading support inbox…</div>;
  if (!data)   return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Support inbox is unavailable.</div>;
  if (data.total === 0) return <div style={{ ...card, fontSize: 13, color: 'var(--text-muted)' }}>No support tickets yet.</div>;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {([['Tickets', data.total], ['Open', data.open], ['Awaiting reply', data.awaiting]] as const).map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: label !== 'Tickets' && value > 0 ? '#b45309' : 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th style={th}>When</th>
              <th style={th}>Type</th>
              <th style={th}>Status</th>
              <th style={th}>Contact</th>
              <th style={th}>Conversation</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(t => <TicketCard key={t.id} t={t} onChanged={reload} />)}
          </tbody>
        </table>
      </div>

      {data.capped && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Showing the most recent {data.total} tickets.</div>
      )}
    </div>
  );
}
