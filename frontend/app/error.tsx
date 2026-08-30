"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#F9F6F0",
        color: "#1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "28rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1rem", color: "#1A1A1A" }}>
          Something went wrong
        </h2>
        <p style={{ color: "#666", marginBottom: "2rem", fontSize: "1rem", lineHeight: "1.5" }}>
          An unexpected error occurred while loading this page. Please try again.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.875rem 2rem",
              backgroundColor: "#0C3A2E",
              color: "#FFFFFF",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              borderRadius: "2px",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              padding: "0.875rem 2rem",
              border: "1px solid #0C3A2E",
              color: "#0C3A2E",
              fontWeight: "600",
              textDecoration: "none",
              borderRadius: "2px",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
