import { Button } from '../ui/Button';
import { useAudit } from '../../context/AuditContext';
import { useRoute } from '../../context/RouteContext';

export function ResultActions() {
  const { resetDraft } = useAudit();
  const { navigate } = useRoute();

  const handleExport = () => {
    // Mock — export PDF will be wired up in a later phase.
    // eslint-disable-next-line no-alert
    alert('Export to PDF — coming in a later phase. Your result data is currently stored locally.');
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 4,
      }}
    >
      <Button variant="primary" size="lg" onClick={handleExport}>
        ⬇ Export PDF
      </Button>
      <Button variant="secondary" size="lg" onClick={() => navigate({ name: 'dashboard' })}>
        View on Dashboard →
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
