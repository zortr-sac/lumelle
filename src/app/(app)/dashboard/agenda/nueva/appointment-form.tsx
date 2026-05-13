"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createAppointment } from "@/server/actions/appointments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatPEN } from "@/lib/format/currency";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
};
type Customer = { id: string; name: string; phone: string | null };
type Staff = { id: string; display_name: string; color: string | null };

export function AppointmentForm({
  services,
  customers,
  staffList,
}: {
  services: Service[];
  customers: Customer[];
  staffList: Staff[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState<string>();
  const [serviceId, setServiceId] = useState<string>();
  const [staffId, setStaffId] = useState<string>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !serviceId || !date) {
      toast.error("Cliente, servicio y fecha son obligatorios");
      return;
    }

    const [h, m] = time.split(":").map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(h ?? 10, m ?? 0, 0, 0);

    startTransition(async () => {
      const r = await createAppointment({
        customerId,
        serviceId,
        staffId: staffId ?? null,
        startsAt: startsAt.toISOString(),
        notes: notes || undefined,
        status: "confirmed",
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Cita agendada âœ¨");
      router.push("/dashboard/agenda");
      router.refresh();
    });
  }

  return (
    <Card className="glass-card-strong">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Clienta</Label>
            {customers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Primero crea una clienta en{" "}
                <Link
                  href="/dashboard/clientas/nueva"
                  className="text-primary underline"
                >
                  Clientas â†’ Nueva
                </Link>
              </p>
            ) : (
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar clienta" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Servicio</Label>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Primero crea un servicio en{" "}
                <Link
                  href="/dashboard/servicios/nuevo"
                  className="text-primary underline"
                >
                  Servicios â†’ Nuevo
                </Link>
              </p>
            ) : (
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.duration_minutes}min ·{" "}
                      {formatPEN(s.price_cents)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {staffList.length > 0 && (
            <div className="space-y-2">
              <Label>Técnica (opcional)</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: s.color ?? "#5C435D" }}
                        />
                        {s.display_name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {date
                      ? format(date, "PPP", { locale: es })
                      : "Elegir fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: pedir esmalte de color azul, llega 5 min tarde…"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Agendando…
                </>
              ) : (
                "Agendar cita"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
