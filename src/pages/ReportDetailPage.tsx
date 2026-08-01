import { useEffect, useMemo, useState } from 'react';
import { useReports } from '../context/ReportsContext';
import { useRoute } from '../context/RouteContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { computeAuditResult } from '../lib/scoring/computeAuditResult';
import {
  downloadReport, renameReport, ReportApiError,
  getReportShareState, createReportShareLink, regenerateReportShareLink, revokeReportShare, setReportSharingDisabled,
  type ReportShareState,
} from '../lib/reports/reportApiClient';
import { PdfLimitModal } from '../components/auditExpress/PdfLimitModal';
import { ReportHeader } from '../components/reports/ReportHeader';
import { ExportHistory } from '../components/reports/ExportHistory';
import { EnrichmentPanel } from '../components/reports/EnrichmentPanel';
import { Button } from '../components/ui/Button';
import { ResultHero } from '../components/result/ResultHero';
import { AudioExplanation } from '../components/result/AudioExplanation';
import { SectionScores } from '../components/result/SectionScores';
import { FindingsList } from '../components/result/FindingsList';
import { RecommendationsList } from '../components/result/RecommendationsList';
import { Roadmap } from '../components/result/Roadmap';
import { ActionPlan } from '../components/result/ActionPlan';
import { Disclaimer } from '../components/result/Disclaimer';
import { PostResultTools } from '../components/result/PostResultTools';
import { auditSections } from '../data/mockAuditQuestions';

