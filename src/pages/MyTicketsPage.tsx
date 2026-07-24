/**
 * My Tickets — the customer's in-app view of their support conversations.
 *
 * This is where a "Support replied to your ticket" notification now lands (it
 * used to route to the generic Help page). The customer can read the full
 * thread, reply back, and close — reusing the existing support_tickets model
 * (no new ticketing system). Works even when the reply EMAIL fails to send.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchMyTickets, replyMyTicket, closeMyTicket, type MyTickets, type MyTicket } from '../lib/support/myTicketsClient';

const wrap = { maxWidth: 820, margin: '0 auto', padding: '24px 20px', display: 'grid', gap: 16 } as const;
const card = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 18 } as const;
const btn = (bg: string, fg: string) => ({ padding: '8px 16px', borderRadius: 8, border: 'none', background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' } as const);
const btnOutline = { padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' } as const;

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

function TicketCard({ t, onChanged }: { t: MyTicket; onChanged: () => void }) {
  const [reply, setReply] = useState('');
  const [busy, setBusy]   = useState(false);
  const [note, setNote]   = useState<string | null>(null);

  const send = async () => {
    if (busy || reply.trim().length === 0) return;
    setBusy(true); setNote(null);
    const ok = await replyMyTicket(t.id, reply.trim());
    setBusy(false);
    if (ok) { setReply(''); onChanged(); } else setNote('Could not send your reply.');
  };
  const close = async () => {
    if (busy) return;
    setBusy(true); setNote(null);
    const ok = await closeMyTicket(t.id);
    setBusy(false);
    if (ok) onChanged(); else setNote('Could not close the ticket.');
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 800, textTransform: 'capitalize' }}>{t.type || 'Support'} ticket</span>
        <span style={statusChip(t.status)}>{t.status}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--text-muted)' }}>{fmt(t.createdAt)}</span>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ borderLeft: '3px solid var(--border)', paddingLeft: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>YOU · {fmt(t.createdAt)}</div>
          <div style={{ fontSize: 13 }}>{t.description || '—'}</div>
        </div>
        {t.replies.map((r, i) => {
          const mine = r.repliedBy === 'customer';
          return (
            <div key={i} style={{ borderLeft: `3px solid ${mine ? 'var(--border)' : 'var(--violet)'}`, paddingLeft: 10 }}>
              <div style={{ fontSize: 11, color: mine ? 'var(--text-muted)' : 'var(--violet-text)', fontWeight: 700 }}>{mine ? 'YOU' : 'SUPPORT'} · {fmt(r.repliedAt)}</div>
              <div style={{ fontSize: 13 }}>{r.message}</div>
            </div>
          );
        })}
        {t.status === 'closed' && (
          <div style={{ borderLeft: '3px solid var(--green-text, #059669)', paddingLeft: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--green-text, #059669)', fontWeight: 700 }}>CLOSED · {fmt(t.closedAt)}</div>
          </div>
        )}
      </div>

      {t.status !== 'closed' && (
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Reply to support…"
            style={{ width: '100%', fontSize: 13, padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2, var(--surface))', color: 'var(--text-primary)', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" disabled={busy || reply.trim().length === 0} onClick={() => void send()} style={btn('var(--violet)', '#fff')}>{busy ? '…' : 'Reply'}</button>
            <button type="button" disabled={busy} onClick={() => void close()} style={btnOutline}>Close ticket</button>
          </div>
        </div>
      )}
      {note && <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--red-text, #b91c1c)' }}>{note}</div>}
    </div>
  );
}

export function MyTicketsPage() {
  const [data, setData]       = useState<MyTickets | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    let alive = true;
    fetchMyTickets().then(d => { if (alive) setData(d); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  useEffect(() => load(), [load]);
  const reload = () => { fetchMyTickets().then(d => d && setData(d)).catch(() => {}); };

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>My Tickets</h1>
      {loading ? (
        <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading your tickets…</div>
      ) : !data || data.items.length === 0 ? (
        <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>You have no support tickets yet. Use the “Contact support” button in the top bar to open one.</div>
      ) : (
        data.items.map(t => <TicketCard key={t.id} t={t} onChanged={reload} />)
      )}
    </div>
  );
}
