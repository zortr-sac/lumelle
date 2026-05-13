"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { serviceSchema, type ServiceInput } from "@/lib/validators/service";
import { createService, updateService } from "@/server/actions/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fromCents, toCents } from "@/lib/format/currency";

type Props = {
  serviceId?: string;
  defaultValues?: Partial<ServiceInput>;
};

const CATEGORIES = [
  "Manicure",
  "Pedicure",
  "Diseños",
  "Cejas",
  "Pestañas",
  "Maquillaje",
  "Cabello",
  "Spa",
  "Otros",
];

export function ServiceForm({ serviceId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [priceDisplay, setPriceDisplay] = useState(
    defaultValues?.priceCents
      ? String(fromCents(defaultValues.priceCents))
      : "",
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      priceCents: 0,
      durationMinutes: 60,
      bufferMinutes: 0,
      imageUrl: "",
      isActive: true,
      requiresStaffSelection: false,
      staffIds: [],
      ...defaultValues,
    },
  });

  const isActive = watch("isActive");
  const requiresStaffSelection = watch("requiresStaffSelection");

  function onSubmit(values: ServiceInput) {
    startTransition(async () => {
      const result = serviceId
        ? await updateService(serviceId, values)
        : await createService(values);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(serviceId ? "Servicio actualizado" : "Servicio creado");
      router.push("/dashboard/servicios");
      router.refresh();
    });
  }

  return (
    <Card className="glass-card-strong">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del servicio</Label>
            <Input id="name" placeholder="Manicure gel" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                {...register("category")}
                className="flex h-12 w-full rounded-2xl border-2 border-input bg-white/80 px-4 text-sm shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sin categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duración</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="durationMinutes"
                  type="number"
                  min={5}
                  step={5}
                  {...register("durationMinutes", { valueAsNumber: true })}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              {errors.durationMinutes && (
                <p className="text-xs text-destructive">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  S/
                </span>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.5}
                  className="pl-10"
                  value={priceDisplay}
                  onChange={(e) => {
                    setPriceDisplay(e.target.value);
                    setValue("priceCents", toCents(e.target.value));
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bufferMinutes">
                Tiempo de limpieza{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bufferMinutes"
                  type="number"
                  min={0}
                  step={5}
                  {...register("bufferMinutes", { valueAsNumber: true })}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Lo que incluye el servicio…"
              {...register("description")}
            />
          </div>

          <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium">Servicio activo</p>
                <p className="text-xs text-muted-foreground">
                  Si está pausado, no aparece en tu página pública
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setValue("isActive", e.target.checked)}
                className="size-5 rounded-md accent-brand-lavender"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium">Requiere elegir técnica</p>
                <p className="text-xs text-muted-foreground">
                  La clienta elegirá quién la atiende
                </p>
              </div>
              <input
                type="checkbox"
                checked={requiresStaffSelection}
                onChange={(e) =>
                  setValue("requiresStaffSelection", e.target.checked)
                }
                className="size-5 rounded-md accent-brand-lavender"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : serviceId ? (
                "Guardar cambios"
              ) : (
                "Crear servicio"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
