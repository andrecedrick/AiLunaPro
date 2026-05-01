import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { RouteProvider, useRoute } from './context/RouteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { ReportsProvider } from './context/ReportsContext';
import { RegistryProvider } from './context/RegistryContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { NewAuditPage } from './pages/NewAuditPage';
import { AuditResultPage } from './pages/AuditResultPage';
import { AuditAssistancePage } from './pages/AuditAssistancePage';
import { ReportsListPage } from './pages/ReportsListPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportSharePage } from './pages/ReportSharePage';
import { RegistryPage } from './pages/RegistryPage';
import { TeamPage } from './pages/TeamPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OrgCreatePage } from './pages/OrgCreatePage';

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
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  })();

  return <ErrorBoundary>{page}</ErrorBoundary>;
}

function AppShell() {
  const { route } = useRoute();
  const { isAuthenticated, isLoading } = useAuth();

  /* ── Firebase: wait for onAuthStateChanged before rendering ── */
  /* Prevents flash of LoginPage for already-authenticated users. */
  if (isLoading) return null;

  /* ── Unauthenticated: auth pages only ──────────────────── */
  if (!isAuthenticated) {
    if (route.name === 'signup')           return <SignupPage />;
    if (route.name === 'forgot-password')  return <ForgotPasswordPage />;
    return <LoginPage />;
  }

  /* ── Authenticated: org-creation wizard (no chrome) ────── */
  if (route.name === 'org/create') return <OrgCreatePage />;

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
                    <AppShell />
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
