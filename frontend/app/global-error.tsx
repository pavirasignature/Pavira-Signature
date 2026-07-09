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
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0B3B2E", color: "#F8F7F3", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#D4B06A", marginBottom: "1rem" }}>Oops!</h1>
            <p style={{ color: "rgba(248,247,243,0.6)", fontSize: "1.125rem", marginBottom: "2rem" }}>
              Something went wrong. Please try refreshing the page.
            </p>
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
