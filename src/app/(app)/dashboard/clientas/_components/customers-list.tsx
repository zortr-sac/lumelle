import Link from "next/link";
import { Plus, Phone, Cake, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { HoverCard } from "@/components/motion/hover-card";
import { EmptyState } from "@/components/empty-states/empty-state";
import { IllustrationCustomers } from "@/components/empty-states/illustrations";
import { formatPEN } from "@/lib/format/currency";
import { formatPhonePE } from "@/lib/format/phone";
import { formatDate } from "@/lib/format/date";
import { listCustomers } from "@/server/queries/customers";

export async function CustomersList({
  businessId,
  search,
  status,
  cursor,
}: {
  businessId: string;
  search?: string;
  status?: string;
  cursor?: string;
}) {
  const page = await listCustomers({ businessId, search, status, cursor });

  if (page.items.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent>
          <EmptyState
            illustration={<IllustrationCustomers />}
            title={
              search ? "Sin resultados" : "Tu primera clienta te está esperando"
            }
            description={
              search
                ? `No encontramos a "${search}". Prueba con otro nombre o teléfono.`
                : "Cuando registres clientas o reciban reservas aparecerán aquí."
            }
            action={
              !search && (
                <Button asChild>
                  <Link href="/dashboard/clientas/nueva">
                    <Plus className="size-4" /> Crear primera clienta
                  </Link>
                </Button>
              )
            }
          />
        </CardContent>
      </Card>
    );
  }

  const nextHref = page.nextCursor
    ? `/dashboard/clientas?cursor=${encodeURIComponent(page.nextCursor)}${search ? `&q=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}`
    : null;

  return (
    <div className="space-y-6">
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {page.items.map((c) => (
          <StaggerItem key={c.id}>
            <HoverCard intensity="subtle">
              <Link
                href={`/dashboard/clientas/${c.id}` as any}
                className="block"
                prefetch={false}
              >
                <Card className="glass-card group transition-all hover:shadow-pop">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{c.name}</p>
                        {c.phone && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="size-3" />
                            {formatPhonePE(c.phone)}
                          </p>
                        )}
                      </div>
                      <SegmentBadge status={c.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.total_visits} visitas</span>
                      <span className="font-display text-base font-medium tabular-nums text-foreground">
                        {formatPEN(c.total_spent_cents)}
                      </span>
                    </div>
                    {c.last_visit_at && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Última visita: {formatDate(c.last_visit_at)}
                      </p>
                    )}
                    {c.birthday && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-brand-lavender">
                        <Cake className="size-3" />
                        Cumpleaños:{" "}
                        {formatDate(`${c.birthday}T00:00:00Z`, "d MMM")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </HoverCard>
          </StaggerItem>
        ))}
      </Stagger>

      {nextHref && (
        <div className="flex justify-center pt-2">
          <Button asChild variant="glass">
            <Link href={nextHref as any} prefetch={false}>
              Cargar más <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function SegmentBadge({ status }: { status: string }) {
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
  return <Badge variant={seg.variant}>{seg.label}</Badge>;
}
