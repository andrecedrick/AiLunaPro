import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Route } from '../types/audit';
import { routeToHash } from '../lib/routing/hashRoute';

interface RouteContextValue {
  route: Route;
  navigate: (next: Route) => void;
  back: () => void;
  canGoBack: boolean;
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const historyRef = useRef<Route[]>([]);

  /* J5 Batch 4 — hash-write-on-navigate (Phase 2). Reflect the current route
     in the address bar so URLs are shareable/reloadable. replaceState (not
     push) keeps a single history entry; in-memory `back` is unchanged. Skips
     routes that own their URL/query (routeToHash → null) and only writes when
     the target differs from the current hash. No mount write — App.tsx reads
     the original deep-link hash first, then its navigate() writes canonical. */
  const writeHash = useCallback((r: Route) => {
    if (typeof window === 'undefined') return;
    const h = routeToHash(r);
    if (h !== null && h !== window.location.hash) {
      window.history.replaceState(window.history.state, '', h);
    }
  }, []);

  const navigate = useCallback((next: Route) => {
    setRoute(prev => {
      historyRef.current.push(prev);
      return next;
    });
    writeHash(next);
  }, [writeHash]);

  const back = useCallback(() => {
    // Peek the target before popping so we can sync the hash too.
    const target = historyRef.current.length > 0
      ? historyRef.current[historyRef.current.length - 1]
      : null;
    setRoute(prev => {
      const prevRoute = historyRef.current.pop();
      return prevRoute ?? prev;
    });
    if (target) writeHash(target);
  }, [writeHash]);

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      navigate,
      back,
      canGoBack: historyRef.current.length > 0,
    }),
    [route, navigate, back],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute must be used inside RouteProvider');
  return ctx;
}
