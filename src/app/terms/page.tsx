import Link from "next/link";
import { Sparkles, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Términos y condiciones",
  description: "Términos del servicio Lumelle.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-20" />
      </div>
      <header className="container py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium hover:text-brand-lavender"
        >
          <ChevronLeft className="size-4" /> Volver
        </Link>
      </header>
      <main className="container max-w-3xl pb-20">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-2xl bg-grad-hero shadow-soft">
            <Sparkles className="size-5 text-white" />
          </span>
          <span className="font-display text-xl font-semibold">Lumelle</span>
        </div>
        <h1 className="mb-2 font-display text-4xl font-medium leading-tight md:text-5xl">
          Términos y condiciones
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Última actualización: 2026
        </p>

        <article className="space-y-5 text-sm leading-relaxed">
          <Section title="1. Aceptación">
            Al registrarte aceptas estos términos. Si no estás de acuerdo, no
            uses el servicio.
          </Section>
          <Section title="2. Cuentas">
            Eres responsable de mantener tu contraseña segura. Una cuenta es
            para un negocio. Si tienes varios salones, contacta soporte.
          </Section>
          <Section title="3. Pago y prueba">
            Ofrecemos 14 días de prueba gratis. Después se cobra el plan
            elegido mensualmente. Puedes cancelar en cualquier momento. No hay
            reembolso por períodos parciales.
          </Section>
          <Section title="4. Uso aceptable">
            No uses Lumelle para enviar spam, almacenar contenido ilegal, o
            intentar acceder a datos de otros negocios. La violación de esta
            cláusula resulta en suspensión inmediata.
          </Section>
          <Section title="5. Datos del negocio">
            Eres dueña de tus datos. Puedes exportarlos o eliminarlos en
            cualquier momento desde el dashboard. Ver{" "}
            <Link href="/privacy" className="underline">
              política de privacidad
            </Link>
            .
          </Section>
          <Section title="6. Disponibilidad">
            Nos esforzamos por mantener el servicio 99% del tiempo. No
            garantizamos disponibilidad ininterrumpida y no somos responsables
            por pérdidas indirectas por interrupciones.
          </Section>
          <Section title="7. Limitación de responsabilidad">
            Lumelle provee una herramienta; tú eres responsable de tu negocio.
            No somos responsables por decisiones operativas, fiscales o legales
            que tomes con base en los reportes generados.
          </Section>
          <Section title="8. Cambios al servicio">
            Podemos agregar o modificar funcionalidades. Si cambiamos planes o
            precios, te avisaremos con 30 días de antelación.
          </Section>
          <Section title="9. Ley aplicable">
            Estos términos se rigen por las leyes de Perú. Disputas se
            resuelven en Lima.
          </Section>
          <Section title="10. Contacto">
            <a href="mailto:hola@lumelle.site" className="underline">
              hola@lumelle.site
            </a>
          </Section>
        </article>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold tracking-[-0.03em]">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}
