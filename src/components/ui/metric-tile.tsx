import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricTile({
  icon,
  label,
  value,
  href,
  tone = "default",
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  href?: string;
  tone?: "default" | "attention" | "success";
}) {
  const className = cn(
    "group block rounded-2xl border border-white/70 bg-white/72 p-4 shadow-soft backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-glass",
    tone === "attention" && "ring-1 ring-amber-300/80",
    tone === "success" && "ring-1 ring-emerald-200/80",
  );

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-grad-accent text-brand-plum shadow-inset">
          {icon}
        </div>
        {href && (
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.04em]">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href as never} prefetch className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
