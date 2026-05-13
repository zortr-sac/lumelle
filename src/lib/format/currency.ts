const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const PEN_COMPACT = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function fromCents(cents: number | null | undefined): number {
  if (cents == null) return 0;
  return cents / 100;
}

export function toCents(value: number | string): number {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function formatPEN(cents: number | null | undefined): string {
  return PEN_FORMATTER.format(fromCents(cents));
}

export function formatPENCompact(cents: number | null | undefined): string {
  return PEN_COMPACT.format(fromCents(cents));
}
