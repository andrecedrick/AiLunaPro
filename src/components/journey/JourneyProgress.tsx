import { useEffect, useState, type CSSProperties } from 'react';
import { useRoute } from '../../context/RouteContext';
import {
  getJourneyStep, isJourneyBarDismissed, dismissJourneyBar,
  JOURNEY_STEPS, JOURNEY_LABELS, JOURNEY_EVENT, type JourneyStep,
} from '../../lib/journey/journeyState';

/**
 * B8.3 — guided journey progress indicator + continuous guidance. Deterministic,
 * no LLM, localStorage-only. Mounted once in the app shell, the bar is ON BY
 * DEFAULT for every user on any shell page while the journey is active
 * (step < adoption); it disappears ONLY when the user explicitly dismisses it or
 * reaches the Adopt step. Honest + reversible: the first step is revisitable, the
 * bar is dismissible, and the dashboard/sidebar stay reachable at all times.
 */

// Deterministic per-step guidance — why you're here / what happens next.
const HINT: Record<JourneyStep, string> = {
  choice: "Choose how to start — Audit Express for a quick snapshot, or a New Audit for depth.",
  audit: "Complete your audit — we'll explain what it means and what to do next.",
  understanding: "Here's what your audit means. Review the insights, then pick a next step.",
  adoption: '',
};

export function JourneyProgress() {
  const { navigate } = useRoute();
  const [, force] = useState(0);
  const [dismissed, setDismissed] = useState(() => isJourneyBarDismissed());

  // Re-read the (localStorage) step when it advances on the current page.
  useEffect(() => {
    const onChange = () => force(n => n + 1);
    window.addEventListener(JOURNEY_EVENT, onChange);
    return () => window.removeEventListener(JOURNEY_EVENT, onChange);
  }, []);

  const step = getJourneyStep();
  // Default-ON: only an explicit Dismiss or reaching Adopt hides the bar.
  if (dismissed || step === 'adoption') return null;

  const currentIdx = JOURNEY_STEPS.indexOf(step);
  const onDismiss = () => { dismissJourneyBar(); setDismissed(true); };

  const bar: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
    padding: '10px 16px', margin: '0 0 14px', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--card-shadow)',
  };
  const stepsRow: CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' };
  const connector: CSSProperties = { width: 18, height: 2, background: 'var(--border-strong)', flex: '0 0 auto' };

  return (
    <nav aria-label="Guided journey progress" style={bar}>
      <ol style={stepsRow}>
        {JOURNEY_STEPS.map((s, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          const revisitable = s === 'choice' && (done || current); // only 'choice' has an unambiguous route
          const dot: CSSProperties = {
            width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, flex: '0 0 auto',
            background: done ? 'var(--violet)' : current ? 'var(--brand-tint-bg)' : 'transparent',
            color: done ? '#fff' : current ? 'var(--violet-text)' : 'var(--text-muted)',
            border: current ? '1.5px solid var(--violet)' : done ? '1.5px solid var(--violet)' : '1.5px solid var(--border-strong)',
          };
          const label: CSSProperties = {
            fontSize: 12.5, fontWeight: current ? 800 : 600,
            color: done || current ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          };
          const content = (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={dot} aria-hidden>{done ? '✓' : i + 1}</span>
              <span style={label}>{JOURNEY_LABELS[s]}</span>
            </span>
          );
          return (
            <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={connector} aria-hidden />}
              {revisitable ? (
                <button type="button" onClick={() => navigate({ name: 'journey/start' })}
                  aria-current={current ? 'step' : undefined}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  {content}
                </button>
              ) : (
                <span aria-current={current ? 'step' : undefined}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 280px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4, flex: '1 1 auto', minWidth: 160 }}>{HINT[step]}</span>
        {step === 'choice' && (
          <button type="button" onClick={() => navigate({ name: 'journey/start' })}
            style={{ flex: '0 0 auto', padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--violet)', background: 'var(--brand-soft-bg)', color: 'var(--violet-text)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            Choose audit type →
          </button>
        )}
        <button type="button" onClick={onDismiss} aria-label="Dismiss guided journey"
          style={{ flex: '0 0 auto', background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
          Dismiss
        </button>
      </div>
    </nav>
  );
}
