/**
 * Generic loading indicator.
 * Displays spinner + optional message.
 */

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  fullScreen = false,
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Spinner */}
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
        {/* Message */}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
