/**
 * SessionValueContext — Part 4 (value display).
 *
 * Tracks, for the current browser session, the cumulative TOKENS spent and
 * VALUE DELIVERED (USD base) so the UI can show "This session: $X value · X
 * tokens" (formatted via useMoney in the user's currency). In-memory only
 * (resets on reload) — a perception aid, not an accounting ledger (the worker
 * token ledger is the source of truth).
 *
 * Call recordAction(action) when a paid action SUCCEEDS client-side. Reading is
 * safe even without a provider (returns a no-op default) so call sites never crash.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { tokenCost, type TokenCostAction } from '../lib/tokens/costs';
import { tokenValueUsd, isCharged } from '../lib/tokens/value';

interface SessionValueState {
  tokens:   number;
  valueUsd: number;
  count:    number;
  /**
   * Log a delivered action. `opts.charged` overrides the default (isCharged) so
   * callers with free-tier knowledge (Luna 3/day, opt-in PDFs, flag-off reco) can
   * log the VALUE without overstating tokens — we only ever count tokens we're sure
   * were spent (conservative = honest).
   */
  recordAction: (action: TokenCostAction, opts?: { charged?: boolean }) => void;
  reset:    () => void;
}

const NOOP: SessionValueState = {
  tokens: 0, valueUsd: 0, count: 0, recordAction: () => {}, reset: () => {},
};

const Ctx = createContext<SessionValueState | null>(null);

export function SessionValueProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens]     = useState(0);
  const [valueUsd, setValueUsd] = useState(0);
  const [count, setCount]       = useState(0);

  const recordAction = useCallback((action: TokenCostAction, opts?: { charged?: boolean }) => {
    // Count tokens only when we're sure a charge happened; free actions still add value.
    const charged = opts?.charged ?? isCharged(action);
    setTokens(t => t + (charged ? tokenCost(action) : 0));
    setValueUsd(v => v + tokenValueUsd(action));
    setCount(c => c + 1);
  }, []);

  const reset = useCallback(() => { setTokens(0); setValueUsd(0); setCount(0); }, []);

  return (
    <Ctx.Provider value={{ tokens, valueUsd, count, recordAction, reset }}>
      {children}
    </Ctx.Provider>
  );
}

/** Safe even outside a provider (returns a no-op) so optional wiring never crashes. */
export function useSessionValue(): SessionValueState {
  return useContext(Ctx) ?? NOOP;
}
