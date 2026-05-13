import { Suspense } from "react";
import Link from "next/link";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { requireBusiness } from "@/lib/auth/session";
import { ListRowsSkeleton } from "@/app/(app)/dashboard/_components/skeletons";
import { AgendaList } from "./_components/agenda-list";

export const metadata = { title: "Agenda" };

const STATUS_FILTERS = [
  { label: "Todas", value: "" },
  { label: "Solicitadas", value: "requested" },
  { label: "Confirmadas", value: "confirmed" },
  { label: "Atendidas", value: "completed" },
];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const session = await requireBusiness();
  const sp = await searchParams;

  const baseDate = sp.date ? parseISO(sp.date) : new Date();
  const dayStart = startOfDay(baseDate);
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(dayStart, i - 3),
  );
  const todayKey = format(dayStart, "yyyy-MM-dd");
  const filterKey = `${todayKey}|${sp.status ?? ""}`;

  return (
    <PageTransition>
      <div className="space-y-5">
        <PageHeader
          title="Agenda"
          description={format(dayStart, "EEEE, d 'de' MMMM 'de' yyyy", {
            locale: es,
          })}
          actions={
            <>
              <Button variant="glass" asChild size="sm">
                <Link
                  href={
                    `/dashboard/agenda?date=${format(addDays(dayStart, -1), "yyyy-MM-dd")}` as never
                  }
                  prefetch={false}
                  aria-label="Día anterior"
                >
                  <ChevronLeft className="size-4" />
                </Link>
              </Button>
              <Button variant="glass" asChild size="sm">
                <Link
                  href={
                    `/dashboard/agenda?date=${format(new Date(), "yyyy-MM-dd")}` as never
                  }
                  prefetch={false}
                >
                  Hoy
                </Link>
              </Button>
              <Button variant="glass" asChild size="sm">
                <Link
                  href={
                    `/dashboard/agenda?date=${format(addDays(dayStart, 1), "yyyy-MM-dd")}` as never
                  }
                  prefetch={false}
                  aria-label="Día siguiente"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/agenda/nueva">
                  <Plus className="size-4" /> Nueva cita
                </Link>
              </Button>
            </>
          }
        />

        <div className="sticky top-16 z-10 -mx-4 border-y border-white/60 bg-white/60 px-4 py-3 backdrop-blur-2xl md:static md:mx-0 md:rounded-3xl md:border md:bg-white/45 md:shadow-inset">
          <div className="scrollbar-thin overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {days.map((d) => {
                const key = format(d, "yyyy-MM-dd");
                const isActive = key === todayKey;
                return (
                  <Link
                    key={key}
                    href={`/dashboard/agenda?date=${key}` as never}
                    prefetch={false}
                    className={`flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-3 py-2.5 transition-all active:scale-[.98] ${
                      isActive
                        ? "bg-brand-ink text-white shadow-soft"
                        : "bg-white/60 text-foreground hover:bg-white"
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase opacity-75">
                      {format(d, "EEE", { locale: es })}
                    </span>
                    <span className="text-2xl font-semibold tabular-nums leading-none tracking-[-0.05em]">
                      {format(d, "d")}
                    </span>
                    <span className="text-[10px] uppercase opacity-70">
                      {format(d, "MMM", { locale: es })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <SegmentedControl
          activeValue={sp.status ?? ""}
          segments={STATUS_FILTERS.map((s) => ({
            ...s,
            href: s.value
              ? `/dashboard/agenda?date=${todayKey}&status=${s.value}`
              : `/dashboard/agenda?date=${todayKey}`,
          }))}
        />

        <Suspense key={filterKey} fallback={<ListRowsSkeleton count={6} />}>
          <AgendaList
            businessId={session.businessId}
            date={dayStart}
            status={sp.status}
          />
        </Suspense>
      </div>
    </PageTransition>
  );
}
