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
 * Whether a `notifications/{id}` record means the reminder already went out. A failed attempt
 * leaves a record too (status "failed"), and that one must not block the next run's retry.
 */
export function isAlreadySent(record: Record<string, unknown> | undefined): boolean {
  return record?.status === "sent";
}

/** The `cronRuns` doc ID: the run's UTC calendar day, so every run of a day shares one doc. */
export function cronRunId(startedAt: Date): string {
  return startedAt.toISOString().slice(0, 10);
}
