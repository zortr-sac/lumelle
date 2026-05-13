"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { closeCashSession } from "@/server/actions/cash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPEN, toCents, fromCents } from "@/lib/format/currency";

export function CloseSessionForm({ expectedCents }: { expectedCents: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [closing, setClosing] = useState("");
  const [notes, setNotes] = useState("");

  const closingCents = closing ? toCents(closing) : null;
  const difference = closingCents != null ? closingCents - expectedCents : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await closeCashSession({
        closingCents: closingCents ?? 0,
        notes: notes || undefined,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const diff = r.data?.differenceCents ?? 0;
      const msg =
        diff === 0
          ? "Caja cuadrada ✓"
          : `Caja cerrada con ${diff > 0 ? "sobrante" : "faltante"} de ${formatPEN(Math.abs(diff))}`;
      toast.success(msg);
      router.push("/dashboard/caja");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="closing">Efectivo contado en caja</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            S/
          </span>
          <Input
            id="closing"
            type="number"
            min={0}
            step={0.5}
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            className="pl-10 font-display text-xl"
            autoFocus
          />
        </div>
      </div>

      {difference != null && (
        <Alert
          variant={
            difference === 0 ? "success" : difference > 0 ? "info" : "warning"
          }
        >
          {difference === 0 ? (
            <>
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                <strong>Cuadra perfecto.</strong> Diferencia: S/0.00
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                {difference > 0 ? "Sobrante" : "Faltante"} de{" "}
                <strong>{formatPEN(Math.abs(difference))}</strong>.{" "}
                {difference > 0
                  ? "Hay más efectivo del esperado."
                  : "Falta efectivo."}
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Devolución olvidada, propina extra…"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isPending || closingCents == null}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Cerrando…
            </>
          ) : (
            "Cerrar caja"
          )}
        </Button>
      </div>
    </form>
  );
}
