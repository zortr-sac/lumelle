import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Instagram,
  Clock,
  Sparkles,
  Phone,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { resolveBusinessBySlug } from "@/lib/tenant/resolve";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPEN } from "@/lib/format/currency";
import { dayName } from "@/lib/format/date";
import { buildWhatsAppLink } from "@/lib/whatsapp/builder";
import { BRAND } from "@/lib/brand";

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await resolveBusinessBySlug(slug);
  if (!business) notFound();

  const admin = createSupabaseAdminClient();

  const [{ data: services }, { data: hours }, { data: staffList }] =
    await Promise.all([
      admin
        .from("services")
        .select(
          "id, name, category, description, price_cents, duration_minutes, image_url",
        )
        .eq("business_id", business.id)
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      admin
        .from("business_hours")
        .select("day_of_week, opens_at, closes_at, is_closed")
        .eq("business_id", business.id)
        .order("day_of_week"),
      admin
        .from("staff")
        .select("id, display_name, role_label, photo_url, color")
        .eq("business_id", business.id)
        .eq("is_bookable", true)
        .order("sort_order"),
    ]);

  const grouped: Record<string, any[]> = {};
  for (const s of services ?? []) {
    const cat = s.category ?? "Servicios";
    grouped[cat] = grouped[cat] ?? [];
    grouped[cat].push(s);
  }

  const whatsappLink = business.whatsappPhone
    ? buildWhatsAppLink({
        phone: business.whatsappPhone,
        message: `Hola ${business.name}, vi tu página y quería hacerte una consulta`,
      })
    : null;

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(42,30,45,.10),transparent_34rem)]" />
      </div>

      <section className="relative">
        {business.coverUrl ? (
          <div className="relative h-64 overflow-hidden md:h-96">
            <Image
              src={business.coverUrl}
              alt={business.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-ink/40" />
          </div>
        ) : (
          <div className="h-48 bg-grad-hero md:h-64" />
        )}

        <div className="container relative -mt-20 pb-8 md:-mt-24">
          <div className="glass-card-strong p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {business.logoUrl ? (
                <div className="relative size-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white shadow-pop md:size-32">
                  <Image
                    src={business.logoUrl}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-grad-hero shadow-pop md:size-32">
                  <Sparkles className="size-10 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                  {business.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {business.district && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {business.district}
                      {business.city && `, ${business.city}`}
                    </span>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-brand-lavender"
                    >
                      <Instagram className="size-3.5" />@
                      {business.instagram.replace("@", "")}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <Button asChild size="xl" className="btn-shine">
                  <Link href={`/b/${business.slug}/reservar` as any}>
                    <Calendar className="size-4" /> Reservar cita
                  </Link>
                </Button>
                {whatsappLink && (
                  <Button asChild size="sm" variant="glass">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="size-3.5" /> Consultar
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
          Nuestros servicios
        </h2>
        {!services || services.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              Todavía no hay servicios publicados. Vuelve pronto.
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-8">
              <Badge variant="soft" className="mb-3">
                {category}
              </Badge>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => (
                  <Card key={service.id} className="glass-card overflow-hidden">
                    {service.image_url && (
                      <div
                        className="h-44 bg-cover bg-center"
                        style={{ backgroundImage: `url(${service.image_url})` }}
                      />
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-semibold leading-tight">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-semibold tracking-[-0.05em]">
                            {formatPEN(service.price_cents)}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {service.duration_minutes} min
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <Link
                            href={
                              `/b/${business.slug}/reservar?service=${service.id}` as any
                            }
                          >
                            Reservar
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {staffList && staffList.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-6 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            Nuestro equipo
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {staffList.map((staff) => (
              <Card key={staff.id} className="glass-card text-center">
                <CardContent className="p-6">
                  <div
                    className="mx-auto mb-3 grid size-20 place-items-center rounded-3xl font-display text-2xl text-white"
                    style={{ background: staff.color }}
                  >
                    {staff.display_name.charAt(0)}
                  </div>
                  <p className="font-medium">{staff.display_name}</p>
                  {staff.role_label && (
                    <p className="text-xs text-muted-foreground">
                      {staff.role_label}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {hours && hours.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-6 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            Horarios
          </h2>
          <Card className="glass-card max-w-md">
            <CardContent className="p-6">
              <ul className="space-y-2">
                {hours.map((h) => (
                  <li
                    key={`${h.day_of_week}-${h.opens_at}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">
                      {dayName(h.day_of_week)}
                    </span>
                    <span className="text-muted-foreground">
                      {h.is_closed
                        ? "Cerrado"
                        : `${h.opens_at.slice(0, 5)} – ${h.closes_at.slice(0, 5)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {business.address && (
        <section className="container py-10">
          <Card className="glass-card max-w-md">
            <CardContent className="p-6">
              <h3 className="mb-2 flex items-center gap-2 font-medium">
                <MapPin className="size-4" /> Dirección
              </h3>
              <p className="text-sm text-muted-foreground">
                {business.address}
                {business.district && `, ${business.district}`}
                {business.city && `, ${business.city}`}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="container py-12">
        <div className="glass-card-strong mx-auto max-w-3xl p-8 text-center md:p-12">
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.05em] md:text-4xl">
            ¿Lista para tu próxima cita?
          </h2>
          <Button asChild size="xl" className="btn-shine mt-6">
            <Link href={`/b/${business.slug}/reservar` as any}>
              Reservar ahora <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-6">
        <p className="text-center text-xs text-muted-foreground">
          Reservas gestionadas con{" "}
          <Link href="/" className="hover:text-foreground">
            {BRAND.name}
          </Link>
        </p>
      </footer>
    </div>
  );
}
