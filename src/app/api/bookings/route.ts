import { NextResponse, type NextRequest } from "next/server";
import { addMinutes, parseISO } from "date-fns";
import { publicBookingSchema } from "@/lib/validators/booking";
import { resolveBusinessBySlug } from "@/lib/tenant/resolve";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertCustomerByPhone } from "@/server/actions/customers";
import { rateLimit, clientIp } from "@/lib/rate-limit/upstash";
import { buildWhatsAppLink } from "@/lib/whatsapp/builder";
import { WhatsAppTemplates } from "@/lib/whatsapp/templates";
import { formatDate, formatTime } from "@/lib/format/date";
import { withIdempotency } from "@/lib/idempotency";
import { RATE_LIMIT, BOOKING } from "@/lib/constants";
import { logger, maskPii } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  const limit = await rateLimit(`booking:${ip}`, RATE_LIMIT.PUBLIC_BOOKING);
  if (!limit.ok) {
    logger.warn("booking.rate_limited", { ip });
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un minuto." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await withIdempotency(req, body, async () => {
    return await processBooking(parsed.data, ip);
  });

  return NextResponse.json(result.body, { status: result.status });
}

async function processBooking(
  data: ReturnType<typeof publicBookingSchema.parse>,
  ip: string,
): Promise<{ status: number; body: unknown }> {
  const { slug, serviceId, staffId, startsAt, customer } = data;
  const business = await resolveBusinessBySlug(slug);
  if (!business) {
    return { status: 404, body: { error: "Negocio no encontrado" } };
  }

  const admin = createSupabaseAdminClient();

  const { data: service } = await admin
    .from("services")
    .select(
      "id, name, duration_minutes, is_active, business_id, requires_staff_selection",
    )
    .eq("id", serviceId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!service || !service.is_active) {
    return { status: 404, body: { error: "Servicio no disponible" } };
  }

  const resolvedStaffId: string | null = staffId ?? null;
  let staffName: string | null = null;

  if (resolvedStaffId) {
    const { data: staffRow } = await admin
      .from("staff")
      .select("id, business_id, is_bookable, display_name")
      .eq("id", resolvedStaffId)
      .eq("business_id", business.id)
      .maybeSingle();
    if (!staffRow || !staffRow.is_bookable) {
      return { status: 400, body: { error: "Técnica no disponible" } };
    }
    staffName = staffRow.display_name;
  } else if (service.requires_staff_selection) {
    return {
      status: 400,
      body: { error: "Selecciona una técnica para continuar" },
    };
  }

  const startsAtDate = parseISO(startsAt);
  const endsAtDate = addMinutes(startsAtDate, service.duration_minutes);

  if (startsAtDate.getTime() < Date.now() + BOOKING.MIN_LEAD_MINUTES * 60_000) {
    return {
      status: 400,
      body: { error: "Esta hora ya pasó. Elige otro horario." },
    };
  }

  const { id: customerId } = await upsertCustomerByPhone(business.id, {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  });

  const { data: appointment, error } = await admin
    .from("appointments")
    .insert({
      business_id: business.id,
      customer_id: customerId,
      service_id: service.id,
      staff_id: resolvedStaffId,
      starts_at: startsAtDate.toISOString(),
      ends_at: endsAtDate.toISOString(),
      status: "requested",
      source: "public",
      notes: customer.notes || null,
    })
    .select("id")
    .single();

  if (error || !appointment) {
    logger.error("booking.insert_failed", {
      businessId: business.id,
      error: error?.message,
    });
    return {
      status: 500,
      body: { error: error?.message ?? "No se pudo crear la cita" },
    };
  }

  let whatsappLink: string | null = null;
  if (business.whatsappPhone) {
    const message = WhatsAppTemplates.bookingRequest({
      nombre: customer.name,
      negocio: business.name,
      servicio: service.name,
      fecha: formatDate(startsAtDate, "PPP", business.timezone),
      hora: formatTime(startsAtDate, business.timezone),
      tecnica: staffName ?? undefined,
    });
    whatsappLink = buildWhatsAppLink({
      phone: business.whatsappPhone,
      message,
    });
  }

  logger.info("booking.created", {
    businessId: business.id,
    bookingId: appointment.id,
    serviceId: service.id,
    customerHash: maskPii(customer.phone),
    ip,
  });

  return {
    status: 200,
    body: {
      bookingId: appointment.id,
      whatsappLink,
      status: "requested",
    },
  };
}
