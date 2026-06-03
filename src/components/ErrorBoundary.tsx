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

      // Inline styles ONLY — must render visibly even if the bundled CSS
      // (Tailwind/tokens) failed to load. Never rely on utility classes here.
      const wrap: React.CSSProperties = {
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16, background: '#F4F6FB',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      };
      const card: React.CSSProperties = {
        maxWidth: 460, width: '100%', background: '#FFFFFF', borderRadius: 14,
        boxShadow: '0 6px 24px rgba(0,0,0,0.10)', padding: 24, color: '#0F172A',
      };
      const btnPrimary: React.CSSProperties = {
        width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none',
        background: '#7C3AED', color: '#fff', fontWeight: 700, fontSize: 14,
        cursor: 'pointer', marginTop: 8,
      };
      const btnSecondary: React.CSSProperties = {
        width: '100%', padding: '10px 16px', borderRadius: 10,
        border: '1px solid #CBD5E1', background: 'transparent', color: '#334155',
        fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8,
      };

      return (
        <div style={wrap} role="alert">
          <div style={card}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#B91C1C', margin: '0 0 10px' }}>
              {chunkFail ? 'Couldn’t load the page' : 'Something went wrong'}
            </h1>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.55, margin: '0 0 12px' }}>
              {chunkFail
                ? 'Part of the app failed to load. This is usually a network issue or a browser ad-blocker / privacy extension blocking the app.'
                : 'An unexpected error occurred. Reloading usually fixes it.'}
            </p>
            {chunkFail && (
              <ul style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: '0 0 12px', paddingLeft: 18 }}>
                <li>Reload the page (often fixes a transient network failure).</li>
                <li>Allow <strong>audit.ailunapro.com</strong> in your ad-blocker.</li>
                <li>Allow <strong>*.googleapis.com</strong> (Firebase / Firestore).</li>
                <li>If on a corporate network: ask IT to allow the domains above.</li>
              </ul>
            )}
            {import.meta.env.DEV && (
              <details style={{ margin: '0 0 12px', fontSize: 12, background: '#F1F5F9', padding: 8, borderRadius: 8 }}>
                <summary style={{ fontFamily: 'monospace', color: '#B91C1C', cursor: 'pointer' }}>
                  Error details
                </summary>
                <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 11 }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            {/* Retry re-attempts the lazy import (reset → Suspense via lazyWithRetry);
                Reload is the hard fallback. Both always visible. */}
            <button onClick={this.reset} style={btnPrimary}>
              {chunkFail ? 'Retry loading' : 'Try again'}
            </button>
            <button onClick={() => window.location.reload()} style={btnSecondary}>
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
