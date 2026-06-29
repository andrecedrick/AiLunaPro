/**
 * ActionValueHint — Part 4: shows cost + worth BEFORE a paid action, so the user
 * sees value + (honest) token cost before spending. Gated by ENABLE_TOKEN_MODEL_V2.
 *
 * Honest: charged actions show "Uses X tokens · ≈ $Y value"; currently-free actions
 * show "Free · ≈ $Y value" (never claims a charge that doesn't happen). The value is
 * USD-base, formatted through useMoney → the user's display currency ($ by default).
 */
import type { CSSProperties } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { useMoney } from '../../lib/currency/useMoney';
import { ENABLE_TOKEN_MODEL_V2 } from '../../lib/flags';
import { tokenCost, type TokenCostAction } from '../../lib/tokens/costs';
import { tokenValueUsd, isCharged } from '../../lib/tokens/value';

export function ActionValueHint({ action, style }: { action: TokenCostAction; style?: CSSProperties }) {
  const T = useLocale();
  const money = useMoney();
  if (!ENABLE_TOKEN_MODEL_V2) return null;
  const vd = T.common.valueDisplay;
  // approx:false → the i18n template owns the single "≈" (avoids "≈ ≈" for non-USD).
  // decimals: show cents only for non-integer values (e.g. $1.50) so Luna's 1.5 isn't
  // rounded up to $2 — never overstate the value.
  const v = tokenValueUsd(action);
  const value = money.format(v, { approx: false, decimals: Number.isInteger(v) ? 0 : 2 });
  const label = isCharged(action)
    ? format(vd.actionHint, { tokens: tokenCost(action), value })
    : format(vd.actionHintFree, { value });
  return (
    <span style={{ fontSize: 12, color: 'var(--text-muted)', ...style }}>
      {label}
    </span>
  );
}
