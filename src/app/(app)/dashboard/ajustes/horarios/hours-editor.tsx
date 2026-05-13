"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateBusinessHours } from "@/server/actions/hours";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { dayName } from "@/lib/format/date";

type Hour = {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
};

export function HoursEditor({ initialHours }: { initialHours: Hour[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialMap = new Map<number, Hour>();
  for (const h of initialHours) initialMap.set(h.day_of_week, h);

  const [days, setDays] = useState<Hour[]>(
    Array.from({ length: 7 }).map((_, i) => {
      const existing = initialMap.get(i);
      return (
        existing ?? {
          day_of_week: i,
          opens_at: "09:00",
          closes_at: "18:00",
          is_closed: i === 0,
        }
      );
    }),
  );

  function updateDay(i: number, patch: Partial<Hour>) {
    setDays((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    );
  }

  function handleSave() {
    startTransition(async () => {
      const r = await updateBusinessHours({
        hours: days.map((d) => ({
          dayOfWeek: d.day_of_week,
          opensAt: d.opens_at.slice(0, 5),
          closesAt: d.closes_at.slice(0, 5),
          isClosed: d.is_closed,
        })),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Horarios actualizados ⏰");
      router.refresh();
    });
  }

  return (
    <Card className="glass-card-strong">
      <CardContent className="space-y-4 p-6">
        {days.map((d, i) => (
          <div
            key={d.day_of_week}
            className="grid grid-cols-[120px_1fr_1fr_auto] items-center gap-3"
          >
            <Label className="font-medium">{dayName(d.day_of_week)}</Label>
            <Input
              type="time"
              value={d.opens_at.slice(0, 5)}
              onChange={(e) => updateDay(i, { opens_at: e.target.value })}
              disabled={d.is_closed}
            />
            <Input
              type="time"
              value={d.closes_at.slice(0, 5)}
              onChange={(e) => updateDay(i, { closes_at: e.target.value })}
              disabled={d.is_closed}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={!d.is_closed}
                onCheckedChange={(checked) =>
                  updateDay(i, { is_closed: !checked })
                }
              />
              <span className="w-12 text-xs text-muted-foreground">
                {d.is_closed ? "Cerrado" : "Abierto"}
              </span>
            </div>
          </div>
        ))}
        <div className="flex justify-end border-t border-border pt-2">
          <Button onClick={handleSave} disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
