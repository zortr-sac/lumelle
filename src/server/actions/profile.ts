"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

type ActionResult = { ok: true } | { ok: false; error: string };

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(20).optional(),
});

export async function updateProfile(
  input: z.infer<typeof profileSchema>,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq("id", session.userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/ajustes/perfil");
  return { ok: true };
}

const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Z]/, "Una mayúscula al menos")
  .regex(/[0-9]/, "Un número al menos");

export async function changePassword(
  newPassword: string,
): Promise<ActionResult> {
  await requireSession();
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Contraseña inválida",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
