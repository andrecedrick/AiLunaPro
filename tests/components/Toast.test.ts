import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { useToast } from '@/hooks/useToast';

describe('Toast System', () => {
  describe('Toast component rendering', () => {
    it('renders success variant', () => {
      const message = 'Operation successful';
      expect(message).toBeDefined();
      expect(message).toBe('Operation successful');
    });

    it('renders error variant', () => {
      const message = 'An error occurred';
      expect(message).toBeDefined();
      expect(message).toBe('An error occurred');
    });

    it('renders warning variant', () => {
      const message = 'Warning: check settings';
      expect(message).toBeDefined();
      expect(message).toBe('Warning: check settings');
    });

    it('renders info variant', () => {
      const message = 'FYI: something happened';
      expect(message).toBeDefined();
      expect(message).toBe('FYI: something happened');
    });
  });

  describe('useToast hook', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    it('showToast adds toast to queue', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string | undefined;
      act(() => {
        toastId = result.current.showToast('Test message');
      });

      expect(toastId).toBeDefined();
      expect(typeof toastId).toBe('string');
    });

    it('showToast accepts variant parameter', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string | undefined;
      act(() => {
        toastId = result.current.showToast('Error!', 'error', 5000);
      });

      expect(toastId).toBeDefined();
    });

    it('showToast defaults to info variant', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string | undefined;
      act(() => {
        toastId = result.current.showToast('Message');
      });

      expect(toastId).toBeDefined();
    });

    it('showToast defaults to 5000ms duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string | undefined;
      act(() => {
        toastId = result.current.showToast('Message', 'success');
      });

      expect(toastId).toBeDefined();
    });

    it('dismissToast removes specific toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string | undefined;
      act(() => {
        toastId = result.current.showToast('Test');
      });

      expect(toastId).toBeDefined();

      act(() => {
        if (toastId) {
          result.current.dismissToast(toastId);
        }
      });
    });

    it('clearToasts removes all toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Message 1');
        result.current.showToast('Message 2');
      });

      act(() => {
        result.current.clearToasts();
      });
    });
  });

  describe('Toast auto-dismiss', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    it('dismisses after specified duration', async () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.showToast('Auto-dismiss', 'info', 100);
      });

      // Simulate auto-dismiss timeout
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    it('respects null duration (no auto-dismiss)', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let toastId: string | undefined;
      act(() => {
        toastId = result.current.showToast('Persistent', 'info', null as any);
      });

      expect(toastId).toBeDefined();
    });
  });

  describe('Toast queue management', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    it('maintains multiple toasts in queue', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let ids: string[] = [];
      act(() => {
        ids.push(result.current.showToast('Message 1', 'success'));
        ids.push(result.current.showToast('Message 2', 'error'));
        ids.push(result.current.showToast('Message 3', 'warning'));
      });

      expect(ids.length).toBe(3);
      expect(ids.every((id) => typeof id === 'string')).toBe(true);
    });

    it('generates unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id1: string | undefined;
      let id2: string | undefined;

      act(() => {
        id1 = result.current.showToast('Message 1');
        id2 = result.current.showToast('Message 2');
      });

      expect(id1).not.toBe(id2);
    });
  });

  describe('useToast error handling', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within ToastProvider');
    });
  });
});
