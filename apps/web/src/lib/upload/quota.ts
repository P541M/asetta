import { MAX_FILES_PER_DAY } from "./constants";

/**
 * The per-account upload quota (A18), server side: at most `MAX_FILES_PER_DAY` files per UTC day.
 * The count lives in the server-only `uploadUsage/{uid}_{YYYY-MM-DD}` doc. The upload route claims
 * a request's files in a transaction before any extraction, and refunds the ones extraction never
 * ran on (an unreadable PDF, a file Gemini refused for its own quota or rate limit).
 */

/** The UTC day a file counts toward, YYYY-MM-DD. */
export const uploadUsageDay = (now: Date): string => now.toISOString().slice(0, 10);

/** One doc per user per UTC day, so a new day starts from zero with nothing to reset. */
export const uploadUsagePath = (uid: string, now: Date): string =>
  `uploadUsage/${uid}_${uploadUsageDay(now)}`;

/** Seconds until the next UTC midnight, when the count starts over (the 429's `retryAfter`). */
export const secondsUntilUtcMidnight = (now: Date): number => {
  const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.ceil((nextDay - now.getTime()) / 1000);
};

/** The files already counted today, from the stored doc: 0 with no doc or no usable count. */
export const filesUsedFromData = (data: Record<string, unknown> | undefined): number => {
  const files = data?.files;
  return typeof files === "number" && Number.isFinite(files) && files > 0 ? Math.floor(files) : 0;
};

export type UploadClaim =
  /** `used` is the day's new count, to store. */
  { allowed: true; used: number } | { allowed: false; remaining: number };

/**
 * All of a request's files, or none: a partial run would hide which files were skipped, because
 * the success modal doesn't list failures.
 */
export const claimUploadFiles = (used: number, requested: number): UploadClaim => {
  const remaining = Math.max(0, MAX_FILES_PER_DAY - used);
  return requested <= remaining
    ? { allowed: true, used: used + requested }
    : { allowed: false, remaining };
};

/** The 429's message, shown under the upload form (the limit modal says the same). */
export const uploadLimitMessage = (remaining: number): string =>
  remaining === 0
    ? `You've uploaded ${MAX_FILES_PER_DAY} files today, the daily limit. You can upload more after midnight UTC.`
    : `You can upload ${remaining} more ${remaining === 1 ? "file" : "files"} today (the limit is ${MAX_FILES_PER_DAY} a day). Choose ${remaining} or fewer and try again.`;
