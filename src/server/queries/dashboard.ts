import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardStats = {
  appointmentsToday: number;
  salesTodayCents: number;
  pendingBookings: number;
  weeklyRevenueCents: number;
};

/**
 * Single round trip per business for the dashboard tiles using a Postgres RPC
 * that aggregates everything server-side. Cached per request via React `cache`
 * so parallel components don't trigger duplicate fetches.
 *
 * The RPC is defined in migration 0015_dashboard_rpc.sql.
 */
export const getDashboardStats = cache(
  async (businessId: string): Promise<DashboardStats> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .rpc("dashboard_stats" as never, { p_business_id: businessId } as never)
      .single();

    if (error || !data) {
      return {
        appointmentsToday: 0,
        salesTodayCents: 0,
        pendingBookings: 0,
        weeklyRevenueCents: 0,
      };
    }

    const row = data as {
      appointments_today: number;
      sales_today_cents: number;
      pending_bookings: number;
      weekly_revenue_cents: number;
    };

    return {
      appointmentsToday: Number(row.appointments_today) || 0,
      salesTodayCents: Number(row.sales_today_cents) || 0,
      pendingBookings: Number(row.pending_bookings) || 0,
      weeklyRevenueCents: Number(row.weekly_revenue_cents) || 0,
    };
  },
);

/**
 * Today's appointments list — separate query so the page can stream it under a
 * Suspense boundary independent of the stats tiles.
 */
export const getTodayAppointments = cache(async (businessId: string) => {
  const supabase = await createSupabaseServerClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, status, notes, customer:customers(name, phone), service:services(name, price_cents), staff:staff(display_name, color)",
    )
    .eq("business_id", businessId)
    .gte("starts_at", todayStart.toISOString())
    .lt("starts_at", todayEnd.toISOString())
    .in("status", ["confirmed", "in_progress", "completed"])
    .order("starts_at")
    .limit(25);

  return data ?? [];
});

export const getPendingBookings = cache(async (businessId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, starts_at, customer:customers(name), service:services(name)")
    .eq("business_id", businessId)
    .eq("status", "requested")
    .order("created_at", { ascending: false })
    .limit(5);

  return data ?? [];
});

export const getBusinessSummary = cache(async (businessId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("businesses")
    .select("name, slug, logo_url")
    .eq("id", businessId)
    .maybeSingle();
  return data;
});
