import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Type Database from src/types/database.types.ts is available but query result inference
// for joined `relation:other_table(...)` selects produces `never`. Returning `any` keeps
// runtime correct; column names match the DB schema exactly.
export async function createSupabaseServerClient(): Promise<any> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // noop in RSC where setAll is unavailable; middleware refreshes session
          }
        },
      },
    },
  );
}
