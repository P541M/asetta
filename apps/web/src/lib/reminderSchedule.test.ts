import { describe, expect, it } from "vitest";
import { makeAssessment } from "@/test/assessments";
import type { Assessment } from "@/types/assessment";
import { claimDecision } from "./reminderCron";
import {
  DEFAULT_TIME_ZONE,
  dueReminders,
  nextReminderRun,
  reminderRecordId,
  resolveTimeZone,
  type ReminderAssessment,
  type ReminderSettings,
} from "./reminderSchedule";

// These functions take the user's zone as a parameter, so "now" is an absolute instant built with
// Date.UTC: the same moment whichever zone the suite runs in. The comments give the local time.
const utc = (month: number, day: number, hours: number, minutes = 0, year = 2026) =>
  new Date(Date.UTC(year, month - 1, day, hours, minutes));

const assessment = (overrides: Partial<Assessment> = {}): ReminderAssessment => ({
  ...makeAssessment(overrides),
  id: overrides.id ?? "a1",
});

const run = (
  timeZone: string,
  now: Date,
  assessments: ReminderAssessment[],
  settings: Partial<ReminderSettings> = {},
) =>
  dueReminders({
    assessments,
    settings: { daysBefore: 3, notifySubmitted: true, ...settings },
    timeZone,
    now,
  });

const ids = (reminders: { assessmentId: string }[]) => reminders.map((r) => r.assessmentId);

