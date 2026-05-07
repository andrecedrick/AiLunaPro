/**
 * TokenBadge — Topbar badge showing current token balance.
 * Hidden when role === client, unauthenticated, or no orgId.
 */

import { useTokens } from '../../context/TokensContext';
import { useRoute } from '../../context/RouteContext';

export function TokenBadge() {
  const { balance, enabled } = useTokens();
  const { navigate }         = useRoute();

  if (!enabled || !balance) return null;

  const total = balance.monthlyAllocation + (balance.rollover ?? 0) + (balance.topupTotal ?? 0);
  const pct   = total > 0 ? Math.max(0, Math.min(100, (balance.balance / total) * 100)) : 0;
  const lowBalance = balance.balance < 50;

  return (
    <button
      type="button"
      onClick={() => navigate({ name: 'billing/tokens' })}
      title={`${balance.balance.toLocaleString()} tokens left · click to manage`}
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
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={lowBalance ? 'var(--red-text)' : 'var(--violet-text)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8 M12 8v8" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: lowBalance ? 'var(--red-text)' : 'var(--text-primary)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}>
          {balance.balance.toLocaleString('en-US')}
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            {' / '}{balance.monthlyAllocation.toLocaleString('en-US')}
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
