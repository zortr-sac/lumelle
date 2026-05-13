import Link from "next/link";
import { cn } from "@/lib/utils";

type Segment = {
  label: string;
  value: string;
  href: string;
};

export function SegmentedControl({
  segments,
  activeValue,
  className,
}: {
  segments: Segment[];
  activeValue: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "scrollbar-thin inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/70 bg-white/60 p-1 shadow-inset backdrop-blur-xl",
        className,
      )}
    >
      {segments.map((segment) => {
        const active = activeValue === segment.value;
        return (
          <Link
            key={segment.value}
            href={segment.href as never}
            prefetch={false}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground",
              active && "bg-brand-ink text-white shadow-soft hover:text-white",
            )}
          >
            {segment.label}
          </Link>
        );
      })}
    </div>
  );
}
