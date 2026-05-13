import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RESERVED_SLUGS } from "./slug";

export type PublicBusinessSummary = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
  whatsappPhone: string | null;
  instagram: string | null;
  bookingPolicy: string | null;
  timezone: string;
  currency: string;
};

/**
 * Resolves a slug to a public business summary.
 * Returns null if not found, inactive, or soft-deleted.
 * Cached per request via React `cache`.
 */
export const resolveBusinessBySlug = cache(
  async (slug: string): Promise<PublicBusinessSummary | null> => {
    if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) return null;

    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
      .from("businesses")
      .select(
        "id, slug, name, logo_url, cover_url, district, city, address, whatsapp_phone, instagram, booking_policy, timezone, currency",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (!data) return null;

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      logoUrl: data.logo_url,
      coverUrl: data.cover_url,
      district: data.district,
      city: data.city,
      address: data.address,
      whatsappPhone: data.whatsapp_phone,
      instagram: data.instagram,
      bookingPolicy: data.booking_policy,
      timezone: data.timezone ?? "America/Lima",
      currency: data.currency ?? "PEN",
    };
  },
);

export { RESERVED_SLUGS, isValidSlug, suggestSlug } from "./slug";
