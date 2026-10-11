import { describe, expect, it } from "vitest";
import { cronRunId, isAlreadySent, isCronAuthorized } from "./reminderCron";

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

describe("isAlreadySent", () => {
  it("is false when there is no record yet", () => {
    expect(isAlreadySent(undefined)).toBe(false);
  });

  it('is true only for status "sent"', () => {
    expect(isAlreadySent({ status: "sent" })).toBe(true);
  });

  // A3: a failed send used to block every later attempt.
  it("is false for a failed send, so the next run retries it", () => {
    expect(isAlreadySent({ status: "failed", error: "Invalid login: 535" })).toBe(false);
  });

  it.each([[{}], [{ status: "Sent" }], [{ status: null }], [{ status: true }]])(
    "is false for any other status: %j",
    (record) => {
      expect(isAlreadySent(record)).toBe(false);
    },
  );
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
