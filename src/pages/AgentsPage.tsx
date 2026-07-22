/**
 * AgentsPage — Phase K0 + K3A.
 * Route: agents
 *
 * Read-only catalog list. Filters by industry and integration.
 * Optional Recommend panel (K3A) personalizes the order with top-3
 * highlight + reasons. Filters disabled while in recommendation mode.
 * Visible to owner/admin/billing/member. Client role gets LockedView.
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { fetchAgents } from '../lib/agents/agentsClient';
import type { AgentCatalogEntry } from '../types/agents';
import { AgentCard } from '../components/agents/AgentCard';
import { RecommendPanel } from '../components/agents/RecommendPanel';
import type { RecommendationResult } from '../types/recommendation';
import { saveWorksheetQuotePrefill } from '../lib/worksheet/quotePrefill';
import { emit } from '../lib/analytics/events';

function LockedView() {
  const { navigate } = useRoute();
  const T = useLocale();
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        {T.agentsPages.list.locked.title}
      </div>
      <button
        type="button"
        onClick={() => navigate({ name: 'dashboard' })}
        style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
      >
        {T.agentsPages.list.locked.backToDashboard}
      </button>
    </div>
  );
}

export function AgentsPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const T = useLocale();
  const role  = session?.role;
  const orgId = session?.orgId ?? null;

  const [agents,    setAgents]    = useState<AgentCatalogEntry[] | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [industry,  setIndustry]  = useState<string>('');
  const [integration, setIntegration] = useState<string>('');

  // K3A: Recommendation state. When non-null, order/highlight cards by score.
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const recMode = recommendation !== null;

  useEffect(() => {
    if (role === 'client' || !session || !orgId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { auth } = await import('../lib/firebase-auth');
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Not authenticated');
        const list = await fetchAgents(orgId, idToken);
        if (!cancelled) setAgents(list);
      } catch (err) {
        console.warn('[AgentsPage] fetchAgents failed:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, session, orgId]);

  // Build filter dropdown values from loaded data
  const industries = useMemo(() => {
    if (!agents) return [];
    const set = new Set<string>();
    for (const a of agents) for (const i of a.fits.industries) set.add(i);
    return Array.from(set).sort();
  }, [agents]);

  const integrations = useMemo(() => {
    if (!agents) return [];
    const set = new Set<string>();
    for (const a of agents) for (const i of a.integrations) set.add(i);
    return Array.from(set).sort();
  }, [agents]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    if (recMode) return agents; // recommendation mode shows full list, sorted/grouped below
    return agents.filter(a => {
      if (industry    && !a.fits.industries.includes(industry) && !a.fits.industries.includes('all')) return false;
      if (integration && !a.integrations.includes(integration)) return false;
      return true;
    });
  }, [agents, industry, integration, recMode]);

  // K3A: derive top-3 vs others list when recommendation is present
  const recommendationMap = useMemo(() => {
    if (!recommendation) return new Map<string, { score: number; reasons: string[]; rank: number }>();
    const m = new Map<string, { score: number; reasons: string[]; rank: number }>();
    recommendation.rankings.forEach((r, i) => m.set(r.agentId, { score: r.score, reasons: r.reasons, rank: i + 1 }));
    return m;
  }, [recommendation]);

  const topThree = useMemo(() => {
    if (!recommendation || !agents) return [] as AgentCatalogEntry[];
    const ids = recommendation.rankings.map(r => r.agentId);
    return ids
      .map(id => agents.find(a => a.agentId === id))
      .filter((a): a is AgentCatalogEntry => Boolean(a));
  }, [recommendation, agents]);

  const otherAgents = useMemo(() => {
    if (!recommendation || !agents) return [] as AgentCatalogEntry[];
    const topIds = new Set(recommendation.rankings.map(r => r.agentId));
    return agents.filter(a => !topIds.has(a.agentId));
  }, [recommendation, agents]);

  if (role === 'client') return <LockedView />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          {T.agentsPages.list.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          {T.agentsPages.list.intro}
        </p>
      </div>

      {/* K3A: Recommend panel — owner/admin/billing/member only (client never reaches here) */}
      {orgId && (
        <RecommendPanel
          orgId={orgId}
          hasResults={recMode}
          onResults={r => setRecommendation(r)}
          onClear={() => setRecommendation(null)}
        />
      )}

      {/* Filters — disabled while in recommendation mode */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20,
        padding: 16, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 12,
        opacity: recMode ? 0.55 : 1,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{T.agentsPages.list.filters.industryLabel}</label>
          <select
            value={industry}
            disabled={recMode}
            onChange={e => setIndustry(e.target.value)}
            style={{
              padding: '7px 10px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)',
              cursor: recMode ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">{T.agentsPages.list.filters.allIndustries}</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{T.agentsPages.list.filters.integrationLabel}</label>
          <select
            value={integration}
            disabled={recMode}
            onChange={e => setIntegration(e.target.value)}
            style={{
              padding: '7px 10px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)',
              cursor: recMode ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">{T.agentsPages.list.filters.allIntegrations}</option>
            {integrations.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        {!recMode && (industry || integration) && (
          <button
            type="button"
            onClick={() => { setIndustry(''); setIntegration(''); }}
            style={{
              alignSelf: 'flex-end', padding: '7px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {T.agentsPages.list.filters.clearFilters}
          </button>
        )}
        {recMode && (
          <div style={{
            alignSelf: 'flex-end',
            fontSize: 12, color: 'var(--text-muted)',
            marginLeft: 'auto',
          }}>
            {T.agentsPages.list.filters.clearRecommendationsHint}
          </div>
        )}
      </div>

      {/* Body */}
      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          {T.agentsPages.list.loading}
        </div>
      )}
      {error && !loading && (
        <div style={{ padding: 24, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 10, fontSize: 14 }}>
          {error}
        </div>
      )}
      {!loading && !error && agents && !recMode && filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          {T.agentsPages.list.emptyFiltered}
        </div>
      )}

      {/* K3A: recommendation mode — top 3 grouped + others below */}
      {!loading && !error && recMode && agents && (
        <>
          <SectionHeading>{T.agentsPages.list.sections.topRecommendations}</SectionHeading>
          <div style={gridStyle()}>
            {topThree.map(a => {
              const meta = recommendationMap.get(a.agentId);
              return (
                <RecommendedAgentCard
                  key={a.agentId}
                  agent={a}
                  rank={meta?.rank ?? 0}
                  score={meta?.score ?? 0}
                  reasons={meta?.reasons ?? []}
                  onOpen={(id) => navigate({ name: 'agents/detail', agentId: id })}
                />
              );
            })}
          </div>

          {/* Phase 5 — Recommendation → Quote bridge: turn the ranked list into an action
              by pre-seeding the Quote (category + a description built from the top picks)
              and navigating there. Reuses the existing sessionStorage prefill carrier; no
              backend, no billing. Gated by V2 so the legacy dead-end is unchanged when OFF. */}
          {topThree.length > 0 && (
            <div style={{ margin: '18px 0', padding: '16px 18px', borderRadius: 12, border: '1px solid var(--violet)', background: 'rgba(124,58,237,0.06)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                {T.agentsPages.list.quoteBridgeTitle}
              </div>
              <button
                type="button"
                onClick={() => {
                  const names = topThree.map(a => a.name).slice(0, 3).join(', ');
                  saveWorksheetQuotePrefill({ category: 'ai_agent', descriptionSeed: format(T.agentsPages.list.quoteBridgeSeed, { agents: names }) });
                  emit('cta_clicked', { flow: 'quote', target: 'quote' });
                  navigate({ name: 'quote' });
                }}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {T.agentsPages.list.quoteBridgeCta}
              </button>
            </div>
          )}

          {otherAgents.length > 0 && (
            <>
              <SectionHeading style={{ marginTop: 22 }}>{T.agentsPages.list.sections.otherAgents}</SectionHeading>
              <div style={gridStyle()}>
                {otherAgents.map(a => (
                  <AgentCard
                    key={a.agentId}
                    agent={a}
                    onOpen={(id) => navigate({ name: 'agents/detail', agentId: id })}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Default mode (no recommendation) — original filtered grid */}
      {!loading && !error && !recMode && filtered.length > 0 && (
        <div style={gridStyle()}>
          {filtered.map(a => (
            <AgentCard
              key={a.agentId}
              agent={a}
              onOpen={(id) => navigate({ name: 'agents/detail', agentId: id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── K3A presentational helpers ──────────────────────────── */

function gridStyle(): React.CSSProperties {
  return {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap:                 16,
  };
}

function SectionHeading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontSize:      12,
      fontWeight:    700,
      color:         'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      margin:        '0 0 10px',
      ...style,
    }}>
      {children}
    </h2>
  );
}

function RecommendedAgentCard({
  agent, rank, score, reasons, onOpen,
}: {
  agent:   AgentCatalogEntry;
  rank:    number;
  score:   number;
  reasons: string[];
  onOpen:  (id: string) => void;
}) {
  const T = useLocale();
  return (
    <div style={{ position: 'relative' }}>
      <AgentCard agent={agent} onOpen={onOpen} rank={rank} score={score} />

      {reasons.length > 0 && (
        <details style={{
          marginTop:    -10,
          padding:      '10px 14px',
          background:   'var(--surface)',
          border:       '2px solid var(--violet)',
          borderTop:    'none',
          borderRadius: '0 0 14px 14px',
        }}>
          <summary style={{
            fontSize:   12,
            fontWeight: 700,
            color:      'var(--violet-text)',
            cursor:     'pointer',
            userSelect: 'none',
          }}>
            {format(reasons.length === 1 ? T.agentsPages.list.whyToggleOne : T.agentsPages.list.whyToggleOther, { count: reasons.length })}
          </summary>
          <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
