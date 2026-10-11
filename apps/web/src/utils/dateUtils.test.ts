import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calendarDaysUntil,
  formatLocalDate,
  formatLocalDateTime,
  getDaysUntil,
  getTodayDateString,
  parseLocalDateTime,
} from "./dateUtils";

/** What each zone pinned in vitest.config.ts looks like, so the pin is proven, not assumed. */
const ZONES: Record<
  string,
  { january: number; july: number; mar8Hours: number; nov1Hours: number }
> = {
  "America/Toronto": { january: 300, july: 240, mar8Hours: 23, nov1Hours: 25 },
  "Asia/Kolkata": { january: -330, july: -330, mar8Hours: 24, nov1Hours: 24 },
};
const zone = ZONES[process.env.TZ ?? ""];

const hoursInLocalDay = (year: number, monthIndex: number, day: number) =>
  (new Date(year, monthIndex, day + 1).getTime() - new Date(year, monthIndex, day).getTime()) /
  3_600_000;

describe("test zone", () => {
  it("is one of the zones vitest.config.ts pins", () => {
    expect(Object.keys(ZONES)).toContain(process.env.TZ);
  });

  it("is in effect for Date", () => {
    expect(new Date(2026, 0, 15).getTimezoneOffset()).toBe(zone.january);
    expect(new Date(2026, 6, 15).getTimezoneOffset()).toBe(zone.july);
  });

  it("has the 2026 DST switches on Mar 8 and Nov 1 in Toronto, and none in Kolkata", () => {
    expect(hoursInLocalDay(2026, 2, 8)).toBe(zone.mar8Hours);
    expect(hoursInLocalDay(2026, 10, 1)).toBe(zone.nov1Hours);
  });
});

describe("parseLocalDateTime", () => {
  it("reads the date and time on the local clock", () => {
    const date = parseLocalDateTime("2026-10-15", "14:30");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 15]);
    expect([date.getHours(), date.getMinutes()]).toEqual([14, 30]);
  });

  it("keeps the stored day at midnight (not UTC midnight)", () => {
    expect(parseLocalDateTime("2026-10-15", "00:00").getDate()).toBe(15);
  });

  it("defaults to 23:59", () => {
    const date = parseLocalDateTime("2026-10-15");
    expect([date.getHours(), date.getMinutes()]).toEqual([23, 59]);
  });

  it("accepts an unpadded time", () => {
    const date = parseLocalDateTime("2026-10-15", "9:05");
    expect([date.getHours(), date.getMinutes()]).toEqual([9, 5]);
  });
});

describe("formatLocalDate", () => {
  it("shows a dash when there is no date", () => {
    expect(formatLocalDate(null)).toBe("-");
  });

  it("formats the stored day, not the UTC day", () => {
    const formatted = formatLocalDate("2026-10-15");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2026");
    expect(formatted).not.toContain("14");
  });
});

describe("formatLocalDateTime", () => {
  it("formats the stored moment on the local clock, 23:59 by default", () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    expect(formatLocalDateTime("2026-10-15", "14:30")).toBe(
      new Date(2026, 9, 15, 14, 30).toLocaleString(undefined, options),
    );
    expect(formatLocalDateTime("2026-10-15")).toBe(
      new Date(2026, 9, 15, 23, 59).toLocaleString(undefined, options),
    );
  });
});

describe("clock-dependent helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getTodayDateString", () => {
    // Each zone has one of these two moments on a different UTC day.
    it("is the local date just before midnight", () => {
      vi.setSystemTime(new Date(2026, 9, 11, 23, 30));
      expect(getTodayDateString()).toBe("2026-10-11");
    });

    it("is the local date just after midnight", () => {
      vi.setSystemTime(new Date(2026, 9, 11, 0, 30));
      expect(getTodayDateString()).toBe("2026-10-11");
    });

    it("pads the month and day", () => {
      vi.setSystemTime(new Date(2026, 0, 5, 12, 0));
      expect(getTodayDateString()).toBe("2026-01-05");
    });
  });

  describe("getDaysUntil", () => {
    it("reads 'now' from the clock by default", () => {
      vi.setSystemTime(new Date(2026, 9, 11, 12, 0));
      expect(getDaysUntil("2026-10-14", "09:00")).toBe(3);
    });

    it("uses the 23:59 default time", () => {
      vi.setSystemTime(new Date(2026, 9, 11, 23, 58));
      expect(getDaysUntil("2026-10-11")).toBe(0);
      vi.setSystemTime(new Date(2026, 9, 11, 23, 59, 30));
      expect(getDaysUntil("2026-10-11")).toBe(-1);
    });
  });
});

describe("calendarDaysUntil", () => {
  const at = (day: number, hours: number, minutes = 0) => new Date(2026, 9, day, hours, minutes);

  it("is 0 for later today", () => {
    expect(calendarDaysUntil(at(11, 23, 59), at(11, 9))).toBe(0);
  });

  it("is 1 for tomorrow at any hour", () => {
    expect(calendarDaysUntil(at(12, 0, 30), at(11, 23))).toBe(1);
    expect(calendarDaysUntil(at(12, 23, 59), at(11, 0, 10))).toBe(1);
  });

  it("counts calendar days, not 24-hour periods", () => {
    expect(calendarDaysUntil(at(14, 9), at(11, 22))).toBe(3);
  });

  it("is -1 once the due moment has passed earlier today", () => {
    expect(calendarDaysUntil(at(11, 9), at(11, 10))).toBe(-1);
  });

  it("counts back for past days", () => {
    expect(calendarDaysUntil(at(10, 23), at(11, 9))).toBe(-1);
    expect(calendarDaysUntil(at(8, 12), at(11, 9))).toBe(-3);
  });

  describe("across the 2026 DST switches", () => {
    it("counts the 23-hour day in March as one day", () => {
      expect(calendarDaysUntil(new Date(2026, 2, 9, 0, 30), new Date(2026, 2, 7, 23))).toBe(2);
      expect(calendarDaysUntil(new Date(2026, 2, 8, 23, 59), new Date(2026, 2, 7, 12))).toBe(1);
    });

    it("counts the 25-hour day in November as one day", () => {
      expect(calendarDaysUntil(new Date(2026, 10, 2, 0, 30), new Date(2026, 9, 31, 23))).toBe(2);
      expect(calendarDaysUntil(new Date(2026, 10, 1, 23, 59), new Date(2026, 9, 31, 12))).toBe(1);
    });

    it("counts a week that spans the switch as seven days", () => {
      expect(getDaysUntil("2026-03-12", "09:00", new Date(2026, 2, 5, 9))).toBe(7);
      expect(getDaysUntil("2026-11-05", "09:00", new Date(2026, 9, 29, 9))).toBe(7);
    });
  });
});
