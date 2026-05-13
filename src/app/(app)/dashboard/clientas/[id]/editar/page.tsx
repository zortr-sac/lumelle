import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CustomerForm } from "../../_components/customer-form";

export const metadata = { title: "Editar clienta" };

export default async function EditarClientaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("receptionist");
  const supabase = await createSupabaseServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("business_id", session.businessId)
    .maybeSingle();

  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Editar clienta
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los datos de {customer.name}.
        </p>
      </header>
      <CustomerForm
        customerId={id}
        defaultValues={{
          name: customer.name,
          phone: customer.phone ?? "",
          email: customer.email ?? "",
          birthday: customer.birthday ?? "",
          district: customer.district ?? "",
          instagram: customer.instagram ?? "",
          notes: customer.notes ?? "",
          allergies: customer.allergies ?? "",
        }}
      />
    </div>
  );
}
