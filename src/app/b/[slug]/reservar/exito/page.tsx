import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveBusinessBySlug } from "@/lib/tenant/resolve";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ booking?: string; wa?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const business = await resolveBusinessBySlug(slug);
  if (!business) notFound();

  const whatsappLink = sp.wa;

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(42,30,45,.10),transparent_34rem)]" />
      </div>

      <div className="container py-10">
        <Card className="glass-card-strong mx-auto max-w-xl">
          <CardContent className="p-8 text-center md:p-10">
            <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-10 text-emerald-700" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.05em] md:text-4xl">
              Reserva enviada
            </h1>
            <p className="mt-3 text-muted-foreground">
              {business.name} la recibirá ahora.{" "}
              <strong>Confírmala por WhatsApp</strong> para asegurar tu hora.
            </p>

            {whatsappLink && (
              <Button asChild size="xl" className="btn-shine mt-8">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-5" /> Confirmar por WhatsApp
                </a>
              </Button>
            )}

            <div className="mt-10 rounded-2xl bg-muted/55 p-4 text-left">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-brand-plum" /> Próximos pasos
              </p>
              <ol className="list-inside list-decimal space-y-1.5 text-sm text-muted-foreground">
                <li>Envía el mensaje de WhatsApp prellenado.</li>
                <li>Espera que el salón confirme la cita.</li>
                <li>Listo, tu horario queda coordinado.</li>
              </ol>
            </div>

            <Button asChild variant="ghost" className="mt-6">
              <Link href={`/b/${slug}` as never}>
                Volver a {business.name} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
