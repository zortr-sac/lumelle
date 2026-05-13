"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { businessSchema } from "@/lib/validators/business";
import { requireSession, requireRole } from "@/lib/auth/session";
import { suggestSlug } from "@/lib/tenant/slug";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createBusiness(
  input: z.infer<typeof businessSchema>,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireSession();
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los datos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", data.slug)
    .maybeSingle();

  if (existing) {
    return {
      ok: false,
      error: "Ese nombre de URL ya está tomado",
      fieldErrors: { slug: ["Slug no disponible"] },
    };
  }

  const { data: created, error } = await supabase
    .from("businesses")
    .insert({
      name: data.name,
      slug: data.slug,
      owner_id: session.userId,
      district: data.district || null,
      city: data.city || "Lima",
      address: data.address || null,
      whatsapp_phone: data.whatsappPhone || null,
      instagram: data.instagram || null,
      booking_policy: data.bookingPolicy || null,
    })
    .select("id, slug")
    .single();

  if (error || !created) {
    return { ok: false, error: error?.message ?? "Error al crear negocio" };
  }

  // Refresh JWT to pick up new business_ids[] and current_business_id
  await supabase.auth.refreshSession();

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return { ok: true, data: { id: created.id, slug: created.slug } };
}

export async function checkSlugAvailability(
  slug: string,
): Promise<{ available: boolean; suggestion?: string }> {
  if (!slug || slug.length < 3) return { available: false };
  const admin = createSupabaseAdminClient();

  const { data: reserved } = await admin
    .from("reserved_slugs")
    .select("slug")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (reserved) return { available: false, suggestion: `${slug}-salon` };

  const { data: existing } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  return { available: !existing };
}

const updateBusinessSchema = businessSchema.partial();

export async function updateBusiness(
  input: z.infer<typeof updateBusinessSchema>,
): Promise<ActionResult> {
  const session = await requireRole("owner");
  const parsed = updateBusinessSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los datos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("businesses")
    .update({
      name: data.name,
      district: data.district || null,
      city: data.city || null,
      address: data.address || null,
      whatsapp_phone: data.whatsappPhone || null,
      instagram: data.instagram || null,
      booking_policy: data.bookingPolicy || null,
    })
    .eq("id", session.businessId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/ajustes/negocio");
  return { ok: true };
}

export { suggestSlug };
