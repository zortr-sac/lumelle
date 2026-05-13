import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";
import { EmptyState } from "@/components/empty-states/empty-state";
import { IllustrationServices } from "@/components/empty-states/illustrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { formatPEN } from "@/lib/format/currency";
import { requireBusiness } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ServiceActions } from "./_components/service-actions";

export const metadata = { title: "Servicios" };

export default async function ServiciosPage() {
  const session = await requireBusiness();
  const supabase = await createSupabaseServerClient();

  const { data: services } = await supabase
    .from("services")
    .select(
      "id, name, category, description, price_cents, duration_minutes, image_url, is_active, sort_order",
    )
    .eq("business_id", session.businessId)
    .order("sort_order")
    .order("name");

  const grouped: Record<string, any[]> = {};
  for (const s of services ?? []) {
    const cat = s.category ?? "Otros";
    grouped[cat] = grouped[cat] ?? [];
    grouped[cat].push(s);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Servicios"
          description="Tu catálogo público y el precio base para agenda y caja."
          actions={
            <>
              <Button asChild variant="glass" size="sm">
                <Link href="/dashboard/servicios/plantillas">Plantillas</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/servicios/nuevo">
                  <Plus className="size-4" /> Nuevo servicio
                </Link>
              </Button>
            </>
          }
        />

        {!services || services.length === 0 ? (
          <Surface variant="elevated" className="p-4">
            <EmptyState
              illustration={<IllustrationServices />}
              title="Define lo que ofreces"
              description="Agrega servicios para que tus clientas puedan reservar desde tu página pública."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link href="/dashboard/servicios/nuevo">
                      <Plus className="size-4" /> Crear servicio
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/servicios/plantillas">
                      Usar plantillas
                    </Link>
                  </Button>
                </div>
              }
            />
          </Surface>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {category}
                </h2>
                <Badge variant="outline">{items.length} servicios</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((service) => (
                  <Surface
                    key={service.id}
                    className={`group flex overflow-hidden transition-all hover:-translate-y-0.5 hover:bg-white/85 ${
                      !service.is_active ? "opacity-60" : ""
                    }`}
                  >
                    <div
                      className="h-auto w-24 shrink-0 bg-grad-accent bg-cover bg-center sm:w-32"
                      style={
                        service.image_url
                          ? { backgroundImage: `url(${service.image_url})` }
                          : undefined
                      }
                    />
                    <div className="min-w-0 flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold">
                              {service.name}
                            </h3>
                            {!service.is_active && (
                              <Badge variant="outline" className="text-[10px]">
                                Pausado
                              </Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <ServiceActions
                          id={service.id}
                          isActive={service.is_active}
                        />
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-2xl font-semibold tabular-nums tracking-[-0.05em]">
                            {formatPEN(service.price_cents)}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {service.duration_minutes} min
                          </p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {service.is_active ? "Publicado" : "Oculto"}
                        </span>
                      </div>
                    </div>
                  </Surface>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </PageTransition>
  );
}
