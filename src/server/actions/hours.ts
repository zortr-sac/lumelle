"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

const blockSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}/),
  closesAt: z.string().regex(/^\d{2}:\d{2}/),
  isClosed: z.boolean(),
});

const updateHoursSchema = z.object({
  hours: z.array(blockSchema).min(1),
});

export async function updateBusinessHours(
  input: z.infer<typeof updateHoursSchema>,
): Promise<ActionResult> {
  const session = await requireRole("owner");
  const parsed = updateHoursSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();

  await supabase
    .from("business_hours")
    .delete()
    .eq("business_id", session.businessId);

  const rows = parsed.data.hours.map((h) => ({
    business_id: session.businessId,
    day_of_week: h.dayOfWeek,
    opens_at: h.opensAt,
    closes_at: h.closesAt,
    is_closed: h.isClosed,
  }));

  const { error } = await supabase.from("business_hours").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/ajustes/horarios");
  revalidatePath("/dashboard");
  return { ok: true };
}
