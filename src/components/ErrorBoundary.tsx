import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/** Keeps a render failure inside the terminal shell instead of blanking the app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-shell error-boundary" aria-labelledby="signal-lost-title">
        <section className="error-boundary-panel" role="alert">
          <p className="eyebrow">Aurora Music mainframe · connection fault</p>
          <h1 id="signal-lost-title">Signal lost</h1>
          <p>Reload to reconnect.</p>
          <button type="button" className="start-button" onClick={() => window.location.reload()}>
            Reload terminal
          </button>
        </section>
      </main>
    );
  }
}
