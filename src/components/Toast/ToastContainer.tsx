/**
 * Toast container — renders all active toasts.
 * Positioned fixed at bottom-right.
 */

import { Toast, type ToastVariant } from './Toast';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number | null;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 flex flex-col gap-2 z-50"
      role="region"
      aria-label="Notifications"
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration ?? undefined}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}
