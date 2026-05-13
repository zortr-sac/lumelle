import * as React from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant = "plain" | "glass" | "elevated" | "inset";

const variants: Record<SurfaceVariant, string> = {
  plain: "surface-plain",
  glass: "glass-card",
  elevated: "glass-card-strong",
  inset: "surface-inset",
};

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = "glass", ...props }, ref) => (
    <div ref={ref} className={cn(variants[variant], className)} {...props} />
  ),
);
Surface.displayName = "Surface";

export { Surface };
