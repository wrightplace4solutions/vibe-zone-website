import React from "react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 24,
          color: "#fff",
          background: "#0b0b13"
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ opacity: 0.8, textAlign: "center", maxWidth: 600 }}>
            The app failed to load. We’ve logged the error. Please refresh the page.
          </p>
          {this.state.error && (
            <pre style={{
              marginTop: 16,
              maxWidth: 800,
              whiteSpace: "pre-wrap",
              background: "rgba(255,255,255,0.06)",
              padding: 12,
              borderRadius: 8
            }}>
              {String(this.state.error)}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
