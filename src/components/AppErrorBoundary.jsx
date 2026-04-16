import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[app-error-boundary] render failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-fallback-shell">
          <div className="app-fallback-card">
            <p className="app-fallback-kicker">DroMetaSites</p>
            <h1>The page hit a client-side error.</h1>
            <p>
              Refresh once. If it still fails, the deployment needs another patch, but
              the site is no longer allowed to collapse into a blank screen.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
