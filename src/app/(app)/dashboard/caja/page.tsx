import Link from "next/link";
import {
  CreditCard,
  Lock,
  Plus,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";
import { EmptyState } from "@/components/empty-states/empty-state";
import { IllustrationCash } from "@/components/empty-states/illustrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricTile } from "@/components/ui/metric-tile";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { formatPEN } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Caja" };

export default async function CajaPage() {
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const { data: openSession } = await supabase
    .from("cash_sessions")
    .select("*")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ data: sales }, { data: payments }, { data: expenses }] =
    await Promise.all([
      supabase
        .from("sales")
        .select(
          "id, total_cents, sale_type, created_at, customer:customers(name)",
        )
        .eq("business_id", session.businessId)
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select(
          "id, method, amount_cents, sale:sales!inner(business_id, created_at)",
        )
        .eq("sale.business_id", session.businessId)
        .gte("sale.created_at", todayStart.toISOString()),
      supabase
        .from("expenses")
        .select("amount_cents, category")
        .eq("business_id", session.businessId)
        .gte("paid_at", todayStart.toISOString()),
    ]);

  const totalSales = (sales ?? []).reduce(
    (acc, s) => acc + (s.total_cents ?? 0),
    0,
  );
  const totalExpenses = (expenses ?? []).reduce(
    (acc, e) => acc + (e.amount_cents ?? 0),
    0,
  );
  const byMethod: Record<string, number> = {};
  for (const p of payments ?? []) {
    byMethod[p.method] = (byMethod[p.method] ?? 0) + (p.amount_cents ?? 0);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Caja"
          description="Movimiento del día, pagos y cierre de sesión."
          eyebrow={
            <Badge variant={openSession ? "success" : "soft"}>
              {openSession ? "Sesión abierta" : "Sin sesión activa"}
            </Badge>
          }
          actions={
            <>
              {!openSession && (
                <Button asChild size="sm">
                  <Link href="/dashboard/caja/abrir">Abrir caja</Link>
                </Button>
              )}
              {openSession && (
                <>
                  <Button asChild size="sm">
                    <Link href="/dashboard/caja/nueva-venta">
                      <Plus className="size-4" /> Nueva venta
                    </Link>
                  </Button>
                  <Button asChild variant="glass" size="sm">
                    <Link href="/dashboard/caja/cierre">
                      <Lock className="size-4" /> Cerrar caja
                    </Link>
                  </Button>
                </>
              )}
            </>
          }
        />

        <div className="grid gap-3 md:grid-cols-3">
          <MetricTile
            icon={<CreditCard className="size-4" />}
            label="Ventas hoy"
            value={formatPEN(totalSales)}
            tone={totalSales > 0 ? "success" : "default"}
          />
          <MetricTile
            icon={<Wallet className="size-4" />}
            label="Gastos"
            value={formatPEN(totalExpenses)}
          />
          <MetricTile
            icon={<TrendingUp className="size-4" />}
            label="Neto"
            value={formatPEN(totalSales - totalExpenses)}
            tone={totalSales - totalExpenses >= 0 ? "success" : "attention"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Surface className="p-5">
            <h2 className="text-lg font-semibold tracking-[-0.03em]">
              Por método de pago
            </h2>
            {Object.keys(byMethod).length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Sin pagos registrados.
              </p>
            ) : (
              <div className="mt-4 grid gap-2">
                {Object.entries(byMethod).map(([method, amount]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between rounded-2xl bg-white/60 p-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Smartphone className="size-4 text-brand-plum" />
                      {labelMethod(method)}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPEN(amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          <Surface variant="elevated" className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em]">
                  Ventas del día
                </h2>
                <p className="text-xs text-muted-foreground">
                  {sales?.length ?? 0} registros
                </p>
              </div>
              {openSession && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/caja/nueva-venta">
                    <Plus className="size-4" /> Registrar
                  </Link>
                </Button>
              )}
            </div>
            {!sales || sales.length === 0 ? (
              <EmptyState
                illustration={<IllustrationCash />}
                title="Aún no hay ventas"
                description={
                  openSession
                    ? "Cuando registres una venta aparecerá aquí."
                    : "Abre caja para empezar a registrar ventas."
                }
                action={
                  openSession ? (
                    <Button asChild>
                      <Link href="/dashboard/caja/nueva-venta">
                        <Plus className="size-4" /> Registrar venta
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/dashboard/caja/abrir">Abrir caja</Link>
                    </Button>
                  )
                }
              />
            ) : (
              <ul className="divide-y divide-border/70">
                {sales.map((sale) => {
                  const customer = Array.isArray(sale.customer)
                    ? sale.customer[0]
                    : sale.customer;
                  return (
                    <li
                      key={sale.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {customer?.name ?? "Cliente walk-in"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(sale.created_at)}
                        </p>
                      </div>
                      <p className="text-lg font-semibold tabular-nums tracking-[-0.04em]">
                        {formatPEN(sale.total_cents)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>
        </div>
      </div>
    </PageTransition>
  );
}

function labelMethod(method: string): string {
  return (
    {
      cash: "Efectivo",
      yape: "Yape",
      plin: "Plin",
      transfer: "Transferencia",
      pos: "POS",
      other: "Otro",
    }[method] ?? method
  );
}
