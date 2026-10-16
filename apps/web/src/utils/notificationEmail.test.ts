import { describe, expect, it } from "vitest";
import {
  cleanEmail,
  notificationEmailStatus,
  reminderRecipient,
  sameAddress,
} from "./notificationEmail";

describe("cleanEmail", () => {
  it("trims a saved address", () => {
    expect(cleanEmail("  sam@example.test ")).toBe("sam@example.test");
  });

  it("is null for anything that isn't an address", () => {
    expect(cleanEmail("")).toBeNull();
    expect(cleanEmail("   ")).toBeNull();
    expect(cleanEmail("sam")).toBeNull();
    expect(cleanEmail("sam@example")).toBeNull();
    expect(cleanEmail(null)).toBeNull();
    expect(cleanEmail(undefined)).toBeNull();
    expect(cleanEmail(42)).toBeNull();
  });
});

describe("sameAddress", () => {
  it("ignores case and surrounding spaces", () => {
    expect(sameAddress("Sam@Example.TEST", " sam@example.test ")).toBe(true);
  });

  it("is false for different addresses, or when either one is missing", () => {
    expect(sameAddress("sam@example.test", "sam+a@example.test")).toBe(false);
    expect(sameAddress("sam@example.test", null)).toBe(false);
    expect(sameAddress(undefined, "sam@example.test")).toBe(false);
    expect(sameAddress("", "")).toBe(false);
  });
});

describe("notificationEmailStatus", () => {
  const accountEmail = "sam@example.test";

  it("is the account's own address when the chosen one matches it", () => {
    expect(
      notificationEmailStatus({
        email: "SAM@example.test",
        verifiedEmail: undefined,
        accountEmail,
      }),
    ).toBe("account");
  });

  it("is confirmed once the link for that address was used", () => {
    expect(
      notificationEmailStatus({
        email: "sam.lee@uni.example.test",
        verifiedEmail: "Sam.Lee@uni.example.test",
        accountEmail,
      }),
    ).toBe("confirmed");
  });

  it("is unconfirmed for another address, even when an earlier one was confirmed", () => {
    expect(
      notificationEmailStatus({
        email: "sam.lee@uni.example.test",
        verifiedEmail: null,
        accountEmail,
      }),
    ).toBe("unconfirmed");
    expect(
      notificationEmailStatus({
        email: "someone@else.example.test",
        verifiedEmail: "sam.lee@uni.example.test",
        accountEmail,
      }),
    ).toBe("unconfirmed");
  });

  it("is unconfirmed when the account has no email to compare with", () => {
    expect(
      notificationEmailStatus({
        email: "sam@example.test",
        verifiedEmail: null,
        accountEmail: null,
      }),
    ).toBe("unconfirmed");
  });

  it("is null when no usable address is chosen", () => {
    expect(notificationEmailStatus({ email: "", verifiedEmail: null, accountEmail })).toBeNull();
    expect(
      notificationEmailStatus({ email: "sam", verifiedEmail: "sam", accountEmail }),
    ).toBeNull();
  });
});

describe("reminderRecipient (A17)", () => {
  const accountEmail = "sam@example.test";

  it("sends to the chosen address when it is the account's own", () => {
    expect(
      reminderRecipient({ email: " Sam@example.test", verifiedEmail: undefined, accountEmail }),
    ).toBe("Sam@example.test");
  });

  it("sends to a confirmed address", () => {
    expect(
      reminderRecipient({
        email: "sam.lee@uni.example.test",
        verifiedEmail: "sam.lee@uni.example.test",
        accountEmail,
      }),
    ).toBe("sam.lee@uni.example.test");
  });

  it("falls back to the account email until the chosen address is confirmed", () => {
    expect(
      reminderRecipient({ email: "victim@example.test", verifiedEmail: undefined, accountEmail }),
    ).toBe(accountEmail);
  });

  it("falls back after the address changes away from the confirmed one", () => {
    expect(
      reminderRecipient({
        email: "victim@example.test",
        verifiedEmail: "sam.lee@uni.example.test",
        accountEmail,
      }),
    ).toBe(accountEmail);
  });

  it("falls back to the account email when no usable address is chosen", () => {
    expect(reminderRecipient({ email: "", verifiedEmail: null, accountEmail })).toBe(accountEmail);
  });

  it("sends nowhere when an unconfirmed address has no account email to fall back to", () => {
    expect(
      reminderRecipient({ email: "victim@example.test", verifiedEmail: null, accountEmail: null }),
    ).toBeNull();
    expect(
      reminderRecipient({ email: "victim@example.test", verifiedEmail: null, accountEmail: "" }),
    ).toBeNull();
  });
});
