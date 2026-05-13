import { addMinutes, isBefore, isEqual, isSameDay, parseISO } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type BusinessHour = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
};

export type ExistingAppointment = {
  startsAt: string;
  endsAt: string;
};

export type SlotComputationInput = {
  date: Date;
  serviceDurationMinutes: number;
  bufferMinutes?: number;
  businessHours: BusinessHour[];
  staffHours?: BusinessHour[] | null;
  existingAppointments: ExistingAppointment[];
  timezone: string;
  slotIntervalMinutes?: number;
  now?: Date;
  minLeadMinutes?: number;
};

export type AvailableSlot = {
  startsAt: string;
  endsAt: string;
};

const DEFAULT_INTERVAL = 15;

/**
 * Computes available appointment slots for a given date in the business timezone.
 *
 * Algorithm:
 *  1. Determine effective business hours for the day (staff hours override).
 *  2. Walk every interval (default 15 min) from open to close.
 *  3. Skip slot if it would end after closing time.
 *  4. Skip slot if it overlaps any existing appointment (with buffer).
 *  5. Skip slot if start is in the past (with optional lead time).
 */
export function computeAvailableSlots(
  input: SlotComputationInput,
): AvailableSlot[] {
  const {
    date,
    serviceDurationMinutes,
    bufferMinutes = 0,
    businessHours,
    staffHours,
    existingAppointments,
    timezone,
    slotIntervalMinutes = DEFAULT_INTERVAL,
    now = new Date(),
    minLeadMinutes = 30,
  } = input;

  const localDate = toZonedTime(date, timezone);
  const dayOfWeek = localDate.getDay();

  const sourceHours = staffHours?.length ? staffHours : businessHours;
  const dayHours = sourceHours.filter(
    (h) => h.dayOfWeek === dayOfWeek && !h.isClosed,
  );
  if (dayHours.length === 0) return [];

  const minStart = addMinutes(now, minLeadMinutes);

  const slots: AvailableSlot[] = [];

  for (const block of dayHours) {
    const openLocal = composeLocalDate(localDate, block.opensAt);
    const closeLocal = composeLocalDate(localDate, block.closesAt);

    let cursor = fromZonedTime(openLocal, timezone);
    const closeUtc = fromZonedTime(closeLocal, timezone);

    while (true) {
      const slotStart = cursor;
      const slotEnd = addMinutes(slotStart, serviceDurationMinutes);

      if (isAfterOrEqual(slotEnd, closeUtc) && !isEqual(slotEnd, closeUtc))
        break;
      if (isBefore(closeUtc, slotEnd)) break;

      if (isBefore(slotStart, minStart)) {
        cursor = addMinutes(cursor, slotIntervalMinutes);
        if (!isBefore(cursor, closeUtc)) break;
        continue;
      }

      const overlaps = existingAppointments.some((appt) => {
        const apptStart = parseISO(appt.startsAt);
        const apptEnd = addMinutes(parseISO(appt.endsAt), bufferMinutes);
        return overlapsRange(slotStart, slotEnd, apptStart, apptEnd);
      });

      if (!overlaps) {
        slots.push({
          startsAt: slotStart.toISOString(),
          endsAt: slotEnd.toISOString(),
        });
      }

      cursor = addMinutes(cursor, slotIntervalMinutes);
      if (!isBefore(cursor, closeUtc)) break;
    }
  }

  return slots;
}

function composeLocalDate(localDate: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const result = new Date(localDate);
  result.setHours(h ?? 0, m ?? 0, 0, 0);
  return result;
}

function isAfterOrEqual(a: Date, b: Date): boolean {
  return !isBefore(a, b);
}

function overlapsRange(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return isBefore(aStart, bEnd) && isBefore(bStart, aEnd);
}

export function groupSlotsByPeriod(slots: AvailableSlot[], timezone: string) {
  const groups: Record<"manana" | "tarde" | "noche", AvailableSlot[]> = {
    manana: [],
    tarde: [],
    noche: [],
  };

  for (const slot of slots) {
    const local = toZonedTime(parseISO(slot.startsAt), timezone);
    const hour = local.getHours();
    if (hour < 12) groups.manana.push(slot);
    else if (hour < 18) groups.tarde.push(slot);
    else groups.noche.push(slot);
  }

  return groups;
}

export function hasAvailability(
  date: Date,
  input: Omit<SlotComputationInput, "date">,
): boolean {
  return computeAvailableSlots({ ...input, date }).length > 0;
}

export { isSameDay };
