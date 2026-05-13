import type { Metadata } from "next";
import { ServiceForm } from "../_components/service-form";

export const metadata: Metadata = { title: "Nuevo servicio" };

export default function NuevoServicioPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Nuevo servicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Define qué ofreces para que aparezca en tu página pública.
        </p>
      </header>
      <ServiceForm />
    </div>
  );
}
