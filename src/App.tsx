import { Suspense, useEffect, useState } from 'react';
import { lazyWithRetry as lazy } from './lib/routing/lazyWithRetry';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ToastProvider } from './context/ToastContext';
import { RouteProvider, useRoute } from './context/RouteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { ReportsProvider } from './context/ReportsContext';
import { RegistryProvider } from './context/RegistryContext';
import { BillingProvider } from './context/BillingContext';
import { TokensProvider } from './context/TokensContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ConsentBanner } from './components/ConsentBanner';
import { AnalyticsBlockedNotice } from './components/AnalyticsBlockedNotice';

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
const HelpPage             = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const SystemBuilderPage    = lazy(() => import('./pages/SystemBuilderPage').then(m => ({ default: m.SystemBuilderPage })));

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
      case 'system-builder':
        return <SystemBuilderPage />;
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

function AppShell() {
  const { route, navigate } = useRoute();
  const { isAuthenticated, isLoading, session } = useAuth();

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
    const h = window.location.hash;
    if (h.startsWith('#/invite/')) {
      navigate({ name: 'accept-invite' });
    } else if (h.startsWith('#/diagnostic')) {
      navigate({ name: 'diagnostic' });
    } else if (h.startsWith('#/roi-calculator')) {
      navigate({ name: 'roi-calculator' });
    } else if (h.startsWith('#/help')) {
      navigate({ name: 'help' });
    } else if (h.startsWith('#/operator')) {
      navigate({ name: 'operator' });
    } else if (h.startsWith('#/system-builder')) {
      navigate({ name: 'system-builder' });
    } else if (h.startsWith('#/audit/history')) {
      navigate({ name: 'audit/history' });
    } else if (h.startsWith('#/reports/share/')) {
      const id = decodeURIComponent(h.slice('#/reports/share/'.length).split(/[?#]/)[0]);
      navigate(id ? { name: 'reports/share', reportId: id } : { name: 'reports' });
    } else if (h.startsWith('#/reports/detail/')) {
      const id = decodeURIComponent(h.slice('#/reports/detail/'.length).split(/[?#]/)[0]);
      navigate(id ? { name: 'reports/detail', reportId: id } : { name: 'reports' });
    } else if (h.startsWith('#/reports')) {
      navigate({ name: 'reports' });
    }
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

  /* ── Firebase: wait for onAuthStateChanged before rendering ── */
  if (isLoading) {
    // Perf P1: fail-fast notice after watchdog timeout instead of blank.
    if (!bootSlow) return null;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--page-bg)' }}>
        <div style={{ maxWidth: 460, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)' }}>
            Still connecting…
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 16px' }}>
            A browser ad-blocker / privacy extension or your network may be blocking{' '}
            <strong>audit.ailunapro.com</strong> or <strong>*.googleapis.com</strong> (Firebase).
            Allow these domains, or reload. The app will continue automatically once it connects.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient, var(--violet))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Reload
          </button>
        </div>
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

  /* ── Diagnostic Express (K1A): public, chromeless, pre-auth ──── */
  if (route.name === 'diagnostic') {
    return (
      <Suspense fallback={<PageFallback />}>
        <DiagnosticPage />
      </Suspense>
    );
  }

  /* ── ROI Calculator (K2A): public, chromeless, pre-auth ──────── */
  if (route.name === 'roi-calculator') {
    return (
      <Suspense fallback={<PageFallback />}>
        <RoiCalculatorPage />
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

  /* ── Authenticated: org-creation wizard (no chrome) ────── */
  /* J1.3C: also force org-create when user has no workspace yet. */
  if (route.name === 'org/create' || (isAuthenticated && !session?.orgId)) {
    return (
      <Suspense fallback={<PageFallback />}>
        <OrgCreatePage />
      </Suspense>
    );
  }

  /* ── Shared-report view (chromeless) ───────────────────── */
  if (route.name === 'reports/share') {
    return (
      <div className="dashboard-layout shared-layout">
        <main className="dashboard-content shared-content">
          <PageOutlet />
        </main>
      </div>
    );
  }

  /* ── Full dashboard shell ───────────────────────────────── */
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <PageOutlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PreferencesProvider>
        <ToastProvider>
          <RouteProvider>
            <AuthProvider>
              <AuditProvider>
                <ReportsProvider>
                  <RegistryProvider>
                    <BillingProvider>
                      <TokensProvider>
                        <AppShell />
                        <ConsentBanner />
                        <AnalyticsBlockedNotice />
                      </TokensProvider>
                    </BillingProvider>
                  </RegistryProvider>
                </ReportsProvider>
              </AuditProvider>
            </AuthProvider>
          </RouteProvider>
        </ToastProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
