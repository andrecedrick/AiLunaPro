import { useEffect, type CSSProperties } from 'react';
import { useRoute } from '../../context/RouteContext';
import { advanceJourney } from '../../lib/journey/journeyState';
import type { Route } from '../../types/audit';

/**
 * B8.2 — guided "Understanding & value → Next action" panel. Deterministic, no LLM.
 * Rendered after an audit completes (New Audit result + Audit Express results). The
 * `summary` is computed by the parent from the already-computed result/preview
 * (estimate-only; no fabricated figures). Adoption options are prominent CTAs —
 * never a forced auto-redirect — and the dashboard is always reachable.
 */
export interface JourneySummary {
  /** Short, plain-language framing of what the audit means (estimate-only). */
  headline: string;
  lines: string[];
}

export function JourneyNext({ summary, hasRecommendedAgents = false }: { summary: JourneySummary; hasRecommendedAgents?: boolean }) {
  const { navigate } = useRoute();

  // Reaching this panel = "understanding" step. Monotonic; safe on revisit.
  useEffect(() => { advanceJourney('understanding'); }, []);

  const go = (route: Route) => { advanceJourney('adoption'); navigate(route); };

  const card: CSSProperties = {
    flex: '1 1 200px', textAlign: 'left', cursor: 'pointer', background: 'var(--surface-2, var(--surface))',
    border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontFamily: 'var(--font-body)',
  };
  const emphasis: CSSProperties = { border: '1.5px solid var(--violet)' };
  const cardTitle: CSSProperties = { fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 3 };
  const cardBody: CSSProperties = { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 };

  return (
    <div style={{ marginTop: 18, padding: 18, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      {/* Understanding & value (Luna framing, deterministic from the result) */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 20, lineHeight: 1 }} aria-hidden>💡</div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{summary.headline}</div>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {summary.lines.map((l, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0' }}>{l}</li>
            ))}
          </ul>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '8px 0 0' }}>Indicative estimates — informational only, not legal or compliance advice.</p>
        </div>
      </div>

      {/* Next action (guided proposal — prominent CTAs, never a forced redirect) */}
      <div style={{ marginTop: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>What would you like to do next?</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        <button type="button" style={{ ...card, ...(hasRecommendedAgents ? emphasis : {}) }} onClick={() => go({ name: 'agents' })}>
          <div style={cardTitle}>See recommended agents{hasRecommendedAgents ? ' ★' : ''}</div>
          <div style={cardBody}>Tools matched to your audit that can save time on the work you flagged.</div>
        </button>
        <button type="button" style={card} onClick={() => go({ name: 'billing' })}>
          <div style={cardTitle}>Explore membership</div>
          <div style={cardBody}>Plans, tokens, and what's included — adopt at your own pace.</div>
        </button>
        <button type="button" style={card} onClick={() => go({ name: 'system-builder' })}>
          <div style={cardTitle}>Open System Builder</div>
          <div style={cardBody}>A read-only guide to design your AI system across six dimensions.</div>
        </button>
      </div>

      <button type="button" onClick={() => navigate({ name: 'dashboard' })}
        style={{ marginTop: 12, background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
        Back to dashboard
      </button>
    </div>
  );
}
