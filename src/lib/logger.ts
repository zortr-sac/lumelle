/**
 * Structured logging. JSON to stdout for prod ingestion; pretty in dev.
 *
 * Usage:
 *   logger.info("appointment.created", { appointmentId, businessId });
 *   logger.error("booking.failed", { reason, ip });
 *
 * Conventions:
 * - event names: `domain.action` (snake_case domain, past-tense action when possible)
 * - never log PII verbatim (phone, email full) — log hashed prefix or count
 * - business_id in every log for tenant attribution
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function emit(
  level: LogLevel,
  event: string,
  context: Record<string, unknown>,
) {
  if (!shouldLog(level)) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...context,
  };

  // In dev, pretty-print so devs can read; in prod, single-line JSON for ingestion.
  if (process.env.NODE_ENV === "production") {
    console[level === "debug" ? "log" : level](JSON.stringify(payload));
  } else {
    const tag = `[${level.toUpperCase()}]`.padEnd(7);
    console[level === "debug" ? "log" : level](
      `${tag} ${event}`,
      Object.keys(context).length ? context : "",
    );
  }
}

export const logger = {
  debug: (event: string, ctx: Record<string, unknown> = {}) =>
    emit("debug", event, ctx),
  info: (event: string, ctx: Record<string, unknown> = {}) =>
    emit("info", event, ctx),
  warn: (event: string, ctx: Record<string, unknown> = {}) =>
    emit("warn", event, ctx),
  error: (event: string, ctx: Record<string, unknown> = {}) =>
    emit("error", event, ctx),
};

/**
 * Mask PII for logs. Returns a 4-char prefix + length, e.g. "+519... (len=12)".
 */
export function maskPii(value: string | null | undefined): string {
  if (!value) return "<empty>";
  const len = value.length;
  return `${value.slice(0, 4)}...(len=${len})`;
}
