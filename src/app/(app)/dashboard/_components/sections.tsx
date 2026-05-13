import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Cake,
  Calendar,
  CreditCard,
  ExternalLink,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricTile } from "@/components/ui/metric-tile";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/empty-states/empty-state";
import {
  IllustrationAgenda,
  IllustrationBookings,
} from "@/components/empty-states/illustrations";
import { formatPEN } from "@/lib/format/currency";
import { formatDateTime, formatTime } from "@/lib/format/date";
import {
  getBusinessSummary,
  getDashboardStats,
  getPendingBookings,
  getTodayAppointments,
} from "@/server/queries/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DashboardHeader({
  fullName,
  businessId,
}: {
  fullName: string;
  businessId: string;
}) {
  const business = await getBusinessSummary(businessId);
  const firstName = fullName.split(" ")[0] ?? "tu";

  return (
    <PageHeader
      eyebrow={
        <Badge variant="soft">
          <Sparkles className="mr-1 size-3" /> Hola {firstName}
        </Badge>
      }
      title={business?.name ?? "Tu salón"}
      description="Agenda, caja y reservas de hoy en una sola vista."
      actions={
        <>
          {business?.slug && (
            <Button asChild variant="glass" size="sm">
              <Link
                href={`/b/${business.slug}` as never}
                target="_blank"
                rel="noreferrer"
                prefetch={false}
              >
                <ExternalLink className="size-4" /> Página pública
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/dashboard/agenda/nueva">
              <Plus className="size-4" /> Nueva cita
            </Link>
          </Button>
        </>
      }
    />
  );
}

export async function DashboardStats({ businessId }: { businessId: string }) {
  const stats = await getDashboardStats(businessId);

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <MetricTile
        icon={<Calendar className="size-4" />}
        label="Citas hoy"
        value={String(stats.appointmentsToday)}
        href="/dashboard/agenda"
      />
      <MetricTile
        icon={<CreditCard className="size-4" />}
        label="Ventas hoy"
        value={formatPEN(stats.salesTodayCents)}
        href="/dashboard/caja"
      />
      <MetricTile
        icon={<Bell className="size-4" />}
        label="Por confirmar"
        value={String(stats.pendingBookings)}
        href="/dashboard/agenda?status=requested"
        tone={stats.pendingBookings > 0 ? "attention" : "default"}
      />
      <MetricTile
        icon={<TrendingUp className="size-4" />}
        label="7 días"
        value={formatPEN(stats.weeklyRevenueCents)}
        href="/dashboard/caja"
      />
    </div>
  );
}

export async function TodayAppointments({
  businessId,
}: {
  businessId: string;
}) {
  const appointments = await getTodayAppointments(businessId);

  return (
    <Surface variant="elevated" className="p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em]">
            Citas de hoy
          </h2>
          <p className="text-xs text-muted-foreground">
            El ritmo de la jornada.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/agenda">
            Ver todas <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
      {appointments.length === 0 ? (
        <EmptyState
          illustration={<IllustrationAgenda />}
          title="Agenda libre hoy"
          description="Cuando confirmes la primera cita aparecerá aquí."
          action={
            <Button asChild>
              <Link href="/dashboard/agenda/nueva">
                <Plus className="size-4" /> Crear cita
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border/70">
          {appointments.map((appt: any) => {
            const customer = Array.isArray(appt.customer)
              ? appt.customer[0]
              : appt.customer;
            const service = Array.isArray(appt.service)
              ? appt.service[0]
              : appt.service;
            const staff = Array.isArray(appt.staff)
              ? appt.staff[0]
              : appt.staff;
            return (
              <li
                key={appt.id}
                className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 py-3"
              >
                <div>
                  <p className="text-lg font-semibold tabular-nums tracking-[-0.04em]">
                    {formatTime(appt.starts_at)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {service?.duration_minutes ?? "--"} min
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {customer?.name ?? "Sin cliente"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {service?.name ?? ""}
                    {staff && ` · ${staff.display_name}`}
                  </p>
                </div>
                <Badge
                  variant={
                    appt.status === "in_progress"
                      ? "info"
                      : appt.status === "completed"
                        ? "success"
                        : "soft"
                  }
                >
                  {labelStatus(appt.status)}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Surface>
  );
}

export async function PendingBookings({ businessId }: { businessId: string }) {
  const pending = await getPendingBookings(businessId);

  return (
    <Surface className="p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-[-0.03em]">
          Por confirmar
        </h2>
        <p className="text-xs text-muted-foreground">
          Reservas que necesitan respuesta.
        </p>
      </div>
      {pending.length === 0 ? (
        <EmptyState
          illustration={<IllustrationBookings />}
          title="Sin pendientes"
          description="Las reservas desde tu página pública aparecerán aquí."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2">
          {pending.map((booking: any) => {
            const customer = Array.isArray(booking.customer)
              ? booking.customer[0]
              : booking.customer;
            const service = Array.isArray(booking.service)
              ? booking.service[0]
              : booking.service;
            return (
              <li
                key={booking.id}
                className="rounded-2xl border border-amber-200/70 bg-amber-50/65 p-3"
              >
                <p className="text-sm font-semibold">
                  {customer?.name ?? "Cliente"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {service?.name} · {formatDateTime(booking.starts_at)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Surface>
  );
}

export async function UpcomingBirthdays({
  businessId,
}: {
  businessId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, birthday")
    .eq("business_id", businessId)
    .not("birthday", "is", null)
    .order("birthday")
    .limit(6);

  return (
    <Surface className="p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Cake className="size-4 text-brand-plum" />
        <h2 className="text-lg font-semibold tracking-[-0.03em]">
          Próximos cumpleaños
        </h2>
      </div>
      {!data || data.length === 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Cuando agregues clientas con cumpleaños, aparecerán aquí para preparar
          mensajes o beneficios.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c: { id: string; name: string; birthday: string }) => (
            <li key={c.id} className="rounded-2xl bg-muted/55 p-3 text-sm">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.birthday}</p>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
}

function labelStatus(status: string): string {
  return (
    {
      requested: "Solicitada",
      confirmed: "Confirmada",
      in_progress: "En atención",
      completed: "Atendida",
      cancelled: "Cancelada",
      no_show: "No asistió",
    }[status] ?? status
  );
}
