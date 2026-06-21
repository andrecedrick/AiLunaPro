/**
 * QuoteProgress — horizontal 4-step indicator for the quote → invoice journey.
 * Submit → Review → Validation → Invoice. `active` is the 1-based current step;
 * earlier steps render as done, the current one highlighted, later ones muted.
 * Pure presentational (no data fetch) — reflects where the user is in the flow.
 */

import { useLocale } from '../context/LocaleContext';

export function QuoteProgress({ active }: { active: number }) {
  const P = useLocale().publicTools.quote.progress;
  const steps = [P.submit, P.review, P.validation, P.invoice];

  return (
    <ol style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0, listStyle: 'none', margin: '0 auto 26px', padding: 0, maxWidth: 440 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < active;
        const current = n === active;
        const accent = done || current;
        return (
          <li key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* connector to the previous step */}
            {i > 0 && (
              <span aria-hidden style={{ position: 'absolute', top: 13, right: '50%', width: '100%', height: 2, background: n <= active ? 'var(--violet)' : 'var(--border)' }} />
            )}
            <span style={{
              position: 'relative', zIndex: 1, width: 28, height: 28, borderRadius: 999,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12.5, fontWeight: 800,
              background: accent ? 'var(--violet)' : 'var(--surface)',
              color: accent ? '#fff' : 'var(--text-muted)',
              border: accent ? 'none' : '1.5px solid var(--border)',
            }}>{done ? '✓' : n}</span>
            <span style={{ marginTop: 7, fontSize: 11.5, fontWeight: current ? 700 : 600, color: current ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
