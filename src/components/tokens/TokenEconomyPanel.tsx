/**
 * Token Economy panel — platform-operator observability (Phase 4).
 *
 * Cross-org aggregates: per action, event count, token count, the
 * free · included · overflow split, and how many DISTINCT organizations used it.
 *
 * Privacy: aggregates only. Organizations are counted, never listed — no org
 * names, no emails, no uids ever reach this surface.
 */

import { useEffect, useState } from 'react';
import { fetchPlatformTokenUsage, type PlatformTokenUsage } from '../../lib/platform/platformService';

const card = {
  border: '1px solid var(--border)', borderRadius: 12,
  background: 'var(--surface)', padding: 16,
} as const;

const th = {
  textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 0.4, color: 'var(--text-muted)', padding: '6px 8px',
} as const;

const td = {
  fontSize: 12.5, color: 'var(--text-primary)', padding: '7px 8px',
  borderTop: '1px solid var(--border)', fontVariantNumeric: 'tabular-nums',
} as const;

const num = (v: number) => Math.round(v).toLocaleString('en-US');

export function TokenEconomyPanel() {
  const [data, setData]       = useState<PlatformTokenUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPlatformTokenUsage()
      .then(d => { if (alive) setData(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading token economy…</div>;
  if (!data)   return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Token economy data is unavailable.</div>;

  const t = data.totals;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Totals strip */}
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {([
          ['Events', num(t.count)],
          ['Tokens', num(t.tokens)],
          ['Organizations', num(t.orgs)],
          ['Free', num(t.free)],
          ['Included', num(t.included)],
          ['Overflow', num(t.overflow)],
        ] as const).map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Per-action table — sorted by tokens desc, so the head is "top actions". */}
      <div style={card}>
        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>Usage by action (all organizations)</div>
        {data.byAction.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No recorded usage yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={th}>Action</th>
                  <th style={th}>Events</th>
                  <th style={th}>Tokens</th>
                  <th style={th}>Orgs</th>
                  <th style={th}>Free</th>
                  <th style={th}>Included</th>
                  <th style={th}>Overflow</th>
                  <th style={th}>Legacy</th>
                </tr>
              </thead>
              <tbody>
                {data.byAction.map(a => (
                  <tr key={a.action}>
                    <td style={{ ...td, fontWeight: 700 }}>{a.action}</td>
                    <td style={td}>{num(a.count)}</td>
                    <td style={td}>{num(a.tokens)}</td>
                    <td style={td}>{num(a.orgs)}</td>
                    <td style={td}>{num(a.free)}</td>
                    <td style={td}>{num(a.included)}</td>
                    <td style={td}>{num(a.overflow)}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{num(a.unknown)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.capped && (
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
            Scan cap reached — figures cover {num(data.scanned)} events and are a lower bound.
          </div>
        )}
      </div>
    </div>
  );
}
