/**
 * Empty state display.
 * Shows message when no data available.
 */

interface EmptyStateProps {
  /** Title message. Default: 'No data found' */
  title?: string;
  /** Description/detail message */
  message?: string;
  /** Show full-screen layout or inline. Default: false (inline) */
  fullScreen?: boolean;
  /** Optional action button */
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No data found',
  message,
  fullScreen = false,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50 px-4'
    : 'flex items-center justify-center py-12 px-4';

  return (
    <div className={containerClass}>
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gray-100 p-3">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>

        {/* Message */}
        {message && <p className="mb-6 text-sm text-gray-600">{message}</p>}

        {/* Action button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
