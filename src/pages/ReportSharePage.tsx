import { useMemo } from 'react';
import { useReports } from '../context/ReportsContext';
import { useRoute } from '../context/RouteContext';
import { useToast } from '../hooks/useToast';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';
import { Button } from '../components/ui/Button';
import { ResultHero } from '../components/result/ResultHero';
import { AudioExplanation } from '../components/result/AudioExplanation';
import { SectionScores } from '../components/result/SectionScores';
import { FindingsList } from '../components/result/FindingsList';
import { RecommendationsList } from '../components/result/RecommendationsList';
import { Roadmap } from '../components/result/Roadmap';
import { ActionPlan } from '../components/result/ActionPlan';
import { Disclaimer } from '../components/result/Disclaimer';
import type { Report } from '../types/report';
import type { RiskLevel } from '../types/scoring';
import { formatDate, formatRiskLevel } from '@/utils/formatters';

/* In-app share URL (hash route). Same-workspace reopen only — NOT a
   public/external link. Mirrors ExportBar.buildShareUrl. */
function buildShareUrl(reportId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://audit.ailunapro.com';
  return `${origin}/#/reports/share/${encodeURIComponent(reportId)}`;
}

const RISK_BADGE: Record<RiskLevel, { bg: string; fg: string }> = {
  low: { bg: 'var(--green-bg)', fg: 'var(--green-text)' },
  medium: { bg: 'var(--amber-bg)', fg: 'var(--amber-text)' },
  high: { bg: 'var(--red-bg)', fg: 'var(--red-text)' },
  critical: { bg: 'var(--critical-bg)', fg: 'var(--critical-text)' },
};

export function ReportSharePage() {
  const { route, navigate } = useRoute();
  const { getReport, recordExport } = useReports();
  const { showToast } = useToast();

  const reportId = route.name === 'reports/share' ? route.reportId : '';
  const report = getReport(reportId);
  const result = useMemo(
    () => (report ? computeAuditResult(report.answersSnapshot) : null),
    [report],
  );

  if (!report || !result) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--text-primary)' }}>
          Shared report unavailable
        </h2>
        <Button variant="primary" size="md" onClick={() => navigate({ name: 'reports' })}>
          ← Back to reports
        </Button>
      </div>
    );
  }

  // In-app / same-workspace copy. No external endpoint, no public access.
  const handleCopyShare = async () => {
    const url = buildShareUrl(report.id);
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      copied = false;
    }
    recordExport(report.id, 'share-link', { url, clipboard: copied ? 'ok' : 'unavailable' });
    showToast(
      copied ? 'Share link copied.' : 'Could not copy link. Try again.',
      copied ? 'success' : 'warning',
    );
  };

  return (
    <div className="shared-report" style={{ maxWidth: 980, margin: '0 auto' }}>
      <SharedBanner
        onCopy={handleCopyShare}
        onBack={() => navigate({ name: 'reports/detail', reportId: report.id })}
      />

      <ReportTopline report={report} />

      <ResultHero result={result} />
      <AudioExplanation result={result} />
      <SectionScores result={result} />
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
      <ActionPlan result={result} />
      <Roadmap result={result} />

      {/* J9: mandatory advisory disclaimer. */}
      <Disclaimer />

      <PoweredByFooter />
    </div>
  );
}

function SharedBanner({ onCopy, onBack }: { onCopy: () => void; onBack: () => void }) {
  return (
    <div
      className="shared-banner"
      style={{
        background: 'var(--brand-gradient)',
        color: '#fff',
        borderRadius: 'var(--card-radius)',
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        boxShadow: 'var(--card-shadow-glow)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            opacity: 0.92,
          }}
        >
          🔗 Shared report — read-only view
        </div>
        <div style={{ fontSize: 13, marginTop: 4, opacity: 0.92 }}>
          Read-only view for people in your workspace, opened from the in-app share link. Internal action buttons are hidden.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCopy}
          style={{
            background: 'rgba(255,255,255,0.16)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            backdropFilter: 'blur(4px)',
          }}
        >
          🔗 Copy share link
        </button>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.16)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            backdropFilter: 'blur(4px)',
          }}
        >
          ← Back to internal view
        </button>
      </div>
    </div>
  );
}

function ReportTopline({ report }: { report: Report }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        AI Compliance Report
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: 26,
          color: 'var(--text-primary)',
          letterSpacing: -0.4,
        }}
      >
        {report.title}
      </h1>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 12,
          flexWrap: 'wrap',
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          Score{' '}
          <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {report.scoreSnapshot}
          </strong>
          /100
        </span>
        <span
          style={{
            display: 'inline-flex',
            background: RISK_BADGE[report.riskSnapshot].bg,
            color: RISK_BADGE[report.riskSnapshot].fg,
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {formatRiskLevel(report.riskSnapshot)}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Generated {formatDate(report.createdAt, 'medium')}
        </span>
      </div>
    </div>
  );
}

function PoweredByFooter() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '24px 0 8px',
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      Powered by AiLunaPro · Compliance Suite
    </div>
  );
}
