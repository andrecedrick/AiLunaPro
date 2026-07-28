/**
 * Demo Requests — operator-only, READ-ONLY commercial lead inbox.
 *
 * P0 CONTEXT: demo requests were capture-only. POST /api/demo-request wrote to
 * `demo_requests` and NOTHING read it — no panel, no bell entry, no email. A
 * prospect asking to be contacted was invisible to the operator. This is the
 * surface that was missing.
 *
 * Contact details (name / email / company) are shown deliberately: a demo
 * request IS a request to be contacted, and the lead cannot be worked without
 * them. Operator-gated, same posture as the Support Inbox.
 */

import { useEffect, useState } from 'react';
import { fetchPlatformDemoRequests, type PlatformDemoRequests } from '../../lib/platform/platformService';

const card = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 16 } as const;
const th = { textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', padding: '6px 8px' } as const;
const td = { fontSize: 12.5, color: 'var(--text-primary)', padding: '8px', borderTop: '1px solid var(--border)', verticalAlign: 'top' } as const;
const statLabel = { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 } as const;
const statValue = { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' } as const;

export function DemoRequestsPanel() {
  const [data, setData]       = useState<PlatformDemoRequests | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPlatformDemoRequests()
      .then(d => { if (alive) setData(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading demo requests…</div>;
  if (!data)   return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Demo requests are unavailable.</div>;
  if (data.total === 0) {
    return <div style={{ ...card, fontSize: 13, color: 'var(--text-muted)' }}>No demo requests received yet.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={statLabel}>Total requests</div>
          <div style={statValue}>{data.total}</div>
        </div>
        <div>
          <div style={statLabel}>New</div>
          <div style={{ ...statValue, color: data.newCount > 0 ? 'var(--violet-text)' : undefined }}>{data.newCount}</div>
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead>
            <tr>
              <th style={th}>When</th>
              <th style={th}>Name</th>
              <th style={th}>Contact email</th>
              <th style={th}>Phone</th>
              <th style={th}>Country</th>
              <th style={th}>Account email</th>
              <th style={th}>Company</th>
              <th style={th}>Message</th>
              <th style={th}>Status</th>
              <th style={th}>Owner</th>
              <th style={th}>Last contact</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(d => (
              <tr key={d.id}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td>
                <td style={{ ...td, fontWeight: 700 }}>{d.name || '—'}</td>
                <td style={td}>
                  {/* Follow up on the address the prospect nominated, not their login. */}
                  {d.contactEmail
                    ? <a href={`mailto:${d.contactEmail}`} style={{ color: 'var(--violet-text)' }}>{d.contactEmail}</a>
                    : '—'}
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  {/* One click to call the lead back. */}
                  {d.phone ? <a href={`tel:${d.phone}`} style={{ color: 'var(--violet-text)' }}>{d.phone}</a> : '—'}
                </td>
                <td style={{ ...td, color: 'var(--text-muted)' }}>{d.countryCode || '—'}</td>
                <td style={{ ...td, color: 'var(--text-muted)' }}>
                  {/* Shown only when it differs — identical addresses are noise. */}
                  {d.identityEmail && d.identityEmail !== d.contactEmail ? d.identityEmail : 'same'}
                </td>
                <td style={td}>{d.company || '—'}</td>
                <td style={td}>{d.message || '—'}</td>
                <td style={td}>{d.status || '—'}</td>
                <td style={{ ...td, color: d.owner ? undefined : 'var(--text-muted)' }}>{d.owner || 'Unassigned'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                  {d.lastContactAt ? new Date(d.lastContactAt).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
