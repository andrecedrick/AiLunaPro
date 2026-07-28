import { Suspense, useEffect, useRef, useState, lazy as reactLazy, type ReactNode } from 'react';
import { lazyWithRetry as lazy } from './lib/routing/lazyWithRetry';
import { routeFromHash } from './lib/routing/hashRoute';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CampaignChrome } from './components/layout/CampaignChrome';
import { JourneyProgress } from './components/journey/JourneyProgress';
import { ThemeProvider } from './context/ThemeContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { LocaleProvider } from './context/LocaleContext';
import { ToastProvider } from './context/ToastContext';
import { SessionValueProvider } from './context/SessionValueContext';
import { RouteProvider, useRoute } from './context/RouteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsentBanner } from './components/ConsentBanner';
import { ConnectionBanner } from './components/ConnectionBanner';
import { AnalyticsBlockedNotice } from './components/AnalyticsBlockedNotice';
import { BackToTop } from './components/ui/BackToTop';

/* ── Lazy-loaded pages: split bundle, faster initial load ── */
const DashboardPage        = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const NewAuditPage         = lazy(() => import('./pages/NewAuditPage').then(m => ({ default: m.NewAuditPage })));
const AuditResultPage      = lazy(() => import('./pages/AuditResultPage').then(m => ({ default: m.AuditResultPage })));
const AuditAssistancePage  = lazy(() => import('./pages/AuditAssistancePage').then(m => ({ default: m.AuditAssistancePage })));
const AuditHistoryPage     = lazy(() => import('./pages/AuditHistoryPage').then(m => ({ default: m.AuditHistoryPage })));
const ReportsListPage      = lazy(() => import('./pages/ReportsListPage').then(m => ({ default: m.ReportsListPage })));
const ReportDetailPage     = lazy(() => import('./pages/ReportDetailPage').then(m => ({ default: m.ReportDetailPage })));
const ReportSharePage      = lazy(() => import('./pages/ReportSharePage').then(m => ({ default: m.ReportSharePage })));
const RegistryPage         = lazy(() => import('./pages/RegistryPage').then(m => ({ default: m.RegistryPage })));
const TeamPage             = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const LoginPage            = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage           = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage   = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const OrgCreatePage        = lazy(() => import('./pages/OrgCreatePage').then(m => ({ default: m.OrgCreatePage })));
const ProfilePage          = lazy(() => import('./pages/settings/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OrgPage              = lazy(() => import('./pages/settings/OrgPage').then(m => ({ default: m.OrgPage })));
const PreferencesPage      = lazy(() => import('./pages/settings/PreferencesPage').then(m => ({ default: m.PreferencesPage })));
const BillingPage          = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));
const BillingSuccessPage   = lazy(() => import('./pages/BillingSuccessPage').then(m => ({ default: m.BillingSuccessPage })));
const AcceptInvitePage     = lazy(() => import('./pages/AcceptInvitePage').then(m => ({ default: m.AcceptInvitePage })));
const BillingSettingsPage  = lazy(() => import('./pages/settings/BillingSettingsPage').then(m => ({ default: m.BillingSettingsPage })));
const OperatorConsolePage  = lazy(() => import('./pages/settings/OperatorConsolePage').then(m => ({ default: m.OperatorConsolePage })));
const TokensPage           = lazy(() => import('./pages/TokensPage').then(m => ({ default: m.TokensPage })));
const AgentsPage           = lazy(() => import('./pages/AgentsPage').then(m => ({ default: m.AgentsPage })));
const AgentDetailPage      = lazy(() => import('./pages/AgentDetailPage').then(m => ({ default: m.AgentDetailPage })));
const DiagnosticPage       = lazy(() => import('./pages/DiagnosticPage').then(m => ({ default: m.DiagnosticPage })));
const RoiCalculatorPage    = lazy(() => import('./pages/RoiCalculatorPage').then(m => ({ default: m.RoiCalculatorPage })));
const QuoteRequestPage     = lazy(() => import('./pages/QuoteRequestPage').then(m => ({ default: m.QuoteRequestPage })));
const QuoteResultPage      = lazy(() => import('./pages/QuoteResultPage').then(m => ({ default: m.QuoteResultPage })));
const QuoteStatusPage      = lazy(() => import('./pages/QuoteStatusPage').then(m => ({ default: m.QuoteStatusPage })));
const InvoicesPage         = lazy(() => import('./pages/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const AdminCenterPage      = lazy(() => import('./pages/AdminCenterPage').then(m => ({ default: m.AdminCenterPage })));
const MyQuotesPage         = lazy(() => import('./pages/MyQuotesPage').then(m => ({ default: m.MyQuotesPage })));
const HelpPage             = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const MyTicketsPage        = lazy(() => import('./pages/MyTicketsPage').then(m => ({ default: m.MyTicketsPage })));
const SystemBuilderPage    = lazy(() => import('./pages/SystemBuilderPage').then(m => ({ default: m.SystemBuilderPage })));
const WorksheetPage        = lazy(() => import('./pages/WorksheetPage').then(m => ({ default: m.WorksheetPage })));
const ContactsPage         = lazy(() => import('./pages/ContactsPage').then(m => ({ default: m.ContactsPage })));
const VisibilityAuditPage  = lazy(() => import('./pages/VisibilityAuditPage').then(m => ({ default: m.VisibilityAuditPage })));
const AuditExpressSavedPage = lazy(() => import('./pages/AuditExpressSavedPage').then(m => ({ default: m.AuditExpressSavedPage })));
const AuditExpressRunPage   = lazy(() => import('./pages/AuditExpressRunPage').then(m => ({ default: m.AuditExpressRunPage })));
const AuditExpressDetailPage = lazy(() => import('./pages/AuditExpressDetailPage').then(m => ({ default: m.AuditExpressDetailPage })));
const GuidedStartPage       = lazy(() => import('./pages/GuidedStartPage').then(m => ({ default: m.GuidedStartPage })));

/* Data-layer providers (Firestore-backed) — lazy so the firestore chunk stays
   off the eager boot/login path; mounted only around authenticated content. */
const AuthedProviders      = reactLazy(() => import('./context/AuthedProviders'));

/* Authenticated-shell chrome — lazy so their transitive Firestore imports
   (Topbar → TokenBadge → TokensContext) stay off the eager boot/login path.
   reactLazy preserves their prop types; they load under the same Suspense as
   AuthedProviders (no extra fallback). */
const Sidebar              = reactLazy(() => import('./components/layout/Sidebar').then(m => ({ default: m.Sidebar })));
const Topbar               = reactLazy(() => import('./components/layout/Topbar').then(m => ({ default: m.Topbar })));

const PageFallback = () => (
  <div style={{ padding: 24, opacity: 0.6 }}>Loading…</div>
);

function PageOutlet() {
  const { route } = useRoute();

  const page = (() => {
    switch (route.name) {
      case 'audit/new':
        return <NewAuditPage />;
      case 'audit/result':
        return <AuditResultPage />;
      case 'audit/assistance':
        return <AuditAssistancePage />;
      case 'audit/history':
        return <AuditHistoryPage />;
      case 'reports':
        return <ReportsListPage />;
      case 'reports/detail':
        return <ReportDetailPage />;
      case 'reports/share':
        return <ReportSharePage />;
      case 'registry':
        return <RegistryPage />;
      case 'team':
        return <TeamPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'admin':
        return <AdminCenterPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'my-quotes':
        return <MyQuotesPage />;
      case 'settings/profile':
        return <ProfilePage />;
      case 'settings/org':
        return <OrgPage />;
      case 'settings/preferences':
        return <PreferencesPage />;
      case 'billing':
        return <BillingPage />;
      case 'billing/success':
        return <BillingSuccessPage />;
      case 'settings/billing':
        return <BillingSettingsPage />;
      case 'operator':
        return <OperatorConsolePage />;
      case 'billing/tokens':
        return <TokensPage />;
      case 'agents':
        return <AgentsPage />;
      case 'agents/detail':
        return <AgentDetailPage />;
      case 'help':
        return <HelpPage />;
      case 'support/tickets':
        return <MyTicketsPage />;
      case 'system-builder':
        return <SystemBuilderPage />;
      case 'worksheet':
        return <WorksheetPage />;
      case 'visibility':
        return <VisibilityAuditPage />;
      case 'audit-express/saved':
        return <AuditExpressSavedPage />;
      case 'audit-express/run':
        return <AuditExpressRunPage />;
      case 'audit-express/detail':
        return <AuditExpressDetailPage />;
      case 'journey/start':
        return <GuidedStartPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  })();

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>{page}</Suspense>
    </ErrorBoundary>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'ailunapro-sidebar-collapsed-v1';

/** Reactive media-query match (SSR-safe, no deps). */
function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const m = window.matchMedia(query);
    const onChange = () => setMatch(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

function AppShell() {
  const { route, navigate } = useRoute();
  const { isAuthenticated, isLoading, session, retryAuth } = useAuth();

  /* Sidebar collapse/expand state.
     - Desktop (>=768px): collapsible rail (240px ↔ 72px), persisted.
     - Mobile  (<768px):  off-canvas drawer with overlay (transient). */
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'; } catch { return false; }
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [sidebarCollapsed]);
  // Close the mobile drawer on navigation.
  useEffect(() => { setMobileNavOpen(false); }, [route.name]);
  // Esc closes the mobile drawer.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);
  const toggleSidebar = () => { if (isMobile) setMobileNavOpen(o => !o); else setSidebarCollapsed(c => !c); };

  /* Perf P1: boot watchdog. If auth/session is still loading after ~8s (e.g.
     Firestore blocked by an ad-blocker → SDK retries for minutes), stop
     showing a blank screen and surface an actionable connectivity notice.
     Auth keeps resolving in the background; if it succeeds the app proceeds. */
  const [bootSlow, setBootSlow] = useState(false);
  useEffect(() => {
    if (!isLoading) { setBootSlow(false); return; }
    const t = window.setTimeout(() => setBootSlow(true), 8000);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  /* Stale-tab self-heal (deploy integrity). recoverIfStaleBundle previously fired
     ONLY on a chunk-load error — but a tab that already loaded a page (e.g. the
     invoices list) never errors, so after a redeploy it kept rendering the OLD
     bundle (stale i18n strings, old UI) until a manual hard refresh. Now: whenever
     the tab regains focus, compare the running build id with /version.json and, if
     provably stale, do the same one-shot convergent reload. Safe moment (user is
     re-entering the tab, not mid-keystroke); the sessionStorage marker prevents any
     reload loop. This is what makes a deployed fix actually reach an open tab. */
  useEffect(() => {
    const check = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void import('./lib/routing/staleBundle').then(m => m.recoverIfStaleBundle()).catch(() => {});
    };
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    check();   // also on mount, so a tab reopened from history heals immediately
    return () => { document.removeEventListener('visibilitychange', check); window.removeEventListener('focus', check); };
  }, []);

  /* Startup API health probe (non-blocking): logs whether the worker API is
     reachable early, so a backend outage is visible in diagnostics without
     blocking the app. Fire-and-forget; has its own timeout. */
  useEffect(() => {
    void import('./lib/health/startupHealth').then(m => m.probeApiHealth()).catch(() => {});
  }, []);

  /* Tell the index.html boot watchdog that React produced usable UI — anything
     except the bare initial spinner (the app, login, or the actionable
     "Still connecting" card). Once set, the bundle-independent fallback in
     index.html stands down. */
  useEffect(() => {
    if (!isLoading || bootSlow) {
      (window as Window & { __APP_INTERACTIVE__?: boolean }).__APP_INTERACTIVE__ = true;
    }
  }, [isLoading, bootSlow]);

  /* Auto-retry while the (deadline-bounded) spinner shows. On a signed-in session
     drop this rebuilds it; on a cold boot it is a logged no-op (the auth subscription
     resolves by itself). The gate can no longer dead-end: AuthContext force-exits
     isLoading after its 12s deadline and the app continues in degraded mode with the
     non-blocking ConnectionBanner (which owns diagnostics + background reconnects). */
  const [autoRetries, setAutoRetries] = useState(0);
  useEffect(() => {
    if (!isLoading || !bootSlow || autoRetries >= 3) return;
    const t = setTimeout(() => {
      console.warn('[boot] auto-retry', autoRetries + 1, 'of 3');
      retryAuth();
      setAutoRetries(n => n + 1);
    }, 2500);
    return () => clearTimeout(t);
  }, [isLoading, bootSlow, autoRetries, retryAuth]);

  /* J13 Batch 2: analytics page_view on route change. route.name is the
     id-free template (ids live in separate fields) → no PII. track() is a
     no-op unless consent granted, so this is safe pre-consent. */
  useEffect(() => {
    void import('./lib/analytics/track').then(m => m.trackPageView(route.name)).catch(() => {});
  }, [route.name]);

  /* ── Deep-link hydration on fresh load (J4 #1, Phase 1: read-on-load) ──
     Opens the correct page when a hash URL is loaded directly / shared.
     Billing routes are handled by the dedicated effect below (they carry
     query-param side-effects). This effect covers the public + authenticated
     content routes. Order matters: more-specific prefixes first.
       #/invite/{orgId}/{inviteId}/{token} → accept-invite
       #/diagnostic / #/roi-calculator     → public (K1A/K2A)
       #/help[?section=...]                → help (section read by HelpPage)
       #/audit/history                     → audit history (J3)
       #/reports                           → reports list                       */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Deep-link entry. The branch chain lives in routeFromHash (lib/routing/
    // hashRoute.ts) so it is testable — inline here it was unreachable by any test,
    // and #/signup and bare #/billing had silently never been given a branch.
    // No match → leave the route alone (unchanged fall-through behaviour).
    const parsed = routeFromHash(window.location.hash);
    if (parsed) navigate(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Stripe redirect detection (J1.2 + J1.4A) ─────────────
     Subscription Checkout returns to:
       - /#/billing/success?session_id=cs_test_... → BillingSuccessPage (sync)
       - /?billing_status=success&session_id=...   → legacy, root query string
       - /#/billing?status=cancel
     Token top-up Checkout (J1.4A) returns to:
       - /#/billing/tokens?topup=success&session_id=...
       - /#/billing/tokens?topup=cancel
     Token top-ups MUST NOT route to BillingSuccessPage — that page calls
     /api/billing/sync-session and produces a "Sync failed" UX for one-time
     payments. TokensPage handles topup query params itself.
     URL is NOT stripped here — child pages still need the params intact. */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash      = window.location.hash;
    const search    = window.location.search;
    const queryStr  = hash.includes('?') ? hash.slice(hash.indexOf('?')) : search;
    const params    = new URLSearchParams(queryStr);
    const status    = params.get('billing_status') ?? params.get('status');
    const sessionId = params.get('session_id');

    // Tokens top-up — let TokensPage handle the query params.
    if (hash.startsWith('#/billing/tokens')) {
      navigate({ name: 'billing/tokens' });
      return;
    }

    // Subscription success — strict path match. Do NOT trigger on bare
    // `session_id` presence; that misroutes token top-ups.
    const inSubSuccess =
      hash.startsWith('#/billing/success') ||
      (status === 'success' && !hash.startsWith('#/billing/tokens'));
    const inSubCancel =
      status === 'cancel' || hash.startsWith('#/billing?status=cancel');

    if (sessionId && inSubSuccess) {
      try { window.sessionStorage.setItem('stripe.lastSessionId', sessionId); } catch { /* ignore */ }
    }

    if (inSubSuccess) {
      navigate({ name: 'billing/success' });
    } else if (inSubCancel) {
      navigate({ name: 'billing' });
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Prefetch critical lazy chunks once user is authenticated ──────
     Pulls the most-visited pages into the browser cache during idle time
     so a later navigation doesn't hit a network at all. Best-effort —
     errors are swallowed (the existing lazyWithRetry + ErrorBoundary
     chunk-aware fallback still cover the failure path). */
  useEffect(() => {
    if (!isAuthenticated || !session?.orgId) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800));
    schedule(() => {
      // Fire-and-forget; chunks just need to land in the HTTP cache.
      // KEEP THIS LIST TIGHT — only routes a typical authenticated user
      // is highly likely to open in the first 30 seconds. Action-triggered
      // pages (report detail, operator console, agents detail, …) stay
      // lazy on-demand to avoid wasting bandwidth.
      void import('./pages/DashboardPage').catch(() => {});
      void import('./pages/NewAuditPage').catch(() => {});
      void import('./pages/ReportsListPage').catch(() => {});
    });
  }, [isAuthenticated, session?.orgId]);

  /* ── Audit Express continuity (J16.1): an anonymous run is preserved in
     localStorage by the static /audit-express page. Once authenticated, hand it
     off — auto-save to the org (idempotent server-side) then open Saved Audits,
     so the result is never lost across signup/login. Runs once per session. */
  const handoffDone = useRef(false);
  useEffect(() => {
    if (handoffDone.current || !isAuthenticated || !session?.orgId) return;
    let raw: string | null = null;
    try { raw = localStorage.getItem('ailunapro.auditExpress.pending'); } catch { /* ignore */ }
    if (!raw) return;
    handoffDone.current = true;
    const clear = () => { try { localStorage.removeItem('ailunapro.auditExpress.pending'); } catch { /* ignore */ } };
    let payload: { taps?: unknown; extractSnapshot?: unknown; createdAt?: string } | null = null;
    try { payload = JSON.parse(raw); } catch { clear(); return; }
    if (!payload || !payload.taps || typeof payload.createdAt !== 'string') { clear(); return; }
    const orgId = session.orgId;
    void import('./lib/auditExpress/savedClient')
      .then(m => m.saveAudit(orgId, { taps: payload!.taps, extractSnapshot: payload!.extractSnapshot, createdAt: payload!.createdAt as string }))
      .then(() => { clear(); navigate({ name: 'audit-express/saved' }); })
      .catch(() => { /* keep pending for a later retry; never block the app */ });
  }, [isAuthenticated, session?.orgId, navigate]);

  /* ── Firebase: wait for onAuthStateChanged before rendering ── */
  if (isLoading) {
    // NEVER render null here (white screen), and NEVER a dead-end card: isLoading is
    // now deadline-bounded in AuthContext (≤12s), so this spinner ALWAYS gives way to
    // the app — authenticated, or degraded/unauthenticated with the non-blocking
    // ConnectionBanner handling diagnostics, manual retry, and background reconnects.
    // Spinner classes live in index.html (CSS-independent).
    return (
      <div className="app-boot-loader" role="status" aria-label="Loading">
        <div className="app-boot-spinner" />
      </div>
    );
  }

  /* ── Invite acceptance: render before/after auth (chromeless) ── */
  if (route.name === 'accept-invite') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AcceptInvitePage />
      </Suspense>
    );
  }

  /* ── Diagnostic Express (K1A): public campaign page. B1: adaptive chrome —
       anon gets Log in / Sign up, authed gets "← Back to app". ──── */
  if (route.name === 'diagnostic') {
    return (
      <Suspense fallback={<PageFallback />}>
        <CampaignChrome><DiagnosticPage /></CampaignChrome>
      </Suspense>
    );
  }

  /* ── ROI Calculator (K2A): public campaign page (same adaptive chrome). ── */
  if (route.name === 'roi-calculator') {
    return (
      <Suspense fallback={<PageFallback />}>
        <CampaignChrome><RoiCalculatorPage /></CampaignChrome>
      </Suspense>
    );
  }

  /* ── Quote (Q1): public campaign page (same adaptive chrome). ── */
  if (route.name === 'quote') {
    return (
      <Suspense fallback={<PageFallback />}>
        <CampaignChrome><QuoteRequestPage /></CampaignChrome>
      </Suspense>
    );
  }

  /* ── Quote result: post-submit confirmation (also the email Accept landing). ── */
  if (route.name === 'quote/result') {
    return (
      <Suspense fallback={<PageFallback />}>
        <CampaignChrome><QuoteResultPage /></CampaignChrome>
      </Suspense>
    );
  }

  /* ── Quote status: public state-tracking view (progress indicator). ── */
  if (route.name === 'quote/status') {
    return (
      <Suspense fallback={<PageFallback />}>
        <CampaignChrome><QuoteStatusPage /></CampaignChrome>
      </Suspense>
    );
  }

  /* ── Unauthenticated: auth pages only ──────────────────── */
  if (!isAuthenticated) {
    const authPage =
      route.name === 'signup'          ? <SignupPage /> :
      route.name === 'forgot-password' ? <ForgotPasswordPage /> :
                                         <LoginPage />;
    return <Suspense fallback={<PageFallback />}>{authPage}</Suspense>;
  }

  /* Wrap authenticated content with the lazy Firestore-backed providers.
     Suspense covers both the providers' lazy chunk and lazy page chunks. */
  const authed = (node: ReactNode) => (
    <Suspense fallback={<PageFallback />}>
      <AuthedProviders>{node}</AuthedProviders>
    </Suspense>
  );

  /* ── Authenticated: org-creation wizard (no chrome) ────── */
  /* J1.3C: also force org-create when user has no workspace yet. */
  if (route.name === 'org/create' || (isAuthenticated && !session?.orgId)) {
    return authed(<OrgCreatePage />);
  }

  /* ── Shared-report view (chromeless) ───────────────────── */
  if (route.name === 'reports/share') {
    return authed(
      <div className="dashboard-layout shared-layout">
        <main className="dashboard-content shared-content">
          <PageOutlet />
        </main>
      </div>,
    );
  }

  /* ── Full dashboard shell ───────────────────────────────── */
  const mainMarginLeft = isMobile ? 0 : (sidebarCollapsed ? 72 : 240);
  return authed(
    <div className="dashboard-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      {isMobile && mobileNavOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.40)', zIndex: 45 }}
        />
      )}
      <div className="dashboard-main" style={{ marginLeft: mainMarginLeft, transition: 'margin-left 0.2s ease' }}>
        <Topbar
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileNavOpen}
        />
        <main className="dashboard-content">
          <JourneyProgress />
          <PageOutlet />
        </main>
      </div>
      <BackToTop />
    </div>,
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PreferencesProvider>
        <LocaleProvider>
        <ToastProvider>
          <SessionValueProvider>
          <RouteProvider>
            <AuthProvider>
              {/* Data-layer providers are lazy-mounted inside AppShell around
                  authenticated content (see AuthedProviders) so Firestore stays
                  off the eager boot/login path. */}
              <AppShell />
              <ConnectionBanner />
              <ConsentBanner />
              <AnalyticsBlockedNotice />
            </AuthProvider>
          </RouteProvider>
          </SessionValueProvider>
        </ToastProvider>
        </LocaleProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
