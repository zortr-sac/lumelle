type LimitOptions = {
  windowMs: number;
  max: number;
};

type LimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Local in-memory rate limiter (dev fallback). In production, swap for
 * @upstash/ratelimit + @upstash/redis. Keep the public signature stable.
 */
export async function rateLimit(
  key: string,
  options: LimitOptions,
): Promise<LimitResult> {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + options.windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: options.max - 1, resetAt };
  }

  if (existing.count >= options.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  memoryBuckets.set(key, existing);
  return {
    ok: true,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  };
}

export const RATE_LIMITS = {
  publicBooking: { windowMs: 60_000, max: 5 },
  publicSlots: { windowMs: 60_000, max: 30 },
  authAttempt: { windowMs: 60_000, max: 10 },
  invitationAccept: { windowMs: 60_000, max: 5 },
} as const;

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
