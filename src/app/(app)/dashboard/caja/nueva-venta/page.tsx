import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SaleForm } from "./sale-form";

export const metadata = { title: "Nueva venta" };

export default async function NuevaVentaPage({
  searchParams,
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const session = await requireRole("receptionist");
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: openSession } = await supabase
    .from("cash_sessions")
    .select("id")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  if (!openSession) redirect("/dashboard/caja");

  const [{ data: services }, { data: customers }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, price_cents, duration_minutes")
      .eq("business_id", session.businessId)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("customers")
      .select("id, name, phone")
      .eq("business_id", session.businessId)
      .order("name")
      .limit(500),
  ]);

  let preload: {
    appointmentId: string;
    customerId?: string;
    items: {
      serviceId: string;
      name: string;
      qty: number;
      unitPriceCents: number;
    }[];
  } | null = null;
  if (sp.appointment) {
    const { data: appt } = await supabase
      .from("appointments")
      .select(
        "id, customer:customers(id, name), service:services(id, name, price_cents)",
      )
      .eq("id", sp.appointment)
      .eq("business_id", session.businessId)
      .maybeSingle();
    if (appt) {
      const cust = Array.isArray(appt.customer)
        ? appt.customer[0]
        : appt.customer;
      const serv = Array.isArray(appt.service) ? appt.service[0] : appt.service;
      preload = {
        appointmentId: appt.id,
        customerId: cust?.id,
        items: serv
          ? [
              {
                serviceId: serv.id,
                name: serv.name,
                qty: 1,
                unitPriceCents: serv.price_cents,
              },
            ]
          : [],
      };
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Nueva venta
        </h1>
        <p className="text-sm text-muted-foreground">
          {preload
            ? "Precargado desde la cita."
            : "Registrar venta sin cita o walk-in."}
        </p>
      </header>
      <SaleForm
        services={services ?? []}
        customers={customers ?? []}
        preload={preload}
      />
    </div>
  );
}
