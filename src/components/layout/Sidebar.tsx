import type { ReactNode } from 'react';
import { mockNavItems, mockOrg, mockUser } from '../../data/mockDashboard';
import { useRoute } from '../../context/RouteContext';
import type { Route, RouteName } from '../../types/audit';

/* Map Sidebar nav item ids to routes (only the ones wired so far). */
const NAV_ROUTES: Partial<Record<string, Route>> = {
  dashboard: { name: 'dashboard' },
  'new-audit': { name: 'audit/new' },
};

/* Map current route → nav item id that should appear active. */
function routeToActiveId(name: RouteName): string {
  if (name === 'dashboard') return 'dashboard';
  if (name === 'audit/new') return 'new-audit';
  if (name === 'audit/result') return 'new-audit';
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

/* ── Component ─────────────────────────────────────────────── */
export function Sidebar() {
  const { route, navigate } = useRoute();
  const activeId = routeToActiveId(route.name);

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
      {/* Logo header — cropped to visible mark, no transparent-canvas waste */}
      <div style={{ padding: '22px 16px 14px' }}>
        {/*
          PNG canvas is 500×500 but the visible wordmark is only 474×79 px.
          Top transparent: 181 px (36.2%), bottom: 240 px (48%).
          Wrapper constrained to maxWidth:175 → img renders at 175×175 px.
            top clip  = 181/500 × 175 ≈ 63 px  → marginTop: -63
            mark height = 79/500 × 175 ≈ 28 px  → wrapper height: 28
          Centred in the 208 px available space (240 − 32 px side padding).
        */}
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
            alt="AI Luna Pro"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              marginTop: -63,
            }}
          />
        </div>

        {/* Tagline — centred, subordinate */}
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

        {/* Gradient accent — short pip, centred */}
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
        <div
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
            {mockOrg.initials}
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
              {mockOrg.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{mockOrg.plan}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '2px 12px', overflowY: 'auto' }}>
        {mockNavItems.map(item => (
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

      {/* User footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
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
          {mockUser.initials}
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
            {mockUser.displayName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{mockUser.role}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
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
