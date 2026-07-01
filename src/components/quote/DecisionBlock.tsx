/**
 * DecisionBlock — the "invest X → recover Y" decision summary (Quote Phase 3).
 *
 * Display-only. All figures come from computeDecision (pure) over data that already
 * exists (quote investment + ROI savings). Money via useMoney; multiples/months are
 * rounded for display. Framing adapts to project size: a strong first-year return
 * leads with the multiple; a large build leads with break-even + the 3-year return —
 * so we never dress up a sub-1× year-one number as a headline win.
 */
import { useLocale } from '../../context/LocaleContext';
import { useMoney } from '../../lib/currency/useMoney';
import { format } from '../../lib/locale/i18n';
import { Stat } from '../ui-tools';
import type { Decision } from '../../lib/quote/decision';

export function DecisionBlock({ decision }: { decision: Decision }) {
  const T = useLocale();
  const money = useMoney();
  const Q = T.publicTools.quote.result;

  const invest = money.format(decision.investmentUsd);
  const yearly = money.format(decision.yearlySavedUsd);
  const y1 = decision.roiYear1.toFixed(1);
  const y3 = decision.roi3yr.toFixed(1);
  const months = decision.paybackMonths === null ? null : String(Math.round(decision.paybackMonths));

  // Lead with break-even + 3-year only when it is both weaker year-one AND we have a
  // break-even figure to show; otherwise lead with the first-year multiple.
  const useLong = !decision.strong && months !== null;
  const summary = useLong
    ? format(Q.decisionSummaryLong, { invest, yearly, months: months! })
    : format(Q.decisionSummaryStrong, { invest, yearly, y1 });

  return (
    <div style={{ marginTop: 14, padding: '18px 20px', borderRadius: 12, border: '1px solid var(--border-strong, var(--border))', background: 'var(--surface)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--violet-text)', marginBottom: 10 }}>
        {Q.decisionHeading}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 14 }}>
        {summary}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <Stat label={Q.decisionReturnLabel} value={format(Q.decisionMultiple, { mult: y1 })} />
        <Stat label={Q.decisionThreeYearLabel} value={format(Q.decisionMultiple, { mult: y3 })} />
        <Stat label={Q.decisionBreakevenLabel} value={months === null ? '—' : format(Q.decisionMonths, { months })} />
      </div>
    </div>
  );
}
