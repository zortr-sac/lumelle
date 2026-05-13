"use client";

import { useState, useTransition } from "react";
import {
  Check,
  MessageCircle,
  MoreVertical,
  Play,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPEN } from "@/lib/format/currency";
import { formatTime } from "@/lib/format/date";
import { whatsappNumber } from "@/lib/format/phone";
import { updateAppointmentStatus } from "@/server/actions/appointments";

type AppointmentForRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  customer: { id: string; name: string; phone: string | null } | null;
  service: {
    name: string;
    price_cents: number;
    duration_minutes: number;
  } | null;
  staff: { id: string; display_name: string; color: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  requested: "Solicitada",
  confirmed: "Confirmada",
  in_progress: "En atención",
  completed: "Atendida",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

const STATUS_COLORS: Record<
  string,
  "info" | "success" | "warning" | "soft" | "destructive"
> = {
  requested: "warning",
  confirmed: "info",
  in_progress: "success",
  completed: "soft",
  cancelled: "destructive",
  no_show: "destructive",
};

export function AppointmentRow({
  appointment,
}: {
  appointment: AppointmentForRow;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const customer = Array.isArray(appointment.customer)
    ? appointment.customer[0]
    : appointment.customer;
  const service = Array.isArray(appointment.service)
    ? appointment.service[0]
    : appointment.service;
  const staff = Array.isArray(appointment.staff)
    ? appointment.staff[0]
    : appointment.staff;

  function handleStatus(status: AppointmentForRow["status"]) {
    startTransition(async () => {
      const r = await updateAppointmentStatus(appointment.id, status as never);
      if (!r.ok) toast.error(r.error);
      else {
        toast.success(`Cita ${STATUS_LABELS[status]?.toLowerCase()}`);
        setOpen(false);
      }
    });
  }

  return (
    <li className="grid grid-cols-[4.25rem_0.5rem_minmax(0,1fr)_auto] items-center gap-3 px-2 py-3 md:grid-cols-[4.75rem_0.5rem_minmax(0,1fr)_6rem_auto_auto] md:px-3">
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums leading-tight tracking-[-0.04em]">
          {formatTime(appointment.starts_at)}
        </p>
        <p className="text-xs text-muted-foreground">
          {service?.duration_minutes ?? 0}min
        </p>
      </div>
      <div
        className="size-2 rounded-full"
        style={{ background: staff?.color ?? "#5C435D" }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {customer?.name ?? "Sin cliente"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {service?.name}
          {staff && ` · ${staff.display_name}`}
        </p>
      </div>
      <div className="hidden text-right md:block">
        <p className="text-sm font-semibold tabular-nums">
          {service && formatPEN(service.price_cents)}
        </p>
      </div>
      <Badge variant={STATUS_COLORS[appointment.status] ?? "soft"}>
        {STATUS_LABELS[appointment.status]}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Acciones"
      >
        <MoreVertical className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{customer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 rounded-2xl bg-muted/55 p-4 text-sm">
            <p>
              <strong>Servicio:</strong> {service?.name}
            </p>
            <p>
              <strong>Hora:</strong> {formatTime(appointment.starts_at)} -{" "}
              {formatTime(appointment.ends_at)}
            </p>
            {staff && (
              <p>
                <strong>Técnica:</strong> {staff.display_name}
              </p>
            )}
            {appointment.notes && (
              <p className="text-muted-foreground">{appointment.notes}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {appointment.status === "requested" && (
              <Button
                onClick={() => handleStatus("confirmed")}
                disabled={isPending}
              >
                <Check className="size-4" /> Confirmar
              </Button>
            )}
            {appointment.status === "confirmed" && (
              <Button
                onClick={() => handleStatus("in_progress")}
                disabled={isPending}
              >
                <Play className="size-4" /> Iniciar
              </Button>
            )}
            {appointment.status === "in_progress" && (
              <Button
                onClick={() => handleStatus("completed")}
                disabled={isPending}
              >
                <Square className="size-4" /> Finalizar
              </Button>
            )}
            {customer?.phone && (
              <Button asChild variant="glass">
                <a
                  href={`https://wa.me/${whatsappNumber(customer.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              </Button>
            )}
            {!["completed", "cancelled", "no_show"].includes(
              appointment.status,
            ) && (
              <Button
                variant="ghost"
                onClick={() => handleStatus("cancelled")}
                disabled={isPending}
                className="col-span-2 text-destructive hover:text-destructive"
              >
                <X className="size-4" /> Cancelar cita
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}
