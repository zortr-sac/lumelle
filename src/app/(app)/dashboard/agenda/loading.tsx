import { ListRowsSkeleton } from "@/app/(app)/dashboard/_components/skeletons";

export default function AgendaLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-muted/40" />
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-20 w-16 animate-pulse rounded-2xl bg-muted/40"
          />
        ))}
      </div>
      <ListRowsSkeleton count={6} />
    </div>
  );
}
