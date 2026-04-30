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

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
              <p className="text-gray-700 mb-4">
                Something went wrong. Please try again.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-4 text-sm bg-gray-100 p-2 rounded">
                  <summary className="font-mono text-red-600 cursor-pointer">
                    Error details
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={this.reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
