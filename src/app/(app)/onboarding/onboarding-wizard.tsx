"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { businessSchema, type BusinessInput } from "@/lib/validators/business";
import { suggestSlug } from "@/lib/tenant/slug";
import {
  createBusiness,
  checkSlugAvailability,
} from "@/server/actions/businesses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/lib/brand";

const STEPS = [
  { id: 1, label: "Tu negocio", description: "Nombre y URL" },
  { id: 2, label: "Ubicación", description: "Distrito y dirección" },
  { id: 3, label: "Contacto", description: "WhatsApp e Instagram" },
] as const;

export function OnboardingWizard({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues: { name: "", slug: "" },
    mode: "onBlur",
  });

  const name = watch("name");
  const slug = watch("slug");

  async function onNameBlur() {
    if (name && !slug) {
      const suggestion = suggestSlug(name);
      setValue("slug", suggestion);
      await checkSlug(suggestion);
    }
  }

  async function checkSlug(value: string) {
    if (!value || value.length < 3) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const { available } = await checkSlugAvailability(value);
    setSlugStatus(available ? "available" : "taken");
  }

  async function nextStep() {
    const fields = step === 1 ? (["name", "slug"] as const) : ([] as const);
    const valid = await trigger(fields);
    if (!valid) return;
    if (step === 1 && slugStatus !== "available") {
      toast.error("Elige una URL disponible para continuar");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function onSubmit(values: BusinessInput) {
    startTransition(async () => {
      const result = await createBusiness(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("¡Tu negocio está listo!");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <Badge variant="soft" className="mb-3">
          <Sparkles className="mr-1 size-3" />
          Hola {userName.split(" ")[0] || "tú"}
        </Badge>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-4xl">
          Vamos a configurar tu salón en 3 pasos
        </h1>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`grid size-10 place-items-center rounded-full text-sm font-semibold transition-colors ${
                step >= s.id
                  ? "bg-grad-button text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ? <Check className="size-4" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-1 w-12 rounded-full transition-colors ${
                  step > s.id ? "bg-brand-lavender" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle>{STEPS[step - 1]?.label}</CardTitle>
          <CardDescription>{STEPS[step - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del salón</Label>
                  <Input
                    id="name"
                    placeholder="Studio Bella Nails"
                    {...register("name", { onBlur: onNameBlur })}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Tu URL pública</Label>
                  <div className="flex items-center rounded-2xl border-2 border-input bg-white/80 px-4 backdrop-blur-sm focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-sm text-muted-foreground">
                      {BRAND.domain}/b/
                    </span>
                    <input
                      id="slug"
                      className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
                      placeholder="studio-bella"
                      {...register("slug", {
                        onChange: (e) => {
                          const v = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                          setValue("slug", v);
                          checkSlug(v);
                        },
                      })}
                    />
                    <SlugStatusIndicator status={slugStatus} />
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive">
                      {errors.slug.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aquí tus clientas reservarán. Comparte por Instagram o
                    WhatsApp.
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="district">Distrito</Label>
                  <Input
                    id="district"
                    placeholder="Miraflores"
                    {...register("district")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    placeholder="Lima"
                    defaultValue="Lima"
                    {...register("city")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección (opcional)</Label>
                  <Input
                    id="address"
                    placeholder="Av. Larco 123, of 4"
                    {...register("address")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo aparecerá en tu página pública si la pones aquí.
                  </p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="whatsappPhone">WhatsApp del salón</Label>
                  <Input
                    id="whatsappPhone"
                    placeholder="+51 999 999 999"
                    {...register("whatsappPhone")}
                  />
                  {errors.whatsappPhone && (
                    <p className="text-xs text-destructive">
                      {errors.whatsappPhone.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Por aquí recibirás confirmaciones de citas.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <div className="flex items-center rounded-2xl border-2 border-input bg-white/80 px-4 backdrop-blur-sm focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-sm text-muted-foreground">@</span>
                    <input
                      id="instagram"
                      className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
                      placeholder="studio.bella"
                      {...register("instagram")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingPolicy">
                    Política de reservas (opcional)
                  </Label>
                  <Textarea
                    id="bookingPolicy"
                    placeholder="Confirmación por WhatsApp. Cancelaciones con 24h de anticipación."
                    {...register("bookingPolicy")}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  Atrás
                </Button>
              ) : (
                <span />
              )}
              {step < STEPS.length ? (
                <Button type="button" onClick={nextStep} size="lg">
                  Continuar <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Creando…
                    </>
                  ) : (
                    "Crear mi salón"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SlugStatusIndicator({
  status,
}: {
  status: "idle" | "checking" | "available" | "taken";
}) {
  if (status === "idle") return null;
  if (status === "checking") {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  }
  if (status === "available") {
    return <Check className="size-4 text-emerald-600" />;
  }
  return (
    <span className="text-xs font-medium text-destructive">No disponible</span>
  );
}
