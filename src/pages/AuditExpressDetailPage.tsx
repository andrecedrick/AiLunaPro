import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { getSavedAuditDetail, renameAudit, createShareLink, regenerateShareLink, revokeShare, setSharingDisabled, SavedAuditError, type SavedAuditDetail } from '../lib/auditExpress/savedClient';
import { usePdfDownload } from '../lib/auditExpress/usePdfDownload';
import { PdfLimitModal } from '../components/auditExpress/PdfLimitModal';
import { AuditResultView, type AuditPreview, type AuditUnderstanding } from '../components/auditExpress/AuditResultView';
import { EnrichmentPanel } from '../components/reports/EnrichmentPanel';

/** Full in-app view of one saved audit (recomputed, non-PII). Download / rename / back. */
export function AuditExpressDetailPage() {
  const { session } = useAuth();
  const { route, navigate } = useRoute();
  const T = useLocale();
  const orgId = session?.orgId ?? '';
  const auditId = route.name === 'audit-express/detail' ? route.auditId : '';

  const [detail, setDetail] = useState<SavedAuditDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [shareLimit, setShareLimit] = useState(false);
  const [pendingRegen, setPendingRegen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pdf = usePdfDownload(orgId);

  // Create (regen=false) or regenerate (regen=true) a share link. Both count against quota.
  const mint = async (regen: boolean, useTokens = false) => {
    setShareBusy(true); setError(null); setPendingRegen(regen);
    try {
      const link = regen ? await regenerateShareLink(orgId, auditId, useTokens) : await createShareLink(orgId, auditId, useTokens);
      setShareUrl(link.url); setShareExpiry(link.expiresAt); setShareLimit(false); setCopied(false);
      setDetail(prev => prev ? { ...prev, sharedAt: new Date().toISOString(), sharedExpiresAt: link.expiresAt, shareRevokedAt: '', shareVersion: prev.shareVersion + (regen ? 1 : 0) } : prev);
    } catch (e) {
      const code = e instanceof SavedAuditError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') setShareLimit(true);
      else if (code === 'TOKENS_INSUFFICIENT') { setShareLimit(false); setError(T.savedAudits.detailErrors.tokensInsufficient); }
      else if (code === 'SHARE_DISABLED') setError(T.savedAudits.detailErrors.sharingDisabled);
      else setError(T.savedAudits.detailErrors.createShareLink);
    } finally { setShareBusy(false); }
  };
  const onRevoke = async () => {
    setShareBusy(true); setError(null);
    try {
      await revokeShare(orgId, auditId);
      setShareUrl(''); setShareExpiry('');
      setDetail(prev => prev ? { ...prev, sharedAt: '', sharedExpiresAt: '', shareRevokedAt: new Date().toISOString(), shareVersion: prev.shareVersion + 1 } : prev);
    } catch { setError(T.savedAudits.detailErrors.revokeShareLink); }
    finally { setShareBusy(false); }
  };
  const onToggleSharing = async () => {
    if (!detail) return;
    setShareBusy(true); setError(null);
    try {
      const disabled = await setSharingDisabled(orgId, auditId, !detail.sharingDisabled);
      setDetail(prev => prev ? { ...prev, sharingDisabled: disabled } : prev);
      if (disabled) setShareUrl(''); // existing live links stop working immediately
    } catch { setError(T.savedAudits.detailErrors.updateSharing); }
    finally { setShareBusy(false); }
  };
  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => { setCopied(true); }).catch(() => { /* clipboard unavailable */ });
  };
  const shareStatus = (d: SavedAuditDetail): 'Disabled' | 'Active' | 'Revoked' | 'Expired' | 'None' => {
    if (d.sharingDisabled) return 'Disabled';
    const exp = d.sharedExpiresAt ? Date.parse(d.sharedExpiresAt) : 0;
    if (d.sharedAt && exp > Date.now()) return 'Active';
    if (d.shareRevokedAt && !d.sharedAt) return 'Revoked';
    if (d.sharedExpiresAt && exp <= Date.now()) return 'Expired';
    return 'None';
  };

  const load = useCallback(async () => {
    if (!orgId || !auditId) return;
    setError(null);
    try { setDetail(await getSavedAuditDetail(orgId, auditId)); }
    catch (e) { setError(e instanceof SavedAuditError && e.code === 'NOT_FOUND' ? T.savedAudits.detailErrors.notFound : T.savedAudits.detailErrors.load); }
  }, [orgId, auditId, T]);

  useEffect(() => { void load(); }, [load]);

  const onRename = async () => {
    setSavingTitle(true); setError(null);
    try {
      const saved = await renameAudit(orgId, auditId, draft.trim());
      setDetail(prev => (prev ? { ...prev, title: saved } : prev));
      setEditing(false);
    } catch { setError(T.savedAudits.detailErrors.rename); }
    finally { setSavingTitle(false); }
  };

  const cta = (variant: 'primary' | 'ghost'): CSSProperties => ({
    padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
    border: variant === 'ghost' ? '1.5px solid var(--border-strong)' : 'none',
    background: variant === 'ghost' ? 'transparent' : 'var(--brand-gradient, var(--violet))',
    color: variant === 'ghost' ? 'var(--text-secondary)' : '#fff',
  });

  return (
    <div style={{ maxWidth: 760 }}>
      <button type="button" onClick={() => navigate({ name: 'audit-express/saved' })}
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: 10, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        {T.savedAudits.detail.backToList}
      </button>

      {error && <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-text)', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginBottom: 12 }}>{error}</div>}

      {!detail && !error && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{T.savedAudits.detail.loading}</p>}

      {detail && (
        <>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input value={draft} maxLength={80} autoFocus onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void onRename(); if (e.key === 'Escape') setEditing(false); }}
                aria-label={T.savedAudits.detail.titleAriaLabel}
                style={{ flex: '1 1 auto', minWidth: 0, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 700 }} />
              <button type="button" style={cta('primary')} disabled={savingTitle} onClick={onRename}>{savingTitle ? T.savedAudits.detail.busy : T.savedAudits.detail.save}</button>
              <button type="button" style={cta('ghost')} onClick={() => setEditing(false)}>{T.savedAudits.detail.cancel}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: 0 }}>{detail.title}</h1>
              <button type="button" onClick={() => { setEditing(true); setDraft(detail.title); }}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-text, var(--violet))', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {T.savedAudits.detail.rename}
              </button>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            {detail.canonicalUrl ? detail.canonicalUrl + ' · ' : ''}{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : ''} · {T.savedAudits.detail.meta.engineLabel} {detail.engineVersion || T.savedAudits.detail.meta.engineFallback} · {T.savedAudits.detail.meta.confidenceLabel} {detail.confidence}
          </p>

          {detail.preview ? (
            <AuditResultView preview={detail.preview as AuditPreview} understanding={(detail.understanding as AuditUnderstanding | null) ?? null}
              onSeeAgents={() => navigate({ name: 'agents' })}
              onRunFullAudit={() => navigate({ name: 'audit/new' })} />
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 14 }}>{T.savedAudits.detail.notRecomputed}</p>
          )}

          {(detail.recommendedAgents?.length ?? 0) > 0 && (
            <div style={{ marginTop: 14, padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{T.savedAudits.recommendedAgents.heading}</div>
                <button type="button" onClick={() => navigate({ name: 'agents' })}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-text, var(--violet))', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {T.savedAudits.recommendedAgents.exploreAll}
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: '6px 0 12px' }}>{T.savedAudits.recommendedAgents.disclaimer}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(detail.recommendedAgents ?? []).map(a => {
                  const h = a.expectedRoi.timeSavedHoursPerMonth;
                  const meta = [
                    h > 0 ? format(T.savedAudits.recommendedAgents.meta.hoursSaved, { hours: h }) : '',
                    a.minPlan ? format(T.savedAudits.recommendedAgents.meta.plan, { plan: a.minPlan }) : '',
                    a.implementationComplexity ? format(T.savedAudits.recommendedAgents.meta.setup, { complexity: a.implementationComplexity }) : '',
                  ].filter(Boolean).join(' · ');
                  return (
                    <button key={a.agentId} type="button" onClick={() => navigate({ name: 'agents/detail', agentId: a.agentId })}
                      style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface-subtle, var(--bg))', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', fontFamily: 'var(--font-body)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{a.name || a.agentId}</div>
                      {a.tagline && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{a.tagline}</div>}
                      {meta && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{meta}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" style={cta('primary')} disabled={pdf.busy === auditId} onClick={() => pdf.download(auditId)}>
              {pdf.busy === auditId ? T.savedAudits.detail.downloadPdfBusy : T.savedAudits.detail.downloadPdf}
            </button>
            <button type="button" style={cta('ghost')} onClick={() => navigate({ name: 'audit-express/saved' })}>{T.savedAudits.detail.backToSaved}</button>
          </div>
          {pdf.error && <p style={{ color: 'var(--amber-text)', fontSize: 13, marginTop: 8 }}>{pdf.error}</p>}

          {(() => {
            const status = shareStatus(detail);
            const isActive = status === 'Active';
            const expiryText = detail.sharedExpiresAt ? new Date(detail.sharedExpiresAt).toLocaleString() : '';
            return (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{T.savedAudits.share.heading}</div>
                  <StatusBadge status={status} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: '6px 0 12px' }}>
                  {T.savedAudits.share.description}
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {isActive ? (
                    <>
                      <button type="button" style={cta('primary')} disabled={shareBusy} onClick={() => mint(true)}>{shareBusy ? T.savedAudits.share.working : T.savedAudits.share.generateNewLink}</button>
                      <button type="button" style={cta('ghost')} disabled={shareBusy} onClick={onRevoke}>{T.savedAudits.share.revoke}</button>
                    </>
                  ) : (
                    <button type="button" style={cta('primary')} disabled={shareBusy || status === 'Disabled'} onClick={() => mint(false)}>{shareBusy ? T.savedAudits.share.working : T.savedAudits.share.shareLink}</button>
                  )}
                  <button type="button" style={cta('ghost')} disabled={shareBusy} onClick={onToggleSharing}>
                    {detail.sharingDisabled ? T.savedAudits.share.enableSharing : T.savedAudits.share.disableSharing}
                  </button>
                </div>

                {shareUrl && status !== 'Disabled' && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input readOnly value={shareUrl} onFocus={e => e.currentTarget.select()}
                        style={{ flex: '1 1 280px', minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 12.5, fontFamily: 'var(--font-mono, monospace)' }} />
                      <button type="button" style={cta('ghost')} onClick={copyShare}>{copied ? T.savedAudits.share.copied : T.savedAudits.share.copy}</button>
                    </div>
                    {shareExpiry && <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '8px 0 0' }}>{format(T.savedAudits.share.expires, { date: new Date(shareExpiry).toLocaleString() })}</p>}
                  </div>
                )}
                {!shareUrl && isActive && expiryText && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '10px 0 0' }}>{format(T.savedAudits.share.activeLinkExists, { date: expiryText })}</p>
                )}
                {status === 'Disabled' && <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '10px 0 0' }}>{T.savedAudits.share.disabledNotice}</p>}
              </div>
            );
          })()}
        </>
      )}

      {/* Public-source enrichment (§26.10). Shown only when a frozen evidence
          snapshot is attached to this audit. */}
      {orgId && detail?.enrichmentSnapshotId && (
        <div style={{ marginTop: 20 }}>
          <EnrichmentPanel orgId={orgId} snapshotId={detail.enrichmentSnapshotId} />
        </div>
      )}

      <PdfLimitModal
        open={!!pdf.limitFor}
        busy={pdf.busy === pdf.limitFor}
        onUseTokens={() => pdf.limitFor && pdf.download(pdf.limitFor, true)}
        onBuyTokens={() => { pdf.setLimitFor(null); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => pdf.setLimitFor(null)}
      />
      <PdfLimitModal
        open={shareLimit}
        busy={shareBusy}
        actionLabel={T.savedAudits.share.limitModalActionLabel}
        onUseTokens={() => mint(pendingRegen, true)}
        onBuyTokens={() => { setShareLimit(false); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => setShareLimit(false)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'Disabled' | 'Active' | 'Revoked' | 'Expired' | 'None' }) {
  const T = useLocale();
  if (status === 'None') return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{T.savedAudits.shareStatus.notShared}</span>;
  const palette: Record<string, { bg: string; fg: string }> = {
    Active: { bg: '#D1FAE5', fg: '#065F46' },
    Expired: { bg: '#FEF3C7', fg: '#92400E' },
    Revoked: { bg: '#FEE2E2', fg: '#991B1B' },
    Disabled: { bg: '#E5E7EB', fg: '#374151' },
  };
  const label: Record<'Active' | 'Expired' | 'Revoked' | 'Disabled', string> = {
    Active: T.savedAudits.shareStatus.active,
    Expired: T.savedAudits.shareStatus.expired,
    Revoked: T.savedAudits.shareStatus.revoked,
    Disabled: T.savedAudits.shareStatus.disabled,
  };
  const p = palette[status];
  return (
    <span style={{ background: p.bg, color: p.fg, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.02em' }}>
      {label[status]}
    </span>
  );
}
