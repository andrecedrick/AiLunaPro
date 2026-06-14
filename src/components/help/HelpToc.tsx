/**
 * HelpToc — sticky left-rail TOC for HelpPage. Phase H0.
 *
 * - Active state: parent passes activeId; click sets activeId.
 * - Mobile (<= 900px): rendered as a <details> by HelpPage; this
 *   component itself is just a list and adapts via container width.
 */

import type { HelpSection } from '../../data/help';
import { useLocale } from '../../context/LocaleContext';

interface Props {
  sections: readonly HelpSection[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function HelpToc({ sections, activeId, onSelect }: Props) {
  const tocAria = useLocale().help.header.tocAria;
  return (
    <nav aria-label={tocAria} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      padding: 8,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
    }}>
      {sections.map((s, i) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={active ? 'true' : undefined}
            style={{
              textAlign:    'left',
              padding:      '8px 12px',
              borderRadius: 8,
              border:       'none',
              background:   active ? 'var(--brand-tint-bg, rgba(124,58,237,0.10))' : 'transparent',
              color:        active ? 'var(--violet-text)' : 'var(--text-secondary)',
              fontSize:     13,
              fontWeight:   active ? 700 : 500,
              fontFamily:   'inherit',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              transition:   'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg, rgba(0,0,0,0.04))';
            }}
            onMouseLeave={e => {
              if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <span aria-hidden style={{
              display:        'inline-flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          22,
              height:         22,
              borderRadius:   6,
              background:     active ? 'var(--violet)' : 'var(--surface-2)',
              color:          active ? '#fff' : 'var(--text-muted)',
              fontSize:       11,
              fontWeight:     700,
              flexShrink:     0,
            }}>
              {i + 1}
            </span>
            <span style={{
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>
              {s.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
