import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { RouteProvider, useRoute } from './context/RouteContext';
import { AuditProvider } from './context/AuditContext';
import { ReportsProvider } from './context/ReportsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { NewAuditPage } from './pages/NewAuditPage';
import { AuditResultPage } from './pages/AuditResultPage';
import { AuditAssistancePage } from './pages/AuditAssistancePage';
import { ReportsListPage } from './pages/ReportsListPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportSharePage } from './pages/ReportSharePage';

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
    case 'dashboard':
    default:
      return <DashboardPage />;
  }
}

function AppShell() {
  const { route } = useRoute();
  /* The shared-report page deliberately drops the chrome so it looks like
     what a stakeholder would receive via the share link. */
  const chromeless = route.name === 'reports/share';

  if (chromeless) {
    return (
      <div className="dashboard-layout shared-layout">
        <main className="dashboard-content shared-content">
          <PageOutlet />
        </main>
      </div>
    );
  }

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
        <AuditProvider>
          <ReportsProvider>
            <AppShell />
          </ReportsProvider>
        </AuditProvider>
      </RouteProvider>
    </ThemeProvider>
  );
}

export default App;
