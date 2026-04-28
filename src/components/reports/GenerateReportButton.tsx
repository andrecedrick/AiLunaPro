import { useState } from 'react';
import { Button } from '../ui/Button';
import { useAudit } from '../../context/AuditContext';
import { useReports } from '../../context/ReportsContext';
import { useRoute } from '../../context/RouteContext';
import { computeAuditResult } from '../../lib/scoring/computeAuditResult';

/**
 * Primary CTA on the result page — snapshots the current audit answers
 * into a Report record and navigates to the new report's detail view.
 */
export function GenerateReportButton() {
  const { draft } = useAudit();
  const { createReport } = useReports();
  const { navigate } = useRoute();
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    setBusy(true);
    // Tiny artificial delay so the user sees the action — no real work yet.
    setTimeout(() => {
      const result = computeAuditResult(draft.answers);
      const reportId = createReport(draft, result);
      navigate({ name: 'reports/detail', reportId });
    }, 350);
  };

  return (
    <Button variant="primary" size="lg" onClick={handleClick} disabled={busy}>
      {busy ? 'Generating…' : '⬇ Generate report'}
    </Button>
  );
}
