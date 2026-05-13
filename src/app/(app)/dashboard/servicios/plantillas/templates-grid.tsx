"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createService } from "@/server/actions/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPEN } from "@/lib/format/currency";

type Template = {
  id: string;
  name: string;
  category: string;
  default_price_cents: number;
  default_duration_minutes: number;
  description: string | null;
};

export function TemplatesGrid({
  templates,
  existingNames,
}: {
  templates: Template[];
  existingNames: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState<Set<string>>(
    new Set(existingNames.map((n) => n.toLowerCase())),
  );

  const grouped: Record<string, Template[]> = {};
  for (const t of templates) {
    grouped[t.category] = grouped[t.category] ?? [];
    grouped[t.category]!.push(t);
  }

  function handleAdd(template: Template) {
    startTransition(async () => {
      const r = await createService({
        name: template.name,
        category: template.category,
        description: template.description ?? "",
        priceCents: template.default_price_cents,
        durationMinutes: template.default_duration_minutes,
        bufferMinutes: 0,
        imageUrl: "",
        isActive: true,
        requiresStaffSelection: false,
        staffIds: [],
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setAdded((prev) => new Set([...prev, template.name.toLowerCase()]));
      toast.success(`${template.name} agregado âœ¨`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <Badge variant="soft" className="mb-3">
            {category}
          </Badge>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => {
              const isAdded = added.has(t.name.toLowerCase());
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.36,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Card
                    className={`glass-card transition-all ${isAdded ? "opacity-60" : ""}`}
                  >
                    <CardContent className="p-5">
                      <h3 className="font-medium">{t.name}</h3>
                      {t.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xl font-semibold tracking-[-0.03em]">
                            {formatPEN(t.default_price_cents)}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {t.default_duration_minutes} min
                          </p>
                        </div>
                        {isAdded ? (
                          <Badge variant="success">
                            <Check className="size-3" /> Agregado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAdd(t)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="size-4" /> Agregar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
