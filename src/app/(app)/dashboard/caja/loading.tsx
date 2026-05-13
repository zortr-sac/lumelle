import { CardGridSkeleton } from "@/app/(app)/dashboard/_components/skeletons";

export default function CajaLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-32 animate-pulse rounded-2xl bg-muted/40" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
      <CardGridSkeleton count={3} />
    </div>
  );
}
