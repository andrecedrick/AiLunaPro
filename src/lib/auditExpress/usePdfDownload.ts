import { useCallback, useState } from 'react';
import { downloadSavedAudit, SavedAuditError } from './savedClient';

/**
 * Shared PDF-download UX for saved audits: handles the 3-free-then-tokens quota.
 * On PDF_LIMIT_REACHED it surfaces `limitFor` (auditId) so the caller can show the
 * tokens modal; "Use tokens & download" calls download(id, true).
 */
export function usePdfDownload(orgId: string) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitFor, setLimitFor] = useState<string | null>(null);

  const download = useCallback(async (auditId: string, useTokens = false) => {
    if (!orgId || !auditId) return;
    setBusy(auditId); setError(null);
    try {
      await downloadSavedAudit(orgId, auditId, useTokens);
      setLimitFor(null);
    } catch (e) {
      const code = e instanceof SavedAuditError ? e.code : '';
      if (code === 'PDF_LIMIT_REACHED') setLimitFor(auditId);
      else if (code === 'TOKENS_INSUFFICIENT') { setLimitFor(null); setError('Not enough tokens to export. Buy tokens to continue.'); }
      else setError('Download failed. Please try again.');
    } finally { setBusy(null); }
  }, [orgId]);

  return { busy, error, setError, limitFor, setLimitFor, download };
}
