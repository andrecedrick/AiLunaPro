import { useState } from 'react';
import { useReports } from '../../context/ReportsContext';
import { useRoute } from '../../context/RouteContext';
import type { Report } from '../../types/report';
import type { AuditResult } from '../../types/scoring';
import { EmailDialog } from './EmailDialog';

interface Props {
  report: Report;
  result: AuditResult;
  /** Hide the share button if we're already on the share page. */
  hideShare?: boolean;
}

/* In-app shareable link (hash route). Reopens the shared report view for
   authenticated users in the same workspace. NOT a public/external link —
   external stakeholder sharing (public read endpoint, signed/expiring links)
   is a separate deferred backend feature. */
function buildShareUrl(reportId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://audit.ailunapro.com';
  return `${origin}/#/reports/share/${reportId}`;
}

/* Trigger a real download of the report data as JSON.
   The "PDF" framing is honest at the data layer; only rendering is deferred. */
function downloadJson(report: Report, result: AuditResult) {
  const payload = {
    meta: {
      generatedBy: 'AiLunaPro — UI shell mock',
      reportId: report.id,
      title: report.title,
      createdAt: report.createdAt,
      status: report.status,
    },
    score: {
      global: result.globalScore,
      risk: result.riskLevel,
      maturity: result.maturityLevel,
      sections: result.sectionScores,
    },
    findings: result.findings,
    recommendations: result.recommendations,
    roadmap: result.roadmap,
    contextFlags: result.contextFlags,
    answers: report.answersSnapshot,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${report.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportBar({ report, result, hideShare = false }: Props) {
  const { recordExport } = useReports();
  const { navigate } = useRoute();
  const [emailOpen, setEmailOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [printedFlash, setPrintedFlash] = useState(false);

  const handlePdf = () => {
    setPdfBusy(true);
    setTimeout(() => {
      downloadJson(report, result);
      recordExport(report.id, 'pdf', { format: 'json-mock', filename: `report-${report.id}.json` });
      setPdfBusy(false);
      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 2000);
    }, 800);
  };

  const handlePrint = () => {
    recordExport(report.id, 'print');
    setPrintedFlash(true);
    setTimeout(() => setPrintedFlash(false), 1500);
    // Defer to next tick so React can repaint the flash before the print dialog opens.
    setTimeout(() => window.print(), 50);
  };

  const handleShare = async () => {
    const url = buildShareUrl(report.id);
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      // Fallback: open prompt with the link selected. Stay graceful.
      copied = false;
    }
    recordExport(report.id, 'share-link', { url, clipboard: copied ? 'ok' : 'unavailable' });
    if (copied) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <>
      <div
        className="export-bar"
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <ExportButton onClick={handlePdf} disabled={pdfBusy} primary>
          {pdfBusy ? '⏳ Exporting…' : pdfDone ? '✓ Exported' : '⬇ Export (JSON)'}
        </ExportButton>

        <ExportButton onClick={() => setEmailOpen(true)}>
          ✉ Send by email
        </ExportButton>

        <ExportButton onClick={handlePrint}>
          {printedFlash ? '✓ Printing…' : '🖨 Print'}
        </ExportButton>

        {!hideShare && (
          <>
            <ExportButton onClick={handleShare}>
              {shareCopied ? '✓ Link copied' : '🔗 Copy share link'}
            </ExportButton>

            <button
              type="button"
              onClick={() => navigate({ name: 'reports/share', reportId: report.id })}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 12,
                color: 'var(--violet-text)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Open shared view →
            </button>
          </>
        )}
      </div>

      {emailOpen && (
        <EmailDialog
          report={report}
          onClose={() => setEmailOpen(false)}
          onSent={recipient => {
            recordExport(report.id, 'email', { recipient });
          }}
        />
      )}
    </>
  );
}

function ExportButton({
  children,
  onClick,
  disabled = false,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        border: primary ? 'none' : '1.5px solid var(--border-strong)',
        background: primary ? 'var(--brand-gradient)' : 'var(--surface)',
        color: primary ? '#fff' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        fontFamily: 'var(--font-body)',
        transition: 'opacity 0.15s, transform 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}