describe("dueReminders", () => {
  describe("9:30 on the target day, in the user's zone", () => {
    it("A8: sends N days before the due date, from 9:30 in Toronto", () => {
      // Oct 12, 09:35 EDT
      expect(run("America/Toronto", utc(10, 12, 13, 35), [assessment()])).toEqual([
        {
          assessmentId: "a1",
          targetDay: "2026-10-12",
          daysUntilDue: 3,
          dueDate: "2026-10-15",
          dueTime: "23:59",
        },
      ]);
    });

    it("A8: sends nothing on the target day before 9:30", () => {
      // Oct 12, 09:25 EDT
      expect(run("America/Toronto", utc(10, 12, 13, 25), [assessment()])).toEqual([]);
    });

    it("A8: sends nothing before the target day, even under N+1 days from the due moment", () => {
      // Oct 11, 10:00 EDT; due Oct 15 at 08:00, so the reminder belongs to Oct 12
      expect(run("America/Toronto", utc(10, 11, 14), [assessment({ dueTime: "08:00" })])).toEqual(
        [],
      );
    });

    it("A8: uses the user's zone east of UTC (Auckland, UTC+13 in October)", () => {
      // Oct 12, 09:35 NZDT is Oct 11 in UTC
      expect(run("Pacific/Auckland", utc(10, 11, 20, 35), [assessment()])).toEqual([
        expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 3 }),
      ]);
    });

    it("A8: uses a half-hour zone (Kolkata, UTC+5:30), from 9:30 exactly", () => {
      // Oct 12, 09:30 IST
      expect(run("Asia/Kolkata", utc(10, 12, 4), [assessment()])).toEqual([
        expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 3 }),
      ]);
    });

    it("A8: sends nothing in Kolkata at 09:29", () => {
      expect(run("Asia/Kolkata", utc(10, 12, 3, 59), [assessment({ dueTime: "20:00" })])).toEqual(
        [],
      );
    });

    it("A8: uses UTC as a zone", () => {
      // Oct 12, 09:30 UTC; due Oct 15 at 09:00 UTC
      expect(run("UTC", utc(10, 12, 9, 30), [assessment({ dueTime: "09:00" })])).toEqual([
        expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 3 }),
      ]);
    });
  });

  describe("day count", () => {
    it("A8: counts calendar days, not 24-hour blocks: due at 08:00 three days out is 3", () => {
      // Oct 12, 09:35 EDT; due Oct 15 at 08:00 (under 71 hours away)
      expect(
        run("America/Toronto", utc(10, 12, 13, 35), [assessment({ dueTime: "08:00" })]),
      ).toEqual([expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 3 })]);
    });

    it("A8: never says 'due in 0 days' for an assessment due tomorrow", () => {
      // Oct 12, 17:00 EDT; due Oct 13 at 05:00, 12 hours away
      expect(
        run(
          "America/Toronto",
          utc(10, 12, 21),
          [assessment({ dueDate: "2026-10-13", dueTime: "05:00" })],
          {
            daysBefore: 1,
          },
        ),
      ).toEqual([expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 1 })]);
    });
  });

  describe("stored times", () => {
    it("A8: accepts an unpadded time and pads it", () => {
      expect(
        run("America/Toronto", utc(10, 12, 13, 35), [assessment({ dueTime: "9:00" })]),
      ).toEqual([expect.objectContaining({ targetDay: "2026-10-12", dueTime: "09:00" })]);
    });

    it("A8: accepts a 12-hour time from before B8", () => {
      expect(
        run("America/Toronto", utc(10, 12, 13, 35), [assessment({ dueTime: "11:59 PM" })]),
      ).toEqual([expect.objectContaining({ dueTime: "23:59" })]);
    });

    it("A8: reads a missing time as 23:59 in the user's zone, not as UTC midnight", () => {
      // Oct 14, 09:35 EDT; due Oct 15 with no time
      expect(
        run("America/Toronto", utc(10, 14, 13, 35), [assessment({ dueTime: "" })], {
          daysBefore: 1,
        }),
      ).toEqual([
        expect.objectContaining({ targetDay: "2026-10-14", daysUntilDue: 1, dueTime: "23:59" }),
      ]);
    });
  });

  describe("which assessments", () => {
    it("A8: skips a Missed assessment", () => {
      expect(
        run("America/Toronto", utc(10, 12, 13, 35), [assessment({ status: "Missed" })]),
      ).toEqual([]);
    });

    it("skips an assessment whose due date needs review (B8)", () => {
      expect(
        run("America/Toronto", utc(10, 12, 13, 35), [assessment({ needsReview: true })]),
      ).toEqual([]);
    });

    it("skips a Submitted assessment when the user opted out, and keeps it otherwise", () => {
      const submitted = [assessment({ status: "Submitted" })];
      const now = utc(10, 12, 13, 35);
      expect(run("America/Toronto", now, submitted, { notifySubmitted: false })).toEqual([]);
      expect(ids(run("America/Toronto", now, submitted, { notifySubmitted: true }))).toEqual([
        "a1",
      ]);
    });

    it("skips an assessment that is already due", () => {
      // Oct 16, 09:35 EDT
      expect(run("America/Toronto", utc(10, 16, 13, 35), [assessment()])).toEqual([]);
    });

    it("skips an assessment whose reminder day is still ahead", () => {
      expect(
        run("America/Toronto", utc(10, 12, 13, 35), [assessment({ dueDate: "2026-10-20" })]),
      ).toEqual([]);
    });

    it.each([["2026-15-03"], ["Sept 30, 2026"], ["TBA"], [""]])(
      "skips a stored date that isn't YYYY-MM-DD: %j",
      (dueDate) => {
        expect(run("America/Toronto", utc(10, 12, 13, 35), [assessment({ dueDate })])).toEqual([]);
      },
    );
  });

  describe("DST (2026)", () => {
    it("A8: Mar 8, spring forward in Toronto: nothing at 09:29 EDT", () => {
      expect(
        run("America/Toronto", utc(3, 8, 13, 29), [assessment({ dueDate: "2026-03-11" })]),
      ).toEqual([]);
    });

    it("A8: Mar 8, spring forward in Toronto: sends at 09:30 EDT", () => {
      expect(
        run("America/Toronto", utc(3, 8, 13, 30), [assessment({ dueDate: "2026-03-11" })]),
      ).toEqual([expect.objectContaining({ targetDay: "2026-03-08", daysUntilDue: 3 })]);
    });

    it("A8: Nov 1, fall back in Toronto: nothing at 08:35 EST", () => {
      expect(
        run("America/Toronto", utc(11, 1, 13, 35), [assessment({ dueDate: "2026-11-04" })]),
      ).toEqual([]);
    });

    it("A8: Nov 1, fall back in Toronto: sends at 09:35 EST", () => {
      expect(
        run("America/Toronto", utc(11, 1, 14, 35), [assessment({ dueDate: "2026-11-04" })]),
      ).toEqual([expect.objectContaining({ targetDay: "2026-11-01", daysUntilDue: 3 })]);
    });
  });

  describe("late runs", () => {
    it("A8: a run later the same day still sends the day's reminder", () => {
      // Oct 12, 18:00 EDT: every slot since 09:30 was missed
      expect(run("America/Toronto", utc(10, 12, 22), [assessment()])).toEqual([
        expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 3 }),
      ]);
    });

    it("A8: a run the next morning catches up yesterday's reminder", () => {
      // Oct 13, 02:00 EDT
      expect(run("America/Toronto", utc(10, 13, 6), [assessment()])).toEqual([
        expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 2 }),
      ]);
    });
  });

  describe("A38: a failed send", () => {
    it("A38: keeps its record ID the next day, after the day count has changed", () => {
      const first = run("America/Toronto", utc(10, 12, 13, 35), [assessment()]);
      const next = run("America/Toronto", utc(10, 13, 13, 35), [assessment()]);
      expect(next).toHaveLength(1);
      expect(next[0].daysUntilDue).toBe(2);
      expect(reminderRecordId("u1", next[0])).toBe(reminderRecordId("u1", first[0]));
    });

    it("A38: goes out in the next run after the day count has changed", () => {
      // Run 1 (Oct 12, 09:35 EDT) claims the reminder, and the send fails.
      const firstRun = utc(10, 12, 13, 35);
      const [first] = run("America/Toronto", firstRun, [assessment()]);
      expect(claimDecision(undefined, firstRun)).toEqual({ claim: true, attempt: 1 });
      const failed = { status: "failed", attempts: 1, lastAttemptAt: firstRun };

      // The next run is the next day (only the daily backstop ran): "due in 2 days" now.
      const nextRun = utc(10, 13, 13, 35);
      const [next] = run("America/Toronto", nextRun, [assessment()]);
      expect(next).toMatchObject({ daysUntilDue: 2 });
      expect(reminderRecordId("u1", next)).toBe(reminderRecordId("u1", first));
      expect(claimDecision(failed, nextRun)).toEqual({ claim: true, attempt: 2 });
    });
  });

  describe("catch-up limit", () => {
    it("sends nothing once the reminder day is more than two days back", () => {
      // Oct 15, 09:35 EDT: the Oct 12 reminder was never sent, and it is still before the due time
      expect(run("America/Toronto", utc(10, 15, 13, 35), [assessment()])).toEqual([]);
    });

    it("still catches up a reminder from two days back", () => {
      // Oct 14, 09:35 EDT
      expect(run("America/Toronto", utc(10, 14, 13, 35), [assessment()])).toEqual([
        expect.objectContaining({ targetDay: "2026-10-12", daysUntilDue: 1 }),
      ]);
    });
  });
});

