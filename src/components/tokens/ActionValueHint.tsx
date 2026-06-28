/**
 * ActionValueHint — Part 4: shows "Uses X tokens · ≈ €Y value" before a paid
 * action, so the user sees worth + cost BEFORE spending (transparency, no hidden
 * cost). Gated by ENABLE_TOKEN_MODEL_V2 — renders nothing when the flag is OFF.
 *
 * Strings are inline English for now; i18n rollout happens before the flag flips.
 */
import type { CSSProperties } from 'react';
import { ENABLE_TOKEN_MODEL_V2 } from '../../lib/flags';
import { tokenCost, type TokenCostAction } from '../../lib/tokens/costs';
import { tokenValueEur, formatValueEur } from '../../lib/tokens/value';

export function ActionValueHint({ action, style }: { action: TokenCostAction; style?: CSSProperties }) {
  if (!ENABLE_TOKEN_MODEL_V2) return null;
  const tokens = tokenCost(action);
  const value  = tokenValueEur(action);
  return (
    <span style={{ fontSize: 12, color: 'var(--text-muted)', ...style }}>
      Uses {tokens} tokens · ≈ {formatValueEur(value)} value
    </span>
  );
}
