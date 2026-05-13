import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BusinessForm } from "./business-form";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publicBusinessUrl } from "@/lib/brand";

export const metadata = { title: "Ajustes del negocio" };

export default async function AjustesNegocioPage() {
  const session = await requireRole("owner");
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, district, city, address, instagram, whatsapp_phone, booking_policy, logo_url, cover_url",
    )
    .eq("id", session.businessId)
    .single();

  if (!business) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">
            Mi negocio
          </h1>
          <p className="text-sm text-muted-foreground">
            Lo que ven tus clientas.
          </p>
        </div>
        <Button asChild variant="glass" size="sm">
          <Link href={`/b/${business.slug}` as never} target="_blank">
            <ExternalLink className="size-4" /> Ver página pública
          </Link>
        </Button>
      </header>

      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
          <CardDescription>
            tu URL pública: <strong>{publicBusinessUrl(business.slug)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessForm
            defaultValues={{
              name: business.name,
              slug: business.slug,
              district: business.district ?? "",
              city: business.city ?? "",
              address: business.address ?? "",
              whatsappPhone: business.whatsapp_phone ?? "",
              instagram: business.instagram ?? "",
              bookingPolicy: business.booking_policy ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
