import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        className,
      )}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2.4s ease-in-out infinite",
      }}
      {...props}
    />
  );
}

export { Skeleton };
