import { useEffect, useState, type CSSProperties } from 'react';
import { useRoute } from '../../context/RouteContext';
import { getLunaGuidance } from '../../lib/luna/guidance';
import { LunaChat } from './LunaChat';
import { getJourneyStep, JOURNEY_LABELS, JOURNEY_STEPS } from '../../lib/journey/journeyState';
import type { Route } from '../../types/audit';

/**
 * B4 — "Luna AI Copilot" surface (Option A: rule-based, deterministic).
 * A named, route-aware slide-over: what this page is for, sensible next
 * actions (in-app deep links), journey position while the guided journey is
 * active, and a Help Center link. No LLM, no free text input, no PII.
 * Always dismissible (Esc / overlay / close); never blocks navigation.
 */
export function LunaPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { route, navigate } = useRoute();
  const [mode, setMode] = useState<'guide' | 'ask'>('guide');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const g = getLunaGuidance(route.name);
  const step = getJourneyStep();
  const journeyActive = step !== 'adoption';

  const go = (r: Route) => { onClose(); navigate(r); };
  const openHelp = () => {
    // Mount-only hash parser: set ?section= first, then navigate (ConsentBanner pattern).
    try { window.location.hash = `#/help?section=${g.helpSection ?? 'getting-started'}`; } catch { /* ignore */ }
    onClose();
    navigate({ name: 'help' });
  };

  const actionBtn: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%',
    textAlign: 'left', padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
    background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border-strong)',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: 13.5, fontFamily: 'var(--font-body)',
  };
  const tabBtn = (active: boolean): CSSProperties => ({
    flex: 1, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', border: 'none',
    background: active ? 'var(--surface)' : 'transparent',
    color: active ? 'var(--violet-text)' : 'var(--text-muted)',
    fontWeight: 700, fontSize: 12.5, fontFamily: 'var(--font-body)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  });

  return (
    <>
      <div aria-hidden onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 600 }} />
      <aside role="dialog" aria-label="Luna — your guide"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(380px, 92vw)', zIndex: 601,
          background: 'var(--surface)', borderLeft: '1px solid var(--border)',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.18)', padding: '20px 22px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>✨</span>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Luna — your guide</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Deterministic · no LLM yet</div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Luna"
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Mode tabs — Guide (deterministic guidance) · Ask Luna (deterministic chat, no LLM) */}
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <button type="button" onClick={() => setMode('guide')} aria-pressed={mode === 'guide'} style={tabBtn(mode === 'guide')}>Guide</button>
          <button type="button" onClick={() => setMode('ask')} aria-pressed={mode === 'ask'} style={tabBtn(mode === 'ask')}>Ask Luna</button>
        </div>

        {mode === 'ask' ? (
          <LunaChat routeName={route.name} onNavigate={go} />
        ) : (
        <>
        {/* Where you are */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
            Where you are
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.purpose}</p>
        </div>

        {/* Journey position (only while active) */}
        {journeyActive && (
          <div style={{ background: 'var(--brand-soft-bg, var(--surface-2))', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--violet-text)', marginBottom: 4 }}>
              Your journey
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
              Step {JOURNEY_STEPS.indexOf(step) + 1} of {JOURNEY_STEPS.length} — {JOURNEY_LABELS[step]}
            </div>
          </div>
        )}

        {/* Next actions */}
        {g.actions.length > 0 && (
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              Suggested next steps
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.actions.map(a => (
                <button key={a.label} type="button" style={actionBtn} onClick={() => go(a.route)}>
                  {a.label}
                  <span aria-hidden style={{ color: 'var(--violet-text)', fontWeight: 800 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <button type="button" onClick={openHelp}
          style={{ marginTop: 'auto', background: 'none', border: 'none', padding: 0, color: 'var(--violet-text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', textDecoration: 'underline' }}>
          Learn more in the Help Center →
        </button>
        </>
        )}
      </aside>
    </>
  );
}
