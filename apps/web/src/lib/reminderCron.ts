// Pure rules for the reminder cron (pages/api/cron/notifications.ts and lib/notifications.ts).

/** Only `Bearer <secret>` passes, and nothing passes while the secret is unset or empty. */
export function isCronAuthorized(
  authHeader: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

/**
 * How many due users a run handles at once. One user's reads and sends still run one after
 * another, and every email goes through the run's few Gmail connections (lib/email.ts).
 */
export const USERS_AT_ONCE = 10;

/** A rejected address fails every time, so a reminder gets this many sends at most. */
export const MAX_SEND_ATTEMPTS = 3;
/** The least time between two attempts at one reminder (runs are 30 minutes apart). */
export const RETRY_DELAY_MS = 20 * 60 * 1000;
/**
 * How long a claim holds before another run may take it over. Longer than a run can last (the
 * route's `maxDuration` is 300 seconds), so it only expires when the run that claimed it died.
 */
export const SEND_LEASE_MS = 10 * 60 * 1000;

/** A `notifications/{id}` record, with Firestore timestamps already converted to dates. */
export interface ReminderRecord {
  status?: unknown;
  attempts?: unknown;
  lastAttemptAt?: Date | null;
}

export type ClaimDecision =
  | { claim: true; attempt: number }
  | { claim: false; reason: "sent" | "sending" | "waiting" | "capped" };

/**
 * Whether this run may send a reminder, given its record. A run claims a reminder (status
 * "sending") in a transaction before sending, so two runs never send the same one. Only "sent"
 * blocks it for good; a failed attempt is retried after a delay, up to the attempt cap.
 */
export function claimDecision(record: ReminderRecord | undefined, now: Date): ClaimDecision {
  if (!record) return { claim: true, attempt: 1 };
  if (record.status === "sent") return { claim: false, reason: "sent" };

  const attempts =
    typeof record.attempts === "number" && Number.isInteger(record.attempts) && record.attempts > 0
      ? record.attempts
      : 0;
  const sinceLastAttempt =
    record.lastAttemptAt instanceof Date
      ? now.getTime() - record.lastAttemptAt.getTime()
      : Infinity;

  if (record.status === "sending" && sinceLastAttempt < SEND_LEASE_MS) {
    return { claim: false, reason: "sending" };
  }
  if (attempts >= MAX_SEND_ATTEMPTS) return { claim: false, reason: "capped" };
  // An expired claim already waited out its lease, so it is retried at once.
  if (record.status !== "sending" && sinceLastAttempt < RETRY_DELAY_MS) {
    return { claim: false, reason: "waiting" };
  }
  return { claim: true, attempt: attempts + 1 };
}

/** The `cronRuns` doc ID: the run's UTC calendar day, so every run of a day shares one doc. */
export function cronRunId(startedAt: Date): string {
  return startedAt.toISOString().slice(0, 10);
}
