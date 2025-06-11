import React from 'react';
import PropTypes from 'prop-types';

const STYLES = {
  CONTAINER:
    'p-8 text-center max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-sm',
  TITLE: 'text-red-600 text-2xl font-semibold mb-4',
  MESSAGE: 'text-gray-600 mb-6',
  BUTTON:
    'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors',
  ERROR_DETAILS:
    'mt-4 p-4 bg-gray-100 rounded text-left text-sm text-gray-700 overflow-auto',
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to your error tracking service here
    console.error('ErrorBoundary caught an error:', {
      error: error,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const { error, errorInfo } = this.state;

      return (
        <div className={STYLES.CONTAINER}>
          <h2 className={STYLES.TITLE}>Oops! Something went wrong</h2>
          <p className={STYLES.MESSAGE}>
            We&apos;re sorry, but something went wrong. Please try reloading the
            page.
          </p>

          <div className='space-x-4'>
            <button
              onClick={() => window.location.reload()}
              className={STYLES.BUTTON}
            >
              Reload Page
            </button>

            <button
              onClick={this.handleReset}
              className={`${STYLES.BUTTON} bg-gray-600 hover:bg-gray-700`}
            >
              Try Again
            </button>
          </div>

          {isDevelopment && error && (
            <div className={STYLES.ERROR_DETAILS}>
              <p className='font-semibold mb-2'>Error Details:</p>
              <p className='mb-2'>{error.toString()}</p>
              {errorInfo && (
                <pre className='whitespace-pre-wrap'>
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

// Higher-order component with prop types
export function withErrorBoundary(WrappedComponent) {
  const WithErrorBoundary = props => {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundary;
}
