/**
 * Production Alerts panel — platform-operator visibility (read-only).
 *
 * Surfaces the durable `platform_alerts` records (token-credit failures, invoice
 * mismatches, and any future billing-alert kind) that were previously only
 * real-time console logs. Read-only: no resolve, no mutation.
 *
 * Privacy: shows operational ids (org / session / invoice) + numeric context,
 * exactly what an operator needs to reconcile. No emails, names, or message text
 * are ever stored on these records, so none reach this surface.
 */

import { useEffect, useState } from 'react';
import { fetchPlatformAlerts, type ProductionAlert, type ProductionAlerts } from '../../lib/platform/platformService';

const card = {
  border: '1px solid var(--border)', borderRadius: 12,
  background: 'var(--surface)', padding: 16,
} as const;

const th = {
  textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 0.4, color: 'var(--text-muted)', padding: '6px 8px',
} as const;

const td = {
  fontSize: 12.5, color: 'var(--text-primary)', padding: '8px 8px',
  borderTop: '1px solid var(--border)', verticalAlign: 'top',
} as const;

const mono = { fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, wordBreak: 'break-all' } as const;

function severityChip(sev: string) {
  const [color, bg] = sev === 'critical' ? ['#b91c1c', 'rgba(185,28,28,0.10)'] : ['#b45309', 'rgba(180,83,9,0.10)'];
  return { color, background: bg, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' } as const;
}

function statusChip(status: string) {
  const [color, bg] = status === 'resolved' ? ['#059669', 'rgba(5,150,105,0.10)'] : ['#7c3aed', 'rgba(124,58,237,0.10)'];
  return { color, background: bg, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' } as const;
}

/** Compact non-PII metadata: the operational ids + parsed context. */
function metaLine(a: ProductionAlert): string {
  const bits: string[] = [];
  if (a.orgId)     bits.push(`org=${a.orgId}`);
  if (a.sessionId) bits.push(`session=${a.sessionId}`);
  if (a.invoiceId) bits.push(`invoice=${a.invoiceId}`);
  for (const [k, v] of Object.entries(a.context ?? {})) bits.push(`${k}=${String(v)}`);
  return bits.join(' · ');
}

export function ProductionAlertsPanel() {
  const [data, setData]       = useState<ProductionAlerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPlatformAlerts()
      .then(d => { if (alive) setData(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Loading production alerts…</div>;
  if (!data)   return <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>Production alerts are unavailable.</div>;

  if (data.alerts.length === 0) {
    return (
      <div style={{ ...card, fontSize: 13, color: 'var(--green-text, #059669)', fontWeight: 600 }}>
        ✓ No production alerts recorded.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ ...card, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{data.total}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)', fontWeight: 700 }}>Open critical</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: data.openCritical > 0 ? '#b91c1c' : 'var(--text-primary)' }}>{data.openCritical}</div>
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={th}>When</th>
              <th style={th}>Type</th>
              <th style={th}>Severity</th>
              <th style={th}>Status</th>
              <th style={th}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {data.alerts.map(a => (
              <tr key={a.id}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{a.at ? new Date(a.at).toLocaleString() : '—'}</td>
                <td style={{ ...td, fontWeight: 700 }}>{a.kind}</td>
                <td style={td}><span style={severityChip(a.severity)}>{a.severity}</span></td>
                <td style={td}><span style={statusChip(a.status)}>{a.status}</span></td>
                <td style={td}>
                  <div style={{ marginBottom: 4 }}>{a.message}</div>
                  <div style={{ ...mono, color: 'var(--text-muted)' }}>{metaLine(a)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.capped && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          Showing the most recent {data.total} alerts — older records are not included.
        </div>
      )}
    </div>
  );
}
