import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { HeroSummary } from './components/dashboard/HeroSummary';
import { KPICards } from './components/dashboard/KPICards';
import { AnalyticsSection } from './components/dashboard/AnalyticsSection';
import { AutomationOpportunities } from './components/dashboard/AutomationOpportunities';
import { BusinessImpact } from './components/dashboard/BusinessImpact';
import { RecentReports } from './components/dashboard/RecentReports';
import { CTABlock } from './components/dashboard/CTABlock';

function App() {
  return (
    <ThemeProvider>
      <div className="dashboard-layout">
        {/* Fixed left sidebar */}
        <Sidebar />

        {/* Main area — pushed right of sidebar */}
        <div className="dashboard-main">
          {/* Sticky top bar */}
          <Topbar />

          {/* Scrollable content */}
          <main className="dashboard-content">
            <HeroSummary />
            <KPICards />
            <AnalyticsSection />
            <AutomationOpportunities />
            <BusinessImpact />
            <RecentReports />
            <CTABlock />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
