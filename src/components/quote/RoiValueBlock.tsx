/**
 * RoiValueBlock — value-first ROI summary for the Quote (Phase 2).
 *
 * Renders the SAME figures the ROI Calculator already computed (carried via
 * pendingLead.roi), using the SAME i18n labels (publicTools.roi.result.*) and the
 * SAME currency path (useMoney) — display-only, no calculation here. Mirrors the
 * ROI Calculator's result treatment so a user sees one consistent money story
 * across the funnel.
 */
import { useLocale } from '../../context/LocaleContext';
import { useMoney } from '../../lib/currency/useMoney';
import { format } from '../../lib/locale/i18n';
import { Stat } from '../ui-tools';
import type { PendingRoiSummary } from '../../lib/leads/pendingLead';

export function RoiValueBlock({ roi }: { roi: PendingRoiSummary }) {
  const T = useLocale();
  const money = useMoney();
  const R = T.publicTools.roi.result;

  return (
    <div style={{
      marginTop: 4, padding: '34px 26px', borderRadius: 18,
      background: 'var(--green-soft-bg, #ecfdf5)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--green-text, #059669)', marginBottom: 12 }}>
        {R.monthlySavingsLabel}
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--green-text, #059669)', lineHeight: 0.95, fontVariantNumeric: 'tabular-nums' }}>
        {money.format(roi.estimatedMonthlyCostSaved)}
        <span style={{ fontSize: 20, color: 'var(--green-text, #059669)', opacity: 0.7, fontWeight: 600 }}>{R.monthlySavingsUnit}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 28, marginTop: 24 }}>
        <Stat label={R.yearlySavingsLabel} value={money.format(roi.estimatedYearlyCostSaved)} />
        <Stat label={R.timeSavedLabel} value={format(R.timeSavedValue, { hours: roi.estimatedTimeSavedHoursPerMonth.toLocaleString('en-US') })} />
        <Stat label={R.paybackLabel} value={roi.estimatedPaybackMonths === null ? R.paybackEmpty : format(R.paybackValue, { months: roi.estimatedPaybackMonths.toLocaleString('en-US') })} />
      </div>
    </div>
  );
}
