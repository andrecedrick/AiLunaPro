import { useEffect, type ReactNode } from 'react';
import { Button } from './Button';
import { useLocale } from '../../context/LocaleContext';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation modal.
 * Replaces window.confirm() per Phase D3 hardening.
 *
 * Renders nothing when `open` is false.
 * Closes on backdrop click, Escape, or explicit cancel.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive  = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const C = useLocale().common;
  const cLabel = confirmLabel ?? C.confirm;
  const xLabel = cancelLabel ?? C.cancel;
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 14,
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 440,
          padding: '22px 22px 18px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
        }}
      >
        <h2
          id="confirm-dialog-title"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: 10,
          }}
        >
          {title}
        </h2>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: 22,
          }}
        >
          {message}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button variant="ghost" size="md" onClick={onCancel}>
            {xLabel}
          </Button>
          <Button
            variant={destructive ? 'primary' : 'primary'}
            size="md"
            onClick={onConfirm}
            style={
              destructive
                ? { background: 'var(--red-text, #DC2626)', color: '#fff' }
                : undefined
            }
          >
            {cLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
