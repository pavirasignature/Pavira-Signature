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
        backgroundColor: "#0B3B2E",
        color: "#F8F7F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "28rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Something went wrong
        </h2>
        <p style={{ color: "rgba(248,247,243,0.6)", marginBottom: "2.5rem", fontSize: "1.125rem" }}>
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={reset}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#D4B06A",
              color: "#0B3B2E",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              borderRadius: "2px",
              fontSize: "1rem",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              padding: "1rem 2rem",
              border: "1px solid rgba(248,247,243,0.2)",
              color: "#F8F7F3",
              fontWeight: "600",
              borderRadius: "2px",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
