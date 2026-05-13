"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Check,
  Sun,
  Sunset,
  Moon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPEN } from "@/lib/format/currency";
import { formatTime } from "@/lib/format/date";
import { phonePE } from "@/lib/validators/common";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  image_url: string | null;
  requires_staff_selection: boolean;
};

type Staff = {
  id: string;
  display_name: string;
  role_label: string | null;
  photo_url: string | null;
  color: string;
};

type Slot = { startsAt: string; endsAt: string };

const customerFormSchema = z.object({
  name: z.string().trim().min(2, "Tu nombre por favor").max(120),
  phone: phonePE,
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
  acceptedPolicies: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar las políticas" }),
  }),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const STEPS = [
  { id: 1, label: "Servicio" },
  { id: 2, label: "Quién" },
  { id: 3, label: "Cuándo" },
  { id: 4, label: "Tus datos" },
];

export function BookingWizard({
  slug,
  businessName,
  services,
  staff,
  staffByService,
  timezone,
  initialServiceId,
  bookingPolicy,
}: {
  slug: string;
  businessName: string;
  services: Service[];
  staff: Staff[];
  staffByService: Record<string, string[]>;
  timezone: string;
  initialServiceId?: string;
  bookingPolicy: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | undefined>(
    initialServiceId,
  );
  const [staffId, setStaffId] = useState<string | undefined>();
  const [date, setDate] = useState<string>(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [slot, setSlot] = useState<Slot | null>(null);
  const [isPending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId);
  const eligibleStaff = service
    ? staff.filter((st) => (staffByService[service.id] ?? []).includes(st.id))
    : [];

  const slotsQuery = useQuery({
    queryKey: ["slots", slug, serviceId, staffId, date],
    queryFn: async () => {
      if (!serviceId) {
        return {
          slots: [] as Slot[],
          grouped: { manana: [], tarde: [], noche: [] } as Record<
            "manana" | "tarde" | "noche",
            Slot[]
          >,
        };
      }
      const params = new URLSearchParams({ slug, serviceId, date });
      if (staffId) params.set("staffId", staffId);
      const res = await fetch(`/api/slots?${params}`);
      if (!res.ok) throw new Error("No se pudieron cargar los horarios");
      return res.json() as Promise<{
        slots: Slot[];
        grouped: Record<"manana" | "tarde" | "noche", Slot[]>;
      }>;
    },
    enabled: step === 3 && !!serviceId,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { acceptedPolicies: false as never },
  });

  const acceptedPolicies = watch("acceptedPolicies");

  function nextStep() {
    if (step === 1 && !serviceId) {
      toast.error("Elige un servicio");
      return;
    }
    if (step === 2) {
      if (service?.requires_staff_selection && !staffId) {
        toast.error("Elige una técnica");
        return;
      }
    }
    if (step === 3 && !slot) {
      toast.error("Elige un horario disponible");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function onSubmit(values: CustomerFormValues) {
    if (!service || !slot) return;

    startTransition(async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          serviceId: service.id,
          staffId,
          startsAt: slot.startsAt,
          customer: {
            name: values.name,
            phone: values.phone,
            email: values.email || undefined,
            notes: values.notes || undefined,
          },
          acceptedPolicies: true,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "No se pudo reservar");
        return;
      }

      const params = new URLSearchParams({
        booking: body.bookingId,
      });
      if (body.whatsappLink) params.set("wa", body.whatsappLink);
      router.push(`/b/${slug}/reservar/exito?${params}` as any);
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "grid size-9 place-items-center rounded-full text-xs font-semibold transition-colors",
                step >= s.id
                  ? "bg-grad-button text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {step > s.id ? <Check className="size-4" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-1 w-8 rounded-full transition-colors md:w-12",
                  step > s.id ? "bg-brand-lavender" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="glass-card-strong">
        <CardContent className="p-6">
          {step === 1 && (
            <StepService
              services={services}
              selected={serviceId}
              onSelect={setServiceId}
            />
          )}

          {step === 2 && (
            <StepStaff
              service={service}
              staff={eligibleStaff}
              selected={staffId}
              onSelect={setStaffId}
            />
          )}

          {step === 3 && (
            <StepSchedule
              date={date}
              onDateChange={(d) => {
                setDate(d);
                setSlot(null);
              }}
              slotsQuery={slotsQuery}
              selected={slot}
              onSelectSlot={setSlot}
              timezone={timezone}
            />
          )}

          {step === 4 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <header>
                <h2 className="mb-1 text-2xl font-semibold tracking-[-0.04em]">
                  Tus datos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Te contactaremos por WhatsApp para confirmar
                </p>
              </header>

              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre</Label>
                <Input
                  id="name"
                  placeholder="María Pérez"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
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
                  placeholder="tu@email.com"
                  {...register("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas para el salón (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="¿Algo que debamos saber?"
                  {...register("notes")}
                />
              </div>

              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">Resumen</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio</span>
                    <span className="font-medium">{service?.name}</span>
                  </div>
                  {staffId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Con</span>
                      <span className="font-medium">
                        {staff.find((s) => s.id === staffId)?.display_name}
                      </span>
                    </div>
                  )}
                  {slot && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cuándo</span>
                      <span className="font-medium">
                        {format(parseISO(slot.startsAt), "PPP 'a las' HH:mm", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-lg font-medium">
                      {service && formatPEN(service.price_cents)}
                    </span>
                  </div>
                </div>
              </div>

              {bookingPolicy && (
                <div className="rounded-2xl bg-brand-lila/10 p-4 text-xs text-muted-foreground">
                  <strong className="text-foreground">Política:</strong>{" "}
                  {bookingPolicy}
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedPolicies as unknown as boolean}
                  onChange={(e) =>
                    setValue("acceptedPolicies", e.target.checked as never, {
                      shouldValidate: true,
                    })
                  }
                  className="mt-1 size-5 shrink-0 rounded-md accent-brand-lavender"
                />
                <span className="text-sm">
                  Acepto las{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="underline hover:text-brand-lavender"
                  >
                    políticas de privacidad
                  </a>{" "}
                  y autorizo el uso de mis datos para gestionar la cita.
                </span>
              </label>
              {errors.acceptedPolicies && (
                <p className="text-xs text-destructive">
                  {errors.acceptedPolicies.message}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="size-4" /> Atrás
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Reservando…
                    </>
                  ) : (
                    "Confirmar reserva"
                  )}
                </Button>
              </div>
            </form>
          )}

          {step < 4 && (
            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="size-4" /> Atrás
                </Button>
              ) : (
                <span />
              )}
              <Button type="button" onClick={nextStep} size="lg">
                Continuar <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepService({
  services,
  selected,
  onSelect,
}: {
  services: Service[];
  selected: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (services.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Aún no hay servicios publicados
      </div>
    );
  }

  return (
    <>
      <header className="mb-4">
        <h2 className="mb-1 text-2xl font-semibold tracking-[-0.04em]">
          ¿Qué te haces?
        </h2>
        <p className="text-sm text-muted-foreground">
          Elige el servicio que quieres reservar
        </p>
      </header>
      <div className="-mr-2 max-h-[60vh] space-y-2 overflow-y-auto pr-2">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              selected === service.id
                ? "border-brand-lavender bg-brand-lavender/10 shadow-soft"
                : "border-transparent bg-white/60 hover:border-brand-lila/40",
            )}
          >
            {service.image_url ? (
              <div
                className="size-16 shrink-0 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${service.image_url})` }}
              />
            ) : (
              <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-grad-soft">
                <Sparkles className="size-5 text-brand-lavender" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{service.name}</p>
              {service.description && (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {service.description}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {service.duration_minutes} min
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-semibold tracking-[-0.03em]">
                {formatPEN(service.price_cents)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StepStaff({
  service,
  staff,
  selected,
  onSelect,
}: {
  service: Service | undefined;
  staff: Staff[];
  selected: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  if (!service || staff.length === 0) {
    return (
      <div className="py-12 text-center">
        <Sparkles className="mx-auto mb-3 size-10 text-brand-lavender" />
        <p className="font-medium">Sigamos sin elegir técnica</p>
        <p className="mt-1 text-sm text-muted-foreground">
          El salón te asignará a quien esté disponible
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-4">
        <h2 className="mb-1 text-2xl font-semibold tracking-[-0.04em]">
          ¿Con quién?
        </h2>
        <p className="text-sm text-muted-foreground">
          Elige a tu técnica favorita o deja que te asignemos
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {!service.requires_staff_selection && (
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className={cn(
              "rounded-2xl border-2 p-4 text-center transition-all",
              selected === undefined
                ? "border-brand-lavender bg-brand-lavender/10"
                : "border-transparent bg-white/60 hover:border-brand-lila/40",
            )}
          >
            <div className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl bg-grad-soft">
              <Sparkles className="size-7 text-brand-lavender" />
            </div>
            <p className="text-sm font-medium">Cualquiera disponible</p>
          </button>
        )}
        {staff.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              "rounded-2xl border-2 p-4 text-center transition-all",
              selected === s.id
                ? "border-brand-lavender bg-brand-lavender/10"
                : "border-transparent bg-white/60 hover:border-brand-lila/40",
            )}
          >
            <div
              className="mx-auto mb-2 grid size-16 place-items-center rounded-2xl font-display text-2xl text-white"
              style={{ background: s.color }}
            >
              {s.display_name.charAt(0)}
            </div>
            <p className="text-sm font-medium">{s.display_name}</p>
            {s.role_label && (
              <p className="text-xs text-muted-foreground">{s.role_label}</p>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function StepSchedule({
  date,
  onDateChange,
  slotsQuery,
  selected,
  onSelectSlot,
  timezone,
}: {
  date: string;
  onDateChange: (date: string) => void;
  slotsQuery: ReturnType<
    typeof useQuery<{
      slots: Slot[];
      grouped: Record<"manana" | "tarde" | "noche", Slot[]>;
    }>
  >;
  selected: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  timezone: string;
}) {
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return {
      iso: format(d, "yyyy-MM-dd"),
      day: format(d, "EEE", { locale: es }),
      date: format(d, "d"),
      monthShort: format(d, "MMM", { locale: es }),
    };
  });

  return (
    <>
      <header className="mb-4">
        <h2 className="mb-1 text-2xl font-semibold tracking-[-0.04em]">
          ¿Cuándo?
        </h2>
        <p className="text-sm text-muted-foreground">
          Elige un día y horario disponible
        </p>
      </header>

      <div className="scrollbar-thin -mx-6 mb-6 overflow-x-auto px-6">
        <div className="flex min-w-max gap-2">
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => onDateChange(d.iso)}
              className={cn(
                "flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-2 py-3 transition-colors",
                d.iso === date
                  ? "bg-grad-button text-white shadow-soft"
                  : "bg-white/60 hover:bg-white",
              )}
            >
              <span className="text-xs uppercase">{d.day}</span>
              <span className="text-2xl font-semibold leading-none tracking-[-0.04em]">
                {d.date}
              </span>
              <span className="text-[10px] uppercase opacity-70">
                {d.monthShort}
              </span>
            </button>
          ))}
        </div>
      </div>

      {slotsQuery.isLoading && (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-brand-lavender" />
        </div>
      )}

      {slotsQuery.data && slotsQuery.data.slots.length === 0 && (
        <div className="py-12 text-center">
          <CalendarIcon className="mx-auto mb-2 size-10 text-muted-foreground" />
          <p className="font-medium">Sin horarios disponibles este día</p>
          <p className="text-sm text-muted-foreground">Prueba con otra fecha</p>
        </div>
      )}

      {slotsQuery.data && slotsQuery.data.slots.length > 0 && (
        <div className="space-y-5">
          <SlotGroup
            icon={<Sun className="size-4" />}
            label="Mañana"
            slots={slotsQuery.data.grouped.manana}
            selected={selected}
            onSelect={onSelectSlot}
            timezone={timezone}
          />
          <SlotGroup
            icon={<Sunset className="size-4" />}
            label="Tarde"
            slots={slotsQuery.data.grouped.tarde}
            selected={selected}
            onSelect={onSelectSlot}
            timezone={timezone}
          />
          <SlotGroup
            icon={<Moon className="size-4" />}
            label="Noche"
            slots={slotsQuery.data.grouped.noche}
            selected={selected}
            onSelect={onSelectSlot}
            timezone={timezone}
          />
        </div>
      )}
    </>
  );
}

function SlotGroup({
  icon,
  label,
  slots,
  selected,
  onSelect,
  timezone,
}: {
  icon: React.ReactNode;
  label: string;
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  timezone: string;
}) {
  if (!slots || slots.length === 0) return null;
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((s) => (
          <button
            key={s.startsAt}
            type="button"
            onClick={() => onSelect(s)}
            className={cn(
              "rounded-xl py-3 text-sm font-medium transition-colors",
              selected?.startsAt === s.startsAt
                ? "bg-grad-button text-white shadow-soft"
                : "border border-border bg-white/60 hover:bg-white",
            )}
          >
            {formatTime(s.startsAt, timezone)}
          </button>
        ))}
      </div>
    </div>
  );
}
