/**
 * AgentsPage — Phase K0.
 * Route: agents
 *
 * Read-only catalog list. Filters by industry and integration.
 * No recommendation algorithm in K0. Visible to owner/admin/billing/member.
 * Client role redirected via App-level gate (sidebar hidden + worker 403).
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { fetchAgents } from '../lib/agents/agentsClient';
import type { AgentCatalogEntry } from '../types/agents';
import { AgentCard } from '../components/agents/AgentCard';

function LockedView() {
  const { navigate } = useRoute();
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Agents are not available for client accounts
      </div>
      <button
        type="button"
        onClick={() => navigate({ name: 'dashboard' })}
        style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--violet)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
      >
        Back to dashboard
      </button>
    </div>
  );
}

export function AgentsPage() {
  const { session } = useAuth();
  const { navigate } = useRoute();
  const role = session?.role;

  const [agents,    setAgents]    = useState<AgentCatalogEntry[] | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [industry,  setIndustry]  = useState<string>('');
  const [integration, setIntegration] = useState<string>('');

  useEffect(() => {
    if (role === 'client' || !session) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { auth } = await import('../lib/firebase-auth');
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Not authenticated');
        const list = await fetchAgents(idToken);
        if (!cancelled) setAgents(list);
      } catch (err) {
        console.warn('[AgentsPage] fetchAgents failed:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, session]);

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
    return agents.filter(a => {
      if (industry    && !a.fits.industries.includes(industry) && !a.fits.industries.includes('all')) return false;
      if (integration && !a.integrations.includes(integration)) return false;
      return true;
    });
  }, [agents, industry, integration]);

  if (role === 'client') return <LockedView />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Agents
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Find AI agents that fit your workflow. AiLunaPro all-in-one agents are highlighted.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20,
        padding: 16, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Industry</label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            style={{
              padding: '7px 10px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)',
            }}
          >
            <option value="">All industries</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Integration</label>
          <select
            value={integration}
            onChange={e => setIntegration(e.target.value)}
            style={{
              padding: '7px 10px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)',
            }}
          >
            <option value="">All integrations</option>
            {integrations.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        {(industry || integration) && (
          <button
            type="button"
            onClick={() => { setIndustry(''); setIntegration(''); }}
            style={{
              alignSelf: 'flex-end', padding: '7px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Body */}
      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading agents…
        </div>
      )}
      {error && !loading && (
        <div style={{ padding: 24, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 10, fontSize: 14 }}>
          {error}
        </div>
      )}
      {!loading && !error && agents && filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No agents match the selected filters.
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
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
