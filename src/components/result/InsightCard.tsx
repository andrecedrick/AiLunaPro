import type { CSSProperties, ReactNode } from 'react';
import type { InsightFlow } from '../../lib/result/narrative';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';

/**
 * Reusable, pedagogical result card (deterministic content only).
 * Structure: metric → what this means → why it matters → text flow
 * (Input → Process → Output → Gain) → illustrative example → conversion-first
 * "Do this next". No LLM, no PII, no legal interpretation.
 */

export type InsightTone = 'critical' | 'warning' | 'good' | 'info';

export interface InsightAction { label: string; onClick: () => void; primary?: boolean }

export interface InsightCardProps {
  icon?: string;
  title: string;
  metric?: string;           // e.g. "−9 pts to recover" or "Medium readiness (62/100)"
  tone?: InsightTone;
  whatItMeans: string;
  whyItMatters: string;
  flow: InsightFlow;
  example: string;
  doNext: {
    heading?: string;        // e.g. "Automate it" / "Do this next"
    badges?: string[];       // e.g. ["Priority High", "Effort Medium", "~2 weeks"]
    steps: string[];
    outcome?: string;        // expected outcome line
    actions?: InsightAction[]; // conversion CTAs (agents / solution)
  };
  references?: string[];
}

const TONE: Record<InsightTone, string> = {
  critical: 'var(--red-text, #DC2626)',
  warning:  'var(--amber-text, #B45309)',
  good:     'var(--green-text, #15803D)',
  info:     'var(--violet-text)',
};

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '14px 0 5px' }}>{children}</div>;
}

export function InsightCard(p: InsightCardProps) {
  const I = useLocale().results.insightCard;
  const accent = TONE[p.tone ?? 'info'];
  const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${accent}`, borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)', padding: '18px 22px', marginBottom: 14 };
  const body: CSSProperties = { fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 };

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16.5, fontWeight: 800, color: 'var(--text-primary)' }}>
          {p.icon ? `${p.icon} ` : ''}{p.title}
        </h3>
        {p.metric && <span style={{ fontSize: 12.5, fontWeight: 800, color: accent, whiteSpace: 'nowrap' }}>{p.metric}</span>}
      </div>

      <Label>{I.whatThisMeans}</Label>
      <p style={body}>{p.whatItMeans}</p>

      <Label>{I.whyItMatters}</Label>
      <p style={body}>{p.whyItMatters}</p>

      <Label>{I.howItPlaysOut}</Label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-secondary)' }}>
        {[p.flow.input, p.flow.process, p.flow.output].map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--surface-2, var(--surface))', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>{s}</span>
            <span aria-hidden style={{ color: 'var(--text-muted)' }}>→</span>
          </span>
        ))}
        <span style={{ background: 'var(--brand-tint-bg)', border: `1px solid ${accent}`, color: 'var(--text-primary)', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>
          {p.flow.gain}
        </span>
      </div>

      <Label>{I.exampleHeading}</Label>
      <p style={{ ...body, fontStyle: 'italic' }}>{p.example} <span style={{ color: 'var(--text-muted)', fontStyle: 'normal' }}>{I.illustrative}</span></p>

      {/* Conversion-first next step */}
      <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'var(--brand-soft-bg, var(--surface-2))', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: accent }}>{p.doNext.heading ? format(I.doThisNextWithHeading, { heading: p.doNext.heading }) : I.doThisNext}</span>
          {(p.doNext.badges ?? []).map(b => (
            <span key={b} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>{b}</span>
          ))}
        </div>
        <ol style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {p.doNext.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        {p.doNext.outcome && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>✓ {format(I.onceDone, { outcome: p.doNext.outcome })}</p>}
        {p.doNext.actions && p.doNext.actions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {p.doNext.actions.map(a => (
              <button key={a.label} type="button" onClick={a.onClick}
                style={{
                  padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  border: a.primary ? 'none' : '1.5px solid var(--violet)',
                  background: a.primary ? 'var(--brand-gradient, var(--violet))' : 'transparent',
                  color: a.primary ? '#fff' : 'var(--violet-text)',
                }}>
                {a.label}{a.primary ? ' →' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {p.references && p.references.length > 0 && (
        <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
          {format(I.referencesPrefix, { refs: p.references.join(' · ') })} <span style={{ opacity: 0.8 }}>(advisory, not legal advice)</span>
        </p>
      )}
    </div>
  );
}
