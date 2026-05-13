"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validators/customer";
import { requireRole } from "@/lib/auth/session";
import { normalizePhonePE } from "@/lib/format/phone";
import { uuid } from "@/lib/validators/common";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function createCustomer(
  input: z.infer<typeof customerSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole("receptionist");
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      business_id: session.businessId,
      name: data.name,
      phone: normalizePhonePE(data.phone),
      email: data.email || null,
      birthday: data.birthday || null,
      district: data.district || null,
      instagram: data.instagram || null,
      notes: data.notes || null,
      allergies: data.allergies || null,
    })
    .select("id")
    .single();

  if (error || !created) return { ok: false, error: error?.message ?? "Error" };

  revalidatePath("/dashboard/clientas");
  return { ok: true, data: { id: created.id } };
}

export async function updateCustomer(
  id: string,
  input: z.infer<typeof customerSchema>,
): Promise<ActionResult> {
  await uuid.parseAsync(id);
  const session = await requireRole("receptionist");
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("customers")
    .update({
      name: data.name,
      phone: normalizePhonePE(data.phone),
      email: data.email || null,
      birthday: data.birthday || null,
      district: data.district || null,
      instagram: data.instagram || null,
      notes: data.notes || null,
      allergies: data.allergies || null,
    })
    .eq("id", id)
    .eq("business_id", session.businessId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/clientas");
  revalidatePath(`/dashboard/clientas/${id}`);
  return { ok: true };
}

/**
 * Find or create a customer by phone (used for public bookings).
 * Idempotent: returns existing if phone match.
 */
export async function upsertCustomerByPhone(
  businessId: string,
  customer: { name: string; phone: string; email?: string },
): Promise<{ id: string }> {
  const supabase = await createSupabaseServerClient();
  const phone = normalizePhonePE(customer.phone);

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("phone", phone)
    .maybeSingle();

  if (existing) return { id: existing.id };

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      business_id: businessId,
      name: customer.name,
      phone,
      email: customer.email || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "No se pudo crear cliente");
  }

  return { id: created.id };
}
