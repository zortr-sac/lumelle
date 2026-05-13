import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  Instagram,
  MapPin,
  Cake,
  Edit,
  MessageCircle,
} from "lucide-react";
import { requireBusiness } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPEN } from "@/lib/format/currency";
import { formatPhonePE, whatsappNumber } from "@/lib/format/phone";
import { formatDate, formatDateTime } from "@/lib/format/date";

export default async function ClientaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireBusiness();
  const supabase = await createSupabaseServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .single();

  if (!customer) notFound();

  const [{ data: appointments }] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "id, starts_at, status, service:services(name, price_cents), staff:staff(display_name)",
      )
      .eq("customer_id", id)
      .order("starts_at", { ascending: false })
      .limit(20),
    supabase
      .from("sales")
      .select("id, total_cents, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const waLink = customer.phone
    ? `https://wa.me/${whatsappNumber(customer.phone)}`
    : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            {customer.name}
          </h1>
          <Badge variant="info" className="mt-2">
            {labelStatus(customer.status)}
          </Badge>
        </div>
        <div className="flex gap-2">
          {waLink && (
            <Button asChild variant="glass" size="sm">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href={`/dashboard/clientas/${id}/editar` as any}>
              <Edit className="size-4" /> Editar
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card md:col-span-1">
          <CardContent className="space-y-3 p-5">
            <p className="text-lg">Contacto</p>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                {formatPhonePE(customer.phone)}
              </div>
            )}
            {customer.email && (
              <div className="text-sm text-muted-foreground">
                {customer.email}
              </div>
            )}
            {customer.instagram && (
              <div className="flex items-center gap-2 text-sm">
                <Instagram className="size-4 text-muted-foreground" />@
                {customer.instagram}
              </div>
            )}
            {customer.district && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                {customer.district}
              </div>
            )}
            {customer.birthday && (
              <div className="flex items-center gap-2 text-sm">
                <Cake className="size-4 text-muted-foreground" />
                {formatDate(`${customer.birthday}T00:00:00Z`, "d MMM yyyy")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardContent className="p-5">
            <p className="mb-3 text-lg">Estadísticas</p>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Visitas" value={String(customer.total_visits)} />
              <Stat
                label="Total gastado"
                value={formatPEN(customer.total_spent_cents)}
              />
              <Stat
                label="Última visita"
                value={
                  customer.last_visit_at
                    ? formatDate(customer.last_visit_at, "d MMM")
                    : "—"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {(customer.allergies || customer.notes) && (
        <Card className="glass-card">
          <CardContent className="space-y-3 p-5">
            {customer.allergies && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Alergias / cuidados
                </p>
                <p className="text-sm">{customer.allergies}</p>
              </div>
            )}
            {customer.notes && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Notas internas
                </p>
                <p className="text-sm">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardContent className="p-5">
          <p className="mb-3 text-lg">Historial de citas</p>
          {!appointments || appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin citas registradas todavía.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {appointments.map((appt) => {
                const service = Array.isArray(appt.service)
                  ? appt.service[0]
                  : appt.service;
                const staff = Array.isArray(appt.staff)
                  ? appt.staff[0]
                  : appt.staff;
                return (
                  <li
                    key={appt.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{service?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(appt.starts_at)}
                        {staff && ` · ${staff.display_name}`}
                      </p>
                    </div>
                    <Badge variant="soft">{labelStatus(appt.status)}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-grad-soft p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function labelStatus(status: string): string {
  const map: Record<string, string> = {
    new: "Nueva",
    active: "Activa",
    frequent: "Frecuente",
    inactive: "Inactiva",
    requested: "Solicitada",
    confirmed: "Confirmada",
    in_progress: "En atención",
    completed: "Atendida",
    cancelled: "Cancelada",
    no_show: "No asistió",
  };
  return map[status] ?? status;
}
