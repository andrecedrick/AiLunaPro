/**
 * TokensPage — Phase J1.4A.
 * Route: billing/tokens
 *
 * Shows:
 *   - balance / monthly allocation / consumed / rollover / cycleEnd
 *   - 3 top-up packs (Starter / Pro / Max) — USD only in MVP
 *   - usage history table
 *   - loading / error / empty states
 *
 * RBAC:
 *   - client: should never reach this page (TokensProvider disabled).
 *     LockedView is rendered as a guard if it ever does.
 *   - member: can view balance + own usage. Cannot buy.
 *   - owner / admin / billing: can view + buy.
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dlog } from '../lib/log';
import { useRoute } from '../context/RouteContext';
import { useToast } from '../hooks/useToast';
import { useTokens } from '../context/TokensContext';
import {
  createTopupCheckout,
  fetchUsage,
  friendlyTokenError,
  repairTokenBalance,
  safeTokenNumber,
  type UsageEvent,
  type TokenPack,
} from '../lib/tokens/tokensClient';

interface PackDef {
  pack:        TokenPack;
  label:       string;
  tokens:      number;
  blurb:       string;
  highlight?:  boolean;
}

const PACKS: PackDef[] = [
  { pack: 'starter', label: 'Starter', tokens:   5_000, blurb: 'Top off a low cycle.' },
  { pack: 'pro',     label: 'Pro',     tokens:  25_000, blurb: 'Most common refill.', highlight: true },
  { pack: 'max',     label: 'Max',     tokens: 100_000, blurb: 'Big workload boost.' },
];

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: 'violet' | 'red' | 'green' }) {
  const color =
    accent === 'violet' ? 'var(--violet-text)' :
    accent === 'red'    ? 'var(--red-text)'    :
    accent === 'green'  ? 'var(--green-text)'  :
    'var(--text-primary)';
  return (
    <div style={{ flex: '1 1 110px', minWidth: 100 }}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: 4,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 18, fontWeight: 700, color,
        lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </div>
    </div>
  );
}

function LockedView({ message }: { message: string }) {
  const { navigate } = useRoute();
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Tokens unavailable
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        {message}
      </div>
      <button
        type="button"
        onClick={() => navigate({ name: 'dashboard' })}
        style={{
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}
      >
        Back to dashboard
      </button>
    </div>
  );
}

export function TokensPage() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const { balance, loading, enabled, refresh } = useTokens();

  const role = session?.role ?? null;
  const orgId = session?.orgId ?? null;

  const canBuy = role === 'owner' || role === 'admin' || role === 'billing';

  const [usage,        setUsage]        = useState<UsageEvent[] | null>(null);
  const [usageError,   setUsageError]   = useState<string | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [pendingPack,  setPendingPack]  = useState<TokenPack | null>(null);
  const [topupError,   setTopupError]   = useState<string | null>(null);
  const [topupNotice,  setTopupNotice]  = useState<string | null>(null);
  const [waitingWebhook, setWaitingWebhook] = useState(false);

  // J1.4A: handle Stripe redirect query params (topup=success | topup=cancel)
  // Banner shows ONLY when the webhook has not yet credited the balance:
  //   - if balance.updatedAt is older than 60s at landing time, webhook hasn't
  //     fired → show banner, watch for topupTotal growth.
  //   - if balance.updatedAt is within 60s, webhook already credited (race
  //     between Stripe redirect and onSnapshot) → no banner.
  // Hard timeout: banner self-clears after 60s regardless to prevent stale UI.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const queryStr = hash.includes('?') ? hash.slice(hash.indexOf('?')) : '';
    if (!queryStr) return;
    const params = new URLSearchParams(queryStr);
    const topup  = params.get('topup');
    if (topup === 'success') {
      const sid = params.get('session_id');
      showToast('Token purchase completed. Your balance will update shortly.', 'success');

      // Detect whether webhook has already updated the balance.
      const updatedAtMs = balance?.updatedAt ? Date.parse(balance.updatedAt) : 0;
      const recentlyCredited = updatedAtMs > 0 && (Date.now() - updatedAtMs) < 60_000;

      if (!recentlyCredited) {
        setTopupNotice('Payment received. Waiting for Stripe webhook to update your token balance.');
        setWaitingWebhook(true);
        // Snapshot the current topupTotal so the watch effect detects growth.
        lastSeenTopupRef.current = balance?.topupTotal ?? 0;
      }

      void refresh();
      // Strip query so reload does not re-fire
      window.history.replaceState({}, '', '#/billing/tokens');
      dlog('[TokensPage] topup success — sessionId:', sid, 'recentlyCredited:', recentlyCredited);
    }
    if (topup === 'cancel') {
      showToast('Token purchase cancelled.', 'info');
      window.history.replaceState({}, '', '#/billing/tokens');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear webhook waiting banner once topupTotal grows OR balance.updatedAt
  // crosses the snapshot threshold. onSnapshot in TokensProvider drives the
  // live update; this effect just observes derived state.
  const topupTotal     = balance?.topupTotal ?? 0;
  const balanceUpdated = balance?.updatedAt   ?? '';
  const lastSeenTopupRef = useRef<number | null>(null);
  useEffect(() => {
    if (!waitingWebhook) return;
    if (lastSeenTopupRef.current !== null && topupTotal > lastSeenTopupRef.current) {
      setWaitingWebhook(false);
      setTopupNotice(null);
      lastSeenTopupRef.current = null;
      return;
    }
    // Defense-in-depth: if balance.updatedAt becomes recent while we are
    // waiting, webhook fired — clear banner even if topupTotal observation
    // raced through ref initialization.
    const updatedAtMs = balanceUpdated ? Date.parse(balanceUpdated) : 0;
    if (updatedAtMs > 0 && (Date.now() - updatedAtMs) < 30_000) {
      setWaitingWebhook(false);
      setTopupNotice(null);
      lastSeenTopupRef.current = null;
    }
  }, [waitingWebhook, topupTotal, balanceUpdated]);

  // Hard 60s timeout to prevent stale waiting banner.
  useEffect(() => {
    if (!waitingWebhook) return;
    const timer = setTimeout(() => {
      setWaitingWebhook(false);
      setTopupNotice(null);
      lastSeenTopupRef.current = null;
    }, 60_000);
    return () => clearTimeout(timer);
  }, [waitingWebhook]);

  // Fetch usage history
  useEffect(() => {
    if (!enabled || !orgId) return;
    let cancelled = false;
    setUsageLoading(true);
    setUsageError(null);
    (async () => {
      try {
        const { auth } = await import('../lib/firebase-auth');
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Not authenticated');
        const list = await fetchUsage(orgId, idToken, 50);
        if (!cancelled) setUsage(list);
      } catch (err) {
        console.warn('[TokensPage] fetchUsage failed:', err);
        const isAdmin = role === 'owner' || role === 'admin';
        if (!cancelled) setUsageError(friendlyTokenError(err, isAdmin));
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, orgId]);

  if (!enabled) {
    if (role === 'client') return <LockedView message="Tokens are not visible from a client account." />;
    return <LockedView message="Tokens are unavailable for this workspace." />;
  }

  const handleBuy = async (pack: TokenPack) => {
    if (!canBuy) {
      showToast('Only owners, admins, or billing managers can buy token packs.', 'warning');
      return;
    }
    if (!orgId) return;
    setPendingPack(pack);
    setTopupError(null);
    try {
      const { auth } = await import('../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const url = await createTopupCheckout(orgId, pack, idToken);
      window.location.href = url;
    } catch (err) {
      console.error('[TokensPage] topup failed:', err);
      const isAdmin = role === 'owner' || role === 'admin';
      setTopupError(friendlyTokenError(err, isAdmin));
      setPendingPack(null);
    }
  };

  // Defensive: safeTokenNumber returns null if value is non-finite or > 1e10
  // (impossible legitimate token amount). Caller renders "needs repair"
  // fallback instead of an absurd string.
  const safeBal       = balance ? safeTokenNumber(balance.balance)           : null;
  const safeAlloc     = balance ? safeTokenNumber(balance.monthlyAllocation) : null;
  const safeConsumed  = balance ? safeTokenNumber(balance.consumed)          : 0;
  const safeRollover  = balance ? safeTokenNumber(balance.rollover)          : 0;
  const safeTopupTot  = balance ? safeTokenNumber(balance.topupTotal)        : 0;
  const balanceCorrupted = !!balance && (safeBal === null || safeAlloc === null || safeConsumed === null || safeRollover === null || safeTopupTot === null);

  const balanceNum    = safeBal      ?? 0;
  const allocationNum = safeAlloc    ?? 0;
  const consumedNum   = safeConsumed ?? 0;
  const rolloverNum   = safeRollover ?? 0;
  const topupTotalNum = safeTopupTot ?? 0;
  const total = allocationNum + rolloverNum + topupTotalNum;
  const pct   = balance && total > 0 && !balanceCorrupted
    ? Math.max(0, Math.min(100, (balanceNum / total) * 100))
    : 0;

  // Repair flow (owner + TOKEN_DEBUG-gated server-side)
  const [repairing,    setRepairing]    = useState(false);
  const [repairResult, setRepairResult] = useState<string | null>(null);
  const isOwner = role === 'owner';
  const handleRepair = async () => {
    if (!isOwner) return;
    setRepairing(true);
    setRepairResult(null);
    try {
      const { auth } = await import('../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      const result = await repairTokenBalance(idToken);
      if (!result) {
        showToast('Repair is disabled in this environment (TOKEN_DEBUG required).', 'warning');
        return;
      }
      const r = result.repaired;
      setRepairResult(
        `Repaired — balance ${r.balance.toLocaleString('en-US')}, allocation ${r.monthlyAllocation.toLocaleString('en-US')}, top-ups ${r.topupTotal.toLocaleString('en-US')}, consumed ${r.consumed.toLocaleString('en-US')}.`,
      );
      showToast('Token balance repaired.', 'success');
      void refresh();
    } catch (err) {
      console.error('[TokensPage] repair failed:', err);
      showToast(friendlyTokenError(err, true), 'error');
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Tokens
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Track usage, monitor your monthly allocation, and buy top-ups when needed.
        </p>
      </div>

      {/* Corruption warning + repair (owner only, server-gated by TOKEN_DEBUG) */}
      {balanceCorrupted && (
        <div style={{
          marginBottom: 16,
          padding: '14px 16px',
          borderRadius: 10,
          background: 'var(--red-soft-bg)',
          color: 'var(--red-text)',
          border: '1px solid var(--red-text)',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <strong>Your token balance contains invalid data from a previous bug.</strong>{' '}
            {isOwner
              ? 'Click Repair to recompute it from your top-ups and usage history.'
              : 'Ask an owner to repair the balance.'}
            {repairResult && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-primary)' }}>{repairResult}</div>
            )}
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={() => void handleRepair()}
              disabled={repairing}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--red-text)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: repairing ? 'wait' : 'pointer',
                opacity: repairing ? 0.6 : 1,
              }}
            >
              {repairing ? 'Repairing…' : 'Repair token balance'}
            </button>
          )}
        </div>
      )}

      {/* Webhook waiting banner */}
      {waitingWebhook && topupNotice && (
        <div style={{
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 10,
          background: 'var(--yellow-soft-bg)',
          color: 'var(--yellow-text)',
          border: '1px solid var(--yellow)',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <span>{topupNotice}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--yellow-text)',
              background: 'transparent',
              color: 'var(--yellow-text)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Refresh balance
          </button>
        </div>
      )}

      {/* Balance summary */}
      <Card style={{ marginBottom: 24 }}>
        {!balance && loading && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading balance…</div>
        )}
        {!balance && !loading && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            No token balance yet. It will be created on your first audit.
          </div>
        )}
        {balance && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18 }}>
              <Stat label="Balance"            value={safeBal      === null ? '—' : balanceNum}    accent="violet" />
              <Stat label="Monthly allocation" value={safeAlloc    === null ? '—' : allocationNum} />
              <Stat label="Consumed"           value={safeConsumed === null ? '—' : consumedNum}   accent="red" />
              <Stat label="Rollover"           value={safeRollover === null ? '—' : rolloverNum}   accent="green" />
              <Stat label="Top-ups"            value={safeTopupTot === null ? '—' : topupTotalNum} accent="green" />
            </div>
            {/* Bar */}
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: 'var(--violet)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Cycle ends: {formatDate(balance.cycleEnd)}</span>
              <span>Last reset: {formatDate(balance.lastReset)}</span>
            </div>
          </>
        )}
      </Card>

      {/* Top-up packs */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Buy more tokens
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Token packs are currently billed in USD. Top-up tokens never expire.
        </p>
        {!canBuy && (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'var(--yellow-soft-bg)', color: 'var(--yellow-text)',
            fontSize: 13, marginBottom: 14,
          }}>
            You can view tokens but only owners, admins, and billing managers can buy packs.
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 12,
          alignItems: 'stretch',
        }}>
          {PACKS.map(p => (
            <div key={p.pack} style={{
              display: 'flex',
              flexDirection: 'column',
              background: p.highlight ? 'rgba(124,58,237,0.04)' : 'var(--surface)',
              border: p.highlight ? '2px solid var(--violet)' : '1px solid var(--border)',
              borderRadius: 14,
              padding: 16,
              minWidth: 0,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {p.label}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800,
                color: p.highlight ? 'var(--violet-text)' : 'var(--text-primary)',
                marginBottom: 4,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                +{p.tokens.toLocaleString('en-US')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                tokens
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4, flex: 1 }}>
                {p.blurb}
              </div>
              <button
                type="button"
                disabled={!canBuy || pendingPack !== null}
                onClick={() => void handleBuy(p.pack)}
                style={{
                  width: '100%', padding: '9px 0',
                  borderRadius: 9, border: 'none',
                  background: !canBuy ? 'var(--surface-2)' : (p.highlight ? 'var(--violet)' : 'var(--text-primary)'),
                  color: !canBuy ? 'var(--text-muted)' : '#fff',
                  fontWeight: 600, fontSize: 12,
                  cursor: !canBuy ? 'not-allowed' : (pendingPack ? 'wait' : 'pointer'),
                  opacity: pendingPack && pendingPack !== p.pack ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {pendingPack === p.pack ? 'Redirecting…' : canBuy ? 'Buy pack' : 'Read-only'}
              </button>
            </div>
          ))}
        </div>
        {topupError && (
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 8,
            background: 'var(--red-soft-bg)', color: 'var(--red-text)', fontSize: 13,
          }}>
            {topupError}
          </div>
        )}
      </div>

      {/* Usage history */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Recent usage
        </h2>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {usageLoading && (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>Loading usage…</div>
          )}
          {!usageLoading && usageError && (
            <div style={{ padding: 24, color: 'var(--red-text)', fontSize: 14 }}>
              {usageError}
            </div>
          )}
          {!usageLoading && !usageError && (usage === null || usage.length === 0) && (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>
              No usage yet.
            </div>
          )}
          {!usageLoading && !usageError && usage && usage.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Module', 'Action', 'Tokens', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: 12, fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: 0.6,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usage.map((ev, i) => (
                  <tr key={ev.eventId} style={{ borderBottom: i < usage.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                      {formatDateTime(ev.at)}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-primary)' }}>
                      {ev.module}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {ev.action}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      −{ev.tokens.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        background: ev.status === 'success' ? 'var(--green-soft-bg)' : 'var(--yellow-soft-bg)',
                        color:      ev.status === 'success' ? 'var(--green-text)'    : 'var(--yellow-text)',
                      }}>
                        {ev.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