export function ReportDetailPage() {
  const { route, navigate } = useRoute();
  const { getReport, getExportsForReport, deleteReport, status } = useReports();
  const { session } = useAuth();
  const T = useLocale();
  const orgId = session?.orgId ?? '';

  const reportId = route.name === 'reports/detail' ? route.reportId : '';
  const report = getReport(reportId);

  const result = useMemo(
    () => (report ? computeAuditResult(report.answersSnapshot) : null),
    [report],
  );

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [savingTitle, setSavingTitle] = useState(false);
  const [shareState, setShareState] = useState<ReportShareState | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [shareLimit, setShareLimit] = useState(false);
  const [pendingRegen, setPendingRegen] = useState(false);
  const [copied, setCopied] = useState(false);

  const canShare = session?.role === 'owner' || session?.role === 'admin';

  // Load share metadata (owners/admins only) so the Sharing card shows status.
  useEffect(() => {
    if (!orgId || !report || !canShare) return;
    let live = true;
    getReportShareState(orgId, report.id).then(s => { if (live) setShareState(s); }).catch(() => { /* card simply hidden */ });
    return () => { live = false; };
  }, [orgId, report, canShare]);

  if (status === 'loading') {
    return (
      <p style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        {T.reportsPages.detail.loading}
      </p>
    );
  }

  if (!report || !result) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 22,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {T.reportsPages.detail.notFoundTitle}
        </h2>
        <p style={{ margin: '8px 0 18px', fontSize: 14, color: 'var(--text-muted)' }}>
          {T.reportsPages.detail.notFoundBody}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate({ name: 'reports' })}>
          {T.reportsPages.detail.backToReports}
        </Button>
      </div>
    );
  }

  const events = getExportsForReport(report.id);
  const weakestSection = auditSections.find(s => s.key === report.weakestSection);
  const displayReport = titleOverride ? { ...report, title: titleOverride } : report;

  const onDownload = async (useTokens = false) => {
    setPdfBusy(true); setPdfError(null);
    try { await downloadReport(orgId, report.id, useTokens); setLimitOpen(false); }
    catch (e) {
      const code = e instanceof ReportApiError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') setLimitOpen(true);
      else if (code === 'TOKENS_INSUFFICIENT') { setLimitOpen(false); setPdfError(T.reportsPages.detail.errors.tokensInsufficientExport); }
      else setPdfError(T.reportsPages.detail.errors.downloadFailed);
    } finally { setPdfBusy(false); }
  };
  const onRename = async () => {
    setSavingTitle(true); setPdfError(null);
    try { setTitleOverride(await renameReport(orgId, report.id, draft.trim())); setEditing(false); }
    catch (e) { setPdfError(e instanceof ReportApiError && e.code === 'FORBIDDEN' ? T.reportsPages.detail.errors.renameForbidden : T.reportsPages.detail.errors.renameFailed); }
    finally { setSavingTitle(false); }
  };

  // ── Share lifecycle ──
  const mintShare = async (regen: boolean, useTokens = false) => {
    setShareBusy(true); setPdfError(null); setPendingRegen(regen);
    try {
      const link = regen ? await regenerateReportShareLink(orgId, report.id, useTokens) : await createReportShareLink(orgId, report.id, useTokens);
      setShareUrl(link.url); setShareExpiry(link.expiresAt); setShareLimit(false); setCopied(false);
      setShareState(prev => ({ shareVersion: (prev?.shareVersion ?? 1) + (regen ? 1 : 0), sharedAt: new Date().toISOString(), sharedExpiresAt: link.expiresAt, shareRevokedAt: '', sharingDisabled: prev?.sharingDisabled ?? false }));
    } catch (e) {
      const code = e instanceof ReportApiError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') setShareLimit(true);
      else if (code === 'TOKENS_INSUFFICIENT') { setShareLimit(false); setPdfError(T.reportsPages.detail.errors.tokensInsufficient); }
      else if (code === 'SHARE_DISABLED') setPdfError(T.reportsPages.detail.errors.shareDisabled);
      else if (code === 'FORBIDDEN') setPdfError(T.reportsPages.detail.errors.shareForbidden);
      else setPdfError(T.reportsPages.detail.errors.shareCreateFailed);
    } finally { setShareBusy(false); }
  };
  const onRevoke = async () => {
    setShareBusy(true); setPdfError(null);
    try {
      await revokeReportShare(orgId, report.id);
      setShareUrl(''); setShareExpiry('');
      setShareState(prev => ({ shareVersion: (prev?.shareVersion ?? 1) + 1, sharedAt: '', sharedExpiresAt: '', shareRevokedAt: new Date().toISOString(), sharingDisabled: prev?.sharingDisabled ?? false }));
    } catch { setPdfError(T.reportsPages.detail.errors.revokeFailed); }
    finally { setShareBusy(false); }
  };
  const onToggleSharing = async () => {
    if (!shareState) return;
    setShareBusy(true); setPdfError(null);
    try {
      const disabled = await setReportSharingDisabled(orgId, report.id, !shareState.sharingDisabled);
      setShareState(prev => (prev ? { ...prev, sharingDisabled: disabled } : prev));
      if (disabled) setShareUrl('');
    } catch { setPdfError(T.reportsPages.detail.errors.toggleSharingFailed); }
    finally { setShareBusy(false); }
  };
  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => setCopied(true)).catch(() => { /* clipboard unavailable */ });
  };
  const shareStatus = (s: ReportShareState): 'Disabled' | 'Active' | 'Revoked' | 'Expired' | 'None' => {
    if (s.sharingDisabled) return 'Disabled';
    const exp = s.sharedExpiresAt ? Date.parse(s.sharedExpiresAt) : 0;
    if (s.sharedAt && exp > Date.now()) return 'Active';
    if (s.shareRevokedAt && !s.sharedAt) return 'Revoked';
    if (s.sharedExpiresAt && exp <= Date.now()) return 'Expired';
    return 'None';
  };

  return (
    <div>
      {editing && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <input value={draft} maxLength={80} autoFocus onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void onRename(); if (e.key === 'Escape') setEditing(false); }}
            aria-label={T.reportsPages.detail.rename.titleAriaLabel}
            style={{ flex: '1 1 320px', minWidth: 0, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 700 }} />
          <Button variant="primary" size="md" onClick={onRename} disabled={savingTitle}>{savingTitle ? T.reportsPages.detail.rename.saving : T.reportsPages.detail.rename.saveTitle}</Button>
          <Button variant="ghost" size="md" onClick={() => setEditing(false)}>{T.reportsPages.detail.rename.cancel}</Button>
        </div>
      )}
      {pdfError && (
        <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-text)', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginBottom: 12 }}>{pdfError}</div>
      )}
      <ReportHeader report={displayReport} result={result} />

      {/* Primary actions — placed at the top (by the header) so the premium PDF
          export + rename are immediately visible, not buried in the footer. */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0 4px' }} className="report-primary-actions">
        <Button variant="primary" size="md" disabled={pdfBusy} onClick={() => onDownload(false)}>
          {pdfBusy ? T.reportsPages.detail.download.preparing : T.reportsPages.detail.download.downloadPdf}
        </Button>
        <Button variant="secondary" size="md" onClick={() => { setDraft(displayReport.title); setEditing(true); }}>
          {T.reportsPages.detail.rename.renameButton}
        </Button>
      </div>

      {canShare && shareState && (() => {
        const st = shareStatus(shareState);
        const isActive = st === 'Active';
        const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', padding: 16, margin: '12px 0' };
        return (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{T.reportsPages.detail.share.heading}</div>
              <StatusBadge status={st} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: '6px 0 12px' }}>
              {T.reportsPages.detail.share.description}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {isActive ? (
                <>
                  <Button variant="primary" size="md" disabled={shareBusy} onClick={() => mintShare(true)}>{shareBusy ? T.reportsPages.detail.share.working : T.reportsPages.detail.share.generateNewLink}</Button>
                  <Button variant="ghost" size="md" disabled={shareBusy} onClick={onRevoke}>{T.reportsPages.detail.share.revoke}</Button>
                </>
              ) : (
                <Button variant="primary" size="md" disabled={shareBusy || st === 'Disabled'} onClick={() => mintShare(false)}>{shareBusy ? T.reportsPages.detail.share.working : T.reportsPages.detail.share.shareLink}</Button>
              )}
              <Button variant="ghost" size="md" disabled={shareBusy} onClick={onToggleSharing}>
                {shareState.sharingDisabled ? T.reportsPages.detail.share.enableSharing : T.reportsPages.detail.share.disableSharing}
              </Button>
            </div>
            {shareUrl && st !== 'Disabled' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input readOnly value={shareUrl} onFocus={e => e.currentTarget.select()}
                    style={{ flex: '1 1 280px', minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 12.5, fontFamily: 'var(--font-mono, monospace)' }} />
                  <Button variant="ghost" size="md" onClick={copyShare}>{copied ? T.reportsPages.detail.share.copied : T.reportsPages.detail.share.copy}</Button>
                </div>
                {shareExpiry && <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '8px 0 0' }}>{format(T.reportsPages.detail.share.expires, { date: new Date(shareExpiry).toLocaleString() })}</p>}
              </div>
            )}
            {!shareUrl && isActive && shareState.sharedExpiresAt && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '10px 0 0' }}>{format(T.reportsPages.detail.share.activeLinkExists, { date: new Date(shareState.sharedExpiresAt).toLocaleString() })}</p>
            )}
            {st === 'Disabled' && <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '10px 0 0' }}>{T.reportsPages.detail.share.disabledNotice}</p>}
          </div>
        );
      })()}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 20,
          alignItems: 'flex-start',
        }}
        className="report-grid"
      >
        {/* Main column — reused result components, fed from snapshot */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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

          {/* Public-source enrichment (§26.10). Rendered only when a frozen
              evidence snapshot is attached — an empty panel would read as
              "nothing found" rather than "never collected". */}
          {orgId && displayReport.enrichmentSnapshotId && (
            <div style={{ marginBottom: 20 }}>
              <EnrichmentPanel orgId={orgId} snapshotId={displayReport.enrichmentSnapshotId} />
            </div>
          )}

          {/* J9: mandatory advisory disclaimer. */}
          <Disclaimer />

          {/* Footer actions */}
          <div
            className="report-footer-actions"
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 4,
              flexWrap: 'wrap',
            }}
          >
            <Button variant="secondary" size="md" onClick={() => navigate({ name: 'reports' })}>
              {T.reportsPages.detail.backToReports}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate({ name: 'audit/assistance' })}
            >
              {T.reportsPages.detail.footer.openAssistancePlan}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                if (confirm(T.reportsPages.detail.footer.deleteConfirm)) {
                  deleteReport(report.id);
                  navigate({ name: 'reports' });
                }
              }}
              style={{ color: 'var(--red-text)', borderColor: 'var(--border-strong)' }}
            >
              {T.reportsPages.detail.footer.deleteReport}
            </Button>
          </div>

          {/* Change B: subtle post-result re-engagement with the quick tools. */}
          <PostResultTools />
        </div>

        {/* Aside */}
        <aside
          className="report-aside"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'sticky',
            top: 92,
            alignSelf: 'flex-start',
          }}
        >
          <Metadata report={displayReport} weakestSectionTitle={weakestSection?.title} />
          <ExportHistory events={events} />
        </aside>
      </div>

      <PdfLimitModal
        open={limitOpen}
        busy={pdfBusy}
        onUseTokens={() => onDownload(true)}
        onBuyTokens={() => { setLimitOpen(false); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => setLimitOpen(false)}
      />
      <PdfLimitModal
        open={shareLimit}
        busy={shareBusy}
        actionLabel={T.reportsPages.detail.share.useTokensAndCreateLink}
        onUseTokens={() => mintShare(pendingRegen, true)}
        onBuyTokens={() => { setShareLimit(false); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => setShareLimit(false)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'Disabled' | 'Active' | 'Revoked' | 'Expired' | 'None' }) {
  const T = useLocale();
  if (status === 'None') return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{T.reportsPages.detail.status.notShared}</span>;
  const palette: Record<string, { bg: string; fg: string }> = {
    Active: { bg: '#D1FAE5', fg: '#065F46' },
    Expired: { bg: '#FEF3C7', fg: '#92400E' },
    Revoked: { bg: '#FEE2E2', fg: '#991B1B' },
    Disabled: { bg: '#E5E7EB', fg: '#374151' },
  };
  const label: Record<'Active' | 'Expired' | 'Revoked' | 'Disabled', string> = {
    Active: T.reportsPages.detail.status.active,
    Expired: T.reportsPages.detail.status.expired,
    Revoked: T.reportsPages.detail.status.revoked,
    Disabled: T.reportsPages.detail.status.disabled,
  };
  const p = palette[status];
  return (
    <span style={{ background: p.bg, color: p.fg, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.02em' }}>
      {label[status]}
    </span>
  );
}

function Metadata({
  report,
  weakestSectionTitle,
}: {
  report: import('../types/report').Report;
  weakestSectionTitle?: string;
}) {
  const T = useLocale();
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 18,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--text-primary)',
        }}
      >
        {T.reportsPages.detail.metadata.heading}
      </h3>

      <Row label={T.reportsPages.detail.metadata.reportId}>
        <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
          {report.id}
        </code>
      </Row>
      <Row label={T.reportsPages.detail.metadata.sourceDraft}>
        <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
          {report.draftId}
        </code>
      </Row>
      <Row label={T.reportsPages.detail.metadata.status}>
        <span
          style={{
            display: 'inline-flex',
            background: 'var(--green-bg)',
            color: 'var(--green-text)',
            padding: '2px 10px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          {report.status}
        </span>
      </Row>
      {weakestSectionTitle && (
        <Row label={T.reportsPages.detail.metadata.weakestSection}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {weakestSectionTitle}
          </span>
        </Row>
      )}
      <Row label={T.reportsPages.detail.metadata.frameworks}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['EU AI Act', 'GDPR', 'ISO 42001', 'NIST AI RMF'].map(f => (
            <span
              key={f}
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </Row>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '6px 0',
        borderBottom: '1px dashed var(--border)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
    </div>
  );
}
