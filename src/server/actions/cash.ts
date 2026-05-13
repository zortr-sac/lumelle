"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { moneyCents, uuid } from "@/lib/validators/common";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const openSessionSchema = z.object({
  openingCents: moneyCents,
  notes: z.string().trim().max(500).optional(),
});

export async function openCashSession(
  input: z.infer<typeof openSessionSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole("receptionist");
  const parsed = openSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cash_sessions")
    .insert({
      business_id: session.businessId,
      opened_by: session.userId,
      opening_cents: parsed.data.openingCents,
      notes: parsed.data.notes ?? null,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.message?.includes("idx_cash_sessions_open_per_business")) {
      return { ok: false, error: "Ya tienes una sesión de caja abierta" };
    }
    return { ok: false, error: error?.message ?? "Error abriendo caja" };
  }

  revalidatePath("/dashboard/caja");
  return { ok: true, data: { id: data.id } };
}

const paymentSchema = z.object({
  method: z.enum(["cash", "yape", "plin", "transfer", "pos", "other"]),
  amountCents: moneyCents,
  reference: z.string().trim().max(80).optional(),
});

const saleItemSchema = z.object({
  serviceId: uuid.optional().nullable(),
  staffId: uuid.optional().nullable(),
  name: z.string().trim().min(1).max(120),
  qty: z.number().int().min(1).max(50).default(1),
  unitPriceCents: moneyCents,
});

const createSaleSchema = z.object({
  customerId: uuid.optional().nullable(),
  appointmentId: uuid.optional().nullable(),
  saleType: z.enum(["appointment", "walkin", "product"]).default("walkin"),
  discountCents: moneyCents.default(0),
  tipCents: moneyCents.default(0),
  notes: z.string().trim().max(500).optional(),
  items: z.array(saleItemSchema).min(1, "Agrega al menos un servicio"),
  payments: z.array(paymentSchema).min(1, "Agrega al menos un pago"),
});

export async function createSale(
  input: z.infer<typeof createSaleSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole("receptionist");
  const parsed = createSaleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const subtotal = data.items.reduce(
    (acc, item) => acc + item.qty * item.unitPriceCents,
    0,
  );
  const total = Math.max(0, subtotal - data.discountCents + data.tipCents);
  const paid = data.payments.reduce((acc, p) => acc + p.amountCents, 0);

  if (paid !== total) {
    return {
      ok: false,
      error: `La suma de pagos (S/${(paid / 100).toFixed(2)}) no iguala el total (S/${(total / 100).toFixed(2)})`,
    };
  }

  const { data: openSession } = await supabase
    .from("cash_sessions")
    .select("id")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      business_id: session.businessId,
      cash_session_id: openSession?.id ?? null,
      customer_id: data.customerId ?? null,
      appointment_id: data.appointmentId ?? null,
      sale_type: data.saleType,
      total_cents: total,
      discount_cents: data.discountCents,
      tip_cents: data.tipCents,
      notes: data.notes ?? null,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    return { ok: false, error: saleError?.message ?? "Error creando venta" };
  }

  const { error: itemsError } = await supabase.from("sale_items").insert(
    data.items.map((it) => ({
      sale_id: sale.id,
      service_id: it.serviceId ?? null,
      staff_id: it.staffId ?? null,
      name: it.name,
      qty: it.qty,
      unit_price_cents: it.unitPriceCents,
      subtotal_cents: it.qty * it.unitPriceCents,
    })),
  );

  if (itemsError) return { ok: false, error: itemsError.message };

  const { error: paymentsError } = await supabase.from("payments").insert(
    data.payments.map((p) => ({
      sale_id: sale.id,
      method: p.method,
      amount_cents: p.amountCents,
      reference: p.reference ?? null,
    })),
  );

  if (paymentsError) return { ok: false, error: paymentsError.message };

  revalidatePath("/dashboard/caja");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: sale.id } };
}

const closeSessionSchema = z.object({
  closingCents: moneyCents,
  notes: z.string().trim().max(500).optional(),
});

export async function closeCashSession(
  input: z.infer<typeof closeSessionSchema>,
): Promise<ActionResult<{ differenceCents: number }>> {
  const session = await requireRole("receptionist");
  const parsed = closeSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();

  const { data: open } = await supabase
    .from("cash_sessions")
    .select("id, opening_cents")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  if (!open) return { ok: false, error: "No hay sesión abierta" };

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
  const differenceCents = parsed.data.closingCents - expectedCents;

  const { error } = await supabase
    .from("cash_sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: session.userId,
      expected_cents: expectedCents,
      closing_cents: parsed.data.closingCents,
      difference_cents: differenceCents,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", open.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/caja");
  revalidatePath("/dashboard");
  return { ok: true, data: { differenceCents } };
}

const expenseSchema = z.object({
  category: z.string().trim().min(1).max(40),
  description: z.string().trim().max(200).optional(),
  amountCents: moneyCents,
});

export async function recordExpense(
  input: z.infer<typeof expenseSchema>,
): Promise<ActionResult> {
  const session = await requireRole("receptionist");
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const supabase = await createSupabaseServerClient();

  const { data: openSession } = await supabase
    .from("cash_sessions")
    .select("id")
    .eq("business_id", session.businessId)
    .eq("status", "open")
    .maybeSingle();

  const { error } = await supabase.from("expenses").insert({
    business_id: session.businessId,
    cash_session_id: openSession?.id ?? null,
    category: parsed.data.category,
    description: parsed.data.description ?? null,
    amount_cents: parsed.data.amountCents,
    created_by: session.userId,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/caja");
  return { ok: true };
}
