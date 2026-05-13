import { formatDistanceToNow, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

export const DEFAULT_TZ = "America/Lima";

export function formatDate(
  date: Date | string,
  fmt: string = "PPP",
  tz: string = DEFAULT_TZ,
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, tz, fmt, { locale: es });
}

export function formatTime(
  date: Date | string,
  tz: string = DEFAULT_TZ,
): string {
  return formatDate(date, "HH:mm", tz);
}

export function formatDateTime(
  date: Date | string,
  tz: string = DEFAULT_TZ,
): string {
  return formatDate(date, "PPP 'a las' HH:mm", tz);
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function toLocalDate(
  date: Date | string,
  tz: string = DEFAULT_TZ,
): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(d, tz);
}

export function dayName(dayOfWeek: number): string {
  const names = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return names[dayOfWeek] ?? "";
}

export function dayNameShort(dayOfWeek: number): string {
  const names = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return names[dayOfWeek] ?? "";
}
