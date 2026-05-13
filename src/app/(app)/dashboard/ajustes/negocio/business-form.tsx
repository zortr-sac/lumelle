"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { businessSchema, type BusinessInput } from "@/lib/validators/business";
import { updateBusiness } from "@/server/actions/businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BusinessForm({
  defaultValues,
}: {
  defaultValues: BusinessInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues,
  });

  function onSubmit(values: BusinessInput) {
    startTransition(async () => {
      const r = await updateBusiness(values);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Negocio actualizado ✨");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del salón</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL pública (slug)</Label>
        <Input id="slug" {...register("slug")} disabled />
        <p className="text-xs text-muted-foreground">
          El slug no se puede cambiar después de creado. Contacta soporte si
          necesitas modificarlo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="district">Distrito</Label>
          <Input
            id="district"
            {...register("district")}
            placeholder="Miraflores"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...register("city")} placeholder="Lima" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección (opcional)</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Av. Larco 123, of 4"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="whatsappPhone">WhatsApp</Label>
          <Input
            id="whatsappPhone"
            {...register("whatsappPhone")}
            placeholder="+51 999 999 999"
          />
          {errors.whatsappPhone && (
            <p className="text-xs text-destructive">
              {errors.whatsappPhone.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <div className="flex items-center rounded-2xl border-2 border-input bg-white/80 px-4">
            <span className="text-sm text-muted-foreground">@</span>
            <input
              id="instagram"
              className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
              {...register("instagram")}
              placeholder="studio.bella"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookingPolicy">
          Política de reservas (aparece en página pública)
        </Label>
        <Textarea
          id="bookingPolicy"
          {...register("bookingPolicy")}
          placeholder="Confirmación por WhatsApp. Cancelaciones con 24h de anticipación."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}
