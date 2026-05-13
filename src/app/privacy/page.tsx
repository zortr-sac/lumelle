import Link from "next/link";
import { Sparkles, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Lumelle protege tus datos personales según la Ley 29733 de Perú.",
};

export default function PrivacyPage() {
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
          Política de privacidad
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Última actualización: 2026
        </p>

        <article className="prose-content space-y-5 text-sm leading-relaxed">
          <Section title="1. Quiénes somos">
            Lumelle es operado por su negocio para la gestión de citas,
            clientas, ventas y configuración de su salón. Cumplimos la Ley
            29733 de Protección de Datos Personales del Perú.
          </Section>

          <Section title="2. Datos que recolectamos">
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                De la dueña del negocio: nombre, email, contraseña encriptada,
                datos del negocio.
              </li>
              <li>
                De las clientas: nombre, teléfono, email opcional, fecha de
                cumpleaños opcional, notas internas sobre preferencias y
                alergias declaradas por la dueña.
              </li>
              <li>
                Datos de uso: cookies de sesión, IP, navegador, para
                autenticación y prevención de abuso.
              </li>
            </ul>
          </Section>

          <Section title="3. Cómo usamos tus datos">
            Los datos se usan exclusivamente para: gestionar tu agenda y caja,
            mostrar tu página pública de reservas, contactar a clientas (por
            canales que tú apruebas), y enviar mensajes de servicio. No
            vendemos datos a terceros. No usamos tus clientas para nuestra
            propia comunicación.
          </Section>

          <Section title="4. Compartir información">
            Solo compartimos datos con proveedores de infraestructura (hosting,
            email, base de datos) bajo contratos de confidencialidad. Estos
            proveedores no usan los datos para fines propios.
          </Section>

          <Section title="5. Tus derechos">
            Tienes derecho a acceder, rectificar, cancelar y oponerte al uso de
            tus datos (Ley 29733). Para ejercerlos contacta a hola@lumelle.site.
            Responderemos dentro de los plazos legales.
          </Section>

          <Section title="6. Seguridad">
            Usamos cifrado en tránsito (HTTPS) y en reposo. Las contraseñas se
            almacenan con hashing seguro. Aplicamos Row Level Security para que
            cada negocio solo acceda a sus propios datos.
          </Section>

          <Section title="7. Retención">
            Conservamos los datos mientras tu cuenta esté activa. Si cancelas,
            mantenemos un respaldo cifrado por 30 días por si decides volver,
            después se elimina permanentemente.
          </Section>

          <Section title="8. Cambios">
            Si hay cambios materiales a esta política, te avisaremos por email
            con 15 días de antelación.
          </Section>

          <Section title="9. Contacto">
            Email:{" "}
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
