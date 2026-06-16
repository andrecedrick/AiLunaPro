import type { CSSProperties } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { track } from '../../lib/analytics/track';
import type { Route } from '../../types/audit';

/**
 * PostResultTools — "smart in-product access" Change B.
 *
 * A subtle, lightweight "next step" strip shown beneath audit results that invites
 * re-engagement with the public acquisition tools (ROI Calculator + Diagnostic).
 * Deliberately quieter than the primary result actions / assistance bridge: no
 * shadow, recessed surface, small outline buttons — so it never competes with the
 * core result CTAs.
 *
 * Each action navigates to the existing public route (those render before the auth
 * gate; CampaignChrome returns the user via "← Back to app") and fires a
 * consent-gated, no-PII event for per-surface CTR. Does NOT touch the affiliate
 * CTA or the sidebar.
 */
type ToolId = 'roi' | 'diagnostic';

export function PostResultTools() {
  const { navigate } = useRoute();
  const N = useLocale().results.nextTools;

  const go = (tool: ToolId, route: Route) => {
    track('tool_entry_clicked', { tool, surface: 'post_audit' });
    navigate(route);
  };

  const btn: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    border: '1px solid var(--border-strong)', background: 'transparent',
    color: 'var(--violet-text)', fontFamily: 'var(--font-body)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  };

  return (
    <section style={{
      marginTop: 20,
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '14px 18px', borderRadius: 14,
      border: '1px solid var(--border)', background: 'var(--surface-2)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{N.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{N.subtitle}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" style={btn} onClick={() => go('roi', { name: 'roi-calculator' })}>
          {N.roi} →
        </button>
        <button type="button" style={btn} onClick={() => go('diagnostic', { name: 'diagnostic' })}>
          {N.diagnostic} →
        </button>
      </div>
    </section>
  );
}
