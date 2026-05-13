import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-muted/40 ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="p-5">
            <Shimmer className="size-10 rounded-2xl" />
            <Shimmer className="mt-3 h-3 w-20" />
            <Shimmer className="mt-2 h-8 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AppointmentsSkeleton() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <Shimmer className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl bg-white/60 p-3"
          >
            <Shimmer className="size-12 shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-40" />
              <Shimmer className="h-3 w-28" />
            </div>
            <Shimmer className="h-6 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PendingSkeleton() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <Shimmer className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/40 p-3"
          >
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-44" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="space-y-3 p-5">
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="h-3 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Shimmer className="h-8 w-20" />
              <Shimmer className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ListRowsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="flex items-center gap-3 p-3">
            <Shimmer className="size-3 rounded-full" />
            <Shimmer className="size-12" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-40" />
              <Shimmer className="h-3 w-28" />
            </div>
            <Shimmer className="h-6 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
