"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  Smartphone,
  Banknote,
  CreditCard,
  Send,
  Wallet2,
} from "lucide-react";
import { toast } from "sonner";
import { createSale } from "@/server/actions/cash";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatPEN, toCents, fromCents } from "@/lib/format/currency";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
};
type Customer = { id: string; name: string; phone: string | null };

type SaleItem = {
  serviceId?: string;
  name: string;
  qty: number;
  unitPriceCents: number;
};
type Payment = {
  method: "cash" | "yape" | "plin" | "transfer" | "pos" | "other";
  amountCents: number;
  reference?: string;
};

type Preload = {
  appointmentId?: string;
  customerId?: string;
  items?: SaleItem[];
} | null;

const PAYMENT_OPTIONS: {
  value: Payment["method"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "yape", label: "Yape", icon: Smartphone },
  { value: "plin", label: "Plin", icon: Smartphone },
  { value: "transfer", label: "Transferencia", icon: Send },
  { value: "pos", label: "POS", icon: CreditCard },
  { value: "other", label: "Otro", icon: Wallet2 },
];

export function SaleForm({
  services,
  customers,
  preload,
}: {
  services: Service[];
  customers: Customer[];
  preload: Preload;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<SaleItem[]>(preload?.items ?? []);
  const [customerId, setCustomerId] = useState<string | undefined>(
    preload?.customerId,
  );
  const [discount, setDiscount] = useState("0");
  const [tip, setTip] = useState("0");
  const [payments, setPayments] = useState<Payment[]>([
    { method: "cash", amountCents: 0 },
  ]);
  const [notes] = useState("");

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.qty * it.unitPriceCents, 0),
    [items],
  );
  const total = Math.max(
    0,
    subtotal - toCents(discount || "0") + toCents(tip || "0"),
  );
  const paid = payments.reduce((acc, p) => acc + p.amountCents, 0);
  const remaining = total - paid;

  function addService(serviceId: string) {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;
    setItems((prev) => [
      ...prev,
      {
        serviceId: svc.id,
        name: svc.name,
        qty: 1,
        unitPriceCents: svc.price_cents,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItemQty(index: number, qty: number) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, qty: Math.max(1, qty) } : it,
      ),
    );
  }

  function addPayment() {
    setPayments((prev) => [
      ...prev,
      { method: "cash", amountCents: remaining > 0 ? remaining : 0 },
    ]);
  }

  function removePayment(index: number) {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePaymentMethod(index: number, method: Payment["method"]) {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, method } : p)),
    );
  }

  function updatePaymentAmount(index: number, value: string) {
    setPayments((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, amountCents: toCents(value || "0") } : p,
      ),
    );
  }

  function fillRemaining(index: number) {
    setPayments((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, amountCents: p.amountCents + remaining } : p,
      ),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Agrega al menos un servicio");
      return;
    }
    if (paid !== total) {
      toast.error(
        `La suma de pagos no coincide (faltan ${formatPEN(Math.abs(remaining))})`,
      );
      return;
    }
    startTransition(async () => {
      const r = await createSale({
        customerId: customerId ?? null,
        appointmentId: preload?.appointmentId ?? null,
        saleType: preload?.appointmentId ? "appointment" : "walkin",
        discountCents: toCents(discount || "0"),
        tipCents: toCents(tip || "0"),
        notes: notes || undefined,
        items,
        payments,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Venta registrada âœ¨");
      router.push("/dashboard/caja");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Items */}
      <Card className="glass-card-strong">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Servicios</h2>
            <Select onValueChange={addService}>
              <SelectTrigger className="h-10 w-56">
                <SelectValue placeholder="Agregar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {formatPEN(s.price_cents)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Agrega al menos un servicio para continuar
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li
                  key={`${it.serviceId}-${i}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPEN(it.unitPriceCents)} c/u
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) => updateItemQty(i, Number(e.target.value))}
                    className="h-10 w-16 text-center"
                  />
                  <p className="w-24 text-right font-display text-base font-medium">
                    {formatPEN(it.qty * it.unitPriceCents)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Customer + Adjustments */}
      <Card className="glass-card">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <Label>Cliente (opcional)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Walk-in (sin cliente)" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount">Descuento</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  S/
                </span>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step={0.5}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip">Propina</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  S/
                </span>
                <Input
                  id="tip"
                  type="number"
                  min={0}
                  step={0.5}
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="glass-card-strong">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-display text-base">
              {formatPEN(subtotal)}
            </span>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">- Descuento</span>
            <span className="font-display text-base text-destructive">
              {formatPEN(toCents(discount || "0"))}
            </span>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">+ Propina</span>
            <span className="font-display text-base text-emerald-700">
              {formatPEN(toCents(tip || "0"))}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-brand-lila/30 pt-3">
            <span className="font-medium">Total</span>
            <span className="gradient-text text-3xl font-semibold tracking-[-0.04em]">
              {formatPEN(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card className="glass-card">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Pagos</h2>
            <Button
              type="button"
              size="sm"
              variant="glass"
              onClick={addPayment}
            >
              <Plus className="size-4" /> Agregar
            </Button>
          </div>
          <ul className="space-y-2">
            {payments.map((p, i) => {
              const Icon =
                PAYMENT_OPTIONS.find((o) => o.value === p.method)?.icon ??
                Wallet2;
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-2xl bg-white/60 p-3"
                >
                  <Icon className="size-4 text-brand-lavender" />
                  <Select
                    value={p.method}
                    onValueChange={(v) =>
                      updatePaymentMethod(i, v as Payment["method"])
                    }
                  >
                    <SelectTrigger className="h-10 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      S/
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={fromCents(p.amountCents)}
                      onChange={(e) => updatePaymentAmount(i, e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {remaining > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => fillRemaining(i)}
                    >
                      Completar
                    </Button>
                  )}
                  {payments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePayment(i)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl p-3 text-sm",
              remaining === 0
                ? "bg-emerald-50 text-emerald-700"
                : remaining > 0
                  ? "bg-amber-50 text-amber-800"
                  : "bg-destructive/10 text-destructive",
            )}
          >
            <span>
              {remaining === 0
                ? "Pagos cuadran âœ“"
                : remaining > 0
                  ? "Falta cobrar"
                  : "Sobra cobrado"}
            </span>
            <span className="text-lg font-medium">
              {formatPEN(Math.abs(remaining))}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isPending || items.length === 0 || remaining !== 0}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : (
            `Registrar venta · ${formatPEN(total)}`
          )}
        </Button>
      </div>
    </form>
  );
}
