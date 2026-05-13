/**
 * Centralized constants. Avoid magic numbers scattered through the codebase.
 * Keep names ALL_CAPS_SNAKE_CASE for easy grep.
 */

// Pagination — keep page sizes small enough that p95 latency stays <300ms
export const PAGE_SIZE = {
  CUSTOMERS: 24,
  APPOINTMENTS: 50,
  SERVICES: 60,
  SALES: 30,
  STAFF: 50,
  AUDIT: 25,
} as const;

// React Query stale times (ms) — balance freshness vs network load
export const STALE_TIME = {
  SHORT: 10_000, // dashboard stats, live state
  MEDIUM: 30_000, // catalog, lists
  LONG: 5 * 60_000, // hours, services config
  VERY_LONG: 60 * 60_000, // service templates, immutable
} as const;

// ISR revalidation windows for public pages (seconds)
export const REVALIDATE = {
  PUBLIC_BUSINESS: 60,
  PUBLIC_SERVICES: 60,
} as const;

// Rate limit windows / max
export const RATE_LIMIT = {
  PUBLIC_BOOKING: { windowMs: 60_000, max: 5 },
  PUBLIC_SLOTS: { windowMs: 60_000, max: 30 },
  AUTH_ATTEMPT: { windowMs: 60_000, max: 8 },
  AUTH_SIGNUP: { windowMs: 60 * 60_000, max: 5 },
  INVITATION: { windowMs: 60_000, max: 5 },
  DEFAULT_API: { windowMs: 60_000, max: 60 },
} as const;

// Cache control headers
export const CACHE_CONTROL = {
  PUBLIC_PAGE: "public, s-maxage=60, stale-while-revalidate=300",
  PRIVATE_NOSTORE: "private, no-store, no-cache, must-revalidate",
  IMMUTABLE_ASSET: "public, max-age=31536000, immutable",
} as const;

// Performance budgets
export const PERF_BUDGET = {
  LCP_MS: 2500,
  INP_MS: 200,
  CLS: 0.1,
  TTFB_MS: 600,
} as const;

// Booking and scheduling
export const BOOKING = {
  MIN_LEAD_MINUTES: 30,
  SLOT_INTERVAL_MINUTES: 15,
  DAYS_AHEAD: 14,
  REQUEST_TTL_HOURS: 48,
} as const;

// Idempotency
export const IDEMPOTENCY = {
  TTL_MS: 24 * 60 * 60_000,
  HEADER: "Idempotency-Key",
} as const;

// Slug validation
export const SLUG = {
  MIN: 3,
  MAX: 40,
  REGEX: /^[a-z0-9](?:[a-z0-9-]{1,40}[a-z0-9])?$/,
} as const;

// File upload limits (bytes)
export const UPLOAD = {
  MAX_IMAGE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_MIMES: ["image/jpeg", "image/png", "image/webp"],
} as const;
