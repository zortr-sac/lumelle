import { CardGridSkeleton } from "@/app/(app)/dashboard/_components/skeletons";

export default function ServiciosLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-muted/40" />
      <CardGridSkeleton count={9} />
    </div>
  );
}
