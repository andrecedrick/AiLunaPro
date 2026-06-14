/**
 * AgentCard — list-view card. Phase K0.
 */

import type { AgentCatalogEntry } from '../../types/agents';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

interface Props {
  agent:   AgentCatalogEntry;
  onOpen?: (agentId: string) => void;
}

const PLAN_LABEL: Record<AgentCatalogEntry['minPlan'], string> = {
  free:         'Free',
  starter:      'Starter',
  professional: 'Pro',
  enterprise:   'Enterprise',
};

export function AgentCard({ agent, onOpen }: Props) {
  const T = useLocale();
  const isAiLuna = agent.source === 'ailunapro';
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open agent ${agent.name}`}
      onClick={() => onOpen?.(agent.agentId)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(agent.agentId); } }}
      style={{
        display:        'flex',
        flexDirection:  'column',
        background:     'var(--surface)',
        border:         isAiLuna ? '2px solid var(--violet)' : '1px solid var(--border)',
        borderRadius:   14,
        padding:        18,
        cursor:         'pointer',
        transition:     'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow:      isAiLuna ? '0 8px 22px rgba(124,58,237,0.10)' : 'none',
        minWidth:       0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
          background: isAiLuna ? 'var(--violet)' : 'var(--surface-2)',
          color:      isAiLuna ? '#fff'           : 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
        }}>
          {isAiLuna ? 'AiLunaPro' : T.agentsPages.card.external}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
          background: 'var(--surface-2)', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
        }}>
          {PLAN_LABEL[agent.minPlan]}+
        </span>
      </div>

      <h3 style={{
        margin: '0 0 4px', fontSize: 16, fontWeight: 700,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {agent.name}
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45, minHeight: 36 }}>
        {agent.tagline}
      </p>

      {agent.expectedRoi.timeSavedHoursPerMonth !== null && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
          {format(T.agentsPages.card.savesPerMonth, { hours: agent.expectedRoi.timeSavedHoursPerMonth })}
        </div>
      )}

      {agent.integrations.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
          {agent.integrations.slice(0, 4).map(it => (
            <span key={it} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 6,
              background: 'var(--surface-2)', color: 'var(--text-muted)',
            }}>
              {it}
            </span>
          ))}
          {agent.integrations.length > 4 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {format(T.agentsPages.card.moreIntegrations, { count: agent.integrations.length - 4 })}
            </span>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onOpen?.(agent.agentId); }}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-primary)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}
        >
          {T.agentsPages.card.viewDetails}
        </button>
        <a
          href={agent.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8,
            background: isAiLuna ? 'var(--violet)' : 'var(--text-primary)',
            color: '#fff', fontWeight: 600, fontSize: 12,
            textAlign: 'center', textDecoration: 'none',
          }}
        >
          {T.agentsPages.card.getThisAgent}
        </a>
      </div>
    </div>
  );
}
