import { describe, expect, it } from "vitest";
import {
  CONFIRM_LINK_TTL_MS,
  MAX_LINKS_PER_DAY,
  RESEND_AFTER_MS,
  confirmLinkUrl,
  confirmOutcome,
  hashConfirmToken,
  isConfirmTokenFormat,
  linkSendDecision,
  newConfirmToken,
  newLinkRecord,
  verificationRecordFromData,
  type VerificationRecord,
} from "./emailVerification";

// Absolute instants: the same moment in both zone runs
const NOW = new Date(Date.UTC(2026, 9, 16, 14, 0, 0));
const at = (msFromNow: number) => new Date(NOW.getTime() + msFromNow);

describe("confirm tokens", () => {
  it("are 32 random bytes in base64url, different every time", () => {
    const token = newConfirmToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(newConfirmToken()).not.toBe(token);
    expect(isConfirmTokenFormat(token)).toBe(true);
  });

  it("are stored only as a SHA-256 hash", () => {
    const token = newConfirmToken();
    expect(hashConfirmToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashConfirmToken(token)).toBe(hashConfirmToken(token));
    expect(hashConfirmToken(token)).not.toContain(token);
  });

  it("rejects anything that isn't a token's shape", () => {
    expect(isConfirmTokenFormat("")).toBe(false);
    expect(isConfirmTokenFormat("short")).toBe(false);
    expect(isConfirmTokenFormat(`${newConfirmToken()}x`)).toBe(false);
    expect(isConfirmTokenFormat("a".repeat(42) + "/")).toBe(false);
    expect(isConfirmTokenFormat(undefined)).toBe(false);
    expect(isConfirmTokenFormat(["a".repeat(43)])).toBe(false);
  });
});

describe("linkSendDecision", () => {
  it("sends the first link", () => {
    expect(linkSendDecision(undefined, NOW)).toEqual({ send: true, sendsToday: 1 });
  });

  it("waits a minute between links, saying how long is left", () => {
    const record: VerificationRecord = {
      lastSentAt: at(-20_000),
      sendDay: "2026-10-16",
      sendsToday: 1,
    };
    expect(linkSendDecision(record, NOW)).toEqual({ send: false, retryAfterSeconds: 40 });
    expect(linkSendDecision({ ...record, lastSentAt: at(-RESEND_AFTER_MS) }, NOW)).toEqual({
      send: true,
      sendsToday: 2,
    });
  });

  it("stops at the day's cap until the next UTC day", () => {
    const record: VerificationRecord = {
      lastSentAt: at(-3_600_000),
      sendDay: "2026-10-16",
      sendsToday: MAX_LINKS_PER_DAY,
    };
    // 14:00 UTC: ten hours to midnight
    expect(linkSendDecision(record, NOW)).toEqual({ send: false, retryAfterSeconds: 36_000 });
  });

  it("counts from zero again on a new UTC day", () => {
    const record: VerificationRecord = {
      lastSentAt: at(-86_400_000),
      sendDay: "2026-10-15",
      sendsToday: MAX_LINKS_PER_DAY,
    };
    expect(linkSendDecision(record, NOW)).toEqual({ send: true, sendsToday: 1 });
  });
});

describe("confirmOutcome", () => {
  const token = newConfirmToken();
  const pending: VerificationRecord = {
    email: "sam.lee@uni.example.test",
    tokenHash: hashConfirmToken(token),
    expiresAt: at(CONFIRM_LINK_TTL_MS),
  };

  it("confirms the link's token before it expires", () => {
    expect(confirmOutcome(pending, token, NOW)).toBe("confirmed");
    expect(confirmOutcome(pending, token, at(CONFIRM_LINK_TTL_MS - 1))).toBe("confirmed");
  });

  it("refuses an expired link", () => {
    expect(confirmOutcome(pending, token, at(CONFIRM_LINK_TTL_MS))).toBe("expired");
  });

  it("refuses another token, a used link and a missing record", () => {
    expect(confirmOutcome(pending, newConfirmToken(), NOW)).toBe("invalid");
    expect(confirmOutcome({ ...pending, tokenHash: undefined }, token, NOW)).toBe("invalid");
    expect(confirmOutcome({ ...pending, email: undefined }, token, NOW)).toBe("invalid");
    expect(confirmOutcome(undefined, token, NOW)).toBe("invalid");
  });

  it("refuses a link without an expiry", () => {
    expect(confirmOutcome({ ...pending, expiresAt: undefined }, token, NOW)).toBe("expired");
  });
});

describe("confirmLinkUrl", () => {
  it("points at the confirm page with the uid and token as query values", () => {
    expect(confirmLinkUrl("https://asetta.me", "abc123", "tok_EN-1")).toBe(
      "https://asetta.me/confirm-email?uid=abc123&token=tok_EN-1",
    );
  });

  it("encodes the uid", () => {
    expect(confirmLinkUrl("http://localhost:3005", "a b&c", "t")).toBe(
      "http://localhost:3005/confirm-email?uid=a+b%26c&token=t",
    );
  });
});

describe("newLinkRecord", () => {
  it("stores the address, the token's hash, a 24-hour expiry and the day's count", () => {
    const token = newConfirmToken();
    expect(newLinkRecord("sam.lee@uni.example.test", token, NOW, 2)).toEqual({
      email: "sam.lee@uni.example.test",
      tokenHash: hashConfirmToken(token),
      expiresAt: at(CONFIRM_LINK_TTL_MS),
      lastSentAt: NOW,
      sendDay: "2026-10-16",
      sendsToday: 2,
    });
  });

  it("counts by the UTC day", () => {
    const lateInToronto = new Date(Date.UTC(2026, 9, 17, 2, 30));
    expect(newLinkRecord("a@example.test", newConfirmToken(), lateInToronto, 1).sendDay).toBe(
      "2026-10-17",
    );
  });
});

describe("verificationRecordFromData", () => {
  // A Firestore Timestamp as the admin SDK returns it
  const timestamp = (date: Date) => ({ toDate: () => date });

  it("reads a stored record, its timestamps as Dates", () => {
    expect(
      verificationRecordFromData({
        email: "sam.lee@uni.example.test",
        tokenHash: "ab".repeat(32),
        expiresAt: timestamp(at(CONFIRM_LINK_TTL_MS)),
        lastSentAt: timestamp(NOW),
        sendDay: "2026-10-16",
        sendsToday: 1,
      }),
    ).toEqual({
      email: "sam.lee@uni.example.test",
      tokenHash: "ab".repeat(32),
      expiresAt: at(CONFIRM_LINK_TTL_MS),
      lastSentAt: NOW,
      sendDay: "2026-10-16",
      sendsToday: 1,
    });
  });

  it("reads a used link (no hash, no expiry) and drops values of the wrong type", () => {
    expect(
      verificationRecordFromData({ email: 42, lastSentAt: "yesterday", sendsToday: "5" }),
    ).toEqual({
      email: undefined,
      tokenHash: undefined,
      expiresAt: null,
      lastSentAt: null,
      sendDay: undefined,
      sendsToday: undefined,
    });
  });

  it("is undefined for a doc that doesn't exist", () => {
    expect(verificationRecordFromData(undefined)).toBeUndefined();
  });
});
