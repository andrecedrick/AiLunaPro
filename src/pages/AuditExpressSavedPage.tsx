import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  listSavedAudits, deleteSavedAudit, downloadSavedAudit, type SavedAuditItem,
} from '../lib/auditExpress/savedClient';

/**
 * Saved Audit Express (J15 P1.1) — lists the org's saved audits and lets the
 * user download (auth-gated PDF) or delete. Org-scoped; no PII beyond own org.
 */
export function AuditExpressSavedPage() {
  const { session } = useAuth();
  const orgId = session?.orgId ?? '';

  const [items, setItems] = useState<SavedAuditItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // auditId currently acting on

  const load = useCallback(async () => {
    if (!orgId) return;
    setError(null);
    try { setItems(await listSavedAudits(orgId)); }
    catch { setError('Could not load your saved audits. Please try again.'); setItems([]); }
  }, [orgId]);

  useEffect(() => { void load(); }, [load]);

  const onDownload = async (id: string) => {
    setBusy(id); setError(null);
    try { await downloadSavedAudit(orgId, id); }
    catch { setError('Download failed. Please try again.'); }
    finally { setBusy(null); }
  };
  const onDelete = async (id: string) => {
    setBusy(id); setError(null);
    try { await deleteSavedAudit(orgId, id); setItems(prev => (prev ?? []).filter(i => i.auditId !== id)); }
    catch { setError('Delete failed. Please try again.'); }
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
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
        Saved Audit Express
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 18px' }}>
        Your saved Audit Express snapshots. Download the PDF or remove a saved result.
      </p>

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
            No saved audits yet. Run <a href="/audit-express" style={{ color: 'var(--violet-text, var(--violet))' }}>Audit Express</a>, then save your result.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(it => (
            <div key={it.auditId} style={card}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, textTransform: 'capitalize' }}>
                  {it.businessType.replace(/_/g, ' ')} · {it.audience}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.canonicalUrl ? it.canonicalUrl + ' · ' : ''}{new Date(it.createdAt).toLocaleString()} · engine {it.engineVersion || 'n/a'} · confidence {it.confidence}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button type="button" style={btn('primary')} disabled={busy === it.auditId} onClick={() => onDownload(it.auditId)}>
                  {busy === it.auditId ? '…' : 'Download PDF'}
                </button>
                <button type="button" style={btn('ghost')} disabled={busy === it.auditId} onClick={() => onDelete(it.auditId)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
