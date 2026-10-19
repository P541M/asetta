// Small promise helpers for server jobs (the reminder cron, lib/notifications.ts).

/**
 * Runs `task` on every item with at most `limit` running at once, and resolves with the results
 * in the items' order. On a failure it starts no new task, waits for the running ones to settle,
 * then rejects with the first error.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`limit must be a positive integer, got ${limit}`);
  }
  const results = new Array<R>(items.length);
  let next = 0;
  let failure: { error: unknown } | undefined;
  const worker = async () => {
    while (!failure && next < items.length) {
      const index = next++;
      try {
        results[index] = await task(items[index], index);
      } catch (error) {
        failure ??= { error };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  if (failure) throw failure.error;
  return results;
}

/**
 * Wraps `fn` so it runs only until it succeeds: calls made while it runs share that attempt, and
 * after a success every call gets the same result without running it again. A failure isn't
 * kept, so the next call tries again.
 */
export function onceUntilSuccess<T>(fn: () => Promise<T>): () => Promise<T> {
  let attempt: Promise<T> | undefined;
  return () => {
    attempt ??= new Promise<T>((resolve) => resolve(fn())).catch((error: unknown) => {
      attempt = undefined;
      throw error;
    });
    return attempt;
  };
}
