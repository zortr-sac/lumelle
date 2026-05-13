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
import { OpenSessionForm } from "./open-session-form";

export const metadata = { title: "Abrir caja" };

export default async function AbrirCajaPage() {
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const { data: open } = await supabase
    .from("cash_sessions")
    .select("id")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  if (open) redirect("/dashboard/caja");

  return (
    <div className="mx-auto max-w-md">
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle>Abrir caja</CardTitle>
          <CardDescription>
            Cuenta el efectivo con el que abres el día. El sistema lo usará para
            el cuadre al cerrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OpenSessionForm />
        </CardContent>
      </Card>
    </div>
  );
}
