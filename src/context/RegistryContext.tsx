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
import type { RegistryItem } from '../types/registry';

interface RegistryContextValue {
  items: RegistryItem[];
  addItem: (
    base: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => RegistryItem;
  updateItem: (id: string, patch: Partial<RegistryItem>) => RegistryItem | undefined;
  deleteItem: (id: string) => void;
  getItem: (id: string) => RegistryItem | undefined;
}

const RegistryContext = createContext<RegistryContextValue | undefined>(undefined);

export function RegistryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RegistryItem[]>(() => getInitialItems());

  /* Mirror to localStorage on every change. */
  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback(
    (base: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>): RegistryItem => {
      const created = withTimestamps(base);
      setItems(prev => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<RegistryItem>): RegistryItem | undefined => {
      let updated: RegistryItem | undefined;
      setItems(prev =>
        prev.map(item => {
          if (item.id !== id) return item;
          updated = {
            ...item,
            ...patch,
            id: item.id, // protect against accidental id change
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }),
      );
      return updated;
    },
    [],
  );

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const getItem = useCallback(
    (id: string) => items.find(item => item.id === id),
    [items],
  );

  const value = useMemo<RegistryContextValue>(
    () => ({ items, addItem, updateItem, deleteItem, getItem }),
    [items, addItem, updateItem, deleteItem, getItem],
  );

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useRegistry must be used inside RegistryProvider');
  return ctx;
}
