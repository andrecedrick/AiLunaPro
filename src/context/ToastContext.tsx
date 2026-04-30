/**
 * Toast context and provider.
 * Manages toast state and operations (show, dismiss, clear).
 */

import { createContext, type ReactNode, useState, useCallback } from 'react';
import { ToastContainer, type ToastItem } from '@/components/Toast';
import type { ToastVariant } from '@/components/Toast/Toast';

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, variant?: ToastVariant, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration: number = 5000): string => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastItem = { id, message, variant, duration };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
