import { useState, type CSSProperties } from 'react';
import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { markJourneyStarted } from '../lib/journey/journeyState';
import { readLatestPendingResult, clearPendingResult } from '../lib/leads/pendingLead';
import { track } from '../lib/analytics/track';
import type { Route } from '../types/audit';

/**
 * B8.1 — Guided choice (journey step 1). Deterministic, no LLM. A minimal inline
 * "Luna" guide explains the two ways to start; choosing either (or skipping) marks
 * the journey started so the user is never forced here again. Dashboard is always
 * reachable (skip link + the sidebar). No dark patterns, fully reversible.
 */
export function GuidedStartPage() {
  const { navigate } = useRoute();
  const S = useLocale().journey.start;

  // B2.3: anonymous→authenticated continuity — if the user ran the public
  // Diagnostic or ROI Calculator before signing up (same browser), greet them
  // with their result so the journey continues instead of restarting. Read
  // once; cleared when they make a choice (one-shot, reversible by re-running).
  const [pending] = useState(() => readLatestPendingResult());

  const go = (route: Route) => {
    if (pending) clearPendingResult(pending.kind);
    const path = route.name === 'audit-express/run' ? 'express' : route.name === 'audit/new' ? 'full' : 'skip';
    track('onboarding_path_chosen', { path });
    markJourneyStarted();
    navigate(route);
  };

  const card: CSSProperties = {
    flex: '1 1 240px', textAlign: 'left', cursor: 'pointer', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', boxShadow: 'none',
    padding: 20, fontFamily: 'var(--font-body)', opacity: 0.92,
  };
  const cardTitle: CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' };
  const cardBody: CSSProperties = { fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' };
  const cta: CSSProperties = { display: 'inline-block', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'var(--brand-gradient, var(--violet))', color: '#fff' };
  // A1 Change 1: Audit Express is the recommended first-run default — give it
  // primary visual weight (badge + accent border + filled CTA); the full audit
  // stays fully available, positioned as the deeper secondary option.
  const expressCard: CSSProperties = { ...card, flex: '2 1 360px', opacity: 1, background: 'var(--brand-soft-bg, #f5f3ff)', border: '2px solid var(--violet)', boxShadow: '0 12px 30px rgba(124,58,237,0.16)' };
  const badgePill: CSSProperties = { display: 'inline-block', background: 'var(--brand-gradient, var(--violet))', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, marginBottom: 10, letterSpacing: 0.2 };
  const timeChip: CSSProperties = { display: 'inline-block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 6, marginLeft: 8, verticalAlign: 'middle' };
  const ctaSecondary: CSSProperties = { ...cta, background: 'transparent', color: 'var(--violet-text)', border: '1px solid var(--violet)' };

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Minimal inline Luna guide (placeholder for the future B4 surface) */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--brand-soft-bg, #f5f3ff)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: '14px 16px', marginBottom: 18 }}>
        <div style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>👋</div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{S.greetingTitle}</div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0 0' }}>
            {pending
              ? (pending.kind === 'diagnostic' ? S.pendingGreetingDiagnostic : S.pendingGreetingRoi)
              : S.greetingBody}
          </p>
        </div>
      </div>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: '0 0 14px' }}>{S.heading}</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <button type="button" style={expressCard} onClick={() => go({ name: 'audit-express/run' })}>
          <span style={badgePill}>★ {S.express.badge}</span>
          <div style={cardTitle}>{S.express.title}<span style={timeChip}>{S.express.time}</span></div>
          <p style={cardBody}>{S.express.body}</p>
          <span style={cta}>{S.express.cta}</span>
        </button>

        <button type="button" style={card} onClick={() => go({ name: 'audit/new' })}>
          <div style={cardTitle}>{S.full.title}<span style={timeChip}>{S.full.time}</span></div>
          <p style={cardBody}>{S.full.body}</p>
          <span style={ctaSecondary}>{S.full.cta}</span>
        </button>
      </div>

      <button type="button" onClick={() => go({ name: 'dashboard' })}
        style={{ marginTop: 18, background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
        {S.skip}
      </button>
    </div>
  );
}
