import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { RouteProvider, useRoute } from './context/RouteContext';
import { AuditProvider } from './context/AuditContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { NewAuditPage } from './pages/NewAuditPage';
import { AuditResultPage } from './pages/AuditResultPage';

function PageOutlet() {
  const { route } = useRoute();

  switch (route.name) {
    case 'audit/new':
      return <NewAuditPage />;
    case 'audit/result':
      return <AuditResultPage />;
    case 'dashboard':
    default:
      return <DashboardPage />;
  }
}

function AppShell() {
  return (
    <div className="dashboard-layout">
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Main area — pushed right of sidebar */}
      <div className="dashboard-main">
        {/* Sticky top bar */}
        <Topbar />

        {/* Scrollable content */}
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
          <AppShell />
        </AuditProvider>
      </RouteProvider>
    </ThemeProvider>
  );
}

export default App;
