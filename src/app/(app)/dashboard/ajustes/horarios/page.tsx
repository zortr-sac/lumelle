import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HoursEditor } from "./hours-editor";

export const metadata = { title: "Horarios" };

export default async function HorariosPage() {
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { data: hours } = await supabase
    .from("business_hours")
    .select("day_of_week, opens_at, closes_at, is_closed")
    .eq("business_id", session.businessId)
    .order("day_of_week");

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Horarios de atención
        </h1>
        <p className="text-sm text-muted-foreground">
          Define cuándo recibes citas. Aparecerá en tu página pública.
        </p>
      </header>
      <HoursEditor initialHours={hours ?? []} />
    </div>
  );
}
