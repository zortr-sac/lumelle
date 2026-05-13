import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TemplatesGrid } from "./templates-grid";

export const metadata = { title: "Plantillas de servicios" };

export default async function PlantillasPage() {
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { data: templates } = await supabase
    .from("service_templates")
    .select(
      "id, name, category, default_price_cents, default_duration_minutes, description",
    )
    .order("category")
    .order("name");

  // Existing services to avoid duplicates
  const { data: existing } = await supabase
    .from("services")
    .select("name")
    .eq("business_id", session.businessId);

  const existingNames = new Set(
    (existing ?? []).map((s: { name: string }) => s.name.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/dashboard/servicios">
            <ChevronLeft className="size-4" /> Volver a servicios
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Plantillas de servicios
        </h1>
        <p className="text-sm text-muted-foreground">
          Agrega servicios populares a tu catálogo en un click.
        </p>
      </header>

      <TemplatesGrid
        templates={templates ?? []}
        existingNames={Array.from(existingNames) as string[]}
      />
    </div>
  );
}
