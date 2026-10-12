import { describe, expect, it } from "vitest";
import { browserTimeZone, isValidTimeZone } from "./timeZone";

describe("isValidTimeZone", () => {
  it.each([["America/Toronto"], ["Pacific/Auckland"], ["Asia/Kolkata"], ["UTC"]])(
    "accepts %s",
    (zone) => {
      expect(isValidTimeZone(zone)).toBe(true);
    },
  );

  it.each([[""], ["Etc/Unknown"], ["Mars/Base"], [undefined], [null], [42]])(
    "rejects %j",
    (zone) => {
      expect(isValidTimeZone(zone)).toBe(false);
    },
  );
});

describe("browserTimeZone", () => {
  // Each Vitest project sets TZ, which Intl reports in Node (a browser reports the OS zone). ICU may
  // name it by an alias ("Asia/Calcutta" for Asia/Kolkata); both are valid IANA names.
  it("is the zone this runtime reports", () => {
    const canonical = new Intl.DateTimeFormat("en-US", { timeZone: process.env.TZ });
    expect(browserTimeZone()).toBe(canonical.resolvedOptions().timeZone);
    expect(isValidTimeZone(browserTimeZone())).toBe(true);
  });
});
