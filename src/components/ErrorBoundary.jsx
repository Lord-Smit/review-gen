import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Top-level error boundary.
 *
 * A render-time exception in any route must not leave customers staring at a
 * blank white page. This component catches the error, reports it to the console
 * (where a real deployment can forward it to monitoring), and offers a reload.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled application error:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-3 text-base text-gray-500">
            The page ran into an unexpected error. Reloading usually fixes it.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-gray-900 p-3 text-left text-xs text-red-200">
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
