/**
 * SessionValueTracker — Part 4: "This session: €X value delivered · X tokens used".
 * Gated by ENABLE_TOKEN_MODEL_V2 and hidden until at least one action is recorded,
 * so it never shows a noisy empty "€0" badge. Reads SessionValueContext.
 */
import type { CSSProperties } from 'react';
import { ENABLE_TOKEN_MODEL_V2 } from '../../lib/flags';
import { useSessionValue } from '../../context/SessionValueContext';
import { formatValueEur } from '../../lib/tokens/value';

export function SessionValueTracker({ style }: { style?: CSSProperties }) {
  const { tokens, valueEur, count } = useSessionValue();
  if (!ENABLE_TOKEN_MODEL_V2 || count === 0) return null;
  return (
    <div
      title="Value delivered this session vs tokens used"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: 'var(--violet-text)',
        background: 'var(--brand-tint-bg)', borderRadius: 999,
        padding: '4px 12px', whiteSpace: 'nowrap', ...style,
      }}
    >
      This session: {formatValueEur(valueEur)} value · {tokens} tokens
    </div>
  );
}
