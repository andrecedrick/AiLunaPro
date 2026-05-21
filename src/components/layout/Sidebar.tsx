import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react';
import { mockNavItems } from '../../data/mockDashboard';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { SidebarPreferences } from './SidebarPreferences';
import type { Route, RouteName } from '../../types/audit';

/* Map Sidebar nav item ids to routes (only the ones wired so far). */
const NAV_ROUTES: Partial<Record<string, Route>> = {
  dashboard: { name: 'dashboard' },
  'new-audit': { name: 'audit/new' },
  reports: { name: 'reports' },
  registry: { name: 'registry' },
  agents: { name: 'agents' },
  team: { name: 'team' },
  help: { name: 'help' },
  settings: { name: 'settings/profile' },
  billing:  { name: 'billing' },
};

/* Map current route → nav item id that should appear active. */
function routeToActiveId(name: RouteName): string {
  if (name === 'dashboard') return 'dashboard';
  if (name === 'audit/new') return 'new-audit';
  if (name === 'audit/result') return 'new-audit';
  if (name === 'audit/assistance') return 'new-audit';
  if (name === 'reports') return 'reports';
  if (name === 'reports/detail') return 'reports';
  if (name === 'reports/share') return 'reports';
  if (name === 'registry') return 'registry';
  if (name === 'agents') return 'agents';
  if (name === 'agents/detail') return 'agents';
  if (name === 'team') return 'team';
  if (name === 'help') return 'help';
  if (name === 'settings/profile')     return 'settings';
  if (name === 'settings/org')         return 'settings';
  if (name === 'settings/preferences') return 'settings';
  if (name === 'settings/billing')     return 'settings';
  if (name === 'billing')              return 'billing';
  return '';
}

const LOGO_URL =
  'https://res.cloudinary.com/dhtnegf9d/image/upload/v1777320369/6_xldhxr.png';

/* ── Icons ─────────────────────────────────────────────────── */
function NavIcon({ id }: { id: string }): ReactNode {
  const s: React.CSSProperties = { width: 18, height: 18, flexShrink: 0 };
  switch (id) {
    case 'dashboard':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'plus':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case 'reports':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'registry':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case 'team':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'settings':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'billing':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case 'agents':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      );
    case 'help':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

/* ── Org switcher dropdown ──────────────────────────────────── */
function OrgSwitcher() {
  const { session, orgs, switchOrg } = useAuth();
  const { navigate } = useRoute();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // `orgs` is already scoped to the user (buildSession derives it from
  // users.orgIds). Do NOT re-filter by `members` — that array only holds the
  // ACTIVE org's members, so filtering collapsed the list to 1 workspace.
  const userOrgs = orgs;

  // Sorted: active workspace pinned first, rest by createdAt desc (newest top).
  const sortedOrgs = useMemo(() => {
    const activeId = session?.orgId;
    return [...userOrgs].sort((a, b) => {
      if (a.id === activeId) return -1;
      if (b.id === activeId) return 1;
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
    });
  }, [userOrgs, session?.orgId]);

  const visibleOrgs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedOrgs;
    return sortedOrgs.filter(o => o.name.toLowerCase().includes(q));
  }, [sortedOrgs, query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Reset search whenever the dropdown closes.
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const org  = session?.org;
  const plan = org?.plan ?? '';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'var(--surface-2)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {org?.initials ?? '??'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {org?.name ?? 'Workspace'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{plan}</div>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
          style={{ color: 'var(--text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 150,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '7px 12px 4px',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Workspaces ({userOrgs.length})
          </div>

          {/* Search — only useful past a handful of workspaces. */}
          {userOrgs.length > 5 && (
            <div style={{ padding: '2px 10px 6px' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search workspaces…"
                autoFocus
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 10px',
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Scrollable list — explicit max-height so large lists never hide
              items without a visible scrollbar. */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {visibleOrgs.length === 0 && (
            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
              No workspace matches “{query}”.
            </div>
          )}
          {visibleOrgs.map(o => {
            const active = o.id === session?.orgId;
            return (
              <div
                key={o.id}
                onClick={() => { switchOrg(o.id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: active ? 'var(--brand-soft-bg)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'var(--brand-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 9,
                    flexShrink: 0,
                  }}
                >
                  {o.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--violet-text)' : 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {o.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{o.plan}</div>
                </div>
                {active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <div
            onClick={() => { navigate({ name: 'org/create' }); setOpen(false); }}
            style={{
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--violet-text)',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 4,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            + Create workspace
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────── */
export function Sidebar() {
  const { route, navigate } = useRoute();
  const { session, logout } = useAuth();
  const activeId = routeToActiveId(route.name);

  const user = session?.user;

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '2px 0 10px rgba(0,0,0,0.04)',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Logo header */}
      <div style={{ padding: '22px 16px 14px' }}>
        <div
          style={{
            overflow: 'hidden',
            height: 28,
            maxWidth: 175,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <img
            src={LOGO_URL}
            alt="AiLunaPro"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              marginTop: -63,
            }}
          />
        </div>

        <div
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginTop: 12,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Compliance Suite
        </div>

        <div
          style={{
            height: 3,
            width: 24,
            borderRadius: 2,
            background: 'var(--brand-gradient)',
            margin: '10px auto 0',
            opacity: 0.7,
          }}
        />
      </div>

      {/* Org switcher */}
      <div style={{ padding: '10px 16px 8px' }}>
        <OrgSwitcher />
      </div>

      {/* Nav — RBAC filtered (J1.3F) */}
      <nav style={{ flex: 1, padding: '2px 12px', overflowY: 'auto' }}>
        {mockNavItems
          .filter(item => {
            const role = session?.role;
            // Hide Billing for member/client (no access to client billing)
            if (item.id === 'billing' && role !== 'owner' && role !== 'admin' && role !== 'billing') return false;
            // Hide Team management for client
            if (item.id === 'team' && role === 'client') return false;
            // K0: Hide Agents catalog for client
            if (item.id === 'agents' && role === 'client') return false;
            return true;
          })
          .map(item => (
            <NavItem
              key={item.id}
              {...item}
              active={item.id === activeId}
              onClick={() => {
                const target = NAV_ROUTES[item.id];
                if (target) navigate(target);
              }}
            />
          ))}
      </nav>

      {/* Language + Currency preferences (visible to all auth roles) */}
      <SidebarPreferences />

      {/* User footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {user?.initials ?? '??'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.displayName ?? 'User'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {session?.role ?? 'member'}
          </div>
        </div>
        {/* Sign out */}
        <button
          type="button"
          title="Sign out"
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            borderRadius: 6,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red-text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          aria-label="Sign out"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 10,
        marginBottom: 2,
        cursor: 'pointer',
        background: active ? 'var(--brand-soft-bg)' : 'transparent',
        color: active ? 'var(--violet-text)' : 'var(--text-muted)',
        fontWeight: active ? 600 : 500,
        fontSize: 13,
        transition: 'background 0.15s, color 0.15s',
        position: 'relative',
      }}
    >
      {active && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            background: 'var(--brand-gradient)',
          }}
        />
      )}
      <NavIcon id={icon} />
      {label}
    </div>
  );
}