describe("resolveTimeZone", () => {
  it.each([
    ["America/Toronto"],
    ["Pacific/Auckland"],
    ["Asia/Kolkata"],
    ["Asia/Calcutta"],
    ["UTC"],
  ])("keeps a valid zone: %s", (zone) => {
    expect(resolveTimeZone(zone)).toBe(zone);
  });

  it.each([[undefined], [null], [""], ["Mars/Base"], [42]])(
    "falls back to Toronto for %j (users who haven't signed in since A8)",
    (value) => {
      expect(resolveTimeZone(value)).toBe(DEFAULT_TIME_ZONE);
      expect(DEFAULT_TIME_ZONE).toBe("America/Toronto");
    },
  );
});

describe("nextReminderRun", () => {
  it.each([
    ["Toronto, 09:35 EDT: tomorrow", "America/Toronto", utc(10, 12, 13, 35), utc(10, 13, 13, 30)],
    ["Toronto, 09:00 EDT: today", "America/Toronto", utc(10, 12, 13), utc(10, 12, 13, 30)],
    // The run at 09:30 exactly sends that day's reminders itself
    ["Toronto, 09:30 EDT: tomorrow", "America/Toronto", utc(10, 12, 13, 30), utc(10, 13, 13, 30)],
    ["Auckland, 09:35 NZDT", "Pacific/Auckland", utc(10, 11, 20, 35), utc(10, 12, 20, 30)],
    ["Kolkata, 09:35 IST", "Asia/Kolkata", utc(10, 12, 4, 5), utc(10, 13, 4)],
    ["UTC, 09:35", "UTC", utc(10, 12, 9, 35), utc(10, 13, 9, 30)],
  ])("%s", (_case, zone, now, expected) => {
    expect(nextReminderRun(zone, now)).toEqual(expected);
  });

  it.each([
    [
      "Toronto, Mar 7 EST to Mar 8 EDT (23 hours)",
      "America/Toronto",
      utc(3, 7, 14, 35),
      utc(3, 8, 13, 30),
    ],
    [
      "Toronto, Oct 31 EDT to Nov 1 EST (25 hours)",
      "America/Toronto",
      utc(10, 31, 13, 35),
      utc(11, 1, 14, 30),
    ],
    [
      "Auckland, Sep 26 NZST to Sep 27 NZDT",
      "Pacific/Auckland",
      utc(9, 25, 21, 35),
      utc(9, 26, 20, 30),
    ],
    [
      "Auckland, Apr 4 NZDT to Apr 5 NZST",
      "Pacific/Auckland",
      utc(4, 3, 20, 35),
      utc(4, 4, 21, 30),
    ],
  ])("crosses a 2026 DST switch: %s", (_case, zone, now, expected) => {
    expect(nextReminderRun(zone, now)).toEqual(expected);
  });

  it("comes back sooner while a failed send waits for its retry", () => {
    // 09:35 EDT: 20 minutes, not tomorrow's 09:30
    expect(nextReminderRun("America/Toronto", utc(10, 12, 13, 35), true)).toEqual(
      utc(10, 12, 13, 55),
    );
  });

  it("never waits past the next 9:30 for a retry", () => {
    // 09:20 EDT: today's slot comes before the retry delay is up
    expect(nextReminderRun("America/Toronto", utc(10, 12, 13, 20), true)).toEqual(
      utc(10, 12, 13, 30),
    );
  });

  it("is always after now, so a second call at the same moment finds the user not due", () => {
    for (const zone of ["America/Toronto", "Pacific/Auckland", "Asia/Kolkata", "UTC"]) {
      // Every 15 minutes across both Toronto DST weekends
      for (const start of [utc(3, 7, 0), utc(10, 31, 0)]) {
        for (let step = 0; step < 4 * 72; step++) {
          const now = new Date(start.getTime() + step * 15 * 60 * 1000);
          for (const retryPending of [false, true]) {
            const next = nextReminderRun(zone, now, retryPending).getTime();
            expect(next).toBeGreaterThan(now.getTime());
            expect(next - now.getTime()).toBeLessThanOrEqual(25 * 60 * 60 * 1000);
          }
        }
      }
    }
  });
});
