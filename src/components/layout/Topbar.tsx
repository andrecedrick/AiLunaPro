import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../theme/ThemeToggle';
import { TokenBadge } from '../tokens/TokenBadge';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ROLE } from '../../types/auth';

const DATE_PRESETS: { id: string; label: string }[] = [
  { id: 'last7',     label: 'Last 7 days' },
  { id: 'last30',    label: 'Last 30 days' },
  { id: 'thismonth', label: 'This month' },
  { id: 'lastmonth', label: 'Last month' },
];

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
}

export function Topbar({ onToggleSidebar, sidebarCollapsed, isMobile, mobileOpen }: TopbarProps) {
  const { navigate } = useRoute();
  const { session }  = useAuth();
  const { showToast } = useToast();

  const [dateLabel, setDateLabel] = useState<string>(() => {
    try { return localStorage.getItem('ailunapro:dateRange') ?? 'Apr 1 – Apr 27, 2025'; } catch { return 'Apr 1 – Apr 27, 2025'; }
  });
  const [dateOpen, setDateOpen]   = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');

  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current   && !dateRef.current.contains(e.target as Node))   setDateOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const role = session?.role;
  const canCreateAudit = ROLE.canUseFeatures(role);

  const onPickDate = (label: string) => {
    setDateLabel(label);
    setDateOpen(false);
    try { localStorage.setItem('ailunapro:dateRange', label); } catch { /* ignore */ }
    showToast(`Date range: ${label}`, 'info');
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) {
      showToast('Pick a from and to date.', 'warning');
      return;
    }
    const from = new Date(customFrom);
    const to   = new Date(customTo);
    if (from > to) {
      showToast('From date must be before To date.', 'warning');
      return;
    }
    const label = `${formatDate(customFrom)} – ${formatDate(customTo)}`;
    setDateLabel(label);
    try { localStorage.setItem('ailunapro:dateRange', label); } catch { /* ignore */ }
    setCustomOpen(false);
    setDateOpen(false);
    showToast(`Date range: ${label}`, 'info');
  };

  const onSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate({ name: 'reports' });
      showToast(`Searching for "${search.trim()}"…`, 'info');
    }
  };

  const onNewAudit = () => {
    if (!canCreateAudit) { showToast("Your role doesn't allow creating audits. Audits are for Owner, Admin, and Member.", 'warning'); return; }
    navigate({ name: 'audit/new' });
  };

  return (
    <header
      className="topbar"
      style={{
        height: 60, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 32px', gap: 12,
        position: 'sticky', top: 0, zIndex: 50,
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Sidebar collapse/expand (desktop) · drawer open/close (mobile) */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-controls="app-sidebar"
        aria-expanded={isMobile ? mobileOpen : !sidebarCollapsed}
        aria-label={
          isMobile
            ? (mobileOpen ? 'Close navigation menu' : 'Open navigation menu')
            : (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
        }
        title={isMobile ? 'Menu' : (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
        style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          AI Compliance Overview — April 2025
        </p>
      </div>

      {/* Date range dropdown */}
      <div ref={dateRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setDateOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {dateLabel}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {dateOpen && (
          <div style={dropdownStyle()}>
            {DATE_PRESETS.map(p => (
              <button key={p.id} type="button" onClick={() => onPickDate(p.label)} style={dropdownItem()}>
                {p.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <button type="button" onClick={() => { setCustomOpen(o => !o); }} style={{ ...dropdownItem(), color: 'var(--violet-text)', fontWeight: 600 }}>
              Custom range…
            </button>

            {customOpen && (
              <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
                />
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={applyCustomRange}
                  style={{
                    marginTop: 4, padding: '7px 12px', borderRadius: 8, border: 'none',
                    background: 'var(--violet)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Apply range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--input-bg)', border: '1px solid var(--input-border)',
        borderRadius: 8, padding: '6px 12px', width: 200,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search audits, reports…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={onSearchEnter}
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 12, color: 'var(--text-secondary)', width: '100%', fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Notification bell */}
      <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setNotifOpen(o => !o)}
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative', color: 'var(--text-secondary)',
          }}
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        {notifOpen && (
          <div style={dropdownStyle({ width: 260 })}>
            <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Notifications
            </div>
            <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              No notifications yet.
            </div>
          </div>
        )}
      </div>

      <TokenBadge />

      <ThemeToggle />

      {/* New Audit */}
      <Button variant="primary" size="sm" onClick={onNewAudit}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Audit
      </Button>
    </header>
  );
}

function dropdownStyle(opts: { width?: number; right?: number } = {}): React.CSSProperties {
  return {
    position:    'absolute',
    top:         44,
    right:       opts.right ?? 0,
    minWidth:    opts.width ?? 200,
    background:  'var(--surface)',
    border:      '1px solid var(--border)',
    borderRadius: 10,
    boxShadow:   '0 8px 24px rgba(0,0,0,0.10)',
    overflow:    'hidden',
    zIndex:      300,
  };
}
function dropdownItem(): React.CSSProperties {
  return {
    display: 'block', width: '100%', padding: '8px 14px',
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontSize: 13, color: 'var(--text-primary)', textAlign: 'left',
  };
}
