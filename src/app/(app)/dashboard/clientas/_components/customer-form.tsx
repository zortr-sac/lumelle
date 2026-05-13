"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { customerSchema, type CustomerInput } from "@/lib/validators/customer";
import { createCustomer, updateCustomer } from "@/server/actions/customers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CustomerForm({
  customerId,
  defaultValues,
}: {
  customerId?: string;
  defaultValues?: Partial<CustomerInput>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      birthday: "",
      district: "",
      instagram: "",
      notes: "",
      allergies: "",
      ...defaultValues,
    },
  });

  function onSubmit(values: CustomerInput) {
    startTransition(async () => {
      const r = customerId
        ? await updateCustomer(customerId, values)
        : await createCustomer(values);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(customerId ? "Clienta actualizada" : "Clienta creada");
      router.push("/dashboard/clientas");
      router.refresh();
    });
  }

  return (
    <Card className="glass-card-strong">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" placeholder="María Pérez" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+51 999 999 999"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="maria@email.com"
                {...register("email")}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="birthday">Cumpleaños (opcional)</Label>
              <Input id="birthday" type="date" {...register("birthday")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito (opcional)</Label>
              <Input
                id="district"
                placeholder="Miraflores"
                {...register("district")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram (opcional)</Label>
            <div className="flex items-center rounded-2xl border-2 border-input bg-white/80 px-4 backdrop-blur-sm focus-within:ring-2 focus-within:ring-ring">
              <span className="text-sm text-muted-foreground">@</span>
              <input
                id="instagram"
                className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
                placeholder="usuaria"
                {...register("instagram")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias o cuidados (opcional)</Label>
            <Textarea
              id="allergies"
              placeholder="Alergia a acetona, esmaltes vegan only…"
              {...register("allergies")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas internas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Le gusta gel, viene cada 3 semanas…"
              {...register("notes")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
