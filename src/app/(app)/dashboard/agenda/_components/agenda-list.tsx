import Link from "next/link";
import { addDays } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/empty-states/empty-state";
import { IllustrationAgenda } from "@/components/empty-states/illustrations";
import { PAGE_SIZE } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppointmentRow } from "./appointment-row";

export async function AgendaList({
  businessId,
  date,
  status,
}: {
  businessId: string;
  date: Date;
  status?: string;
}) {
  const dayEnd = addDays(date, 1);

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, notes, customer:customers(id, name, phone), service:services(name, price_cents, duration_minutes), staff:staff(id, display_name, color)",
    )
    .eq("business_id", businessId)
    .gte("starts_at", date.toISOString())
    .lt("starts_at", dayEnd.toISOString())
    .order("starts_at")
    .limit(PAGE_SIZE.APPOINTMENTS);

  if (status) query = query.eq("status", status as never);

  const { data: appointments } = await query;

  if (!appointments || appointments.length === 0) {
    return (
      <Surface variant="elevated" className="p-4">
        <EmptyState
          illustration={<IllustrationAgenda />}
          title="Agenda libre este día"
          description="No hay citas. Crea una nueva o cambia de fecha."
          action={
            <Button asChild>
              <Link href="/dashboard/agenda/nueva">
                <Plus className="size-4" /> Crear cita
              </Link>
            </Button>
          }
        />
      </Surface>
    );
  }

  return (
    <Surface variant="elevated" className="p-2 md:p-3">
      <ul className="divide-y divide-border/70">
        {appointments.map((appt: any) => (
          <AppointmentRow key={appt.id} appointment={appt} />
        ))}
      </ul>
    </Surface>
  );
}
