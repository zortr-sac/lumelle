import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloseSessionForm } from "./close-session-form";
import { formatPEN } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

export const metadata = { title: "Cerrar caja" };

export default async function CierreCajaPage() {
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const { data: open } = await supabase
    .from("cash_sessions")
    .select("id, opening_cents, opened_at, notes")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  if (!open) redirect("/dashboard/caja");

  const { data: cashPayments } = await supabase
    .from("payments")
    .select("amount_cents, sales!inner(business_id, cash_session_id)")
    .eq("method", "cash")
    .eq("sales.business_id", session.businessId)
    .eq("sales.cash_session_id", open.id);

  const { data: cashExpenses } = await supabase
    .from("expenses")
    .select("amount_cents")
    .eq("business_id", session.businessId)
    .eq("cash_session_id", open.id);

  const incomeFromCash = (cashPayments ?? []).reduce(
    (acc: number, p: { amount_cents: number }) => acc + p.amount_cents,
    0,
  );
  const outgoingCash = (cashExpenses ?? []).reduce(
    (acc: number, e: { amount_cents: number }) => acc + e.amount_cents,
    0,
  );
  const expectedCents = open.opening_cents + incomeFromCash - outgoingCash;

  return (
    <div className="mx-auto max-w-xl">
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle>Cierre de caja</CardTitle>
          <CardDescription>
            Cuenta el efectivo físico que hay en caja en este momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3 rounded-2xl bg-grad-soft p-5">
            <Row
              label="Apertura"
              value={formatPEN(open.opening_cents)}
              sub={formatDateTime(open.opened_at)}
            />
            <Row
              label="+ Ventas en efectivo"
              value={formatPEN(incomeFromCash)}
            />
            <Row label="- Gastos en efectivo" value={formatPEN(outgoingCash)} />
            <div className="border-t border-brand-lila/30 pt-3">
              <Row
                label="Esperado en caja"
                value={formatPEN(expectedCents)}
                emphasis
              />
            </div>
          </div>
          <CloseSessionForm expectedCents={expectedCents} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  emphasis = false,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p
          className={`text-sm ${emphasis ? "font-medium" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      <p
        className={
          emphasis
            ? "text-2xl font-semibold tracking-[-0.04em]"
            : "font-display text-base"
        }
      >
        {value}
      </p>
    </div>
  );
}
