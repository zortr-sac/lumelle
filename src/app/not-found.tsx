import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grad-hero opacity-30" />
      </div>
      <div className="container max-w-md text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-grad-hero shadow-pop">
          <Sparkles className="size-9 text-white" />
        </div>
        <h1 className="font-display text-5xl font-medium leading-tight md:text-6xl">
          404
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          No encontramos esta página.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
