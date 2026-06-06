import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { getSavedAuditDetail, renameAudit, createShareLink, SavedAuditError, type SavedAuditDetail } from '../lib/auditExpress/savedClient';
import { usePdfDownload } from '../lib/auditExpress/usePdfDownload';
import { PdfLimitModal } from '../components/auditExpress/PdfLimitModal';
import { AuditResultView, type AuditPreview, type AuditUnderstanding } from '../components/auditExpress/AuditResultView';

/** Full in-app view of one saved audit (recomputed, non-PII). Download / rename / back. */
export function AuditExpressDetailPage() {
  const { session } = useAuth();
  const { route, navigate } = useRoute();
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
  const [copied, setCopied] = useState(false);

  const pdf = usePdfDownload(orgId);

  const onShare = async (useTokens = false) => {
    setShareBusy(true); setError(null);
    try {
      const link = await createShareLink(orgId, auditId, useTokens);
      setShareUrl(link.url); setShareExpiry(link.expiresAt); setShareLimit(false); setCopied(false);
    } catch (e) {
      const code = e instanceof SavedAuditError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') setShareLimit(true);
      else if (code === 'TOKENS_INSUFFICIENT') { setShareLimit(false); setError('Not enough tokens to create a share link. Buy tokens to continue.'); }
      else if (code === 'SHARE_DISABLED') setError('Sharing is not enabled yet.');
      else setError('Could not create a share link. Please try again.');
    } finally { setShareBusy(false); }
  };
  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => { setCopied(true); }).catch(() => { /* clipboard unavailable */ });
  };

  const load = useCallback(async () => {
    if (!orgId || !auditId) return;
    setError(null);
    try { setDetail(await getSavedAuditDetail(orgId, auditId)); }
    catch (e) { setError(e instanceof SavedAuditError && e.code === 'NOT_FOUND' ? 'This audit no longer exists.' : 'Could not load this audit. Please try again.'); }
  }, [orgId, auditId]);

  useEffect(() => { void load(); }, [load]);

  const onRename = async () => {
    setSavingTitle(true); setError(null);
    try {
      const saved = await renameAudit(orgId, auditId, draft.trim());
      setDetail(prev => (prev ? { ...prev, title: saved } : prev));
      setEditing(false);
    } catch { setError('Could not rename. Please try again.'); }
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
        ← Saved Audits
      </button>

      {error && <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-text)', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginBottom: 12 }}>{error}</div>}

      {!detail && !error && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>}

      {detail && (
        <>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input value={draft} maxLength={80} autoFocus onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void onRename(); if (e.key === 'Escape') setEditing(false); }}
                aria-label="Audit title"
                style={{ flex: '1 1 auto', minWidth: 0, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 700 }} />
              <button type="button" style={cta('primary')} disabled={savingTitle} onClick={onRename}>{savingTitle ? '…' : 'Save'}</button>
              <button type="button" style={cta('ghost')} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: 0 }}>{detail.title}</h1>
              <button type="button" onClick={() => { setEditing(true); setDraft(detail.title); }}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-text, var(--violet))', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Rename
              </button>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            {detail.canonicalUrl ? detail.canonicalUrl + ' · ' : ''}{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : ''} · engine {detail.engineVersion || 'n/a'} · confidence {detail.confidence}
          </p>

          {detail.preview ? (
            <AuditResultView preview={detail.preview as AuditPreview} understanding={(detail.understanding as AuditUnderstanding | null) ?? null} />
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 14 }}>This audit could not be recomputed.</p>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" style={cta('primary')} disabled={pdf.busy === auditId} onClick={() => pdf.download(auditId)}>
              {pdf.busy === auditId ? 'Preparing…' : 'Download PDF'}
            </button>
            <button type="button" style={cta('ghost')} disabled={shareBusy} onClick={() => onShare(false)}>
              {shareBusy ? 'Creating…' : 'Share link'}
            </button>
            <button type="button" style={cta('ghost')} onClick={() => navigate({ name: 'audit-express/saved' })}>Back to Saved Audits</button>
          </div>
          {pdf.error && <p style={{ color: 'var(--amber-text)', fontSize: 13, marginTop: 8 }}>{pdf.error}</p>}

          {shareUrl && (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Shareable link (no login required)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input readOnly value={shareUrl} onFocus={e => e.currentTarget.select()}
                  style={{ flex: '1 1 280px', minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 12.5, fontFamily: 'var(--font-mono, monospace)' }} />
                <button type="button" style={cta('ghost')} onClick={copyShare}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
              {shareExpiry && <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '8px 0 0' }}>Expires {new Date(shareExpiry).toLocaleString()}.</p>}
            </div>
          )}
        </>
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
        actionLabel="Use tokens & create link"
        onUseTokens={() => onShare(true)}
        onBuyTokens={() => { setShareLimit(false); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => setShareLimit(false)}
      />
    </div>
  );
}
