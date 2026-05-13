import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AmbientBlobs } from "@/components/motion/ambient-blobs";
import { BRAND } from "@/lib/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientBlobs variant="auth" />

      <header className="container flex h-20 items-center">
        <Link href="/" className="group flex items-center gap-2">
          <span className="lumelle-mark size-10 transition-transform group-hover:-rotate-3">
            <Sparkles className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-[-0.05em]">
            {BRAND.name}
          </span>
        </Link>
      </header>

      <main className="container grid min-h-[calc(100vh-5rem)] items-center pb-10 lg:grid-cols-[1fr_28rem] lg:gap-14">
        <section className="hidden max-w-xl lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Salon operations
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.96] tracking-[-0.07em]">
            Entra a una jornada más clara.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Reservas, caja, clientas y equipo en una experiencia ligera, pensada
            para trabajar desde recepción o desde el celular.
          </p>
        </section>
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          {children}
        </div>
      </main>
    </div>
  );
}
