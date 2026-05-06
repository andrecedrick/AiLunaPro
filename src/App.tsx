import { lazy, Suspense, useEffect } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { RouteProvider, useRoute } from './context/RouteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { ReportsProvider } from './context/ReportsContext';
import { RegistryProvider } from './context/RegistryContext';
import { BillingProvider } from './context/BillingContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

/* ── Lazy-loaded pages: split bundle, faster initial load ── */
const DashboardPage        = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const NewAuditPage         = lazy(() => import('./pages/NewAuditPage').then(m => ({ default: m.NewAuditPage })));
const AuditResultPage      = lazy(() => import('./pages/AuditResultPage').then(m => ({ default: m.AuditResultPage })));
const AuditAssistancePage  = lazy(() => import('./pages/AuditAssistancePage').then(m => ({ default: m.AuditAssistancePage })));
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

  /* ── Invite link detection (J1.3D) ───────────────────────
     URL: #/invite/{orgId}/{inviteId}/{token}                */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash.startsWith('#/invite/')) {
      navigate({ name: 'accept-invite' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Stripe redirect detection (J1.2) ───────────────────── */
  /* Stripe Checkout returns to:
     - /#/billing/success?session_id=cs_test_... (preferred — hash routing)
     - /?billing_status=success&session_id=...   (legacy)
     - /#/billing?status=cancel
     URL is NOT stripped here — BillingSuccessPage needs session_id intact.
     sessionId is also persisted to sessionStorage so a manual refresh on
     the success page still recovers it. */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash       = window.location.hash;
    const search     = window.location.search;
    const queryStr   = hash.includes('?') ? hash.slice(hash.indexOf('?')) : search;
    const params     = new URLSearchParams(queryStr);
    const status     = params.get('billing_status') ?? params.get('status');
    const sessionId  = params.get('session_id');
    const inSuccess  = hash.startsWith('#/billing/success') || status === 'success' || (sessionId && !hash.includes('cancel'));
    const inCancel   = status === 'cancel' || hash.startsWith('#/billing?status=cancel');

    if (sessionId) {
      try { window.sessionStorage.setItem('stripe.lastSessionId', sessionId); } catch { /* ignore */ }
    }

    if (inSuccess) {
      navigate({ name: 'billing/success' });
      // Do NOT replaceState — BillingSuccessPage still needs to read session_id.
    } else if (inCancel) {
      navigate({ name: 'billing' });
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Firebase: wait for onAuthStateChanged before rendering ── */
  if (isLoading) return null;

  /* ── Invite acceptance: render before/after auth (chromeless) ── */
  if (route.name === 'accept-invite') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AcceptInvitePage />
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
        <ToastProvider>
          <RouteProvider>
            <AuthProvider>
              <AuditProvider>
                <ReportsProvider>
                  <RegistryProvider>
                    <BillingProvider>
                      <AppShell />
                    </BillingProvider>
                  </RegistryProvider>
                </ReportsProvider>
              </AuditProvider>
            </AuthProvider>
          </RouteProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
