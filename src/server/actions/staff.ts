"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { uuid } from "@/lib/validators/common";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const createStaffSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  roleLabel: z.string().trim().max(40).optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#5C435D"),
  instagram: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(500).optional(),
  isBookable: z.boolean().default(true),
});

export async function createStaff(
  input: z.infer<typeof createStaffSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole("owner");
  const parsed = createStaffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { data: created, error } = await supabase
    .from("staff")
    .insert({
      business_id: session.businessId,
      display_name: data.displayName,
      role_label: data.roleLabel ?? null,
      color: data.color,
      instagram: data.instagram ?? null,
      bio: data.bio ?? null,
      is_bookable: data.isBookable,
    })
    .select("id")
    .single();

  if (error || !created) return { ok: false, error: error?.message ?? "Error" };

  revalidatePath("/dashboard/ajustes/equipo");
  return { ok: true, data: { id: created.id } };
}

export async function updateStaff(
  id: string,
  input: z.infer<typeof createStaffSchema>,
): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("owner");
  const parsed = createStaffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("staff")
    .update({
      display_name: data.displayName,
      role_label: data.roleLabel ?? null,
      color: data.color,
      instagram: data.instagram ?? null,
      bio: data.bio ?? null,
      is_bookable: data.isBookable,
    })
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/ajustes/equipo");
  return { ok: true };
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("staff")
    .delete()
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/ajustes/equipo");
  return { ok: true };
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["receptionist", "staff"]).default("staff"),
});

export async function inviteStaffByEmail(
  input: z.infer<typeof inviteSchema>,
): Promise<ActionResult<{ token: string }>> {
  const session = await requireRole("owner");
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Email inválido" };

  const supabase = await createSupabaseServerClient();
  const token = randomBytes(24).toString("hex");

  const { error } = await supabase.from("business_invitations").insert({
    business_id: session.businessId,
    email: parsed.data.email,
    role: parsed.data.role,
    token,
    invited_by: session.userId,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ya hay una invitación pendiente para ese email",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/ajustes/equipo");
  return { ok: true, data: { token } };
}
