import { useEffect, useMemo, useRef } from 'react';
import { useAudit } from '../context/AuditContext';
import { useReports } from '../context/ReportsContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';

/**
 * Auto-report on submit — OFF by default. Enable only via the build-time flag
 * VITE_AUTO_REPORT_ON_SUBMIT='true'. When off, behavior is unchanged: a report
 * is created only when the user clicks Generate report.
 */
const AUTO_REPORT_ON_SUBMIT = import.meta.env.VITE_AUTO_REPORT_ON_SUBMIT === 'true';
import { formatDate } from '../utils/formatters';
import { ResultHero } from '../components/result/ResultHero';
import { AudioExplanation } from '../components/result/AudioExplanation';
import { SectionScores } from '../components/result/SectionScores';
import { Roadmap } from '../components/result/Roadmap';
import { ExplainedResults } from '../components/result/ExplainedResults';
import { ActionPlan } from '../components/result/ActionPlan';
import { Disclaimer } from '../components/result/Disclaimer';
import { AssistanceTeaser } from '../components/result/AssistanceTeaser';
import { ResultActions } from '../components/result/ResultActions';
import { JourneyNext } from '../components/journey/JourneyNext';

/**
 * Audit Result page.
 * Phase 4: scoring runs client-side from the submitted draft answers.
 * No backend, no Firestore. Result data lives only in localStorage.
 */
export function AuditResultPage() {
  const { draft } = useAudit();
  const { reports, createReport } = useReports();
  const T = useLocale();

  const result = useMemo(() => computeAuditResult(draft.answers), [draft.answers]);

  const submittedAt = formatDate(draft.submittedAt || draft.updatedAt, 'datetime');

  // The submission-ID line wraps the raw draft id in a <code> element, so we
  // split the localized template around the {id} placeholder and render each
  // side separately (keeping the id verbatim, never translated).
  const [submissionIdBefore, submissionIdAfter] =
    T.auditResultPage.header.submissionId.split('{id}');

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
          ✓ {draft.status === 'submitted' ? T.auditResultPage.header.badge.submitted : T.auditResultPage.header.badge.preview}
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
          {T.auditResultPage.header.title}
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          {format(submissionIdBefore, {})}
          <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
            {draft.id}
          </code>
          {format(submissionIdAfter, { submittedAt })}
        </p>
      </div>

      {/* Hero */}
      <ResultHero result={result} />
      <AudioExplanation result={result} />

      {/* Section breakdown */}
      <SectionScores result={result} />

      {/* Pedagogical, conversion-oriented explanation of findings + actions
          (replaces the flat findings/recommendations lists). */}
      <ExplainedResults result={result} />

      {/* Roadmap */}
      <ActionPlan result={result} />
      <Roadmap result={result} />

      {/* Bridge into the post-audit assistance flow */}
      <AssistanceTeaser result={result} />

      {/* J9: mandatory advisory disclaimer (informational, not legal advice). */}
      <Disclaimer />

      {/* B8.2: guided "Understanding & value → Next action" (replaces the static
          System Builder CTA with a guided proposal; deterministic, reversible). */}
      <JourneyNext
        summary={{
          headline: T.auditResultPage.journeyNext.headline,
          lines: [
            format(T.auditResultPage.journeyNext.summary.overallScore, {
              score: result.globalScore,
              risk: result.riskLevel,
            }),
            format(
              result.findings.length === 1 && result.recommendations.length === 1
                ? T.auditResultPage.journeyNext.summary.findingsSingular
                : T.auditResultPage.journeyNext.summary.findingsPlural,
              { n: result.findings.length, m: result.recommendations.length },
            ),
            format(T.auditResultPage.journeyNext.summary.maturity, {
              level: result.maturityLevel,
            }),
          ],
        }}
      />

      {/* Actions */}
      <ResultActions />
    </div>
  );
}
