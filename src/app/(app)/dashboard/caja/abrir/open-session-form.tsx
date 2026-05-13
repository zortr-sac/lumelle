"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { openCashSession } from "@/server/actions/cash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toCents } from "@/lib/format/currency";

export function OpenSessionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [opening, setOpening] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await openCashSession({
        openingCents: toCents(opening || "0"),
        notes: notes || undefined,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Caja abierta 💼");
      router.push("/dashboard/caja");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="opening">Efectivo de apertura</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            S/
          </span>
          <Input
            id="opening"
            type="number"
            min={0}
            step={0.5}
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Cuenta los billetes y monedas físicos antes de empezar.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Fondo fijo del día"
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Abriendo…
            </>
          ) : (
            "Abrir caja"
          )}
        </Button>
      </div>
    </form>
  );
}
