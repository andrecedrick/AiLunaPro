import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getInitialItems,
  saveItems,
  withTimestamps,
} from '../lib/registry/storage';
import {
  fsListItems,
  fsAddItem,
  fsUpdateItem,
  fsDeleteItem,
} from '../lib/registry/firestoreRegistryService';
import { resolveLayer } from '../lib/featureFlags';
import { useAuth } from './AuthContext';
import type { RegistryItem } from '../types/registry';

// ─── Context shape ────────────────────────────────────────────────────────────

export type RegistryStatus = 'loading' | 'loaded' | 'error';

interface RegistryContextValue {
  items: RegistryItem[];
  status: RegistryStatus;
  addItem: (
    base: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<RegistryItem>;
  updateItem: (id: string, patch: Partial<RegistryItem>) => Promise<RegistryItem | undefined>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => RegistryItem | undefined;
}

const RegistryContext = createContext<RegistryContextValue | undefined>(undefined);

const LAYER = resolveLayer('registry');

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RegistryProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const orgId = session?.orgId ?? null;

  // Mock: init synchronously from localStorage — no flash.
  // Firebase: start empty + loading, populate async.
  const [items, setItems]   = useState<RegistryItem[]>(
    () => LAYER === 'mock' ? getInitialItems() : [],
  );
  const [status, setStatus] = useState<RegistryStatus>(
    LAYER === 'mock' ? 'loaded' : 'loading',
  );

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (LAYER === 'mock') {
      // Already loaded synchronously in useState initializer — nothing to do.
      return;
    }

    // Firebase: load from Firestore when orgId is available.
    if (!orgId) return; // auth not yet resolved

    let cancelled = false;
    setStatus('loading');

    fsListItems(orgId)
      .then(fetched => {
        if (!cancelled) {
          setItems(fetched);
          setStatus('loaded');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, [orgId]);

  // ── Mock: mirror to localStorage on every change ────────────────────────────

  useEffect(() => {
    if (LAYER === 'mock') saveItems(items);
  }, [items]);

  // ── CRUD — mock path ─────────────────────────────────────────────────────────

  const addItemMock = useCallback(
    async (base: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegistryItem> => {
      const created = withTimestamps(base);
      setItems(prev => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateItemMock = useCallback(
    async (id: string, patch: Partial<RegistryItem>): Promise<RegistryItem | undefined> => {
      let updated: RegistryItem | undefined;
      setItems(prev =>
        prev.map(item => {
          if (item.id !== id) return item;
          updated = {
            ...item,
            ...patch,
            id: item.id,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }),
      );
      return updated;
    },
    [],
  );

  const deleteItemMock = useCallback(async (id: string): Promise<void> => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // ── CRUD — firebase path ─────────────────────────────────────────────────────

  const addItemFirebase = useCallback(
    async (base: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegistryItem> => {
      const created = withTimestamps(base);
      await fsAddItem(orgId!, created);
      setItems(prev => [created, ...prev]);
      return created;
    },
    [orgId],
  );

  const updateItemFirebase = useCallback(
    async (id: string, patch: Partial<RegistryItem>): Promise<RegistryItem | undefined> => {
      await fsUpdateItem(orgId!, id, patch);
      let updated: RegistryItem | undefined;
      setItems(prev =>
        prev.map(item => {
          if (item.id !== id) return item;
          updated = {
            ...item,
            ...patch,
            id: item.id,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }),
      );
      return updated;
    },
    [orgId],
  );

  const deleteItemFirebase = useCallback(
    async (id: string): Promise<void> => {
      await fsDeleteItem(orgId!, id);
      setItems(prev => prev.filter(item => item.id !== id));
    },
    [orgId],
  );

  // ── Bind correct implementation ──────────────────────────────────────────────

  const addItem    = LAYER === 'firebase' ? addItemFirebase    : addItemMock;
  const updateItem = LAYER === 'firebase' ? updateItemFirebase : updateItemMock;
  const deleteItem = LAYER === 'firebase' ? deleteItemFirebase : deleteItemMock;

  const getItem = useCallback(
    (id: string) => items.find(item => item.id === id),
    [items],
  );

  const value = useMemo<RegistryContextValue>(
    () => ({ items, status, addItem, updateItem, deleteItem, getItem }),
    [items, status, addItem, updateItem, deleteItem, getItem],
  );

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useRegistry must be used inside RegistryProvider');
  return ctx;
}
