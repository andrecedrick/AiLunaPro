/**
 * Token Usage panel — org observability (MVP).
 *
 * Shows balance / monthly allocation, per-action usage with the free ·
 * included · overflow split, and the recent event history (newest first).
 *
 * Read-only. Displays what the ledger recorded — it never computes or implies a
 * charge. Rows written before schema v2 carry no `mode`/`priceSnapshot`; they are
 * shown honestly as "legacy" rather than back-filled with an inferred value.
 */

import { useEffect, useState } from 'react';
import { getIdToken } from '../../lib/team/teamApiClient';
import {
  fetchUsageSummary, fetchUsage, safeTokenNumber,
  type UsageSummary, type UsageEvent,
} from '../../lib/tokens/tokensClient';

const EVENT_PAGE = 25;

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

const modeChip = (mode: string) => {
  const map: Record<string, [string, string]> = {
    free:     ['#059669', 'rgba(5,150,105,0.10)'],
    included: ['#7c3aed', 'rgba(124,58,237,0.10)'],
    overflow: ['#b45309', 'rgba(180,83,9,0.10)'],
  };
  const [color, background] = map[mode] ?? ['var(--text-muted)', 'var(--surface-2, transparent)'];
  return {
    color, background, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.4, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap',
  } as const;
};

const num = (v: number | null | undefined) =>
  v == null ? '—' : Math.round(v).toLocaleString('en-US');

export function TokenUsagePanel({ orgId }: { orgId: string }) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [events, setEvents]   = useState<UsageEvent[]>([]);
  const [offset, setOffset]   = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!orgId) return;
    let alive = true;
    setLoading(true); setError(false);
    getIdToken()
      .then(token => Promise.all([
        fetchUsageSummary(orgId, token),
        fetchUsage(orgId, token, EVENT_PAGE, 0),
      ]))
      .then(([s, e]) => {
        if (!alive) return;
        setSummary(s); setEvents(e); setOffset(0);
        setHasMore(e.length === EVENT_PAGE);
      })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [orgId]);

  const loadMore = async () => {
    const next = offset + EVENT_PAGE;
    try {
      const token = await getIdToken();
      const more  = await fetchUsage(orgId, token, EVENT_PAGE, next);
      setEvents(prev => [...prev, ...more]);
      setOffset(next);
      setHasMore(more.length === EVENT_PAGE);
    } catch { setHasMore(false); }
  };

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading token usage…</div>;
  if (error || !summary) {
    return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Token usage is unavailable right now.</div>;
  }

  const balance    = safeTokenNumber(summary.balance);
  const allocation = safeTokenNumber(summary.monthlyAllocation);
  const consumed   = safeTokenNumber(summary.consumed);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Balance strip */}
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {([
          ['Balance', num(balance)],
          ['Monthly allocation', num(allocation)],
          ['Consumed this cycle', num(consumed)],
          ['Events recorded', num(summary.totals.count)],
        ] as const).map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Per-action rollup */}
      <div style={card}>
        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>Usage by action</div>
        {summary.byAction.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No recorded usage yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={th}>Action</th>
                  <th style={th}>Events</th>
                  <th style={th}>Tokens</th>
                  <th style={th}>Free</th>
                  <th style={th}>Included</th>
                  <th style={th}>Overflow</th>
                  <th style={th}>Legacy</th>
                </tr>
              </thead>
              <tbody>
                {summary.byAction.map(b => (
                  <tr key={b.action}>
                    <td style={{ ...td, fontWeight: 700 }}>{b.action}</td>
                    <td style={td}>{num(b.count)}</td>
                    <td style={td}>{num(b.tokens)}</td>
                    <td style={td}>{num(b.free)}</td>
                    <td style={td}>{num(b.included)}</td>
                    <td style={td}>{num(b.overflow)}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{num(b.unknown)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {summary.capped && (
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
            Showing the most recent {num(summary.scanned)} events — older activity is not included in this rollup.
          </div>
        )}
      </div>

      {/* Event history */}
      <div style={card}>
        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>Event history</div>
        {events.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No events recorded.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Action</th>
                    <th style={th}>Tokens</th>
                    <th style={th}>Mode</th>
                    <th style={th}>Terms at charge</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e.eventId}>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{e.at ? new Date(e.at).toLocaleString() : '—'}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{e.action ?? '—'}</td>
                      <td style={td}>{num(e.tokens)}</td>
                      <td style={td}>
                        <span style={modeChip(e.mode ?? 'unknown')}>{e.mode === 'unknown' || !e.mode ? 'legacy' : e.mode}</span>
                      </td>
                      <td style={{ ...td, color: 'var(--text-muted)' }}>
                        {e.priceSnapshot
                          ? `${num(e.priceSnapshot.costTokens)} tok · $${e.priceSnapshot.tokenPriceUsd.toFixed(2)}/tok`
                          : 'not recorded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                style={{ marginTop: 10, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
