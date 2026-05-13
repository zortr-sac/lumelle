import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Switch the user's active business context.
 * Stored in the `profiles.current_business_id` column. The Auth Hook reads it
 * on next token refresh to mint a JWT with the right `current_business_id` claim.
 */
export async function setCurrentBusiness(
  userId: string,
  businessId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createSupabaseAdminClient();

  const { data: membership } = await admin
    .from("business_users")
    .select("business_id, is_active")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership)
    return { ok: false, error: "No tienes acceso a este negocio" };

  await admin
    .from("profiles")
    .update({ current_business_id: businessId })
    .eq("id", userId);

  const supabase = await createSupabaseServerClient();
  await supabase.auth.refreshSession();

  return { ok: true };
}
