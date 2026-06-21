/**
 * @file components/ErrorBoundary.jsx
 * @description React class-based Error Boundary.
 *
 * Catches JavaScript errors in any child component tree and renders a
 * friendly fallback UI instead of crashing the whole application.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * React requires a class component for error boundaries because the
 * lifecycle methods componentDidCatch and getDerivedStateFromError are
 * not yet available as hooks.
 */

import { Component } from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  /**
   * Update state so the next render shows the fallback UI.
   * @param {Error} error
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Unknown error" };
  }

  /**
   * Log error details for debugging.
   * @param {Error}          error
   * @param {React.ErrorInfo} info
   */
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show default UI
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "24px",
            borderRadius: 16,
            background: "rgba(255,60,60,0.06)",
            border: "1px solid rgba(255,60,60,0.18)",
            color: "rgba(255,255,255,0.65)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            textAlign: "center",
            gap: 10,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,80,80,0.7)"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
            Something went wrong
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {this.state.errorMessage}
          </span>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            style={{
              marginTop: 8,
              padding: "6px 18px",
              borderRadius: 8,
              border: "1px solid rgba(0,198,255,0.35)",
              background: "rgba(0,198,255,0.10)",
              color: "#00c6ff",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /** Component tree to protect */
  children: PropTypes.node.isRequired,
  /** Optional custom fallback UI to render on error */
  fallback: PropTypes.node,
};

export default ErrorBoundary;
