import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { SidebarPreferences } from './SidebarPreferences';
import { setSrc } from '../../lib/analytics/srcParam';
import type { Route, RouteName } from '../../types/audit';

/* Map current route → nav item id that should appear active. */
function routeToActiveId(name: RouteName): string {
  if (name === 'dashboard') return 'dashboard';
  if (name === 'audit/new') return 'new-audit';
  if (name === 'audit/result') return 'new-audit';
  if (name === 'audit/assistance') return 'new-audit';
  if (name === 'reports') return 'reports';
  if (name === 'reports/detail') return 'reports';
  if (name === 'reports/share') return 'reports';
  if (name === 'audit/history') return 'audit-history';
  if (name === 'audit-express/run') return 'audit-express-run';
  if (name === 'audit-express/saved') return 'audit-express-saved';
  if (name === 'registry') return 'registry';
  if (name === 'system-builder') return 'system-builder';
  if (name === 'worksheet') return 'worksheet';
  if (name === 'visibility') return 'visibility';
  if (name === 'agents') return 'agents';
  if (name === 'agents/detail') return 'agents';
  if (name === 'team') return 'team';
  if (name === 'help') return 'help';
  if (name === 'settings/profile')     return 'settings';
  if (name === 'settings/org')         return 'settings';
  if (name === 'settings/preferences') return 'settings';
  if (name === 'settings/billing')     return 'settings';
  if (name === 'billing')              return 'billing';
  if (name === 'invoices')             return 'invoices';
  if (name === 'my-quotes')            return 'my-quotes';
  if (name === 'admin')                return 'admin';
  if (name === 'contacts')             return 'contacts';
  return '';
}

/* ── Grouped navigation model (RBAC-gated, collapsible sections) ──────────────
 * Single source of truth: logical groups → entries. Each entry keeps its route,
 * icon, and role gate; a group renders only the entries the current role may see
 * and hides entirely when empty. Reorganization only — every existing route +
 * gate is preserved (content items stay content-role-only, etc.). */
type RoleStr = string | undefined;
const isContent   = (r: RoleStr) => r === 'owner' || r === 'admin' || r === 'member';
const notClient   = (r: RoleStr) => !!r && r !== 'client';
const isOrgAdmin  = (r: RoleStr) => r === 'owner' || r === 'admin';

interface NavEntry {
  id: string;
  icon: string;
  route: Route;
  src?: string;                                   // ?src acquisition tag for public tools
  gate?: (role: RoleStr, isSuperAdmin: boolean) => boolean; // undefined → visible to all authed
}
interface NavGroupDef { id: string; items: NavEntry[]; }

const NAV_GROUPS: NavGroupDef[] = [
  { id: 'core', items: [
    { id: 'dashboard', icon: 'dashboard', route: { name: 'dashboard' } },
  ] },
  { id: 'audit', items: [
    { id: 'new-audit',            icon: 'new-audit',       route: { name: 'audit/new' },            gate: r => isContent(r) },
    { id: 'audit-history',        icon: 'audit-history',   route: { name: 'audit/history' },         gate: r => isContent(r) },
    { id: 'audit-express-run',    icon: 'audit-express',   route: { name: 'audit-express/run' },     gate: r => isContent(r) },
    { id: 'audit-express-saved',  icon: 'saved-audits',    route: { name: 'audit-express/saved' },   gate: r => isContent(r) },
    { id: 'reports',              icon: 'reports',         route: { name: 'reports' },               gate: r => isContent(r) },
    { id: 'registry',             icon: 'registry',        route: { name: 'registry' },              gate: r => isContent(r) },
    { id: 'system-builder',       icon: 'system-builder',  route: { name: 'system-builder' },        gate: r => isContent(r) },
    { id: 'agents',               icon: 'agents',          route: { name: 'agents' },                gate: r => notClient(r) },
    { id: 'worksheet',            icon: 'worksheet-tool',  route: { name: 'worksheet' },             gate: r => isContent(r) },
    { id: 'visibility',           icon: 'visibility-tool', route: { name: 'visibility' },            gate: r => isContent(r) },
  ] },
  { id: 'crm', items: [
    { id: 'quote-tool', icon: 'quote-tool', route: { name: 'quote' },     src: 'menu-quote' },
    { id: 'my-quotes',  icon: 'my-quotes',  route: { name: 'my-quotes' }, gate: r => notClient(r) },
    { id: 'contacts',   icon: 'contacts',   route: { name: 'contacts' },  gate: (r, sa) => sa || isContent(r) },
  ] },
  { id: 'admin', items: [
    { id: 'admin', icon: 'admin',    route: { name: 'admin' }, gate: (r, sa) => sa || isOrgAdmin(r) },
    { id: 'team',  icon: 'team',     route: { name: 'team' },  gate: r => notClient(r) },
  ] },
  { id: 'billing', items: [
    { id: 'billing',  icon: 'billing',  route: { name: 'billing' },  gate: r => r === 'owner' || r === 'admin' || r === 'billing' },
    { id: 'invoices', icon: 'invoices', route: { name: 'invoices' }, gate: r => notClient(r) },
  ] },
  { id: 'tools', items: [ // public acquisition tools (chromeless SPA pages)
    { id: 'roi-tool',  icon: 'roi-tool',  route: { name: 'roi-calculator' }, src: 'menu-roi' },
    { id: 'diag-tool', icon: 'diag-tool', route: { name: 'diagnostic' },     src: 'menu-diagnostic' },
  ] },
  { id: 'system', items: [
    { id: 'settings', icon: 'settings', route: { name: 'settings/profile' } },
    { id: 'help',     icon: 'help',     route: { name: 'help' } },
  ] },
];

