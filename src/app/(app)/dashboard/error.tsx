"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard-error]", error);
  }, [error]);

  return (
    <Card className="glass-card-strong mx-auto mt-8 max-w-xl">
      <CardContent className="p-8 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-amber-100">
          <AlertTriangle className="size-7 text-amber-600" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-[-0.04em]">
          No pudimos cargar esta sección
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Reintenta en unos segundos. Si persiste, revisa tu conexión.
        </p>
        {error.digest && (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            ID: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw className="size-4" /> Reintentar
          </Button>
          <Button asChild variant="glass">
            <Link href="/dashboard">Ir al inicio</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
