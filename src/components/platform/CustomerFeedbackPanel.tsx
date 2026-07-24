/**
 * Customer Feedback Center + Customer Signals + Luna Insights — operator-only,
 * READ-ONLY.
 *
 * Feedback was capture-only (write-only collection) until now; this surfaces it.
 *
 * Everything shown is DETERMINISTIC: percentages are counts over rated entries,
 * the average difficulty is an arithmetic mean, and every "signal" is an exact
 * occurrence tally of the submitted string. No LLM, no summarisation, no
 * inference — "Most reported blocker" literally means "this exact text was
 * submitted N times".
 *
 * Privacy: feedback is anonymous by design (no uid / email / orgId is stored),
 * so nothing here can identify a customer.
 */

import { useEffect, useState } from 'react';
import { fetchPlatformFeedback, type PlatformFeedback, type SignalCount } from '../../lib/platform/platformService';

const card = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 16 } as const;
const th = { textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', padding: '6px 8px' } as const;
const td = { fontSize: 12.5, color: 'var(--text-primary)', padding: '8px', borderTop: '1px solid var(--border)', verticalAlign: 'top' } as const;
const statLabel = { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 } as const;
const statValue = { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' } as const;

/** A ranked, exact-count list. Empty renders nothing (no fabricated insight). */
function SignalList({ title, rows, empty }: { title: string; rows: SignalCount[]; empty: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{empty}</div>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
          {rows.map(r => (
            <li key={r.value} style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
              <span>{r.value}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}> — {r.count}×</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function CustomerFeedbackPanel() {
  const [data, setData]       = useState<PlatformFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPlatformFeedback()
      .then(d => { if (alive) setData(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading customer feedback…</div>;
  if (!data)   return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Customer feedback is unavailable.</div>;
  if (data.total === 0) {
    return <div style={{ ...card, fontSize: 13, color: 'var(--text-muted)' }}>No customer feedback recorded yet.</div>;
  }

  const topBlocker = data.topBlockers[0];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Headline stats */}
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {([
          ['Total feedback', String(data.total)],
          ['Positive',       `${data.positivePct}%`],
          ['Negative',       `${data.negativePct}%`],
          ['Avg. difficulty', data.avgDifficulty === null ? '—' : String(data.avgDifficulty)],
        ] as const).map(([label, value]) => (
          <div key={label}>
            <div style={statLabel}>{label}</div>
            <div style={statValue}>{value}</div>
          </div>
        ))}
      </div>

      {/* Luna Insights — a plain restatement of the top deterministic signal. */}
      {topBlocker && (
        <div style={{ ...card, borderColor: 'var(--violet)', background: 'rgba(124,58,237,0.06)' }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 6 }}>✨ Luna Insights</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
            Most reported blocker: <strong>{topBlocker.value}</strong> — <strong>{topBlocker.count}</strong> occurrence{topBlocker.count === 1 ? '' : 's'}.
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Counted from submitted feedback. Deterministic — no AI generation or summarisation.
          </div>
        </div>
      )}

      {/* Customer Signals */}
      <SignalList title="Most reported blockers"      rows={data.topBlockers}    empty="No blockers reported." />
      <SignalList title="Most requested improvements" rows={data.topSuggestions} empty="No suggestions submitted." />
      <SignalList title="Feedback by source"          rows={data.topSources}     empty="No sources recorded." />

      {/* Newest feedback */}
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr>
              <th style={th}>When</th>
              <th style={th}>Source</th>
              <th style={th}>Satisfaction</th>
              <th style={th}>Difficulty</th>
              <th style={th}>Blocker</th>
              <th style={th}>Suggestion</th>
              <th style={th}>Country</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(f => (
              <tr key={f.id}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</td>
                <td style={{ ...td, fontWeight: 700 }}>{f.source || '—'}</td>
                <td style={td}>{f.satisfaction || '—'}</td>
                <td style={td}>{f.difficulty || '—'}</td>
                <td style={td}>{f.blocker || '—'}</td>
                <td style={td}>{f.suggestion || '—'}</td>
                <td style={{ ...td, color: 'var(--text-muted)' }}>{f.country || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.capped && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          Showing the most recent {data.total} entries — older feedback is not included.
        </div>
      )}
    </div>
  );
}
