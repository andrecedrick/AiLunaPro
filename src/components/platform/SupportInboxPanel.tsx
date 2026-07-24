/**
 * Support Inbox — operator-only, READ-ONLY.
 *
 * Support tickets were capture-only (written + emailed to ADMIN_EMAIL, never
 * readable in-product). This surfaces the queue so an operator can see, triage
 * and call back without leaving the platform.
 *
 * Contact details (email + phone) ARE shown: they are the point of a ticket —
 * an operator cannot answer without them. This surface is platform-admin gated,
 * and the values are never logged.
 *
 * Read-only by design: no status change, no assignment, no reply-from-here.
 */

import { useEffect, useState } from 'react';
import { fetchPlatformSupport, type PlatformSupport, type SignalCount } from '../../lib/platform/platformService';

const card = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 16 } as const;
const th = { textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', padding: '6px 8px' } as const;
const td = { fontSize: 12.5, color: 'var(--text-primary)', padding: '8px', borderTop: '1px solid var(--border)', verticalAlign: 'top' } as const;
const mono = { fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, wordBreak: 'break-all' } as const;

function typeChip(t: string) {
  const map: Record<string, [string, string]> = {
    bug:      ['#b91c1c', 'rgba(185,28,28,0.10)'],
    billing:  ['#b45309', 'rgba(180,83,9,0.10)'],
    question: ['#7c3aed', 'rgba(124,58,237,0.10)'],
  };
  const [color, background] = map[t] ?? ['var(--text-muted)', 'transparent'];
  return { color, background, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' } as const;
}

function Counts({ title, rows }: { title: string; rows: SignalCount[] }) {
  if (rows.length === 0) return null;
  return (
    <div style={card}>
      <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {rows.map(r => (
          <span key={r.value} style={{ fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 999, padding: '4px 12px' }}>
            {r.value || '—'} <strong>{r.count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SupportInboxPanel() {
  const [data, setData]       = useState<PlatformSupport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPlatformSupport()
      .then(d => { if (alive) setData(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading support inbox…</div>;
  if (!data)   return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Support inbox is unavailable.</div>;
  if (data.total === 0) {
    return <div style={{ ...card, fontSize: 13, color: 'var(--text-muted)' }}>No support tickets yet.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>Tickets</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{data.total}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>Open</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: data.open > 0 ? '#b45309' : 'var(--text-primary)' }}>{data.open}</div>
        </div>
      </div>

      <Counts title="Tickets by type" rows={data.byType} />
      {/* Most problematic pages — deterministic count of ticket origin routes. */}
      <Counts title="Most problematic pages" rows={data.topPages} />

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr>
              <th style={th}>When</th>
              <th style={th}>Type</th>
              <th style={th}>Status</th>
              <th style={th}>Contact</th>
              <th style={th}>Page</th>
              <th style={th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(t => (
              <tr key={t.id}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}</td>
                <td style={td}><span style={typeChip(t.type)}>{t.type || '—'}</span></td>
                <td style={td}>{t.status}</td>
                <td style={td}>
                  <div style={mono}>{t.email || '—'}</div>
                  <div style={{ ...mono, color: 'var(--text-muted)' }}>{t.phone || 'no phone'}</div>
                </td>
                <td style={{ ...td, color: 'var(--text-muted)' }}>{t.page || '—'}</td>
                <td style={{ ...td, maxWidth: 380 }}>{t.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.capped && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          Showing the most recent {data.total} tickets — older tickets are not included.
        </div>
      )}
    </div>
  );
}
