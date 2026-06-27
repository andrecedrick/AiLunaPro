/**
 * AgentDetailPage — Phase K0.
 * Route: agents/detail (route param: agentId)
 *
 * Read-only single-agent detail view with affiliate CTA.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import { fetchAgent } from '../lib/agents/agentsClient';
import { useMoney } from '../lib/currency/useMoney';
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

type AgentText = { tagline: string; description: string; problemSolved: string };

export function AgentDetailPage() {
  const { route, navigate } = useRoute();
  const { session } = useAuth();
  const T = useLocale();
  const money = useMoney();
  const AC = T.agentsContent;
  const tax = (group: Record<string, string>, key: string) => group[key] ?? key;
  const role  = session?.role;
  const orgId = session?.orgId ?? null;
  const agentId = route.name === 'agents/detail' ? route.agentId : null;

  const [agent,   setAgent]   = useState<AgentCatalogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (role === 'client') return;
    if (!agentId) {
      setError(T.agentsPages.detail.errors.missingAgentId);
      setLoading(false);
      return;
    }
    if (!orgId) {
      setError(T.agentsPages.detail.errors.missingOrgContext);
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
        const a = await fetchAgent(orgId, agentId, idToken);
        if (!cancelled) setAgent(a);
      } catch (err) {
        console.warn('[AgentDetailPage] fetchAgent failed:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [agentId, role, orgId]);

  if (role === 'client') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{T.agentsPages.detail.lockedNotice}</div>
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
        {T.agentsPages.detail.backToAgents}
      </button>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>{T.agentsPages.detail.loading}</div>
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
              <Pill tone={agent.source === 'ailunapro' ? 'violet' : 'neutral'}>{agent.source === 'ailunapro' ? 'AiLunaPro' : T.agentsPages.detail.pills.external}</Pill>
              <Pill>{format(T.agentsPages.detail.pills.minPlanSuffix, { plan: PLAN_LABEL[agent.minPlan] })}</Pill>
              <Pill tone="green">{format(T.agentsPages.detail.pills.tokens, { profile: tax(AC.profile as Record<string, string>, agent.tokenUsageProfile) })}</Pill>
              <Pill tone="yellow">{format(T.agentsPages.detail.pills.setup, { complexity: tax(AC.complexity as Record<string, string>, agent.implementationComplexity) })}</Pill>
              {agent.badges.includes('recommended-all-in-one') && <Pill tone="violet">{T.agentsPages.detail.pills.recommendedAllInOne}</Pill>}
              {agent.badges.includes('compliance') && <Pill tone="green">{T.agentsPages.detail.pills.compliance}</Pill>}
              {agent.badges.includes('audit')      && <Pill tone="green">{T.agentsPages.detail.pills.audit}</Pill>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {agent.name}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {(AC.byId as Record<string, AgentText>)[agent.agentId]?.tagline ?? agent.tagline}
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
              background: 'var(--brand-gradient)', color: '#fff',
              fontWeight: 700, fontSize: 14,
              textDecoration: 'none', marginBottom: 28,
            }}
          >
            {T.agentsPages.detail.cta}
          </a>

          {/* Description */}
          <Section title={T.agentsPages.detail.sections.overview}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              {(AC.byId as Record<string, AgentText>)[agent.agentId]?.description ?? agent.description}
            </p>
          </Section>

          {/* Problem */}
          <Section title={T.agentsPages.detail.sections.problemSolved}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              {(AC.byId as Record<string, AgentText>)[agent.agentId]?.problemSolved ?? agent.problemSolved}
            </p>
          </Section>

          {/* Fits */}
          <Section title={T.agentsPages.detail.sections.bestFit}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T.agentsPages.detail.bestFit.industries}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.fits.industries.map(i => <Pill key={i}>{tax(AC.industries as Record<string, string>, i)}</Pill>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T.agentsPages.detail.bestFit.companySize}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.fits.companySize.map(s => <Pill key={s}>{tax(AC.companySize as Record<string, string>, s)}</Pill>)}
                </div>
              </div>
              {agent.fits.budgetMin !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T.agentsPages.detail.bestFit.minBudget}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {format(T.agentsPages.detail.bestFit.minBudgetValue, { amount: money.format(agent.fits.budgetMin) })}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Integrations */}
          {agent.integrations.length > 0 && (
            <Section title={T.agentsPages.detail.sections.integrations}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.integrations.map(i => <Pill key={i}>{tax(AC.integrations as Record<string, string>, i)}</Pill>)}
              </div>
            </Section>
          )}

          {/* ROI */}
          <Section title={T.agentsPages.detail.sections.expectedRoi}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {agent.expectedRoi.timeSavedHoursPerMonth !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T.agentsPages.detail.roi.timeSaved}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {format(T.agentsPages.detail.roi.timeSavedValue, { hours: agent.expectedRoi.timeSavedHoursPerMonth })}
                  </div>
                </div>
              )}
              {agent.expectedRoi.monthlyCostSaved !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T.agentsPages.detail.roi.costSaved}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-text)' }}>
                    {format(T.agentsPages.detail.roi.costSavedValue, { amount: money.format(agent.expectedRoi.monthlyCostSaved) })}
                  </div>
                </div>
              )}
              {agent.expectedRoi.paybackMonths !== null && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T.agentsPages.detail.roi.payback}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {format(T.agentsPages.detail.roi.paybackValue, { months: agent.expectedRoi.paybackMonths })}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Pricing */}
          <Section title={T.agentsPages.detail.sections.pricing}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {format(T.agentsPages.detail.pricing.modelPrefix, { model: tax(AC.model as Record<string, string>, agent.pricing.model) })
                .split('**')
                .map((seg, i) => (i % 2 === 1 ? <strong key={i}>{seg}</strong> : seg))}
              {agent.pricing.installPrice !== null && (
                <>{format(T.agentsPages.detail.pricing.install, { amount: money.format(agent.pricing.installPrice) })}</>
              )}
              {agent.pricing.monthlyPrice !== null && (
                <>{format(T.agentsPages.detail.pricing.monthly, { amount: money.format(agent.pricing.monthlyPrice) })}</>
              )}
              {agent.pricing.installPrice === null && agent.pricing.monthlyPrice === null && (
                <>{T.agentsPages.detail.pricing.onRequest}</>
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
              background: 'var(--brand-gradient)', color: '#fff',
              fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
            }}
          >
            {T.agentsPages.detail.cta}
          </a>
        </>
      )}
    </div>
  );
}
