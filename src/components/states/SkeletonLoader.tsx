/**
 * Generic skeleton loader.
 * Displays placeholder shimmer while content loads.
 */

interface SkeletonLoaderProps {
  /** Number of skeleton items to display. Default: 3 */
  count?: number;
  /** Height of each skeleton item. Default: 'h-12' (3rem) */
  height?: string;
  /** Optional className override */
  className?: string;
  /** Show full-screen layout or inline. Default: false (inline) */
  fullScreen?: boolean;
}

export function SkeletonLoader({
  count = 3,
  height = 'h-12',
  className = '',
  fullScreen = false,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const containerClass = fullScreen
    ? 'min-h-screen bg-gray-50 p-6'
    : '';

  return (
    <div className={containerClass}>
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i}
            className={`${height} w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${className}`}
          />
        ))}
      </div>
    </div>
  );
}
