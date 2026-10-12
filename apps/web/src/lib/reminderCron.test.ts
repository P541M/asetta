import { describe, expect, it } from "vitest";
import {
  MAX_SEND_ATTEMPTS,
  RETRY_DELAY_MS,
  SEND_LEASE_MS,
  claimDecision,
  cronRunId,
  isCronAuthorized,
  isRecentLegacySend,
  legacyRecordIds,
} from "./reminderCron";

describe("isCronAuthorized", () => {
  const secret = "local-placeholder-secret";

  it("accepts the exact Bearer header for the configured secret", () => {
    expect(isCronAuthorized(`Bearer ${secret}`, secret)).toBe(true);
  });

  it.each([
    ["no header", undefined],
    ["an empty header", ""],
    ["the wrong secret", "Bearer something-else"],
    ["the secret without the Bearer prefix", secret],
    ["a lowercase scheme", `bearer ${secret}`],
    ["a trailing space", `Bearer ${secret} `],
    ["a prefix of the secret", `Bearer ${secret.slice(0, -1)}`],
  ])("rejects %s", (_case, header) => {
    expect(isCronAuthorized(header, secret)).toBe(false);
  });

  // A3: an unset secret used to accept "Bearer undefined", and an empty one "Bearer ".
  it.each([
    ["unset", undefined],
    ["empty", ""],
  ])("rejects every header when the secret is %s", (_case, unset) => {
    for (const header of [undefined, "", "Bearer", "Bearer ", "Bearer undefined", "Bearer null"]) {
      expect(isCronAuthorized(header, unset)).toBe(false);
    }
  });
});

describe("claimDecision", () => {
  const now = new Date(Date.UTC(2026, 9, 12, 13, 35));
  const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60 * 1000);

  it("claims a reminder that has no record yet, as attempt 1", () => {
    expect(claimDecision(undefined, now)).toEqual({ claim: true, attempt: 1 });
  });

  it('never claims a record with status "sent"', () => {
    expect(
      claimDecision({ status: "sent", attempts: 1, lastAttemptAt: minutesAgo(60) }, now),
    ).toEqual({ claim: false, reason: "sent" });
  });

  // A3: a failed send used to block every later attempt.
  it("retries a failed send once the retry delay is up", () => {
    expect(
      claimDecision(
        { status: "failed", attempts: 1, lastAttemptAt: minutesAgo(RETRY_DELAY_MS / 60000) },
        now,
      ),
    ).toEqual({ claim: true, attempt: 2 });
  });

  it("waits out the retry delay after a failed send, so two runs minutes apart don't both retry", () => {
    expect(
      claimDecision({ status: "failed", attempts: 1, lastAttemptAt: minutesAgo(5) }, now),
    ).toEqual({ claim: false, reason: "waiting" });
  });

  it(`stops after ${MAX_SEND_ATTEMPTS} attempts, so a rejected address isn't retried forever`, () => {
    expect(
      claimDecision(
        { status: "failed", attempts: MAX_SEND_ATTEMPTS, lastAttemptAt: minutesAgo(600) },
        now,
      ),
    ).toEqual({ claim: false, reason: "capped" });
    expect(MAX_SEND_ATTEMPTS).toBe(3);
  });

  it("leaves a send another run has claimed alone while its lease runs", () => {
    expect(
      claimDecision({ status: "sending", attempts: 1, lastAttemptAt: minutesAgo(2) }, now),
    ).toEqual({ claim: false, reason: "sending" });
  });

  it("reports an in-flight last attempt as sending, not capped", () => {
    expect(
      claimDecision(
        { status: "sending", attempts: MAX_SEND_ATTEMPTS, lastAttemptAt: minutesAgo(2) },
        now,
      ),
    ).toEqual({ claim: false, reason: "sending" });
  });

  it("takes over a claim whose run died mid-send once the lease is up, as the next attempt", () => {
    const expired = minutesAgo(SEND_LEASE_MS / 60000);
    expect(claimDecision({ status: "sending", attempts: 1, lastAttemptAt: expired }, now)).toEqual({
      claim: true,
      attempt: 2,
    });
    expect(
      claimDecision(
        { status: "sending", attempts: MAX_SEND_ATTEMPTS, lastAttemptAt: expired },
        now,
      ),
    ).toEqual({ claim: false, reason: "capped" });
  });

  it.each([[{}], [{ status: "Sent" }], [{ status: null }], [{ status: true, attempts: "2" }]])(
    "treats any other record as a failed attempt with no count: %j",
    (record) => {
      expect(claimDecision(record, now)).toEqual({ claim: true, attempt: 1 });
    },
  );
});

describe("legacy records (the cron before A8)", () => {
  const now = new Date(Date.UTC(2026, 9, 12, 13, 35));
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  it("names the record the old cron wrote for the same reminder: the day count", () => {
    expect(legacyRecordIds("u1", "a1", 3)).toEqual(["u1_a1_3"]);
  });

  it("also checks day count 0 when reminders go 1 day before (its 12-36 hour window)", () => {
    expect(legacyRecordIds("u1", "a1", 1)).toEqual(["u1_a1_1", "u1_a1_0"]);
  });

  it("counts a legacy send from the last few days", () => {
    expect(isRecentLegacySend({ status: "sent", sentAt: daysAgo(1) }, now)).toBe(true);
    expect(isRecentLegacySend({ status: "sent", sentAt: daysAgo(3.9) }, now)).toBe(true);
  });

  it("ignores an older legacy send, so a moved due date still gets its reminder", () => {
    expect(isRecentLegacySend({ status: "sent", sentAt: daysAgo(4) }, now)).toBe(false);
  });

  it.each([
    [undefined],
    [{ status: "failed", sentAt: new Date(Date.UTC(2026, 9, 11)) }],
    [{ status: "sent" }],
    [{ status: "sent", sentAt: null }],
  ])("ignores %j", (record) => {
    expect(isRecentLegacySend(record, now)).toBe(false);
  });
});

describe("cronRunId", () => {
  // The ID is the UTC calendar day on purpose: every run, in any zone, files under the same day.
  it("is the UTC date of the run", () => {
    expect(cronRunId(new Date(Date.UTC(2026, 9, 11, 21, 0)))).toBe("2026-10-11");
  });

  it("stays on the UTC day when the local date has already moved on", () => {
    // 23:30 UTC is Oct 12 in Kolkata and still Oct 11 in Toronto.
    expect(cronRunId(new Date(Date.UTC(2026, 9, 11, 23, 30)))).toBe("2026-10-11");
  });

  it("moves to the next day at UTC midnight", () => {
    expect(cronRunId(new Date(Date.UTC(2026, 9, 12, 0, 0)))).toBe("2026-10-12");
  });
});
