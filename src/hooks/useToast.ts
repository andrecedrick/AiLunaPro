/**
 * Hook for using toast notifications.
 * Must be used within ToastProvider.
 */

import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';
import type { ToastVariant } from '@/components/Toast/Toast';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    showToast: (message: string, variant: ToastVariant = 'info', duration: number = 5000) =>
      context.showToast(message, variant, duration),
    dismissToast: context.dismissToast,
    clearToasts: context.clearToasts,
  };
}
