import type { CSSProperties } from 'react';
import { useRoute } from '../../context/RouteContext';
import { useLocale } from '../../context/LocaleContext';
import { track } from '../../lib/analytics/track';
import type { Route } from '../../types/audit';

/**
 * QuickToolsCard — "smart in-product access" Change A.
 *
 * A subtle, SECONDARY dashboard surface that lets authenticated users re-run the
 * public acquisition tools (Diagnostic + ROI Calculator) without polluting the
 * sidebar. Deliberately quieter than the primary product cards: recessed
 * surface-2 background, no gradient/glow, plain outline tiles.
 *
 * Each tile navigates to the existing public route — those render before the auth
 * gate and CampaignChrome shows a "Back to app" return for logged-in users, so the
 * funnel is preserved. A consent-gated, no-PII event measures per-surface CTR.
 */

type ToolId = 'diagnostic' | 'roi' | 'worksheet' | 'visibility';

function ToolIcon({ id, color }: { id: ToolId; color: string }) {
  const s: CSSProperties = { width: 20, height: 20, color };
  if (id === 'diagnostic') {
    // activity / pulse — quick health check
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    );
  }
  if (id === 'worksheet') {
    // grid — the time→money worksheet
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    );
  }
  if (id === 'visibility') {
    // eye — AI visibility / social presence
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  // trending-up — ROI growth
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 16.5 8.5 11.5 1 19" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function QuickToolsCard() {
  const { navigate } = useRoute();
  const Q = useLocale().dashboard.quickTools;

  const tools: { id: ToolId; route: Route; color: string; label: string; hint: string }[] = [
    { id: 'diagnostic', route: { name: 'diagnostic' },     color: '#7C3AED', label: Q.diagnostic.label, hint: Q.diagnostic.hint },
    { id: 'roi',        route: { name: 'roi-calculator' }, color: '#10B981', label: Q.roi.label,        hint: Q.roi.hint },
    { id: 'worksheet',  route: { name: 'worksheet' },      color: '#F59E0B', label: 'Audit Temps → Argent', hint: 'Calcule avec tes vraies données, tâche par tâche' },
    { id: 'visibility', route: { name: 'visibility' },     color: '#0EA5E9', label: 'Visibilité IA & Réseaux', hint: 'Présence dans ChatGPT/Perplexity + audit social' },
  ];

  const open = (id: ToolId, route: Route) => {
    track('tool_entry_clicked', { tool: id, surface: 'dashboard' });
    navigate(route);
  };

  return (
    <div style={{
      background: 'var(--surface-2)',
      borderRadius: 'var(--card-radius)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--card-shadow)',
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'background 0.2s ease, border-color 0.2s ease',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
          {Q.title}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>
          {Q.subtitle}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {tools.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => open(t.id, t.route)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '12px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s ease, transform 0.15s ease',
            }}
          >
            <span style={{
              flex: '0 0 auto', width: 38, height: 38, borderRadius: 10,
              background: `${t.color}1F`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ToolIcon id={t.id} color={t.color} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t.label}
              </span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {t.hint}
              </span>
            </span>
            <span aria-hidden style={{ flex: '0 0 auto', color: 'var(--text-muted)', fontSize: 16, fontWeight: 700 }}>
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
