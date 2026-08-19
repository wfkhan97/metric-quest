import { Component, type ReactNode } from 'react';
import { trackClientError } from '../lib/analytics';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  recoveryKey: number;
};

/** Keeps a render failure inside the terminal shell instead of blanking the app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, recoveryKey: 0 };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, recoveryKey: 0 };
  }

  componentDidCatch(): void {
    // Do not transmit the error text or component stack: either can contain
    // learner-provided text. A count by recovery surface is sufficient here.
    trackClientError('error_boundary');
  }

  tryAgain = () => {
    this.setState((state) => ({ hasError: false, recoveryKey: state.recoveryKey + 1 }));
  }

  render() {
    if (!this.state.hasError) return <div key={this.state.recoveryKey}>{this.props.children}</div>;

    return (
      <main className="app-shell error-boundary" aria-labelledby="signal-lost-title">
        <section className="error-boundary-panel" role="alert">
          <p className="eyebrow">Aurora Music mainframe · connection fault</p>
          <h1 id="signal-lost-title">Signal lost</h1>
          <p>Something unexpected interrupted this screen. Your saved progress is still safe when browser storage is available.</p>
          <div className="actions">
            <button type="button" className="primary" onClick={this.tryAgain}>
              Try again
            </button>
            <button type="button" className="start-button" onClick={() => window.location.reload()}>
            Reload terminal
            </button>
          </div>
        </section>
      </main>
    );
  }
}
