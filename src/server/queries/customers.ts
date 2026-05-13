import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  decodeCursor,
  encodeCursor,
  paginate,
  type PageResult,
} from "@/lib/pagination/cursor";
import { PAGE_SIZE } from "@/lib/constants";

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  district: string | null;
  status: string;
  total_visits: number;
  total_spent_cents: number;
  last_visit_at: string | null;
  birthday: string | null;
  created_at: string;
};

export type ListCustomersInput = {
  businessId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
};

/**
 * Paginated customers — cursor by (created_at DESC, id DESC). Single round trip
 * to the DB, only the columns the grid needs.
 */
export async function listCustomers(
  input: ListCustomersInput,
): Promise<PageResult<CustomerListItem>> {
  const limit = input.limit ?? PAGE_SIZE.CUSTOMERS;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("customers")
    .select(
      "id, name, phone, email, district, status, total_visits, total_spent_cents, last_visit_at, birthday, created_at",
    )
    .eq("business_id", input.businessId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (input.search) {
    const term = input.search.replace(/[%_]/g, "\\$&");
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  if (input.status) {
    query = query.eq("status", input.status);
  }

  const decoded = decodeCursor(input.cursor);
  if (decoded) {
    const [createdAt, id] = decoded;
    // tuple comparison for stable cursor (created_at, id) descending
    query = query.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return paginate<CustomerListItem>(
    (data ?? []) as unknown as CustomerListItem[],
    limit,
    (r) => encodeCursor(r.created_at, r.id),
  );
}

/**
 * Customer count by segment for the dashboard widget. Uses a single query that
 * aggregates in Postgres rather than fetching all rows.
 */
export async function countCustomersByStatus(
  businessId: string,
): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc(
    "count_customers_by_status" as never,
    {
      p_business_id: businessId,
    } as never,
  );

  const result: Record<string, number> = {
    new: 0,
    active: 0,
    frequent: 0,
    inactive: 0,
  };
  for (const row of (data ?? []) as { status: string; count: number }[]) {
    result[row.status] = Number(row.count) || 0;
  }
  return result;
}
