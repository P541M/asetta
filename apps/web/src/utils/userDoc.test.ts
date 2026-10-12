import { describe, expect, it } from "vitest";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  displayPreferencesFromUserDoc,
  lastLoginToWrite,
  onboardingStatusFromUserDoc,
  shouldRedirectToOnboarding,
  timeZoneToWrite,
} from "./userDoc";

/** What a Firestore Timestamp field reads back as: an object with toDate(). */
const timestamp = (date: Date) => ({ toDate: () => date });

describe("onboardingStatusFromUserDoc", () => {
  it("treats a missing doc as a new user who needs onboarding", () => {
    expect(onboardingStatusFromUserDoc(undefined)).toEqual({
      hasCompletedOnboarding: false,
      onboardingCompletedAt: undefined,
      isNewUser: true,
      needsOnboarding: true,
    });
  });

  it("reads a finished onboarding", () => {
    const completedAt = new Date(2026, 8, 1, 12, 5);
    expect(
      onboardingStatusFromUserDoc({
        hasCompletedOnboarding: true,
        onboardingCompletedAt: timestamp(completedAt),
      }),
    ).toEqual({
      hasCompletedOnboarding: true,
      onboardingCompletedAt: completedAt,
      isNewUser: false,
      needsOnboarding: false,
    });
  });

  it("needs onboarding when the doc has no onboarding fields", () => {
    expect(onboardingStatusFromUserDoc({ displayName: "Sam" })).toMatchObject({
      isNewUser: true,
      needsOnboarding: true,
    });
  });

  it("is not a new user once onboarding has a date, even if not completed", () => {
    expect(
      onboardingStatusFromUserDoc({
        hasCompletedOnboarding: false,
        onboardingCompletedAt: timestamp(new Date(2026, 8, 1)),
      }),
    ).toMatchObject({ isNewUser: false, needsOnboarding: true });
  });
});

describe("shouldRedirectToOnboarding", () => {
  it("never redirects without a status", () => {
    expect(shouldRedirectToOnboarding(null)).toBe(false);
  });

  it("follows needsOnboarding", () => {
    const status = onboardingStatusFromUserDoc(undefined);
    expect(shouldRedirectToOnboarding(status)).toBe(true);
    expect(shouldRedirectToOnboarding({ ...status, needsOnboarding: false })).toBe(false);
  });
});

describe("displayPreferencesFromUserDoc", () => {
  it("uses the defaults without a doc or without the fields", () => {
    expect(displayPreferencesFromUserDoc(undefined)).toEqual(DEFAULT_DISPLAY_PREFERENCES);
    expect(displayPreferencesFromUserDoc({})).toEqual(DEFAULT_DISPLAY_PREFERENCES);
  });

  it("keeps each stored choice", () => {
    expect(
      displayPreferencesFromUserDoc({
        showDaysTillDue: false,
        showWeight: false,
        showNotes: false,
        showStatsBar: true,
      }),
    ).toEqual({ showDaysTillDue: false, showWeight: false, showNotes: false, showStatsBar: true });
  });
});

describe("lastLoginToWrite", () => {
  const now = new Date(2026, 9, 11, 20, 30);

  it("records the first sign-in", () => {
    expect(lastLoginToWrite(undefined, now)).toBe(now);
  });

  it("records a sign-in on a later local day", () => {
    expect(lastLoginToWrite(timestamp(new Date(2026, 9, 10, 20, 30)), now)).toBe(now);
  });

  it("records a sign-in just after local midnight", () => {
    const last = timestamp(new Date(2026, 9, 10, 23, 59));
    expect(lastLoginToWrite(last, new Date(2026, 9, 11, 0, 1))).toEqual(
      new Date(2026, 9, 11, 0, 1),
    );
  });

  it.each([["yesterday"], [42], [null], [timestamp(new Date(Number.NaN))]])(
    "records a sign-in over an unreadable lastLogin (%j)",
    (stored) => {
      expect(lastLoginToWrite(stored, now)).toBe(now);
    },
  );

  it.fails("A12: writes nothing for a second sign-in the same local day", () => {
    expect(lastLoginToWrite(timestamp(new Date(2026, 9, 11, 0, 5)), now)).toBeNull();
  });

  it.fails("A12: reads a stored Date as well as a Timestamp", () => {
    expect(lastLoginToWrite(new Date(2026, 9, 11, 8, 0), now)).toBeNull();
  });

  it.fails("A12: counts the March DST day as one day", () => {
    const last = timestamp(new Date(2026, 2, 8, 0, 30));
    expect(lastLoginToWrite(last, new Date(2026, 2, 8, 23, 30))).toBeNull();
  });

  it.fails("A12: counts the November DST day as one day", () => {
    const last = timestamp(new Date(2026, 10, 1, 0, 30));
    expect(lastLoginToWrite(last, new Date(2026, 10, 1, 23, 30))).toBeNull();
  });
});

describe("timeZoneToWrite", () => {
  it("saves the browser's zone when none is stored", () => {
    expect(timeZoneToWrite(undefined, "America/Toronto")).toBe("America/Toronto");
  });

  it("saves the browser's zone when it has changed", () => {
    expect(timeZoneToWrite("Pacific/Auckland", "America/Toronto")).toBe("America/Toronto");
  });

  it("writes nothing when the zone is unchanged", () => {
    expect(timeZoneToWrite("America/Toronto", "America/Toronto")).toBeNull();
  });

  it("writes nothing when the browser has no usable zone", () => {
    expect(timeZoneToWrite("America/Toronto", null)).toBeNull();
    expect(timeZoneToWrite(undefined, null)).toBeNull();
  });

  it("replaces a stored value that isn't a zone name", () => {
    expect(timeZoneToWrite(42, "Asia/Kolkata")).toBe("Asia/Kolkata");
  });
});
