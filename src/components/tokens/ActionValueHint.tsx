/**
 * ActionValueHint — Part 4: shows cost + worth BEFORE a paid action, so the user
 * sees value + (honest) token cost before spending. Gated by ENABLE_TOKEN_MODEL_V2.
 *
 * Honest: charged actions show "Uses X tokens · ≈ €Y value"; currently-free actions
 * show "Free · ≈ €Y value" (never claims a charge that doesn't happen). Localized —
 * no hardcoded copy.
 */
import type { CSSProperties } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { ENABLE_TOKEN_MODEL_V2 } from '../../lib/flags';
import { tokenCost, type TokenCostAction } from '../../lib/tokens/costs';
import { tokenValueEur, formatValueEur, isCharged } from '../../lib/tokens/value';

export function ActionValueHint({ action, style }: { action: TokenCostAction; style?: CSSProperties }) {
  const T = useLocale();
  if (!ENABLE_TOKEN_MODEL_V2) return null;
  const vd = T.common.valueDisplay;
  const value = formatValueEur(tokenValueEur(action));
  const label = isCharged(action)
    ? format(vd.actionHint, { tokens: tokenCost(action), value })
    : format(vd.actionHintFree, { value });
  return (
    <span style={{ fontSize: 12, color: 'var(--text-muted)', ...style }}>
      {label}
    </span>
  );
}
