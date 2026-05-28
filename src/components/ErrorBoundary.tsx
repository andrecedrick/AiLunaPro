import React, { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * Distinguish a lazy-chunk / network load failure (often caused by an
   * ad-blocker / privacy extension / flaky network) from a real render error.
   * No retry system — just a clearer message + a full page reload action.
   */
  private isChunkLoadError(): boolean {
    const msg = this.state.error?.message ?? '';
    return /dynamically imported module|Loading chunk .* failed|Importing a module script failed|Failed to fetch/i.test(
      msg,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const chunkFail = this.isChunkLoadError();

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {chunkFail ? 'Couldn’t load the page' : 'Oops!'}
            </h1>
            <p className="text-gray-700 mb-4">
              {chunkFail
                ? 'Part of the app failed to load. This is usually a network issue or a browser ad-blocker / privacy extension blocking the app.'
                : 'Something went wrong. Please try again.'}
            </p>
            {chunkFail && (
              <ul className="text-gray-700 text-sm mb-4 list-disc list-inside">
                <li>Reload the page (often fixes a transient network failure).</li>
                <li>Allow <strong>audit.ailunapro.com</strong> in your ad-blocker.</li>
                <li>Allow <strong>*.googleapis.com</strong> (Firebase / Firestore).</li>
                <li>If on a corporate network: ask IT to allow the domains above.</li>
              </ul>
            )}
            {import.meta.env.DEV && (
              <details className="mb-4 text-sm bg-gray-100 p-2 rounded">
                <summary className="font-mono text-red-600 cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            {chunkFail ? (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Reload page
              </button>
            ) : (
              <button
                onClick={this.reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
