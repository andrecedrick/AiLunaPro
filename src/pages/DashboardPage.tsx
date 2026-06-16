import { HeroSummary } from '../components/dashboard/HeroSummary';
import { KPICards } from '../components/dashboard/KPICards';
import { AnalyticsSection } from '../components/dashboard/AnalyticsSection';
import { AutomationOpportunities } from '../components/dashboard/AutomationOpportunities';
import { BusinessImpact } from '../components/dashboard/BusinessImpact';
import { QuickToolsCard } from '../components/dashboard/QuickToolsCard';
import { RecentReports } from '../components/dashboard/RecentReports';
import { CTABlock } from '../components/dashboard/CTABlock';

export function DashboardPage() {
  return (
    <>
      <HeroSummary />
      <KPICards />
      <AnalyticsSection />
      <AutomationOpportunities />
      <BusinessImpact />
      <QuickToolsCard />
      <RecentReports />
      <CTABlock />
    </>
  );
}
