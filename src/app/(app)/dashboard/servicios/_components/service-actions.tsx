"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MoreVertical, Edit, EyeOff, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleServiceActive, deleteService } from "@/server/actions/services";

export function ServiceActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const r = await toggleServiceActive(id);
      if (!r.ok) toast.error(r.error);
      else toast.success(isActive ? "Servicio pausado" : "Servicio activado");
      setOpen(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const r = await deleteService(id);
      if (!r.ok) toast.error(r.error);
      else toast.success("Servicio eliminado");
      setConfirmDelete(false);
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/dashboard/servicios/${id}/editar`}>
            <Edit className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Más opciones"
        >
          <MoreVertical className="size-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opciones del servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleToggle}
              disabled={isPending}
            >
              {isActive ? (
                <>
                  <EyeOff className="size-4" /> Pausar servicio
                </>
              ) : (
                <>
                  <Eye className="size-4" /> Activar servicio
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
            >
              <Trash2 className="size-4" /> Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar servicio?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Si el servicio tiene citas, se
              mantendrán pero ya no podrás agendarlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
