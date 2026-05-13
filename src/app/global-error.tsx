"use client";

/**
 * Global error boundary — replaces the root layout when an error escapes from it.
 * Keep it self-contained (no global CSS, no providers): if it tries to use them
 * and those failed too, we'd get an infinite loop.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-PE">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#D8C7D9,#E9B7B8,#FFF3EA)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#2A1E2D",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 650, marginBottom: 8 }}>
            Algo salió muy mal
          </h1>
          <p style={{ color: "#6F6671", marginBottom: 24 }}>
            La aplicación no pudo iniciar. Por favor recarga la página.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: "#7A6F88",
                marginBottom: 24,
                fontFamily: "monospace",
              }}
            >
              ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "linear-gradient(135deg,#5C435D,#B86F5C)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
