import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { resolveBusinessBySlug } from "@/lib/tenant/resolve";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BookingWizard } from "./_components/booking-wizard";

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string; staff?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const business = await resolveBusinessBySlug(slug);
  if (!business) notFound();

  const admin = createSupabaseAdminClient();

  const [{ data: services }, { data: staff }, { data: serviceStaff }] =
    await Promise.all([
      admin
        .from("services")
        .select(
          "id, name, category, description, price_cents, duration_minutes, image_url, requires_staff_selection",
        )
        .eq("business_id", business.id)
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      admin
        .from("staff")
        .select("id, display_name, role_label, photo_url, color")
        .eq("business_id", business.id)
        .eq("is_bookable", true)
        .order("sort_order"),
      admin.from("service_staff").select("service_id, staff_id"),
    ]);

  const staffByService = new Map<string, string[]>();
  for (const link of serviceStaff ?? []) {
    const existing = staffByService.get(link.service_id) ?? [];
    existing.push(link.staff_id);
    staffByService.set(link.service_id, existing);
  }

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(42,30,45,.10),transparent_32rem)]" />
      </div>

      <header className="container py-4">
        <Link
          href={`/b/${business.slug}` as any}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> {business.name}
        </Link>
      </header>

      <main className="container pb-20">
        <BookingWizard
          slug={business.slug}
          businessName={business.name}
          services={services ?? []}
          staff={staff ?? []}
          staffByService={Object.fromEntries(staffByService)}
          timezone={business.timezone}
          initialServiceId={sp.service}
          bookingPolicy={business.bookingPolicy}
        />
      </main>
    </div>
  );
}
