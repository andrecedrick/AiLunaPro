import './App.css';
import { ThemeProvider } from './context/ThemeContext';
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
import { OrgCreatePage } from './pages/OrgCreatePage';

function PageOutlet() {
  const { route } = useRoute();

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
}

function AppShell() {
  const { route } = useRoute();
  const { isAuthenticated } = useAuth();

  /* ── Unauthenticated: auth pages only ──────────────────── */
  if (!isAuthenticated) {
    if (route.name === 'signup') return <SignupPage />;
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
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
