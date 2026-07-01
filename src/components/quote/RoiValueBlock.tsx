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
      marginTop: 24, padding: '24px 26px', borderRadius: 16,
      border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--violet-text)', marginBottom: 6 }}>
        {R.monthlySavingsLabel}
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--green-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {money.format(roi.estimatedMonthlyCostSaved)}
        <span style={{ fontSize: 20, color: 'var(--text-muted)', fontWeight: 600 }}>{R.monthlySavingsUnit}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 20 }}>
        <Stat label={R.yearlySavingsLabel} value={money.format(roi.estimatedYearlyCostSaved)} />
        <Stat label={R.timeSavedLabel} value={format(R.timeSavedValue, { hours: roi.estimatedTimeSavedHoursPerMonth.toLocaleString('en-US') })} />
        <Stat label={R.paybackLabel} value={roi.estimatedPaybackMonths === null ? R.paybackEmpty : format(R.paybackValue, { months: roi.estimatedPaybackMonths.toLocaleString('en-US') })} />
      </div>
    </div>
  );
}
