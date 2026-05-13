import Link from "next/link";
import { Sparkles, ChevronLeft, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Centro de ayuda",
  description: "Respuestas a las preguntas más frecuentes.",
};

const FAQS = [
  {
    q: "¿Cómo recibo reservas en línea?",
    a: "Cada negocio tiene una URL pública (lumelle.site/b/tu-slug) que puedes compartir por Instagram, WhatsApp o donde quieras. Tus clientas eligen servicio, técnica y horario, y a ti te llega la reserva al dashboard.",
  },
  {
    q: "¿Cómo confirmo una reserva?",
    a: "Desde el dashboard ves las reservas en estado 'Solicitada'. Le das click a 'Confirmar' y la cita se bloquea en tu agenda. También recibes un mensaje WhatsApp prellenado para responderle a la clienta.",
  },
  {
    q: "¿Puedo registrar pagos con Yape o Plin?",
    a: "Sí. Al registrar una venta, eliges el método (efectivo, Yape, Plin, transferencia, POS) e incluso puedes combinar varios métodos en una misma venta.",
  },
  {
    q: "¿Cómo evito el doble agendamiento?",
    a: "El sistema bloquea automáticamente los horarios ocupados a nivel de base de datos. Si dos personas intentan reservar el mismo horario al mismo tiempo, solo una pasa.",
  },
  {
    q: "¿Cómo agrego a mis técnicas?",
    a: "Ve a Ajustes → Equipo y haz click en 'Agregar técnica'. Puedes crearlas sin cuenta de usuario (solo aparecen en agenda) o invitarlas por email para que tengan su propio acceso.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos Row Level Security para que cada negocio solo acceda a sus propios datos, cifrado en tránsito y en reposo, y cumplimos la Ley 29733 de Protección de Datos de Perú.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Cancela desde Ajustes en cualquier momento. No tiene penalizaciones. Tus datos se conservan 30 días por si decides regresar.",
  },
];

export default function HelpPage() {
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
        <h1 className="mb-3 font-display text-4xl font-medium leading-tight md:text-5xl">
          Centro de ayuda
        </h1>
        <p className="mb-10 text-muted-foreground">
          Las preguntas más frecuentes. Si no encuentras lo que buscas,
          escríbenos.
        </p>

        <div className="mb-12 space-y-3">
          {FAQS.map((faq, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-5">
                <h2 className="mb-2 text-lg font-medium">{faq.q}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card-strong">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-2xl font-semibold tracking-[-0.04em]">
              ¿Necesitas más ayuda?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Escríbenos por WhatsApp o email y te respondemos rápido.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a
                  href="https://wa.me/51999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href="mailto:hola@lumelle.site">
                  <Mail className="size-4" /> hola@lumelle.site
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
