"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Catches errors thrown during render/data fetching.
 * NOT used for 404 (use not-found.tsx) or for the root layout (use global-error.tsx).
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // TODO: integrate Sentry/Datadog here once configured
      console.error("[route-error]", error);
    }
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-20" />
      </div>
      <div className="container max-w-md text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-amber-100">
          <AlertTriangle className="size-9 text-amber-600" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-4xl">
          Algo salió mal
        </h1>
        <p className="mb-2 text-muted-foreground">
          Tuvimos un problema cargando esta página. Ya estamos enterados.
        </p>
        {error.digest && (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            <RotateCcw className="size-4" /> Reintentar
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link href="/dashboard">
              <Home className="size-4" /> Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
