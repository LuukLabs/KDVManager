import { Component, type ReactNode } from 'react';
import ErrorPage from './ErrorPage';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // intentional diagnostic log
    // eslint-disable-next-line no-console
    console.error('Unhandled error boundary error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage errorOverride={this.state.error} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
