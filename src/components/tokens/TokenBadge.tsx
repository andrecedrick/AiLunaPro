/**
 * TokenBadge — Topbar badge showing current token balance.
 * Hidden when role === client, unauthenticated, or no orgId.
 *
 * Defensive rendering:
 *  - safeTokenNumber() returns null for non-finite or absurdly large values
 *    (caps at 1e10). Protects against any historic string-concat corruption
 *    that may still exist in the Firestore doc.
 *  - Topbar layout is protected via maxWidth + overflow ellipsis so the
 *    button never explodes the topbar even if values escape the cap.
 *  - When balance is invalid, badge shows "Tokens need repair" and still
 *    routes to /billing/tokens on click.
 */

import { useTokens } from '../../context/TokensContext';
import { useRoute } from '../../context/RouteContext';
import { safeTokenNumber } from '../../lib/tokens/tokensClient';

export function TokenBadge() {
  const { balance, enabled } = useTokens();
  const { navigate }         = useRoute();

  if (!enabled || !balance) return null;

  const bal       = safeTokenNumber(balance.balance);
  const allocated = safeTokenNumber(balance.monthlyAllocation);
  const rollover  = safeTokenNumber(balance.rollover) ?? 0;
  const topupTot  = safeTokenNumber(balance.topupTotal) ?? 0;
  const corrupted = bal === null || allocated === null;

  const goto = () => navigate({ name: 'billing/tokens' });

  if (corrupted) {
    return (
      <button
        type="button"
        onClick={goto}
        title="Token balance contains invalid data — click to repair"
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            8,
          background:     'var(--yellow-soft-bg)',
          border:         '1px solid var(--yellow-text)',
          borderRadius:   8,
          padding:        '6px 12px',
          cursor:         'pointer',
          flexShrink:     0,
          fontFamily:     'inherit',
          maxWidth:       220,
          overflow:       'hidden',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--yellow-text)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9"  x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{
          fontSize: 12, fontWeight: 600, color: 'var(--yellow-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          Tokens need repair
        </span>
      </button>
    );
  }

  const total      = allocated + rollover + topupTot;
  const pct        = total > 0 ? Math.max(0, Math.min(100, (bal / total) * 100)) : 0;
  const lowBalance = bal < 50;

  return (
    <button
      type="button"
      onClick={goto}
      title={`${bal.toLocaleString('en-US')} tokens left · click to manage`}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            8,
        background:     lowBalance ? 'var(--red-soft-bg)' : 'var(--input-bg)',
        border:         '1px solid var(--input-border)',
        borderRadius:   8,
        padding:        '6px 12px',
        cursor:         'pointer',
        flexShrink:     0,
        fontFamily:     'inherit',
        maxWidth:       220,
        overflow:       'hidden',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={lowBalance ? 'var(--red-text)' : 'var(--violet-text)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8 M12 8v8" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, minWidth: 0, overflow: 'hidden' }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: lowBalance ? 'var(--red-text)' : 'var(--text-primary)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 180,
        }}>
          {bal.toLocaleString('en-US')}
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            {' / '}{allocated.toLocaleString('en-US')}
          </span>
        </span>
        <div style={{ width: 80, height: 3, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width:       `${pct}%`,
            height:      '100%',
            background:  lowBalance ? 'var(--red-text)' : 'var(--violet)',
            transition:  'width 0.3s ease',
          }} />
        </div>
      </div>
    </button>
  );
}
