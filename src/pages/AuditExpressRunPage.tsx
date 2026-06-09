import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { AX_QUESTIONS } from '../lib/auditExpress/questions';
import { runPreview, runExtract, saveAudit, deleteSavedAudit, SavedAuditError } from '../lib/auditExpress/savedClient';
import { usePdfDownload } from '../lib/auditExpress/usePdfDownload';
import { PdfLimitModal } from '../components/auditExpress/PdfLimitModal';
import { AuditResultView, type AuditPreview, type AuditUnderstanding } from '../components/auditExpress/AuditResultView';
import { JourneyNext } from '../components/journey/JourneyNext';
import { advanceJourney } from '../lib/journey/journeyState';

interface Snapshot { understanding?: AuditUnderstanding; canonicalUrl?: string }

export function AuditExpressRunPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const orgId = session?.orgId ?? '';

  const [taps, setTaps] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'form' | 'results'>('form');
  const [preview, setPreview] = useState<AuditPreview | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [auditId, setAuditId] = useState<string>('');
  const [busy, setBusy] = useState<string>(''); // 'preview' | 'analyze' | ''
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState<'quick' | 'deep'>('quick');

  const auditIdRef = useRef('');     // latest saved id (ref => no stale closure on supersede)
  const createdAtRef = useRef('');   // fixed stamp for the run (determinism)

  const pdf = usePdfDownload(orgId);
  const complete = AX_QUESTIONS.every(q => Boolean(taps[q.key]));

  // B8.3: entering the Audit Express run = the "Audit" journey step (monotonic).
  useEffect(() => { advanceJourney('audit'); }, []);

  /** Save (auto), then supersede the earlier preview-only record so Saved Audits
   *  shows exactly one entry per run (enriched replaces preview-only). */
  async function persist(snap: Snapshot | null) {
    try {
      const prev = auditIdRef.current;
      const id = await saveAudit(orgId, { taps, extractSnapshot: snap ?? undefined, createdAt: createdAtRef.current });
      auditIdRef.current = id; setAuditId(id);
      if (prev && prev !== id) deleteSavedAudit(orgId, prev).catch(() => { /* non-fatal */ });
    } catch { /* non-fatal: results still render; user can retry from Saved Audits */ }
  }

  async function onRun() {
    if (!complete || !orgId || busy) return;
    setBusy('preview'); setError(null);
    const when = new Date().toISOString();
    try {
      const p = await runPreview(orgId, taps) as AuditPreview;
      setPreview(p); setPhase('results'); setSnapshot(null);
      createdAtRef.current = when; auditIdRef.current = ''; setAuditId('');
      void persist(null);
    } catch (e) {
      setError(e instanceof SavedAuditError ? 'Could not run the preview (' + e.code + ').' : 'Could not run the preview.');
    } finally { setBusy(''); }
  }

  async function onAnalyze() {
    if (!url || !orgId || busy) return;
    setBusy('analyze'); setError(null);
    try {
      const snap = await runExtract(orgId, url, depth) as Snapshot;
      setSnapshot(snap);
      void persist(snap);
    } catch (e) {
      setError(e instanceof SavedAuditError ? 'Analysis unavailable (' + e.code + ').' : 'Analysis unavailable. Please try again.');
    } finally { setBusy(''); }
  }

  const chip = (active: boolean): CSSProperties => ({
    border: active ? '1.5px solid var(--violet)' : '1.5px solid var(--border-strong)',
    background: active ? 'var(--brand-tint-bg, #EDE9FE)' : 'var(--surface)',
    color: active ? 'var(--violet-text)' : 'var(--text-secondary)',
    borderRadius: 999, padding: '8px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
  });
  const cta = (variant: 'primary' | 'ghost'): CSSProperties => ({
    padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
    border: variant === 'ghost' ? '1.5px solid var(--border-strong)' : 'none',
    background: variant === 'ghost' ? 'transparent' : 'var(--brand-gradient, var(--violet))',
    color: variant === 'ghost' ? 'var(--text-secondary)' : '#fff',
  });
  const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', padding: 22, marginTop: 14 };
  const h2: CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text-primary)' };

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: '0 0 6px' }}>Run Audit Express</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5, margin: '0 0 4px' }}>A fast, estimate-only AI readiness snapshot — saved automatically to your workspace.</p>

      {error && <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-text)', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, marginTop: 12 }}>{error}</div>}

      {phase === 'form' && (
        <div style={card}>
          {AX_QUESTIONS.map(q => (
            <div key={q.key} style={{ margin: '18px 0' }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.4, color: 'var(--text-secondary)', marginBottom: 10 }}>{q.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {q.options.map(o => (
                  <button key={o.value} type="button" style={chip(taps[q.key] === o.value)}
                    aria-pressed={taps[q.key] === o.value}
                    onClick={() => setTaps(prev => ({ ...prev, [q.key]: o.value }))}>{o.label}</button>
                ))}
              </div>
            </div>
          ))}
          <button type="button" style={{ ...cta('primary'), marginTop: 10, opacity: complete ? 1 : 0.55 }} disabled={!complete || busy === 'preview'} onClick={onRun}>
            {busy === 'preview' ? 'Computing…' : 'Get preview'}
          </button>
        </div>
      )}

      {phase === 'results' && preview && (
        <>
          <AuditResultView preview={preview} understanding={snapshot?.understanding ?? null} />

          <div style={card}>
            <h2 style={{ ...h2, margin: '0 0 8px' }}>Analyze a public website (optional)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 10px' }}>Reads only public pages, respects robots.txt. Enriches “What this business does”.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
                style={{ flex: '1 1 240px', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-strong)', fontSize: 14, fontFamily: 'var(--font-body)' }} />
              <button type="button" style={cta('primary')} disabled={!url || busy === 'analyze'} onClick={onAnalyze}>{busy === 'analyze' ? 'Analyzing…' : 'Analyze site'}</button>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={depth === 'deep'} onChange={e => setDepth(e.target.checked ? 'deep' : 'quick')} /> Deep scan (slower, more pages)
            </label>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" style={cta('primary')} disabled={!auditId || pdf.busy === auditId} onClick={() => pdf.download(auditId)}>
              {pdf.busy === auditId ? 'Preparing…' : 'Download PDF'}
            </button>
            <button type="button" style={cta('ghost')} onClick={() => navigate({ name: 'audit-express/saved' })}>View Saved Audits</button>
          </div>
          {pdf.error && <p style={{ color: 'var(--amber-text)', fontSize: 13, marginTop: 8 }}>{pdf.error}</p>}
          {!auditId && <p style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 8 }}>Saving your result…</p>}

          <JourneyNext
            summary={{
              headline: 'Here is what your snapshot means',
              lines: [
                `AI readiness: ${preview.k1a.bucket} (${preview.k1a.normalizedScore}/100).`,
                `Estimated time saved ≈ ${preview.k2a.result.estimatedTimeSavedHoursPerMonth} hours/month.`,
                `Estimated cost saved ≈ $${Math.round(Number(preview.k2a.result.estimatedMonthlyCostSaved) || 0).toLocaleString('en-US')}/month.`,
              ],
            }}
            hasRecommendedAgents={(preview.k1a.recommendedAgentIds?.length ?? 0) > 0}
          />
        </>
      )}

      <PdfLimitModal
        open={!!pdf.limitFor}
        busy={pdf.busy === pdf.limitFor}
        onUseTokens={() => pdf.limitFor && pdf.download(pdf.limitFor, true)}
        onBuyTokens={() => { pdf.setLimitFor(null); navigate({ name: 'billing/tokens' }); }}
        onCancel={() => pdf.setLimitFor(null)}
      />
    </div>
  );
}
