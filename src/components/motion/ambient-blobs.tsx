"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

/**
 * Subtle Lumelle background plane. It keeps a soft iOS-like material feel
 * without decorative blobs competing with product UI.
 */
export function AmbientBlobs({
  variant = "hero",
}: {
  variant?: "hero" | "soft" | "auth";
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 45, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 24 });

  const x = useTransform(springX, [-1, 1], [-10, 10]);
  const y = useTransform(springY, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    function handler(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) / cx);
      mouseY.set((e.clientY - cy) / cy);
    }
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        style={{ x, y }}
        className={`absolute inset-x-0 top-0 h-[48rem] ${
          variant === "auth" ? "opacity-100" : "opacity-95"
        }`}
      >
        <div className="absolute inset-0 bg-grad-hero" />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(143,63,252,.16),transparent_34%),linear-gradient(148deg,rgba(255,79,163,.18),transparent_42%),linear-gradient(245deg,rgba(255,214,107,.34),transparent_50%),linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.58))]" />
      </motion.div>
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
