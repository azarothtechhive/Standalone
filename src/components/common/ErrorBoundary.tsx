import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Uncaught error caught in ErrorBoundary:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            Something encountered an issue
          </h1>
          <p style={{ maxWidth: '500px', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            An unexpected error occurred while rendering this page. You can try again, return to the
            homepage, or reload the application.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={this.handleRetry} className="btn btn-primary" type="button">
              Try again
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className="btn btn-outline"
              type="button"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
