"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    startTransition(async () => {
      const r = await changePassword(password);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Contraseña actualizada");
      setPassword("");
      setConfirm("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPwd">Nueva contraseña</Label>
        <Input
          id="newPwd"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres, una mayúscula y un número.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPwd">Confirmar contraseña</Label>
        <Input
          id="confirmPwd"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !password}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Cambiando…
            </>
          ) : (
            "Cambiar contraseña"
          )}
        </Button>
      </div>
    </form>
  );
}
