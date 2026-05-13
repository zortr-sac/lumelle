"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serviceSchema } from "@/lib/validators/service";
import { requireRole, requireBusiness } from "@/lib/auth/session";
import { uuid } from "@/lib/validators/common";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function createService(
  input: z.infer<typeof serviceSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole("owner");
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { data: created, error } = await supabase
    .from("services")
    .insert({
      business_id: session.businessId,
      name: data.name,
      category: data.category || null,
      description: data.description || null,
      price_cents: data.priceCents,
      duration_minutes: data.durationMinutes,
      buffer_minutes: data.bufferMinutes,
      image_url: data.imageUrl || null,
      is_active: data.isActive,
      requires_staff_selection: data.requiresStaffSelection,
    })
    .select("id")
    .single();

  if (error || !created) return { ok: false, error: error?.message ?? "Error" };

  if (data.staffIds.length > 0) {
    await supabase.from("service_staff").insert(
      data.staffIds.map((staffId) => ({
        service_id: created.id,
        staff_id: staffId,
      })),
    );
  }

  revalidatePath("/dashboard/servicios");
  return { ok: true, data: { id: created.id } };
}

export async function updateService(
  id: string,
  input: z.infer<typeof serviceSchema>,
): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("owner");
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("services")
    .update({
      name: data.name,
      category: data.category || null,
      description: data.description || null,
      price_cents: data.priceCents,
      duration_minutes: data.durationMinutes,
      buffer_minutes: data.bufferMinutes,
      image_url: data.imageUrl || null,
      is_active: data.isActive,
      requires_staff_selection: data.requiresStaffSelection,
    })
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) return { ok: false, error: error.message };

  await supabase.from("service_staff").delete().eq("service_id", id);
  if (data.staffIds.length > 0) {
    await supabase.from("service_staff").insert(
      data.staffIds.map((staffId) => ({
        service_id: id,
        staff_id: staffId,
      })),
    );
  }

  revalidatePath("/dashboard/servicios");
  return { ok: true };
}

export async function toggleServiceActive(id: string): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { data: current } = await supabase
    .from("services")
    .select("is_active")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .single();

  if (!current) return { ok: false, error: "Servicio no encontrado" };

  const { error } = await supabase
    .from("services")
    .update({ is_active: !current.is_active })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/servicios");
  return { ok: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/servicios");
  return { ok: true };
}

export async function listServices() {
  const session = await requireBusiness();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("services")
    .select(
      "id, name, category, description, price_cents, duration_minutes, buffer_minutes, image_url, is_active, sort_order, requires_staff_selection",
    )
    .eq("business_id", session.businessId)
    .order("sort_order")
    .order("name");

  return data ?? [];
}
