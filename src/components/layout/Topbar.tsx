import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LunaPanel } from '../luna/LunaPanel';
import { SupportModal } from '../support/SupportModal';
import { InsufficientTokensModal } from '../tokens/InsufficientTokensModal';
import { TokenBadge } from '../tokens/TokenBadge';
import { SessionValueTracker } from '../tokens/SessionValueTracker';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { ROLE } from '../../types/auth';
import { fetchPlatformNotifications, type NotificationItem } from '../../lib/platform/platformService';

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
}

export function Topbar({ onToggleSidebar, sidebarCollapsed, isMobile, mobileOpen }: TopbarProps) {
  const { navigate, route } = useRoute();
  const { session }  = useAuth();
  const { showToast } = useToast();
  const T = useLocale();
  const datePresets = [
    { id: 'last7',     label: T.topbar.dateRange.last7 },
    { id: 'last30',    label: T.topbar.dateRange.last30 },
    { id: 'thismonth', label: T.topbar.dateRange.thisMonth },
    { id: 'lastmonth', label: T.topbar.dateRange.lastMonth },
  ];

  // B6.2 precision: store the SELECTION (preset id or custom range), never a
  // frozen label — so the displayed text re-localizes when the language changes.
  type DateSel = { kind: 'preset'; id: string } | { kind: 'custom'; from: string; to: string };
  const [dateSel, setDateSel] = useState<DateSel>(() => {
    try {
      const raw = localStorage.getItem('ailunapro:dateRange:v2');
      if (raw) { const p = JSON.parse(raw); if (p && (p.kind === 'preset' || p.kind === 'custom')) return p; }
    } catch { /* ignore */ }
    return { kind: 'preset', id: 'thismonth' };
  });
  const [dateOpen, setDateOpen]   = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  // Operator notification feed for the bell. Platform-admin gated at the endpoint,
  // so a non-operator gets null and the bell stays empty (no per-user feed exists).
  const [notifs, setNotifs] = useState<NotificationItem[] | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [lunaOpen,  setLunaOpen]  = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [lunaTokens, setLunaTokens] = useState<{ balance: number; required: number } | null>(null);
  const [search, setSearch] = useState('');

  // Load the operator notification feed once on mount. Endpoint is platform-admin
  // gated → non-operators resolve to null and the bell shows the empty state.
  useEffect(() => {
    let alive = true;
    fetchPlatformNotifications().then(n => {
      if (!alive || !n) return;
      setNotifs(n.items);
      setNotifCount(n.count);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

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

  const onPickPreset = (id: string) => {
    const sel: DateSel = { kind: 'preset', id };
    setDateSel(sel);
    setDateOpen(false);
    try { localStorage.setItem('ailunapro:dateRange:v2', JSON.stringify(sel)); } catch { /* ignore */ }
    const label = datePresets.find(p => p.id === id)?.label ?? '';
    showToast(format(T.topbar.dateRange.toast, { label }), 'info');
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) {
      showToast(T.topbar.dateRange.errPickBoth, 'warning');
      return;
    }
    const from = new Date(customFrom);
    const to   = new Date(customTo);
    if (from > to) {
      showToast(T.topbar.dateRange.errOrder, 'warning');
      return;
    }
    const sel: DateSel = { kind: 'custom', from: customFrom, to: customTo };
    setDateSel(sel);
    try { localStorage.setItem('ailunapro:dateRange:v2', JSON.stringify(sel)); } catch { /* ignore */ }
    const label = `${formatDate(customFrom)} – ${formatDate(customTo)}`;
    setCustomOpen(false);
    setDateOpen(false);
    showToast(format(T.topbar.dateRange.toast, { label }), 'info');
  };

  // Displayed label is derived from the selection + current locale (re-localizes).
  const dateLabel = dateSel.kind === 'preset'
    ? (datePresets.find(p => p.id === dateSel.id)?.label ?? T.topbar.dateRange.thisMonth)
    : `${formatDate(dateSel.from)} – ${formatDate(dateSel.to)}`;

  const onSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate({ name: 'reports' });
      showToast(format(T.topbar.search.toast, { query: search.trim() }), 'info');
    }
  };

  const onNewAudit = () => {
    if (!canCreateAudit) { showToast(T.topbar.newAudit.denied, 'warning'); return; }
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
            ? (mobileOpen ? T.topbar.sidebar.closeMenu : T.topbar.sidebar.openMenu)
            : (sidebarCollapsed ? T.topbar.sidebar.expand : T.topbar.sidebar.collapse)
        }
        title={isMobile ? T.topbar.sidebar.menu : (sidebarCollapsed ? T.topbar.sidebar.expand : T.topbar.sidebar.collapse)}
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
          {(T.topbar.title as Record<string, string>)[route.name] ?? T.topbar.title.dashboard}
        </h1>
        {route.name === 'dashboard' && (
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
            {T.topbar.subtitle.dashboard}
          </p>
        )}
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
            {datePresets.map(p => (
              <button key={p.id} type="button" onClick={() => onPickPreset(p.id)} style={dropdownItem()}>
                {p.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <button type="button" onClick={() => { setCustomOpen(o => !o); }} style={{ ...dropdownItem(), color: 'var(--violet-text)', fontWeight: 600 }}>
              {T.topbar.dateRange.customRange}
            </button>

            {customOpen && (
              <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{T.topbar.dateRange.from}</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface)', color: 'var(--text-primary)' }}
                />
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{T.topbar.dateRange.to}</label>
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
                    background: 'var(--brand-gradient)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {T.topbar.dateRange.apply}
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
          placeholder={T.topbar.search.placeholder}
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
          aria-label={T.topbar.notifications.label}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifCount > 0 && (
            <span aria-hidden style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: '#b91c1c', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {notifCount > 99 ? '99+' : notifCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div style={dropdownStyle({ width: 320 })}>
            <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {T.topbar.notifications.title}
            </div>
            {(!notifs || notifs.length === 0) ? (
              <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                {T.topbar.notifications.empty}
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifs.map(n => (
                  <div key={n.id} style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span aria-hidden style={{ marginTop: 2, width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: n.severity === 'critical' ? '#b91c1c' : n.severity === 'info' ? '#7c3aed' : '#b45309' }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-word' }}>{n.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.at ? new Date(n.at).toLocaleString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SessionValueTracker />
      <TokenBadge />

      {/* S2: Contact support — opens the support-ticket modal */}
      <button
        type="button"
        onClick={() => setSupportOpen(true)}
        aria-label={T.support.cta}
        title={T.support.cta}
        style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
      {supportOpen && <SupportModal open onClose={() => setSupportOpen(false)} />}

      {/* B4: Luna AI Copilot — named, route-aware, rule-based guide */}
      <button
        type="button"
        onClick={() => setLunaOpen(true)}
        aria-label={T.topbar.luna.aria}
        title={T.topbar.luna.title}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, border: '1.5px solid var(--violet)', cursor: 'pointer',
          background: 'var(--brand-soft-bg, transparent)', color: 'var(--violet-text)',
          fontWeight: 700, fontSize: 12.5, fontFamily: 'var(--font-body)', flexShrink: 0,
        }}
      >
        <span aria-hidden>✨</span> {T.topbar.luna.label}
      </button>
      <LunaPanel
        open={lunaOpen}
        onClose={() => setLunaOpen(false)}
        onNeedTokens={(info) => { setLunaOpen(false); setLunaTokens(info); }}
      />
      {lunaTokens && (
        <InsufficientTokensModal
          open
          onClose={() => setLunaTokens(null)}
          balance={lunaTokens.balance}
          required={lunaTokens.required}
          actionLabel={T.topbar.luna.label}
        />
      )}

      <ThemeToggle />

      {/* New Audit */}
      <Button variant="primary" size="sm" onClick={onNewAudit}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {T.topbar.newAudit.label}
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
