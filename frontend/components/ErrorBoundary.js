import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry, but something went wrong. Please try again later.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>

          <style jsx>{`
            .error-container {
              padding: 2rem;
              text-align: center;
              max-width: 600px;
              margin: 2rem auto;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            h2 {
              color: #e53e3e;
              margin-bottom: 1rem;
            }

            p {
              color: #666;
              margin-bottom: 1.5rem;
            }

            button {
              background-color: #0070f3;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.2s;
            }

            button:hover {
              background-color: #0051cc;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap pages with ErrorBoundary
export function withErrorBoundary(WrappedComponent) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
