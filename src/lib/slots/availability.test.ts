import { describe, expect, it } from "vitest";
import { computeAvailableSlots, hasAvailability } from "./availability";

const businessHours = [
  { dayOfWeek: 1, opensAt: "09:00", closesAt: "18:00", isClosed: false },
  { dayOfWeek: 2, opensAt: "09:00", closesAt: "18:00", isClosed: false },
  { dayOfWeek: 3, opensAt: "09:00", closesAt: "13:00", isClosed: false },
  { dayOfWeek: 3, opensAt: "15:00", closesAt: "20:00", isClosed: false },
  { dayOfWeek: 0, opensAt: "00:00", closesAt: "00:00", isClosed: true },
];

const TZ = "America/Lima";

describe("computeAvailableSlots", () => {
  it("returns no slots when business is closed that day", () => {
    const date = new Date("2026-05-10T12:00:00Z");
    const slots = computeAvailableSlots({
      date,
      serviceDurationMinutes: 60,
      businessHours,
      existingAppointments: [],
      timezone: TZ,
      now: new Date("2026-05-09T00:00:00Z"),
    });
    expect(slots.length).toBe(0);
  });

  it("returns multiple slots for an open day with no appointments", () => {
    const date = new Date("2026-05-11T12:00:00Z");
    const slots = computeAvailableSlots({
      date,
      serviceDurationMinutes: 60,
      businessHours,
      existingAppointments: [],
      timezone: TZ,
      now: new Date("2026-05-10T00:00:00Z"),
    });
    expect(slots.length).toBeGreaterThan(0);
  });

  it("excludes slots overlapping existing appointments", () => {
    const date = new Date("2026-05-11T12:00:00Z");
    const slots = computeAvailableSlots({
      date,
      serviceDurationMinutes: 60,
      businessHours,
      existingAppointments: [
        {
          startsAt: "2026-05-11T15:00:00.000Z",
          endsAt: "2026-05-11T16:00:00.000Z",
        },
      ],
      timezone: TZ,
      now: new Date("2026-05-10T00:00:00Z"),
    });
    const overlapping = slots.find(
      (s) =>
        s.startsAt === "2026-05-11T15:00:00.000Z" ||
        s.startsAt === "2026-05-11T15:30:00.000Z",
    );
    expect(overlapping).toBeUndefined();
  });

  it("respects buffer between appointments", () => {
    const date = new Date("2026-05-11T12:00:00Z");
    const slots = computeAvailableSlots({
      date,
      serviceDurationMinutes: 30,
      bufferMinutes: 15,
      businessHours,
      existingAppointments: [
        {
          startsAt: "2026-05-11T15:00:00.000Z",
          endsAt: "2026-05-11T15:30:00.000Z",
        },
      ],
      timezone: TZ,
      now: new Date("2026-05-10T00:00:00Z"),
    });
    const tooClose = slots.find(
      (s) => s.startsAt === "2026-05-11T15:30:00.000Z",
    );
    expect(tooClose).toBeUndefined();
  });

  it("excludes past slots respecting min lead time", () => {
    const date = new Date("2026-05-11T18:00:00Z");
    const now = new Date("2026-05-11T17:00:00Z");
    const slots = computeAvailableSlots({
      date,
      serviceDurationMinutes: 60,
      businessHours,
      existingAppointments: [],
      timezone: TZ,
      now,
      minLeadMinutes: 30,
    });
    for (const slot of slots) {
      expect(new Date(slot.startsAt).getTime()).toBeGreaterThanOrEqual(
        now.getTime() + 30 * 60_000,
      );
    }
  });

  it("handles split day with lunch break", () => {
    const date = new Date("2026-05-13T12:00:00Z");
    const slots = computeAvailableSlots({
      date,
      serviceDurationMinutes: 60,
      businessHours,
      existingAppointments: [],
      timezone: TZ,
      now: new Date("2026-05-12T00:00:00Z"),
    });
    expect(slots.length).toBeGreaterThan(0);
  });

  it("hasAvailability returns false for closed days", () => {
    const closedSunday = new Date("2026-05-10T12:00:00Z");
    expect(
      hasAvailability(closedSunday, {
        serviceDurationMinutes: 60,
        businessHours,
        existingAppointments: [],
        timezone: TZ,
        now: new Date("2026-05-09T00:00:00Z"),
      }),
    ).toBe(false);
  });
});
