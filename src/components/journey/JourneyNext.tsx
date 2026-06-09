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

interface Cta { key: string; icon: string; title: string; body: string; route: Route }

const CTAS: Cta[] = [
  { key: 'agents', icon: '🤖', title: 'See recommended agents', body: 'Tools matched to your audit that can save time on the work you flagged.', route: { name: 'agents' } },
  { key: 'billing', icon: '💳', title: 'Explore membership', body: "Plans, tokens, and what's included — adopt at your own pace.", route: { name: 'billing' } },
  { key: 'system-builder', icon: '🛠️', title: 'Open System Builder', body: 'A read-only guide to design your AI system across six dimensions.', route: { name: 'system-builder' } },
];

// Scoped styles — inline styles can't express :hover / :focus-visible / :active.
const CTA_CSS = `
.jn-cta-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.jn-cta {
  flex: 1 1 220px; display: flex; flex-direction: column; gap: 6px; text-align: left;
  cursor: pointer; font-family: var(--font-body); background: var(--surface-2);
  border: 1.5px solid var(--border-strong); border-radius: 12px; padding: 14px 16px;
  transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease, background .14s ease;
}
.jn-cta:hover { transform: translateY(-2px); box-shadow: var(--card-shadow); border-color: var(--violet); background: var(--brand-tint-bg); }
.jn-cta:focus-visible { outline: 2px solid var(--violet); outline-offset: 2px; }
.jn-cta:active { transform: translateY(0); box-shadow: none; }
.jn-cta--primary { border-color: var(--violet); background: var(--brand-soft-bg); box-shadow: var(--card-shadow); }
.jn-cta__head { display: flex; align-items: center; gap: 8px; }
.jn-cta__icon { font-size: 16px; line-height: 1; }
.jn-cta__title { flex: 1; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13.5px; color: var(--text-primary); }
.jn-cta__tag { font-size: 10px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--violet-text); background: var(--brand-tint-bg); border-radius: 999px; padding: 2px 7px; }
.jn-cta__arrow { font-size: 15px; font-weight: 800; color: var(--violet-text); transition: transform .14s ease; }
.jn-cta:hover .jn-cta__arrow { transform: translateX(3px); }
.jn-cta__body { font-size: 12px; color: var(--text-muted); line-height: 1.45; }
`;

export function JourneyNext({ summary, hasRecommendedAgents = false }: { summary: JourneySummary; hasRecommendedAgents?: boolean }) {
  const { navigate } = useRoute();

  // Reaching this panel = "understanding" step. Monotonic; safe on revisit.
  useEffect(() => { advanceJourney('understanding'); }, []);

  const go = (route: Route) => { advanceJourney('adoption'); navigate(route); };

  const panel: CSSProperties = { marginTop: 18, padding: 18, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' };

  return (
    <div style={panel}>
      <style>{CTA_CSS}</style>

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

      {/* Next action (guided proposal — prominent button-like CTAs, never a forced redirect) */}
      <div style={{ marginTop: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>What would you like to do next?</div>
      <div className="jn-cta-row">
        {CTAS.map(c => {
          const isPrimary = c.key === 'agents' && hasRecommendedAgents;
          return (
            <button key={c.key} type="button" className={`jn-cta${isPrimary ? ' jn-cta--primary' : ''}`} onClick={() => go(c.route)}>
              <span className="jn-cta__head">
                <span className="jn-cta__icon" aria-hidden>{c.icon}</span>
                <span className="jn-cta__title">
                  {c.title}
                  {isPrimary && <span className="jn-cta__tag">Recommended</span>}
                </span>
                <span className="jn-cta__arrow" aria-hidden>→</span>
              </span>
              <span className="jn-cta__body">{c.body}</span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => navigate({ name: 'dashboard' })}
        style={{ marginTop: 12, background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
        Back to dashboard
      </button>
    </div>
  );
}
