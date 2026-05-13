/**
 * Idempotency utility — Stripe-style.
 *
 * Client sends header `Idempotency-Key: <uuid>`. Server caches the (status, body)
 * for TTL_MS. Same key + same payload hash → return cached response. Same key +
 * different payload → 422 (key reuse detected).
 *
 * In-memory implementation (process-local). Replace with Upstash/Redis for
 * production multi-instance deploys; keep the same public signature.
 */

import { createHash } from "node:crypto";
import { IDEMPOTENCY } from "@/lib/constants";

type Entry = {
  status: number;
  body: unknown;
  hash: string;
  expiresAt: number;
};

const store = new Map<string, Entry>();

function bodyHash(body: unknown): string {
  return createHash("sha256")
    .update(typeof body === "string" ? body : JSON.stringify(body ?? ""))
    .digest("hex");
}

export type IdempotencyResult =
  | { type: "miss" }
  | { type: "hit"; status: number; body: unknown }
  | { type: "conflict" };

export function checkIdempotency(
  key: string,
  body: unknown,
): IdempotencyResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expiresAt < now) {
    if (entry) store.delete(key);
    return { type: "miss" };
  }

  if (entry.hash !== bodyHash(body)) {
    return { type: "conflict" };
  }

  return { type: "hit", status: entry.status, body: entry.body };
}

export function saveIdempotency(
  key: string,
  body: unknown,
  status: number,
  responseBody: unknown,
): void {
  store.set(key, {
    status,
    body: responseBody,
    hash: bodyHash(body),
    expiresAt: Date.now() + IDEMPOTENCY.TTL_MS,
  });

  // Best-effort cleanup of stale entries when the store grows
  if (store.size > 1000) {
    const now = Date.now();
    for (const [k, v] of store) {
      if (v.expiresAt < now) store.delete(k);
    }
  }
}

/**
 * Wraps a handler with idempotency. The handler must return `{ status, body }`.
 */
export async function withIdempotency<T>(
  request: Request,
  body: unknown,
  handler: () => Promise<{ status: number; body: T }>,
): Promise<{ status: number; body: T | { error: string } }> {
  const key = request.headers.get(IDEMPOTENCY.HEADER);

  if (!key) {
    return handler() as Promise<{ status: number; body: T }>;
  }

  const check = checkIdempotency(key, body);

  if (check.type === "hit") {
    return { status: check.status, body: check.body as T };
  }

  if (check.type === "conflict") {
    return {
      status: 422,
      body: { error: "Idempotency-Key reused with different payload" },
    };
  }

  const result = await handler();
  saveIdempotency(key, body, result.status, result.body);
  return result;
}
