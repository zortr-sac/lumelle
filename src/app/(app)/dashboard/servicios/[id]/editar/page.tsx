import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ServiceForm } from "../../_components/service-form";

export const metadata = { title: "Editar servicio" };

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .maybeSingle();

  if (!service) notFound();

  const { data: staffLinks } = await supabase
    .from("service_staff")
    .select("staff_id")
    .eq("service_id", id);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Editar servicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los datos de {service.name}.
        </p>
      </header>
      <ServiceForm
        serviceId={id}
        defaultValues={{
          name: service.name,
          category: service.category ?? "",
          description: service.description ?? "",
          priceCents: service.price_cents,
          durationMinutes: service.duration_minutes,
          bufferMinutes: service.buffer_minutes,
          imageUrl: service.image_url ?? "",
          isActive: service.is_active,
          requiresStaffSelection: service.requires_staff_selection,
          staffIds: (staffLinks ?? []).map(
            (l: { staff_id: string }) => l.staff_id,
          ),
        }}
      />
    </div>
  );
}
