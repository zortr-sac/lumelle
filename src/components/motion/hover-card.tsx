"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLMotionProps<"div"> & {
  children: ReactNode;
  intensity?: "subtle" | "medium" | "strong";
};

const intensities = {
  subtle: { y: -2, scale: 1.005 },
  medium: { y: -4, scale: 1.01 },
  strong: { y: -8, scale: 1.02 },
};

export function HoverCard({
  children,
  className,
  intensity = "medium",
  ...rest
}: Props) {
  return (
    <motion.div
      className={cn("transform-gpu will-change-transform", className)}
      whileHover={intensities[intensity]}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
