import { Button } from '../ui/Button';
import { useAudit } from '../../context/AuditContext';
import { useRoute } from '../../context/RouteContext';
import { GenerateReportButton } from '../reports/GenerateReportButton';

export function ResultActions() {
  const { resetDraft } = useAudit();
  const { navigate } = useRoute();

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 4,
      }}
    >
      {/* Phase 6 — Export PDF is replaced by Generate report.
          Snapshots the audit into a Report and navigates to its detail view. */}
      <GenerateReportButton />
      <Button variant="secondary" size="lg" onClick={() => navigate({ name: 'reports' })}>
        View all reports →
      </Button>
      <Button variant="ghost" size="lg" onClick={() => navigate({ name: 'dashboard' })}>
        View on Dashboard
      </Button>
      <Button
        variant="ghost"
        size="lg"
        onClick={() => {
          resetDraft();
          navigate({ name: 'audit/new' });
        }}
      >
        Start a new audit
      </Button>
    </div>
  );
}
