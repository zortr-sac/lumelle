import Link from "next/link";
import { Cake, Phone, Plus, Search } from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";
import { EmptyState } from "@/components/empty-states/empty-state";
import { IllustrationCustomers } from "@/components/empty-states/illustrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Surface } from "@/components/ui/surface";
import { formatPEN } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { formatPhonePE } from "@/lib/format/phone";
import { requireBusiness } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Clientas" };

export default async function ClientasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireBusiness();
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("customers")
    .select(
      "id, name, phone, email, district, status, total_visits, total_spent_cents, last_visit_at, birthday",
    )
    .eq("business_id", session.businessId)
    .order("name");

  if (sp.q) query = query.or(`name.ilike.%${sp.q}%,phone.ilike.%${sp.q}%`);
  if (sp.status) query = query.eq("status", sp.status as never);

  const { data: customers } = await query.limit(200);

  const segments = [
    { label: "Todas", value: "" },
    { label: "Nuevas", value: "new" },
    { label: "Activas", value: "active" },
    { label: "Frecuentes", value: "frequent" },
    { label: "Inactivas", value: "inactive" },
  ];

  return (
    <PageTransition>
      <div className="space-y-5">
        <PageHeader
          title="Clientas"
          description="Historial, recurrencia y contexto para atender mejor."
          actions={
            <Button asChild size="sm">
              <Link href="/dashboard/clientas/nueva">
                <Plus className="size-4" /> Nueva clienta
              </Link>
            </Button>
          }
        />

        <Surface variant="plain" className="p-3">
          <form className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar por nombre o teléfono"
                defaultValue={sp.q ?? ""}
                className="pl-10"
              />
            </div>
            <SegmentedControl
              activeValue={sp.status ?? ""}
              segments={segments.map((seg) => ({
                ...seg,
                href: seg.value
                  ? `/dashboard/clientas?status=${seg.value}`
                  : "/dashboard/clientas",
              }))}
            />
          </form>
        </Surface>

        {!customers || customers.length === 0 ? (
          <Surface variant="elevated" className="p-4">
            <EmptyState
              illustration={<IllustrationCustomers />}
              title={sp.q ? "Sin resultados" : "Tu primera clienta te espera"}
              description={
                sp.q
                  ? `No encontramos a "${sp.q}". Prueba con otro nombre o teléfono.`
                  : "Cuando registres clientas o reciban reservas aparecerán aquí."
              }
              action={
                !sp.q && (
                  <Button asChild>
                    <Link href="/dashboard/clientas/nueva">
                      <Plus className="size-4" /> Crear primera clienta
                    </Link>
                  </Button>
                )
              }
            />
          </Surface>
        ) : (
          <Surface variant="elevated" className="overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_6rem_7rem_7rem_auto] gap-3 border-b border-border/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground max-md:hidden">
              <span>Clienta</span>
              <span>Estado</span>
              <span>Visitas</span>
              <span>Total</span>
              <span className="text-right">Última</span>
            </div>
            <ul className="divide-y divide-border/70">
              {customers.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/clientas/${c.id}` as never}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-white/55 md:grid-cols-[minmax(0,1fr)_6rem_7rem_7rem_auto] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {c.name}
                        </p>
                        <SegmentBadge status={c.status} className="md:hidden" />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3" />
                            {formatPhonePE(c.phone)}
                          </span>
                        )}
                        {c.birthday && (
                          <span className="inline-flex items-center gap-1 text-brand-plum">
                            <Cake className="size-3" />
                            {formatDate(`${c.birthday}T00:00:00Z`, "d MMM")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <SegmentBadge status={c.status} />
                    </div>
                    <p className="text-sm font-semibold tabular-nums max-md:hidden">
                      {c.total_visits}
                    </p>
                    <p className="text-sm font-semibold tabular-nums max-md:hidden">
                      {formatPEN(c.total_spent_cents)}
                    </p>
                    <p className="text-right text-xs text-muted-foreground max-md:text-left">
                      {c.last_visit_at
                        ? formatDate(c.last_visit_at)
                        : "Sin visita"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Surface>
        )}
      </div>
    </PageTransition>
  );
}

function SegmentBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const map: Record<
    string,
    { label: string; variant: "info" | "success" | "warning" | "soft" }
  > = {
    new: { label: "Nueva", variant: "info" },
    active: { label: "Activa", variant: "success" },
    frequent: { label: "Frecuente", variant: "warning" },
    inactive: { label: "Inactiva", variant: "soft" },
  };
  const seg = map[status] ?? { label: status, variant: "soft" as const };
  return (
    <Badge variant={seg.variant} className={className}>
      {seg.label}
    </Badge>
  );
}
