/**
 * Sales dashboard — funnel, analytics and the follow-up queue.
 *
 * The QUEUE is first and the charts are second, deliberately. A dashboard whose
 * top half is a conversion percentage tells a rep how they did; a dashboard whose
 * top half is "these six leads are overdue, worst first" tells them what to do
 * next. Only the second one changes the number.
 *
 * Scope is decided by the server: a rep sees their own leads, a super admin sees
 * everything. This component only renders what it is given.
 */

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { Button } from '../ui/Button';
import { fetchSalesDashboard, SalesError, type SalesDashboard as Data, type GroupStat } from '../../lib/sales/salesClient';

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
  boxShadow: 'var(--card-shadow)', padding: 16, marginBottom: 14,
};
const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-muted)' } as const;

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'var(--red-text)', high: 'var(--red-text)', normal: 'var(--text-secondary)', low: 'var(--text-muted)',
};

function Stat({ k, v, tone }: { k: string; v: string | number; tone?: string }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={label}>{k}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: tone ?? 'var(--text-primary)', lineHeight: 1.2 }}>{v}</div>
    </div>
  );
}

function GroupTable({ title, rows, t }: { title: string; rows: GroupStat[]; t: (k: string) => string }) {
  if (!rows.length) return null;
  return (
    <div style={{ flex: '1 1 260px', minWidth: 240 }}>
      <div style={{ ...label, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12.5 }}>
        {rows.slice(0, 8).map(r => (
          <div key={r.key} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.key}</span>
            <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.total}</span>
            <span style={{ color: r.conversionRate >= 50 ? 'var(--green-text)' : 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>
              {r.won + r.lost > 0 ? `${r.conversionRate}%` : '—'}
            </span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 4 }}>{t('salesConvHint')}</div>
      </div>
    </div>
  );
}

export function SalesDashboard({ orgId, onOpenContact, loadingContactId = '', reloadKey = 0 }: {
  orgId: string;
  onOpenContact?: (contactId: string, orgId: string) => void;
  /** Row currently being fetched, so the click has immediate visible feedback. */
  loadingContactId?: string;
  /**
   * Bumped by the page after a pipeline change. Without it, acting on a lead left
   * it sitting in the queue it should have just left — the queue looked broken
   * precisely when the operator had done the right thing.
   */
  reloadKey?: number;
}) {
  const C = useLocale().contacts;
  const t = (k: string) => (C as unknown as Record<string, string>)[k] ?? k;

  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try { setData(await fetchSalesDashboard(orgId)); }
    catch (e) { setErr(e instanceof SalesError ? e.code : 'LOAD_FAILED'); }
  }, [orgId]);
  // `reloadKey` re-runs this after a pipeline change. `data` is NOT cleared first:
  // blanking the whole dashboard to re-fetch it made every stage change look like
  // a full page reload.
  useEffect(() => { void load(); }, [load, reloadKey]);

  if (err) return <div style={{ ...card, color: 'var(--red-text)', fontSize: 13 }}>{(C.errors as Record<string, string>)[err] ?? err}</div>;
  if (!data) return <div style={{ ...card, fontSize: 13, color: 'var(--text-muted)' }}>{C.loading}</div>;

  const T = data.totals;

  return (
    <>
      {/* The queue leads: what to do now, worst first. */}
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <div style={{ ...label }}>{t('salesQueue')}</div>
          <Button variant="secondary" size="sm" onClick={() => void load()}>{t('salesRefresh')}</Button>
        </div>
        {data.queue.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600 }}>{t('salesQueueClear')}</div>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 12.5 }}>
            {data.queue.map(q => (
              <div key={q.orgId + q.contactId} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ minWidth: 58, fontWeight: 700, color: PRIORITY_COLOR[q.priority] }}>{t(`priority_${q.priority}`)}</span>
                <button
                  type="button"
                  onClick={() => onOpenContact?.(q.contactId, q.orgId)}
                  disabled={Boolean(loadingContactId)}
                  style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--violet-text)', cursor: onOpenContact ? 'pointer' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: loadingContactId && loadingContactId !== q.contactId ? 0.5 : 1 }}
                >
                  {q.name}{q.company ? ` — ${q.company}` : ''}
                  {/* Immediate feedback on the row that was clicked. The click
                      used to look unresponsive because nothing changed until the
                      panel appeared — or, on a 403, ever. */}
                  {loadingContactId === q.contactId && <span style={{ color: 'var(--text-muted)' }}> …</span>}
                </button>
                <span style={{ color: 'var(--text-muted)', minWidth: 110 }}>{t(`stage_${q.stage}`)}</span>
                <span style={{ color: 'var(--red-text)', minWidth: 70, textAlign: 'right' }}>
                  {q.daysOverdue}d {t('salesLate')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ ...card, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
        <Stat k={t('salesTotalLeads')} v={T.leads} />
        <Stat k={t('salesOpen')} v={T.open} />
        <Stat k={t('salesWon')} v={T.won} tone="var(--green-text)" />
        <Stat k={t('salesLost')} v={T.lost} />
        <Stat k={t('salesConversion')} v={`${T.conversionRate}%`} />
        <Stat k={t('salesAvgCycle')} v={`${T.avgCycleDays}d`} />
        <Stat k={t('salesFollowUpRate')} v={`${T.followUpRate}%`} />
        <Stat k={t('salesOverdue')} v={T.overdue} tone={T.overdue ? 'var(--red-text)' : undefined} />
        <Stat k={t('salesDueToday')} v={T.dueToday} />
        <Stat k={t('salesNoNextStep')} v={T.noNextStep} tone={T.noNextStep ? 'var(--red-text)' : undefined} />
      </section>

      <section style={card}>
        <div style={{ ...label, marginBottom: 8 }}>{t('salesFunnel')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(data.funnel).map(([stage, n]) => (
            <div key={stage} style={{
              padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
              background: n ? 'var(--surface-2)' : 'transparent', minWidth: 120,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t(`stage_${stage}`)}</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{n}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...card, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
        <GroupTable title={t('salesBySource')} rows={data.bySource} t={t} />
        <GroupTable title={t('salesByOwner')} rows={data.byOwner} t={t} />
        <GroupTable title={t('salesByCompany')} rows={data.byCompany} t={t} />
        {data.byOrg.length > 0 && <GroupTable title={t('salesByOrg')} rows={data.byOrg} t={t} />}
      </section>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
        {t('salesScope')}: {data.scope === 'all' ? t('salesScopeAll') : t('salesScopeAssigned')} · {data.scanned} {C.scannedCount}
      </div>
    </>
  );
}
