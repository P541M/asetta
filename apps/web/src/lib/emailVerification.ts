import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { storedDate } from "../utils/dateUtils";

/**
 * The confirm link for a notification address (A17), server side. A link carries a random token;
 * only its SHA-256 hash is stored, in the server-only `emailVerifications/{uid}` doc, with the
 * address it confirms, its expiry and the day's send count.
 */

export const CONFIRM_LINK_TTL_MS = 24 * 60 * 60 * 1000;
/** Each link is an email from Asetta's Gmail to an address the student typed, so they're capped. */
export const RESEND_AFTER_MS = 60 * 1000;
export const MAX_LINKS_PER_DAY = 5;

/** `emailVerifications/{uid}`. */
export interface VerificationRecord {
  /** The address the pending link confirms. */
  email?: string;
  tokenHash?: string;
  expiresAt?: Date | null;
  lastSentAt?: Date | null;
  /** The UTC day `sendsToday` counts, YYYY-MM-DD. */
  sendDay?: string;
  sendsToday?: number;
}

export const newConfirmToken = (): string => randomBytes(32).toString("base64url");

export const hashConfirmToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const isConfirmTokenFormat = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);

export type SendDecision =
  { send: true; sendsToday: number } | { send: false; retryAfterSeconds: number };

const utcDay = (date: Date) => date.toISOString().slice(0, 10);

/** Whether a new link may go out now: at most one a minute and `MAX_LINKS_PER_DAY` a UTC day. */
export function linkSendDecision(record: VerificationRecord | undefined, now: Date): SendDecision {
  const sinceLast = record?.lastSentAt ? now.getTime() - record.lastSentAt.getTime() : Infinity;
  if (sinceLast < RESEND_AFTER_MS) {
    return { send: false, retryAfterSeconds: Math.ceil((RESEND_AFTER_MS - sinceLast) / 1000) };
  }

  const sendsToday = record?.sendDay === utcDay(now) ? (record.sendsToday ?? 0) : 0;
  if (sendsToday >= MAX_LINKS_PER_DAY) {
    const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return { send: false, retryAfterSeconds: Math.ceil((nextDay - now.getTime()) / 1000) };
  }
  return { send: true, sendsToday: sendsToday + 1 };
}

export type ConfirmOutcome = "confirmed" | "invalid" | "expired";

/** Whether `token` confirms the pending address: its link, not used yet, not expired. */
export function confirmOutcome(
  record: VerificationRecord | undefined,
  token: string,
  now: Date,
): ConfirmOutcome {
  if (!record?.email || !record.tokenHash) return "invalid";
  const expected = Buffer.from(record.tokenHash, "hex");
  const actual = Buffer.from(hashConfirmToken(token), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return "invalid";
  if (!record.expiresAt || now.getTime() >= record.expiresAt.getTime()) return "expired";
  return "confirmed";
}

/** The link in the email: a page whose button confirms, so a mail scanner's GET confirms nothing. */
export function confirmLinkUrl(appUrl: string, uid: string, token: string): string {
  return `${appUrl}/confirm-email?${new URLSearchParams({ uid, token })}`;
}

/** The record a new link leaves: what it confirms, its token's hash and expiry, the day's count. */
export function newLinkRecord(
  email: string,
  token: string,
  now: Date,
  sendsToday: number,
): VerificationRecord {
  return {
    email,
    tokenHash: hashConfirmToken(token),
    expiresAt: new Date(now.getTime() + CONFIRM_LINK_TTL_MS),
    lastSentAt: now,
    sendDay: utcDay(now),
    sendsToday,
  };
}

/** `emailVerifications/{uid}` as stored, for the functions above; undefined when there is none. */
export function verificationRecordFromData(
  data: Record<string, unknown> | undefined,
): VerificationRecord | undefined {
  if (!data) return undefined;
  const text = (value: unknown) => (typeof value === "string" ? value : undefined);
  return {
    email: text(data.email),
    tokenHash: text(data.tokenHash),
    expiresAt: storedDate(data.expiresAt),
    lastSentAt: storedDate(data.lastSentAt),
    sendDay: text(data.sendDay),
    sendsToday: typeof data.sendsToday === "number" ? data.sendsToday : undefined,
  };
}
