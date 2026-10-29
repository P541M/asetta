import { describe, expect, it } from "vitest";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  displayPreferencesFromUserDoc,
  lastLoginToWrite,
  onboardingChoicesFromUserDoc,
  onboardingChoicesToWrite,
  onboardingStatusFromUserDoc,
  pathAfterAuth,
  profileFromUserDoc,
  shouldRedirectToOnboarding,
  timeZoneToWrite,
  userDocErrorKind,
  verifiedEmailFromUserDoc,
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

describe("pathAfterAuth", () => {
  it("sends an account that hasn't finished onboarding to onboarding", () => {
    expect(pathAfterAuth(onboardingStatusFromUserDoc(undefined))).toBe("/onboarding");
    expect(pathAfterAuth(onboardingStatusFromUserDoc({ institution: "" }))).toBe("/onboarding");
  });

  it("sends an account that finished onboarding to the dashboard", () => {
    expect(pathAfterAuth(onboardingStatusFromUserDoc({ hasCompletedOnboarding: true }))).toBe(
      "/dashboard",
    );
  });

  it("A54: sends a user doc that couldn't be read to the dashboard, never to onboarding", () => {
    expect(pathAfterAuth(null)).toBe("/dashboard");
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

describe("profileFromUserDoc", () => {
  it("reads the display name", () => {
    expect(profileFromUserDoc({ displayName: "Sam" })).toEqual({ displayName: "Sam" });
  });

  it("is empty without a doc or a name", () => {
    expect(profileFromUserDoc(undefined)).toEqual({ displayName: "" });
    expect(profileFromUserDoc({ displayName: null })).toEqual({ displayName: "" });
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

  it("A12: writes nothing for a second sign-in the same local day", () => {
    expect(lastLoginToWrite(timestamp(new Date(2026, 9, 11, 0, 5)), now)).toBeNull();
  });

  it("A12: reads a stored Date as well as a Timestamp", () => {
    expect(lastLoginToWrite(new Date(2026, 9, 11, 8, 0), now)).toBeNull();
  });

  it("A12: counts the March DST day as one day", () => {
    const last = timestamp(new Date(2026, 2, 8, 0, 30));
    expect(lastLoginToWrite(last, new Date(2026, 2, 8, 23, 30))).toBeNull();
  });

  it("A12: counts the November DST day as one day", () => {
    const last = timestamp(new Date(2026, 10, 1, 0, 30));
    expect(lastLoginToWrite(last, new Date(2026, 10, 1, 23, 30))).toBeNull();
  });
});

describe("userDocErrorKind", () => {
  it("reads Firestore's unavailable code as offline", () => {
    expect(userDocErrorKind({ code: "unavailable", message: "client is offline" })).toBe("offline");
  });

  it.each([[{ code: "permission-denied" }], [new Error("boom")], ["text"], [null]])(
    "reads anything else as a failure (%j)",
    (error) => {
      expect(userDocErrorKind(error)).toBe("failed");
    },
  );
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

describe("verifiedEmailFromUserDoc", () => {
  it("reads the address the server confirmed (A17)", () => {
    expect(verifiedEmailFromUserDoc({ verifiedEmail: "sam.lee@uni.example.test" })).toBe(
      "sam.lee@uni.example.test",
    );
  });

  it("is null without one, or for a doc that doesn't exist", () => {
    expect(verifiedEmailFromUserDoc({ email: "sam@example.test" })).toBeNull();
    expect(verifiedEmailFromUserDoc({ verifiedEmail: true })).toBeNull();
    expect(verifiedEmailFromUserDoc(undefined)).toBeNull();
  });
});

describe("onboardingChoicesFromUserDoc", () => {
  it("starts from the choices the user doc holds", () => {
    expect(
      onboardingChoicesFromUserDoc({
        displayName: "Sam",
        institution: "University of Guelph",
        hasConsentedToNotifications: true,
        emailNotifications: true,
        notificationDaysBefore: 14,
        email: "sam@example.test",
      }),
    ).toEqual({
      institution: "University of Guelph",
      hasConsentedToNotifications: true,
      emailNotifications: true,
      notificationDaysBefore: 14,
      email: "sam@example.test",
    });
  });

  it("keeps notifications switched off", () => {
    expect(
      onboardingChoicesFromUserDoc({
        emailNotifications: false,
        hasConsentedToNotifications: false,
      }),
    ).toMatchObject({ emailNotifications: false, hasConsentedToNotifications: false });
  });

  it("uses the defaults, notifications off, without a doc or without the fields", () => {
    const defaults = {
      institution: "",
      hasConsentedToNotifications: false,
      emailNotifications: false,
      notificationDaysBefore: 1,
      email: "",
    };
    expect(onboardingChoicesFromUserDoc(undefined)).toEqual(defaults);
    expect(onboardingChoicesFromUserDoc({ displayName: "Sam" })).toEqual(defaults);
  });

  it("A48: writes back as it was read when the student changes nothing", () => {
    const off = { emailNotifications: false, hasConsentedToNotifications: false };
    expect(onboardingChoicesToWrite(onboardingChoicesFromUserDoc(off))).toMatchObject(off);
  });
});

describe("onboardingChoicesToWrite", () => {
  it("writes what the student chose", () => {
    const choices = {
      institution: "University of Guelph",
      hasConsentedToNotifications: true,
      emailNotifications: true,
      notificationDaysBefore: 14,
      email: "sam@example.test",
    };
    expect(onboardingChoicesToWrite(choices)).toEqual(choices);
  });

  it("A48: writes email notifications off when the student switched them off", () => {
    expect(
      onboardingChoicesToWrite({
        hasConsentedToNotifications: false,
        emailNotifications: false,
        notificationDaysBefore: 3,
        email: "sam@example.test",
      }),
    ).toMatchObject({ hasConsentedToNotifications: false, emailNotifications: false });
  });

  it("A48: writes the defaults, notifications off, for choices never made", () => {
    expect(onboardingChoicesToWrite({})).toEqual({
      institution: "",
      hasConsentedToNotifications: false,
      emailNotifications: false,
      notificationDaysBefore: 1,
      email: "",
    });
  });
});
