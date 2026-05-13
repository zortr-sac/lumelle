import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { BRAND } from "@/lib/brand";
import { AmbientBlobs } from "@/components/motion/ambient-blobs";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const features = [
  {
    icon: Calendar,
    title: "Agenda del día",
    description:
      "Citas, solicitudes y técnicas en una vista pensada para decidir rápido.",
  },
  {
    icon: MessageCircle,
    title: "Reservas por link",
    description:
      "Tus clientas eligen servicio, horario y confirman por WhatsApp.",
  },
  {
    icon: CreditCard,
    title: "Caja clara",
    description:
      "Pagos mixtos, Yape, Plin, descuentos, propinas y cierre diario.",
  },
  {
    icon: Users,
    title: "Clientas fieles",
    description:
      "Historial, preferencias, cumpleaños y contexto antes de atender.",
  },
  {
    icon: TrendingUp,
    title: "Lectura de negocio",
    description: "Ingresos, pendientes y rendimiento sin reportes pesados.",
  },
  {
    icon: Sparkles,
    title: "Catálogo público",
    description:
      "Una página elegante para que cada salón reciba reservas 24/7.",
  },
];

const plans = [
  {
    name: "Solo",
    price: 39,
    audience: "Profesional independiente",
    features: ["Agenda y caja", "Página pública", "Clientas", "1 técnica"],
    highlighted: false,
  },
  {
    name: "Atelier",
    price: 89,
    audience: "Studio de 2 a 5 técnicas",
    features: [
      "Todo lo de Solo",
      "Equipo y roles",
      "Reservas online",
      "Reportes simples",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    name: "Maison",
    price: 199,
    audience: "Salón con operación completa",
    features: [
      "Todo lo de Atelier",
      "Técnicas ilimitadas",
      "Caja avanzada",
      "Inventario y sucursales",
    ],
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientBlobs variant="hero" />

      <header className="container relative z-10 flex h-20 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className="lumelle-mark size-10 transition-transform group-hover:-rotate-3">
            <Sparkles className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-[-0.05em]">
            {BRAND.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="#features"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Funciones
          </Link>
          <Link
            href="#precios"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Precios
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Iniciar sesión
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/signup">Empezar</Link>
        </Button>
      </header>

      <main>
        <section className="relative">
          <div className="container grid items-center gap-10 py-10 lg:min-h-[760px] lg:grid-cols-[0.88fr_1.12fr]">
            <Reveal>
              <div className="max-w-2xl">
                <Badge variant="soft" className="mb-5">
                  <Sparkles className="mr-1 size-3" /> Glamour operativo para
                  salones luminosos
                </Badge>
                <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.07em] md:text-7xl">
                  <span className="gradient-text">Luminosidad</span> para operar
                  tu salón con glamour.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                  {BRAND.name} ilumina reservas, caja, clientas y catálogo
                  público con una interfaz premium, rápida y lista para trabajar
                  desde el celular.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="xl" className="btn-shine">
                    <Link href="/signup">
                      Crear cuenta <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="xl" variant="glass">
                    <Link href="#features">Ver funciones</Link>
                  </Button>
                </div>
                <div className="mt-6 grid max-w-md grid-cols-3 gap-3 text-sm">
                  <Proof value="14d" label="gratis" />
                  <Proof value="5min" label="setup" />
                  <Proof value="24/7" label="reservas" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative min-h-[520px] lg:min-h-[640px]">
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 shadow-pop backdrop-blur-2xl">
                  <Image
                    src="/lumelle-dashboard-preview.png"
                    alt="Vista del dashboard Lumelle"
                    fill
                    className="object-cover object-right-top opacity-90"
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.18),transparent_38%),linear-gradient(310deg,rgba(255,79,163,.16),transparent_48%),linear-gradient(180deg,transparent,rgba(255,214,107,.16))]" />
                </div>
                <Surface
                  variant="elevated"
                  className="absolute bottom-6 left-6 right-6 p-4 md:left-auto md:w-80"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Hoy
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniMetric value="8" label="citas" />
                    <MiniMetric value="S/ 620" label="ventas" />
                    <MiniMetric value="3" label="pendientes" />
                  </div>
                </Surface>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="features" className="container py-20">
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Badge variant="soft" className="mb-4">
                Sistema operativo
              </Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] md:text-5xl">
                Todo lo que mueve el salón, sin ruido visual.
              </h2>
            </div>
          </Reveal>
          <Stagger className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Surface className="h-full p-5 transition-all hover:-translate-y-0.5 hover:bg-white/85">
                  <div className="mb-5 grid size-11 place-items-center rounded-2xl bg-grad-accent text-brand-plum">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </Surface>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section id="precios" className="container py-20">
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Badge variant="soft" className="mb-4">
                Planes
              </Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] md:text-5xl">
                Empieza liviano. Escala cuando el equipo crezca.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Surface
                key={plan.name}
                variant={plan.highlighted ? "elevated" : "glass"}
                className={
                  plan.highlighted ? "p-6 ring-1 ring-brand-plum/20" : "p-6"
                }
              >
                {plan.highlighted && (
                  <Badge className="mb-5 bg-brand-ink text-white">
                    Más elegido
                  </Badge>
                )}
                <h3 className="text-xl font-semibold tracking-[-0.04em]">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.audience}
                </p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-[-0.06em]">
                    S/{plan.price}
                  </span>
                  <span className="pb-2 text-sm text-muted-foreground">
                    /mes
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-sage" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href="/signup">Elegir plan</Link>
                </Button>
              </Surface>
            ))}
          </div>
        </section>

        <section className="container pb-24 pt-10">
          <Surface
            variant="elevated"
            className="mx-auto max-w-4xl p-8 text-center md:p-12"
          >
            <h2 className="text-3xl font-semibold tracking-[-0.05em] md:text-5xl">
              Ordena el próximo día de trabajo.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Prueba Lumelle con tu equipo, tus servicios y tu página pública.
            </p>
            <Button asChild size="xl" className="btn-shine mt-8">
              <Link href="/signup">
                Crear mi salón <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Surface>
        </section>
      </main>

      <footer className="border-t border-white/70 py-8">
        <div className="container flex flex-col items-center gap-4 text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {BRAND.name}. Hecho para salones
            en Perú.
          </p>
          <nav className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Términos
            </Link>
            <Link href="/help" className="hover:text-foreground">
              Ayuda
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 p-3 shadow-inset backdrop-blur-xl">
      <p className="text-lg font-semibold tracking-[-0.04em]">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-lg font-semibold tabular-nums tracking-[-0.04em]">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
