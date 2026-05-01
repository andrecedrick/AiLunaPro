import type { ReactNode } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import type { Route, RouteName } from '../../types/audit';

interface Tab {
  id: 'profile' | 'org' | 'preferences' | 'billing';
  label: string;
  route: Route;
  routeName: RouteName;
  ownerOnly?: boolean;
}

const TABS: Tab[] = [
  { id: 'profile',     label: 'Profile',          route: { name: 'settings/profile' },     routeName: 'settings/profile' },
  { id: 'org',         label: 'Organization',     route: { name: 'settings/org' },         routeName: 'settings/org' },
  { id: 'preferences', label: 'Preferences',      route: { name: 'settings/preferences' }, routeName: 'settings/preferences' },
  { id: 'billing',     label: 'Billing',          route: { name: 'settings/billing' },     routeName: 'settings/billing', ownerOnly: true },
];

interface Props {
  title: string;
  children: ReactNode;
}

/**
 * Shared shell for the Settings sub-pages.
 * Renders the page title and a tab strip that mirrors the current route.
 */
export function SettingsLayout({ title, children }: Props) {
  const { route, navigate } = useRoute();
  const { session } = useAuth();
  const isOwner = session?.role === 'owner';
  const visibleTabs = TABS.filter(t => !t.ownerOnly || isOwner);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 880 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: 4,
        }}
      >
        Settings
      </h1>
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 22,
        }}
      >
        Manage your profile, organization, and preferences.
      </div>

      {/* Tab strip */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--border)',
          marginBottom: 26,
        }}
      >
        {visibleTabs.map((t) => {
          const active = route.name === t.routeName;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => navigate(t.route)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '10px 14px',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--violet-text)' : 'var(--text-muted)',
                borderBottom: active
                  ? '2px solid var(--violet, #7C3AED)'
                  : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: 18,
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}
