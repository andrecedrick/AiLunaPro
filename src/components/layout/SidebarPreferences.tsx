/**
 * Sidebar Language + Currency widget — compact two-row layout.
 *
 * Backed by PreferencesContext (single source of truth). Visible to all
 * authenticated users on dashboard-shell routes. Hidden on chromeless
 * routes (login, signup, accept-invite, diagnostic).
 *
 * Sidebar shows short labels (EN / USD $) for compactness. Settings page
 * shows long labels (English / USD $).
 */

import { usePreferences } from '../../context/PreferencesContext';
import { useLocale } from '../../context/LocaleContext';
import {
  LANGUAGE_SHORT_LABELS,
  LANGUAGE_VALUES,
  type Language,
} from '../../lib/preferences';

export function SidebarPreferences() {
  const { language, setLanguage } = usePreferences();
  const T = useLocale();

  return (
    <div
      style={{
        margin: '8px 12px 4px',
        padding: '10px 12px',
        borderRadius: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <Row
        icon={<GlobeIcon />}
        label={T.shell.language}
        ariaLabel={T.shell.language}
        value={language}
        onChange={v => setLanguage(v as Language)}
        options={LANGUAGE_VALUES.map(v => ({ value: v, label: LANGUAGE_SHORT_LABELS[v] }))}
      />
    </div>
  );
}

/* ── Row ──────────────────────────────────────────────────── */

interface RowProps {
  icon:      React.ReactNode;
  label:     string;
  ariaLabel: string;
  value:     string;
  onChange:  (v: string) => void;
  options:   { value: string; label: string }[];
}

function Row({ icon, label, ariaLabel, value, onChange, options }: RowProps) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            8,
      minWidth:       0,
    }}>
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            6,
        flex:           1,
        minWidth:       0,
        color:          'var(--text-muted)',
      }}>
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontSize:       11,
          fontWeight:     600,
          color:          'var(--text-secondary)',
          whiteSpace:     'nowrap',
          overflow:       'hidden',
          textOverflow:   'ellipsis',
        }}>
          {label}
        </span>
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance:        'none',
            WebkitAppearance:  'none',
            MozAppearance:     'none',
            padding:           '5px 22px 5px 10px',
            borderRadius:      8,
            border:            '1px solid var(--border-strong, var(--border))',
            background:        'var(--surface-2)',
            color:             'var(--text-primary)',
            fontSize:          12,
            fontWeight:        700,
            fontFamily:        'inherit',
            cursor:            'pointer',
            outline:           'none',
            minWidth:          70,
            transition:        'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong, var(--border))'; }}
          onFocus={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)';
          }}
          onBlur={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong, var(--border))';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {/* Custom caret overlay (native arrow hidden via appearance: none) */}
        <span
          aria-hidden
          style={{
            position:       'absolute',
            right:          7,
            top:            '50%',
            transform:      'translateY(-50%)',
            pointerEvents:  'none',
            color:          'var(--text-muted)',
            display:        'inline-flex',
          }}
        >
          <CaretDown />
        </span>
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────── */

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CaretDown() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
