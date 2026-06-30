/**
 * RankBadge — recommendation rank + score pill (shared, single source of truth).
 *
 * Premium horizontal pill (Option A): brand gradient (violet → cyan), rounded-full,
 * subtle shadow, white text, clear hierarchy — rank bold, score lighter, a thin
 * divider between. In-flow (not an absolute overlay), so it never overlaps the card's
 * source/plan badges and wraps cleanly on mobile. Pure presentation — no logic.
 */
import type { CSSProperties } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

export function RankBadge({ rank, score, style }: { rank: number; score: number; style?: CSSProperties }) {
  const T = useLocale();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        background: 'var(--brand-gradient)',
        color: '#fff',
        borderRadius: 999,
        padding: '4px 11px',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.30)',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...style,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.2 }}>
        {format(T.agentsPages.list.rankBadge, { rank })}
      </span>
      <span aria-hidden style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.45)', borderRadius: 1 }} />
      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.95 }}>
        {format(T.agentsPages.list.scorePts, { score })}
      </span>
    </div>
  );
}
