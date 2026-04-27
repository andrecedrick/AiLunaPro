import { useMemo } from 'react';
import { useAudit } from '../context/AuditContext';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';
import { AssistanceHeader } from '../components/assistance/AssistanceHeader';
import { DetectedSummary } from '../components/assistance/DetectedSummary';
import { PriorityActions } from '../components/assistance/PriorityActions';
import { AutomationStructure } from '../components/assistance/AutomationStructure';
import { WhyItMatters } from '../components/assistance/WhyItMatters';
import { ImpactProjection } from '../components/assistance/ImpactProjection';
import { NextStep } from '../components/assistance/NextStep';

/**
 * Post-audit assistance page.
 * Phase 5 — turns the AuditResult into a guided strategic action plan.
 * Pure derivations (no backend, no Firestore, no Stripe).
 */
export function AuditAssistancePage() {
  const { draft } = useAudit();
  const result = useMemo(() => computeAuditResult(draft.answers), [draft.answers]);

  return (
    <div>
      <AssistanceHeader result={result} />
      <DetectedSummary result={result} />
      <PriorityActions result={result} />
      <AutomationStructure result={result} />
      <WhyItMatters result={result} />
      <ImpactProjection result={result} />
      <NextStep result={result} />
    </div>
  );
}
