/**
 * AgentDetailPage — Phase K0.
 * Route: agents/detail (route param: agentId)
 *
 * Read-only single-agent detail view with affiliate CTA.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { fetchAgent } from '../lib/agents/agentsClient';
import type { AgentCatalogEntry } from '../types/agents';

const PLAN_LABEL: Record<AgentCatalogEntry['minPlan'], string> = {
  free:         'Free',
  starter:      'Starter',
  professional: 'Professional',
  enterprise:   'Enterprise',
};

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'violet' | 'green' | 'yellow' }) {
  const bg =
    tone === 'violet' ? 'rgba(124,58,237,0.10)' :
    tone === 'green'  ? 'var(--green-soft-bg)'  :
    tone === 'yellow' ? 'var(--yellow-soft-bg)' :
    'var(--surface-2)';
  const fg =
    tone === 'violet' ? 'var(--violet-text)'  :
    tone === 'green'  ? 'var(--green-text)'   :
    tone === 'yellow' ? 'var(--yellow-text)'  :
    'var(--text-muted)';
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11, fontWeight: 700,
      padding: '4px 10px', borderRadius: 999,
      background: bg, color: fg,
      textTransform: 'uppercase', letterSpacing: 0.4,
    }}>
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AgentDetailPage() {
  const { route, navigate } = useRoute();
  const { session } = useAuth();
  const role = session?.role;
  const agentId = route.name === 'agents/detail' ? route.agentId : null;

  const [agent,   setAgent]   = useState<AgentCatalogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (role === 'client') return;
    if (!agentId) {
      setError('Missing agent id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { auth } = await import('../lib/firebase-auth');
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Not authenticated');
        const a = await fetchAgent(agentId, idToken);
        if (!cancelled) setAgent(a);
      } catch (err) {
        console.warn('[AgentDetailPage] fetchAgent failed:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [agentId, role]);

  if (role === 'client') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Agents are not available for client accounts.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <button
        type="button"
        onClick={() => navigate({ name: 'agents' })}
        style={{
          marginBottom: 16, padding: '6px 12px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
        }}
      >
        ← Back to agents
      </button>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      )}
      {error && !loading && (
        <div style={{ padding: 16, background: 'var(--red-soft-bg)', color: 'var(--red-text)', borderRadius: 10, fontSize: 14 }}>
          {error}
        </div>
      )}
      {!loading && !error && agent && (
        <>
          {/* Hero */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <Pill tone={agent.source === 'ailunapro' ? 'violet' : 'neutral'}>{agent.source === 'ailunapro' ? 'AiLunaPro' : 'External'}</Pill>
              <Pill>{PLAN_LABEL[agent.minPlan]}+</Pill>
              <Pill tone="green">Tokens · {agent.tokenUsageProfile}</Pill>
              <Pill tone="yellow">Setup · {agent.implementationComplexity}</Pill>
              {agent.badges.includes('recommended-all-in-one') && <Pill tone="violet">Recommended All-in-One</Pill>}
              {agent.badges.includes('compliance') && <Pill tone="green">Compliance</Pill>}
              {agent.badges.includes('audit')      && <Pill tone="green">Audit</Pill>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {agent.name}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {agent.tagline}
            </p>
          </div>

          {/* Primary CTA */}
          <a
            href={agent.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '11px 22px', borderRadius: 10,
              background: 'var(--violet)', color: '#fff',
              fontWeight: 700, fontSize: 14,
              textDecoration: 'none', marginBottom: 28,
            }}
          >
            Get this agent →
          </a>

          {/* Description */}
          <Section title="Overview">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              {agent.description}
            </p>
          </Section>

          {/* Problem */}
          <Section title="Problem solved">
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              {agent.problemSolved}
            </p>
          </Section>

          {/* Fits */}
          <Section title="Best fit">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Industries</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.fits.industries.map(i => <Pill key={i}>{i}</Pill>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Company size</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.fits.companySize.map(s => <Pill key={s}>{s}</Pill>)}
                </div>
              </div>
              {agent.fits.budgetMin !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Min budget</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                    ${agent.fits.budgetMin.toLocaleString('en-US')}/mo
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Integrations */}
          {agent.integrations.length > 0 && (
            <Section title="Integrations">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.integrations.map(i => <Pill key={i}>{i}</Pill>)}
              </div>
            </Section>
          )}

          {/* ROI */}
          <Section title="Expected ROI">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {agent.expectedRoi.timeSavedHoursPerMonth !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Time saved</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {agent.expectedRoi.timeSavedHoursPerMonth} h/mo
                  </div>
                </div>
              )}
              {agent.expectedRoi.monthlyCostSaved !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cost saved</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-text)' }}>
                    ${agent.expectedRoi.monthlyCostSaved.toLocaleString('en-US')}/mo
                  </div>
                </div>
              )}
              {agent.expectedRoi.paybackMonths !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payback</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {agent.expectedRoi.paybackMonths} months
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Model: <strong>{agent.pricing.model}</strong>
              {agent.pricing.installPrice !== null && (
                <> · Install: ${agent.pricing.installPrice.toLocaleString('en-US')}</>
              )}
              {agent.pricing.monthlyPrice !== null && (
                <> · Monthly: ${agent.pricing.monthlyPrice.toLocaleString('en-US')}</>
              )}
              {agent.pricing.installPrice === null && agent.pricing.monthlyPrice === null && (
                <> · Pricing on request</>
              )}
            </div>
          </Section>

          {/* Footer CTA */}
          <a
            href={agent.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '11px 22px', borderRadius: 10,
              background: 'var(--violet)', color: '#fff',
              fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Get this agent →
          </a>
        </>
      )}
    </div>
  );
}
