import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import {
  listSavedAudits, deleteSavedAudit, downloadSavedAudit, renameAudit, SavedAuditError, type SavedAuditItem,
} from '../lib/auditExpress/savedClient';

/**
 * Saved Audit Express (J15 P1.1) — lists the org's saved audits and lets the
 * user download (auth-gated PDF) or delete. Org-scoped; no PII beyond own org.
 */
export function AuditExpressSavedPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const orgId = session?.orgId ?? '';

  const [items, setItems] = useState<SavedAuditItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // auditId currently acting on
  const [limitFor, setLimitFor] = useState<string | null>(null); // auditId hitting the free-PDF limit
  const [editing, setEditing] = useState<string | null>(null);    // auditId being renamed
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    if (!orgId) return;
    setError(null);
    try { setItems(await listSavedAudits(orgId)); }
    catch { setError('Could not load your saved audits. Please try again.'); setItems([]); }
  }, [orgId]);

  useEffect(() => { void load(); }, [load]);

  const onDownload = async (id: string, useTokens = false) => {
    setBusy(id); setError(null);
    try {
      await downloadSavedAudit(orgId, id, useTokens);
      setLimitFor(null);
    } catch (e) {
      const code = e instanceof SavedAuditError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') { setLimitFor(id); }
      else if (code === 'TOKENS_INSUFFICIENT') { setLimitFor(null); setError('Not enough tokens to export. Buy tokens to continue.'); }
      else { setError('Download failed. Please try again.'); }
    } finally { setBusy(null); }
  };
  const onDelete = async (id: string) => {
    setBusy(id); setError(null);
    try { await deleteSavedAudit(orgId, id); setItems(prev => (prev ?? []).filter(i => i.auditId !== id)); }
    catch { setError('Delete failed. Please try again.'); }
    finally { setBusy(null); }
  };
  const startEdit = (it: SavedAuditItem) => { setEditing(it.auditId); setDraft(it.title); setError(null); };
  const onRename = async (id: string) => {
    setBusy(id); setError(null);
    try {
      const saved = await renameAudit(orgId, id, draft.trim());
      setItems(prev => (prev ?? []).map(i => (i.auditId === id ? { ...i, title: saved } : i)));
      setEditing(null);
    } catch { setError('Could not rename. Please try again.'); }
    finally { setBusy(null); }
  };

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)',
    boxShadow: 'var(--card-shadow)', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  };
  const btn = (variant: 'primary' | 'ghost'): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    border: variant === 'ghost' ? '1.5px solid var(--border-strong)' : 'none',
    background: variant === 'ghost' ? 'transparent' : 'var(--brand-gradient, var(--violet))',
    color: variant === 'ghost' ? 'var(--text-secondary)' : '#fff',
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Saved Audit Express
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 18px' }}>
            Your saved Audit Express snapshots. Download the PDF or remove a saved result.
          </p>
        </div>
        <button type="button" style={{ ...btn('primary'), padding: '10px 18px' }} onClick={() => navigate({ name: 'audit-express/run' })}>
          Run Audit Express
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-text)', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {items === null ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={{ ...card, justifyContent: 'flex-start' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No saved audits yet. Use <button type="button" onClick={() => navigate({ name: 'audit-express/run' })} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-text, var(--violet))', font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>Run Audit Express</button> to create one.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(it => (
            <div key={it.auditId} style={card}>
              <div style={{ minWidth: 0, flex: 1 }}>
                {editing === it.auditId ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={draft} maxLength={80} autoFocus onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') void onRename(it.auditId); if (e.key === 'Escape') setEditing(null); }}
                      aria-label="Audit title"
                      style={{ flex: '1 1 auto', minWidth: 0, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 14, fontFamily: 'var(--font-body)' }} />
                    <button type="button" style={btn('primary')} disabled={busy === it.auditId} onClick={() => onRename(it.auditId)}>{busy === it.auditId ? '…' : 'Save'}</button>
                    <button type="button" style={btn('ghost')} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.title || `${it.businessType.replace(/_/g, ' ')} · ${it.audience}`}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.canonicalUrl ? it.canonicalUrl + ' · ' : ''}{new Date(it.createdAt).toLocaleString()} · engine {it.engineVersion || 'n/a'} · confidence {it.confidence}
                    </div>
                  </>
                )}
              </div>
              {editing !== it.auditId && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button type="button" style={btn('ghost')} disabled={busy === it.auditId} onClick={() => startEdit(it)}>Rename</button>
                  <button type="button" style={btn('primary')} disabled={busy === it.auditId} onClick={() => onDownload(it.auditId)}>
                    {busy === it.auditId ? '…' : 'Download PDF'}
                  </button>
                  <button type="button" style={btn('ghost')} disabled={busy === it.auditId} onClick={() => onDelete(it.auditId)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {limitFor && (
        <div role="dialog" aria-modal="true" aria-label="PDF export limit"
          style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(15,23,42,0.55)' }}
          onClick={e => { if (e.target === e.currentTarget) setLimitFor(null); }}>
          <div style={{ maxWidth: 440, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: '0 12px 40px rgba(0,0,0,0.22)', padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              You’ve used your 3 free PDF exports
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 18px' }}>
              Downloading more PDFs requires tokens (10 tokens per export).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button type="button" style={btn('primary')} disabled={busy === limitFor} onClick={() => onDownload(limitFor, true)}>
                {busy === limitFor ? '…' : 'Use tokens & download'}
              </button>
              <button type="button" style={btn('ghost')} onClick={() => { const id = limitFor; setLimitFor(null); void id; navigate({ name: 'billing/tokens' }); }}>
                Upgrade or buy tokens
              </button>
              <button type="button" style={btn('ghost')} onClick={() => setLimitFor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
