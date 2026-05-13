import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppointmentForm } from "./appointment-form";

export const metadata = { title: "Nueva cita" };

export default async function NuevaCitaPage() {
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const [{ data: services }, { data: customers }, { data: staffList }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id, name, price_cents, duration_minutes")
        .eq("business_id", session.businessId)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("customers")
        .select("id, name, phone")
        .eq("business_id", session.businessId)
        .order("name")
        .limit(500),
      supabase
        .from("staff")
        .select("id, display_name, color")
        .eq("business_id", session.businessId)
        .eq("is_bookable", true)
        .order("sort_order"),
    ]);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Nueva cita
        </h1>
        <p className="text-sm text-muted-foreground">
          Agenda una cita interna desde el dashboard.
        </p>
      </header>
      <AppointmentForm
        services={services ?? []}
        customers={customers ?? []}
        staffList={staffList ?? []}
      />
    </div>
  );
}
