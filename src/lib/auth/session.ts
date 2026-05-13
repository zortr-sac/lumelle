import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Role = "owner" | "receptionist" | "staff";

export type SessionContext = {
  userId: string;
  email: string;
  fullName: string | null;
  businessId: string | null;
  businessIds: string[];
  role: Role | null;
};

/**
 * Reads JWT custom claims (current_business_id, business_ids, business_role)
 * injected by the Supabase Auth Hook (migration 0013_auth_hook_jwt.sql).
 *
 * Falls back to DB queries when the Auth Hook is not enabled, so the app works
 * out of the box. Activate the hook in Supabase Dashboard → Auth → Hooks for
 * the fast path (zero DB reads per request).
 *
 * Cached per request via React `cache` so parallel components share one fetch.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const claims = (user.app_metadata ?? {}) as {
    current_business_id?: string;
    business_ids?: string[];
    business_role?: Role;
  };

  // Fast path: Auth Hook populated the JWT
  if (claims.business_ids && claims.business_ids.length > 0) {
    return {
      userId: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      businessId: claims.current_business_id || null,
      businessIds: claims.business_ids,
      role: claims.business_role ?? null,
    };
  }

  // Fallback path: query the DB. Single round-trip with two parallel reads.
  const [{ data: memberships }, { data: profile }] = await Promise.all([
    supabase
      .from("business_users")
      .select("business_id, role")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("full_name, current_business_id")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const businessIds = (memberships ?? []).map(
    (m: { business_id: string }) => m.business_id,
  );
  const currentBusinessId =
    (profile as { current_business_id: string | null } | null)
      ?.current_business_id ??
    businessIds[0] ??
    null;
  const currentMembership = (memberships ?? []).find(
    (m: { business_id: string; role: Role }) =>
      m.business_id === currentBusinessId,
  ) as { role: Role } | undefined;

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName:
      (profile as { full_name: string | null } | null)?.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      null,
    businessId: currentBusinessId,
    businessIds,
    role: currentMembership?.role ?? null,
  };
});

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireBusiness(): Promise<
  SessionContext & { businessId: string }
> {
  const session = await requireSession();
  if (!session.businessId) redirect("/onboarding");
  return session as SessionContext & { businessId: string };
}

const ROLE_PRIORITY: Record<Role, number> = {
  staff: 1,
  receptionist: 2,
  owner: 3,
};

export function hasRole(current: Role | null, required: Role): boolean {
  if (!current) return false;
  return ROLE_PRIORITY[current] >= ROLE_PRIORITY[required];
}

export async function requireRole(required: Role) {
  const session = await requireBusiness();
  if (!hasRole(session.role, required)) redirect("/dashboard?error=forbidden");
  return session;
}
