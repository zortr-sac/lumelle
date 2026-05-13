"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { uuid } from "@/lib/validators/common";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const createAppointmentSchema = z.object({
  customerId: uuid,
  serviceId: uuid,
  staffId: uuid.optional().nullable(),
  startsAt: z.string().datetime(),
  notes: z.string().trim().max(500).optional(),
  status: z
    .enum([
      "requested",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .default("confirmed"),
});

export async function createAppointment(
  input: z.infer<typeof createAppointmentSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole("receptionist");
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const data = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", data.serviceId)
    .eq("business_id", session.businessId)
    .single();

  if (!service) return { ok: false, error: "Servicio no encontrado" };

  const startsAt = new Date(data.startsAt);
  const endsAt = addMinutes(startsAt, service.duration_minutes);

  const { data: created, error } = await supabase
    .from("appointments")
    .insert({
      business_id: session.businessId,
      customer_id: data.customerId,
      service_id: data.serviceId,
      staff_id: data.staffId ?? null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: data.status,
      notes: data.notes ?? null,
      source: "dashboard",
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("appointments_no_overlap")) {
      return {
        ok: false,
        error: "Hay un conflicto de horarios. Prueba con otra hora.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: created.id } };
}

export async function updateAppointmentStatus(
  id: string,
  status: z.infer<typeof createAppointmentSchema>["status"],
  reason?: string,
): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status, internal_notes: reason ?? null })
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) {
    if (error.message.includes("appointments_no_overlap")) {
      return {
        ok: false,
        error:
          "No se puede confirmar: ya hay otra cita confirmada en ese horario.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rescheduleAppointment(
  id: string,
  newStartsAt: string,
): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const { data: appt } = await supabase
    .from("appointments")
    .select("starts_at, ends_at, service_id")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .single();

  if (!appt) return { ok: false, error: "Cita no encontrada" };

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", appt.service_id)
    .single();

  const duration = service?.duration_minutes ?? 60;
  const startsAt = new Date(newStartsAt);
  const endsAt = addMinutes(startsAt, duration);

  const { error } = await supabase
    .from("appointments")
    .update({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.message.includes("appointments_no_overlap")) {
      return { ok: false, error: "Conflicto de horarios" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/agenda");
  return { ok: true };
}
