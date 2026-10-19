import { describe, expect, it } from "vitest";
import { MAX_FILES_PER_DAY } from "./constants";
import {
  claimUploadFiles,
  filesUsedFromData,
  secondsUntilUtcMidnight,
  uploadLimitMessage,
  uploadUsageDay,
  uploadUsagePath,
} from "./quota";

// Absolute instants: the quota runs on the UTC day, the same moment in both zone runs
const utc = (day: number, hour: number, minute = 0, second = 0, ms = 0) =>
  new Date(Date.UTC(2026, 9, day, hour, minute, second, ms));

describe("uploadUsageDay", () => {
  it("is the UTC day, whatever the server's zone", () => {
    expect(uploadUsageDay(utc(19, 14))).toBe("2026-10-19");
    // 23:59 UTC is already the next day in Kolkata and still the same day in Toronto
    expect(uploadUsageDay(utc(19, 23, 59, 59, 999))).toBe("2026-10-19");
    expect(uploadUsageDay(utc(20, 0))).toBe("2026-10-20");
  });
});

describe("uploadUsagePath", () => {
  it("is one doc per user per UTC day", () => {
    expect(uploadUsagePath("abc123", utc(19, 14))).toBe("uploadUsage/abc123_2026-10-19");
    expect(uploadUsagePath("abc123", utc(20, 0, 0, 1))).toBe("uploadUsage/abc123_2026-10-20");
  });
});

describe("secondsUntilUtcMidnight", () => {
  it("counts to the next UTC midnight, rounding up", () => {
    expect(secondsUntilUtcMidnight(utc(19, 14))).toBe(36_000);
    expect(secondsUntilUtcMidnight(utc(19, 23, 59, 59, 500))).toBe(1);
    expect(secondsUntilUtcMidnight(utc(20, 0))).toBe(86_400);
  });
});

describe("filesUsedFromData", () => {
  it("reads the stored count", () => {
    expect(filesUsedFromData({ files: 7 })).toBe(7);
  });

  it("is 0 with no doc yet or no usable count", () => {
    expect(filesUsedFromData(undefined)).toBe(0);
    expect(filesUsedFromData({})).toBe(0);
    expect(filesUsedFromData({ files: "7" })).toBe(0);
    expect(filesUsedFromData({ files: Number.NaN })).toBe(0);
    expect(filesUsedFromData({ files: -2 })).toBe(0);
  });
});

describe("claimUploadFiles", () => {
  it("allows 20 files a day (D5)", () => {
    expect(MAX_FILES_PER_DAY).toBe(20);
  });

  it("claims every file of a request that fits, returning the new count", () => {
    expect(claimUploadFiles(0, 1)).toEqual({ allowed: true, used: 1 });
    expect(claimUploadFiles(10, 10)).toEqual({ allowed: true, used: 20 });
    expect(claimUploadFiles(19, 1)).toEqual({ allowed: true, used: 20 });
  });

  it("refuses the 21st file of the day", () => {
    expect(claimUploadFiles(20, 1)).toEqual({ allowed: false, remaining: 0 });
  });

  it("refuses a whole request that would go over, saying how many are left", () => {
    expect(claimUploadFiles(17, 5)).toEqual({ allowed: false, remaining: 3 });
    expect(claimUploadFiles(19, 2)).toEqual({ allowed: false, remaining: 1 });
  });

  it("never reports a negative number left", () => {
    expect(claimUploadFiles(25, 1)).toEqual({ allowed: false, remaining: 0 });
  });
});

describe("uploadLimitMessage", () => {
  it("says the limit is reached and when it resets", () => {
    const message = uploadLimitMessage(0);
    expect(message).toContain("20 files");
    expect(message).toContain("midnight UTC");
  });

  it("says how many files are left when some are", () => {
    expect(uploadLimitMessage(3)).toContain("3 more files");
    expect(uploadLimitMessage(1)).toMatch(/\b1 more file(?!s)/);
  });
});
