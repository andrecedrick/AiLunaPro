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

  const navigate = useCallback((next: Route) => {
    setRoute(prev => {
      historyRef.current.push(prev);
      return next;
    });
  }, []);

  const back = useCallback(() => {
    setRoute(prev => {
      const prevRoute = historyRef.current.pop();
      return prevRoute ?? prev;
    });
  }, []);

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
