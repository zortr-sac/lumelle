import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeamManager } from "./team-manager";

export const metadata = { title: "Equipo" };

export default async function EquipoPage() {
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const [{ data: staff }, { data: invitations }] = await Promise.all([
    supabase
      .from("staff")
      .select(
        "id, display_name, role_label, color, instagram, is_bookable, photo_url",
      )
      .eq("business_id", session.businessId)
      .order("sort_order"),
    supabase
      .from("business_invitations")
      .select("id, email, role, expires_at, created_at")
      .eq("business_id", session.businessId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Equipo</h1>
        <p className="text-sm text-muted-foreground">
          Tus técnicas y recepcionistas. Pueden tener cuentas propias o solo
          aparecer en agenda.
        </p>
      </header>
      <TeamManager staff={staff ?? []} invitations={invitations ?? []} />
    </div>
  );
}
