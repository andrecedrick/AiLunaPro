/**
 * TokensContext — Phase J1.4A.
 *
 * Live balance via Firestore onSnapshot.
 * No-op when:
 *   - not authenticated
 *   - no orgId
 *   - role === 'client'
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { useAuth } from './AuthContext';
import { fetchBalance, type TokenBalance } from '../lib/tokens/tokensClient';
import { resolveLayer } from '../lib/featureFlags';

interface TokensContextValue {
  balance:    TokenBalance | null;
  loading:    boolean;
  enabled:    boolean;            // false for client/unauth
  refresh:    () => Promise<void>;
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined);

const LAYER = resolveLayer('auth');

export function TokensProvider({ children }: { children: ReactNode }) {
  const { session, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(false);

  const orgId   = session?.orgId ?? null;
  const role    = session?.role  ?? null;
  const enabled = isAuthenticated && !!orgId && role !== 'client' && LAYER === 'firebase';

  // onSnapshot live balance
  useEffect(() => {
    if (!enabled || !orgId) {
      setBalance(null);
      return;
    }
    const ref = doc(db, 'organizations', orgId, 'tokens', 'current');
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) setBalance(snap.data() as TokenBalance);
      },
      err => { console.warn('[TokensContext] onSnapshot error:', err); },
    );
    return unsub;
  }, [enabled, orgId]);

  // Manual refresh via worker (also bootstraps balance doc if missing)
  const refresh = useCallback(async () => {
    if (!enabled || !orgId) return;
    setLoading(true);
    try {
      const { auth } = await import('../lib/firebase-auth');
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;
      const fresh = await fetchBalance(orgId, idToken);
      setBalance(fresh);
    } catch (err) {
      console.warn('[TokensContext] refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, orgId]);

  // Initial bootstrap on mount when enabled
  useEffect(() => {
    if (enabled && !balance) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <TokensContext.Provider value={{ balance, loading, enabled, refresh }}>
      {children}
    </TokensContext.Provider>
  );
}

export function useTokens(): TokensContextValue {
  const ctx = useContext(TokensContext);
  if (!ctx) throw new Error('useTokens must be used inside TokensProvider');
  return ctx;
}
