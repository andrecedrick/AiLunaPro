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
  // J8: track history depth in state so canGoBack re-derives correctly.
  // historyRef alone (a ref) wouldn't trigger the useMemo to refresh, leaving
  // canGoBack stale-until-next-render after a navigate/back.
  const [histDepth, setHistDepth] = useState(0);

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
    setHistDepth(d => d + 1);
    writeHash(next);
  }, [writeHash]);

  const back = useCallback(() => {
    // Pop once, outside the updater — avoids a double-tap peek/pop race and
    // StrictMode's double-invoke popping twice. Sync the hash to the target.
    const prevRoute = historyRef.current.pop();
    if (!prevRoute) return;
    setRoute(prevRoute);
    setHistDepth(d => Math.max(0, d - 1));
    writeHash(prevRoute);
  }, [writeHash]);

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      navigate,
      back,
      canGoBack: histDepth > 0,
    }),
    [route, navigate, back, histDepth],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute must be used inside RouteProvider');
  return ctx;
}