/** Localized label for a nav entry id (reuses existing dictionary keys). */
function navLabel(id: string, T: ReturnType<typeof useLocale>): string {
  switch (id) {
    case 'roi-tool':   return T.nav.aiRoiCalculator;
    case 'diag-tool':  return T.nav.aiMaturityDiagnostic;
    case 'quote-tool': return T.nav.requestQuote;
    case 'my-quotes':  return T.nav.myQuotes;
    case 'worksheet':  return T.auditTools.nav.worksheetLabel;
    case 'visibility': return T.auditTools.nav.visibilityLabel;
    case 'admin':      return T.adminCenter.nav;
    case 'contacts':   return T.contacts.nav;
    default:           return (T.nav as Record<string, string>)[id] ?? id;
  }
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
    case 'new-audit': // file + plus
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="12" x2="12" y2="18" /><line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      );
    case 'audit-history': // history clock
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 8 12 12 14.5 13.5" />
        </svg>
      );
    case 'audit-express': // lightning bolt
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'saved-audits': // bookmark
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'my-quotes': // stacked documents
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'contacts': // contact card
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" />
          <path d="M5.5 17a3.5 3.5 0 0 1 7 0" /><line x1="15" y1="9" x2="18" y2="9" /><line x1="15" y1="13" x2="18" y2="13" />
        </svg>
      );
    case 'admin': // sliders (admin controls)
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
    case 'invoices': // receipt
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2h12a1 1 0 0 1 1 1v18l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1z" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      );
    case 'system-builder': // layers
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'reports': // bar-chart — distinct from quote-tool's file-text
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
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
    case 'roi-tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 16.5 8.5 11.5 1 19" /><polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case 'diag-tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'quote-tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="14" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      );
    case 'worksheet-tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      );
    case 'visibility-tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
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
  const T = useLocale();
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
            {T.shell.workspaces} ({userOrgs.length})
          </div>

          {/* Search — only useful past a handful of workspaces. */}
          {userOrgs.length > 5 && (
            <div style={{ padding: '2px 10px 6px' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={T.shell.searchWorkspaces}
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
            + {T.shell.createWorkspace}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────── */
interface SidebarProps {
  collapsed?: boolean;   // desktop rail collapsed (icons-only)
  isMobile?: boolean;    // <768px → off-canvas drawer
  mobileOpen?: boolean;  // drawer visible (mobile only)
  onNavigate?: () => void; // called after a nav click (closes the drawer)
}

export function Sidebar({ collapsed = false, isMobile = false, mobileOpen = false, onNavigate }: SidebarProps) {
  const { route, navigate } = useRoute();
  const { session, logout } = useAuth();
  const T = useLocale();
  const activeId = routeToActiveId(route.name);

  // Admin Center is gated on super-admin (email in ADMIN_EMAILS / PLATFORM_ADMIN_EMAILS).
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    let alive = true;
    void import('../../lib/platform/platformService').then(m => m.fetchPlatformMe())
      .then(s => { if (alive) setIsSuperAdmin(s.isSuperAdmin); })
      .catch(() => { /* fail-closed: stay hidden */ });
    return () => { alive = false; };
  }, [session?.userId]);

  const user = session?.user;
  // Icons-only rail applies on desktop only; on mobile the drawer shows full width.
  const iconsOnly = collapsed && !isMobile;
  const width = isMobile ? 264 : (iconsOnly ? 72 : 240);

  return (
    <aside
      id="app-sidebar"
      role="navigation"
      aria-label="Primary"
      aria-hidden={isMobile && !mobileOpen}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width,
        height: '100vh',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: isMobile ? '2px 0 18px rgba(0,0,0,0.18)' : '2px 0 10px rgba(0,0,0,0.04)',
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'width 0.2s ease, transform 0.2s ease, background 0.2s ease, border-color 0.2s ease',
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

        {!iconsOnly && (
          <>
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
              {T.shell.complianceSuite}
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
          </>
        )}
      </div>

      {/* Org switcher — hidden in the collapsed rail (expand to switch workspace) */}
      {!iconsOnly && (
        <div style={{ padding: '10px 16px 8px' }}>
          <OrgSwitcher />
        </div>
      )}

      {/* Nav — RBAC-gated, collapsible logical groups (Core / Audit / CRM / Admin / Billing / Tools) */}
      <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <NavGroup
            key={group.id}
            group={group}
            role={session?.role}
            isSuperAdmin={isSuperAdmin}
            activeId={activeId}
            iconsOnly={iconsOnly}
            T={T}
            onSelect={entry => {
              if (entry.src) setSrc(entry.src);
              navigate(entry.route);
              onNavigate?.();
            }}
          />
        ))}
      </nav>

      {/* Language + Currency preferences (hidden in the collapsed rail) */}
      {!iconsOnly && <SidebarPreferences />}

      {/* User footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: iconsOnly ? 'center' : 'flex-start',
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
        {!iconsOnly && (
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
        )}
        {/* Sign out */}
        <button
          type="button"
          title={T.shell.signOut}
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
          aria-label={T.shell.signOut}
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
  iconsOnly = false,
}: {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick?: () => void;
  iconsOnly?: boolean;
}) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); }
  };
  return (
    <div
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-current={active ? 'page' : undefined}
      title={iconsOnly ? label : undefined}
      aria-label={iconsOnly ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: iconsOnly ? 'center' : 'flex-start',
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
      {!iconsOnly && label}
    </div>
  );
}

const groupHeaderStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 12px 4px', background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
  color: 'var(--text-muted)', fontFamily: 'inherit',
};

/** A collapsible, RBAC-filtered nav section. Hidden when the role sees no entry;
 *  the active item's group is always shown expanded; collapse state persists. */
function NavGroup({ group, role, isSuperAdmin, activeId, iconsOnly, T, onSelect }: {
  group: NavGroupDef;
  role: RoleStr;
  isSuperAdmin: boolean;
  activeId: string;
  iconsOnly: boolean;
  T: ReturnType<typeof useLocale>;
  onSelect: (entry: NavEntry) => void;
}) {
  const visible = group.items.filter(it => !it.gate || it.gate(role, isSuperAdmin));
  const hasActive = visible.some(it => it.id === activeId);
  const STORAGE = `ailunapro-nav-group-${group.id}`;
  const [open, setOpen] = useState<boolean>(() => {
    try { const v = localStorage.getItem(STORAGE); if (v != null) return v === '1'; } catch { /* ignore */ }
    return true; // default: expanded
  });
  const expanded = open || hasActive; // never hide the section that holds the current page
  const toggle = () => { const n = !open; setOpen(n); try { localStorage.setItem(STORAGE, n ? '1' : '0'); } catch { /* ignore */ } };

  if (visible.length === 0) return null;

  const rows = visible.map(it => (
    <NavItem key={it.id} id={it.id} icon={it.icon} label={navLabel(it.id, T)}
      active={it.id === activeId} iconsOnly={iconsOnly} onClick={() => onSelect(it)} />
  ));

  // Collapsed rail: no headers, just icons (with a thin separator between groups).
  if (iconsOnly) {
    return <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>{rows}</div>;
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <button type="button" onClick={toggle} aria-expanded={expanded} style={groupHeaderStyle}>
        <span>{(T.navGroups as Record<string, string>)[group.id] ?? group.id}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', opacity: 0.7 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      {expanded && rows}
    </div>
  );
}
