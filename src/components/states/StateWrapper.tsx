/**
 * StateWrapper — manages loading/empty/error/loaded states.
 * Uses discriminated union for type-safe state management.
 */

import type { ReactNode } from 'react';
import { LoadingState } from './LoadingState';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';
import { ErrorBoundary } from '../ErrorBoundary';
import { useLocale } from '../../context/LocaleContext';

/**
 * Discriminated union for state config.
 * Each state variant enforces its required props.
 */
export type StateConfig =
  | {
      state: 'loading';
      /** Optional loading message. Default: 'Loading...' */
      message?: string;
      /** Show full-screen or inline. Default: false (inline) */
      fullScreen?: boolean;
    }
  | {
      state: 'skeleton';
      /** Number of skeleton items. Default: 3 */
      count?: number;
      /** Height of each item. Default: 'h-12' */
      height?: string;
      /** Show full-screen or inline. Default: false (inline) */
      fullScreen?: boolean;
    }
  | {
      state: 'empty';
      /** Empty state title. Default: 'No data found' */
      title?: string;
      /** Empty state message */
      message?: string;
      /** Optional action button label */
      actionLabel?: string;
      /** Optional action button callback */
      onAction?: () => void;
      /** Show full-screen or inline. Default: false (inline) */
      fullScreen?: boolean;
    }
  | {
      state: 'error';
      /** Error object or message */
      error: Error | string;
      /** Optional retry callback */
      onRetry?: () => void;
      /** Show full-screen or inline. Default: false (inline) */
      fullScreen?: boolean;
    }
  | {
      state: 'loaded';
      /** Content to display */
      children: ReactNode;
    };

type StateWrapperProps = StateConfig & {
  /** Wrap loaded content with ErrorBoundary. Default: true */
  withErrorBoundary?: boolean;
};

export function StateWrapper({
  withErrorBoundary = true,
  ...config
}: StateWrapperProps) {
  const C = useLocale().common;
  // Loading state
  if (config.state === 'loading') {
    return (
      <LoadingState
        message={config.message}
        fullScreen={config.fullScreen}
      />
    );
  }

  // Skeleton state
  if (config.state === 'skeleton') {
    return (
      <SkeletonLoader
        count={config.count}
        height={config.height}
        fullScreen={config.fullScreen}
      />
    );
  }

  // Empty state
  if (config.state === 'empty') {
    return (
      <EmptyState
        title={config.title}
        message={config.message}
        actionLabel={config.actionLabel}
        onAction={config.onAction}
        fullScreen={config.fullScreen}
      />
    );
  }

  // Error state
  if (config.state === 'error') {
    const errorMessage =
      config.error instanceof Error ? config.error.message : config.error;

    return (
      <div
        className={
          config.fullScreen
            ? 'min-h-screen flex items-center justify-center bg-gray-50 px-4'
            : 'flex items-center justify-center py-12 px-4'
        }
      >
        <div className="max-w-md text-center">
          {/* Error icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error title */}
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {C.somethingWentWrong}
          </h3>

          {/* Error message */}
          <p className="mb-6 text-sm text-gray-600">{errorMessage}</p>

          {/* Retry button */}
          {config.onRetry && (
            <button
              onClick={config.onRetry}
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {C.tryAgain}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loaded state
  if (config.state === 'loaded') {
    const content = config.children;
    return withErrorBoundary ? (
      <ErrorBoundary>{content}</ErrorBoundary>
    ) : (
      content
    );
  }

  // Fallback (should never reach)
  return null;
}
