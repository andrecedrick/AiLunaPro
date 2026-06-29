/**
 * SessionValueTracker — Part 4: "This session: $X value delivered · X tokens used".
 * Gated by ENABLE_TOKEN_MODEL_V2 and hidden until ≥1 action is recorded (no empty
 * "$0" badge). Reads SessionValueContext; value is USD-base, formatted via useMoney
 * in the user's display currency. Localized — no hardcoded copy.
 */
import type { CSSProperties } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import { useMoney } from '../../lib/currency/useMoney';
import { ENABLE_TOKEN_MODEL_V2 } from '../../lib/flags';
import { useSessionValue } from '../../context/SessionValueContext';

export function SessionValueTracker({ style }: { style?: CSSProperties }) {
  const T = useLocale();
  const money = useMoney();
  const { tokens, valueUsd, count } = useSessionValue();
  if (!ENABLE_TOKEN_MODEL_V2 || count === 0) return null;
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: 'var(--violet-text)',
        background: 'var(--brand-tint-bg)', borderRadius: 999,
        padding: '4px 12px', whiteSpace: 'nowrap', ...style,
      }}
    >
      {format(T.common.valueDisplay.sessionTracker, { value: money.format(valueUsd, { approx: false, decimals: Number.isInteger(valueUsd) ? 0 : 2 }), tokens })}
    </div>
  );
}
