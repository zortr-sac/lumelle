import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Brotli > gzip; Next handles this on Vercel automatically. Toggle on for self-host.
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },

  // typedRoutes disabled — incompatible with Turbopack in Next 15.1. ESLint's
  // no-html-link-for-pages still guards Link usage in our code.
  experimental: {
    // Tree-shake known-heavy libraries by allowing per-symbol imports.
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "framer-motion",
      "recharts",
      "@tanstack/react-query",
    ],
  },

  // Static assets get max-age in production; in dev Turbopack reuses chunk names
  // when their content changes via HMR, so a long immutable cache pins a stale
  // chunk and breaks hydration. Dev mode disables the cache override.
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
