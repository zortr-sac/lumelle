/**
 * Security headers applied at edge via middleware.
 * Mitigates OWASP Top 10 (XSS, clickjacking, MIME sniffing, referrer leak).
 *
 * IMPORTANT: CSP is set to permit Supabase + Vercel + WhatsApp wa.me + Instagram.
 * Tighten further when you self-host more assets.
 */

type Headers = Record<string, string>;

const SUPABASE_HOSTS = ["*.supabase.co", "*.supabase.in"];
const ALLOWED_IMG_HOSTS = [
  "data:",
  "blob:",
  ...SUPABASE_HOSTS.map((h) => `https://${h}`),
  "https://images.unsplash.com",
];

export function buildSecurityHeaders(): Headers {
  const isProd = process.env.NODE_ENV === "production";

  const cspDirectives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://wa.me",
    "frame-ancestors 'none'",
    // Next.js needs inline scripts for hydration; nonce can be added later
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `img-src 'self' ${ALLOWED_IMG_HOSTS.join(" ")}`,
    `connect-src 'self' ${SUPABASE_HOSTS.map((h) => `https://${h} wss://${h}`).join(" ")} https://*.vercel-insights.com`,
    "media-src 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  // upgrade-insecure-requests breaks http://localhost during dev; only emit in prod.
  if (isProd) cspDirectives.push("upgrade-insecure-requests");

  const csp = cspDirectives.join("; ");

  return {
    "Content-Security-Policy": csp,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
    "X-DNS-Prefetch-Control": "on",
  };
}

export function applySecurityHeaders(
  response: Response | { headers: { set: (k: string, v: string) => void } },
) {
  const headers = buildSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    if (
      "headers" in response &&
      response.headers &&
      "set" in response.headers
    ) {
      response.headers.set(key, value);
    }
  }
  return response;
}
