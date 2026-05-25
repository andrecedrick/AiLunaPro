import { useEffect, useMemo, useRef } from 'react';
import { useAudit } from '../context/AuditContext';
import { useReports } from '../context/ReportsContext';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';

/**
 * Auto-report on submit — OFF by default. Enable only via the build-time flag
 * VITE_AUTO_REPORT_ON_SUBMIT='true'. When off, behavior is unchanged: a report
 * is created only when the user clicks Generate report.
 */
const AUTO_REPORT_ON_SUBMIT = import.meta.env.VITE_AUTO_REPORT_ON_SUBMIT === 'true';
import { formatDate } from '../utils/formatters';
import { ResultHero } from '../components/result/ResultHero';
import { SectionScores } from '../components/result/SectionScores';
import { FindingsList } from '../components/result/FindingsList';
import { RecommendationsList } from '../components/result/RecommendationsList';
import { Roadmap } from '../components/result/Roadmap';
import { AssistanceTeaser } from '../components/result/AssistanceTeaser';
import { ResultActions } from '../components/result/ResultActions';

/**
 * Audit Result page.
 * Phase 4: scoring runs client-side from the submitted draft answers.
 * No backend, no Firestore. Result data lives only in localStorage.
 */
export function AuditResultPage() {
  const { draft } = useAudit();
  const { reports, createReport } = useReports();

  const result = useMemo(() => computeAuditResult(draft.answers), [draft.answers]);

  const submittedAt = formatDate(draft.submittedAt || draft.updatedAt, 'datetime');

  // Auto-report (flag-gated, default OFF). On a submitted audit, create a report
  // snapshot once if none exists for this draft. Guarded to fire at most once.
  const autoReportDone = useRef(false);
  useEffect(() => {
    if (!AUTO_REPORT_ON_SUBMIT) return;
    if (draft.status !== 'submitted') return;
    if (autoReportDone.current) return;
    if (reports.some(r => r.draftId === draft.id)) { autoReportDone.current = true; return; }
    autoReportDone.current = true;
    createReport(draft, result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.status, draft.id, reports]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-block',
            background: 'var(--green-bg)',
            color: 'var(--green-text)',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          ✓ {draft.status === 'submitted' ? 'Audit submitted' : 'Audit preview'}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 28,
            color: 'var(--text-primary)',
            letterSpacing: -0.5,
          }}
        >
          Audit Result
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          Submission ID&nbsp;
          <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
            {draft.id}
          </code>
          &nbsp;·&nbsp;{submittedAt}
        </p>
      </div>

      {/* Hero */}
      <ResultHero result={result} />

      {/* Section breakdown */}
      <SectionScores result={result} />

      {/* Findings + Recommendations side-by-side */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <FindingsList result={result} />
        <RecommendationsList result={result} />
      </div>

      {/* Roadmap */}
      <Roadmap result={result} />

      {/* Bridge into the post-audit assistance flow */}
      <AssistanceTeaser result={result} />

      {/* Actions */}
      <ResultActions />
    </div>
  );
}
