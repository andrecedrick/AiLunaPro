/**
 * Individual toast notification component.
 * Displays temporary notification with dismiss button.
 */

import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // milliseconds, null = no auto-dismiss
  onDismiss: (id: string) => void;
}

const variantConfig: Record<ToastVariant, { bg: string; icon: string; textColor: string }> = {
  success: {
    bg: 'bg-green-50',
    icon: '✓',
    textColor: 'text-green-900',
  },
  error: {
    bg: 'bg-red-50',
    icon: '✕',
    textColor: 'text-red-900',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: '⚠',
    textColor: 'text-yellow-900',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'ℹ',
    textColor: 'text-blue-900',
  },
};

export function Toast({
  id,
  message,
  variant = 'info',
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const config = variantConfig[variant];

  useEffect(() => {
    if (duration === null) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`${config.bg} mb-3 flex items-start gap-3 rounded-lg border border-gray-200 p-4 shadow-sm`}
      role="alert"
    >
      {/* Icon */}
      <div className={`text-lg font-bold ${config.textColor} flex-shrink-0`}>
        {config.icon}
      </div>

      {/* Message */}
      <div className={`flex-1 ${config.textColor}`}>{message}</div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
