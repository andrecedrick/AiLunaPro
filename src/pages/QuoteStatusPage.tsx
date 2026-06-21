/**
 * QuoteStatusPage — public state-tracking view for the quote → invoice journey.
 *
 * Reached from the confirmation page ("Track your request"). Shows the 4-step
 * progress indicator (currently at Review), a note that an expert is reviewing,
 * and the full process so the client always knows the next action. Chromeless
 * (rendered inside CampaignChrome); presentational only — no data fetch.
 */

import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { primaryBtnStyle } from '../components/ui-tools';
import { QuoteProgress } from '../components/QuoteProgress';

export function QuoteStatusPage() {
  const { navigate } = useRoute();
  const Q = useLocale().publicTools.quote;
  const S = Q.status;
  const flow = Q.flow;
  const steps = [flow.s1, flow.s2, flow.s3, flow.s4];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>{S.title}</h1>
      <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 28px' }}>{S.intro}</p>

      <QuoteProgress active={2} />

      <div style={{ margin: '0 auto 24px', maxWidth: 380, padding: '12px 16px', borderRadius: 10, background: 'var(--amber-soft-bg, #fef3c7)', color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.55 }}>
        ⏳ {S.reviewNote}
      </div>

      <ol style={{ listStyle: 'none', margin: '0 auto 28px', padding: 0, display: 'grid', gap: 10, maxWidth: 380, textAlign: 'left' }}>
        {steps.map((s, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ flex: '0 0 auto', width: 22, height: 22, borderRadius: 999, background: 'var(--violet)', color: '#fff', fontSize: 11.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <button type="button" onClick={() => navigate({ name: 'quote' })} style={primaryBtnStyle()}>{S.back}</button>
    </div>
  );
}
