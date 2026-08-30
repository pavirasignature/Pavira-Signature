"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#F9F6F0",
          color: "#1A1A1A",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "600",
                color: "#1A1A1A",
                marginBottom: "1rem",
              }}
            >
              Application Error
            </h1>
            <p
              style={{
                color: "#666",
                fontSize: "1rem",
                marginBottom: "2rem",
                lineHeight: "1.5",
              }}
            >
              An unexpected error occurred. Please try reloading the application.
            </p>
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
          </div>
        </div>
      </body>
    </html>
  );
}
