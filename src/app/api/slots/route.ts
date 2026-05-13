import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  computeAvailableSlots,
  groupSlotsByPeriod,
} from "@/lib/slots/availability";
import { resolveBusinessBySlug } from "@/lib/tenant/resolve";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit, RATE_LIMITS, clientIp } from "@/lib/rate-limit/upstash";

export const runtime = "nodejs";

const querySchema = z.object({
  slug: z.string().min(3).max(40),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const limit = await rateLimit(`slots:${ip}`, RATE_LIMITS.publicSlots);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429, headers: rateHeaders(limit) },
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    slug: searchParams.get("slug"),
    serviceId: searchParams.get("serviceId"),
    staffId: searchParams.get("staffId") ?? undefined,
    date: searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 },
    );
  }

  const { slug, serviceId, staffId, date } = parsed.data;
  const business = await resolveBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json(
      { error: "Negocio no encontrado" },
      { status: 404 },
    );
  }

  const admin = createSupabaseAdminClient();

  const [{ data: service }, { data: hours }] = await Promise.all([
    admin
      .from("services")
      .select("duration_minutes, buffer_minutes, is_active, business_id")
      .eq("id", serviceId)
      .eq("business_id", business.id)
      .maybeSingle(),
    admin
      .from("business_hours")
      .select("day_of_week, opens_at, closes_at, is_closed")
      .eq("business_id", business.id),
  ]);

  if (!service || !service.is_active) {
    return NextResponse.json(
      { error: "Servicio no disponible" },
      { status: 404 },
    );
  }

  let staffHours = null;
  if (staffId) {
    const { data: sh } = await admin
      .from("staff_hours")
      .select("day_of_week, opens_at, closes_at, is_closed")
      .eq("staff_id", staffId);
    if (sh && sh.length > 0) staffHours = sh;
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  let appointmentsQ = admin
    .from("appointments")
    .select("starts_at, ends_at, staff_id, status")
    .eq("business_id", business.id)
    .in("status", ["confirmed", "in_progress"])
    .gte("starts_at", dayStart.toISOString())
    .lte("starts_at", dayEnd.toISOString());

  if (staffId) appointmentsQ = appointmentsQ.eq("staff_id", staffId);

  const { data: existingAppointments } = await appointmentsQ;

  const slots = computeAvailableSlots({
    date: dayStart,
    serviceDurationMinutes: service.duration_minutes,
    bufferMinutes: service.buffer_minutes,
    businessHours: (hours ?? []).map((h) => ({
      dayOfWeek: h.day_of_week,
      opensAt: h.opens_at,
      closesAt: h.closes_at,
      isClosed: h.is_closed,
    })),
    staffHours: staffHours
      ? (staffHours as any[]).map((h) => ({
          dayOfWeek: h.day_of_week,
          opensAt: h.opens_at,
          closesAt: h.closes_at,
          isClosed: h.is_closed,
        }))
      : null,
    existingAppointments: (existingAppointments ?? []).map((a) => ({
      startsAt: a.starts_at,
      endsAt: a.ends_at,
    })),
    timezone: business.timezone,
  });

  return NextResponse.json(
    {
      slots,
      grouped: groupSlotsByPeriod(slots, business.timezone),
    },
    { headers: rateHeaders(limit) },
  );
}

function rateHeaders(limit: { remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Remaining": String(limit.remaining),
    "X-RateLimit-Reset": String(limit.resetAt),
  };
}
