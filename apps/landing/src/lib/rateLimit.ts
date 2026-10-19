/**
 * A per-key sliding-window limit held in memory (the contact form's per-IP limit, A20).
 *
 * On Vercel the state lives in one function instance: a warm instance serves many requests in a
 * row, so this stops one client resubmitting in a loop, but a cold start forgets it and parallel
 * instances count separately. It slows abuse; it is not a hard cap, which needs a shared store.
 */

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export interface RateLimiter {
  /** Counts a hit for `key` at `now` (ms) when it is allowed; a refused hit isn't counted. */
  hit(key: string, now: number): RateLimitDecision;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  /** Past this many keys the expired ones are dropped, then the oldest, so memory stays bounded. */
  maxKeys?: number;
}): RateLimiter {
  // Each key's hit times inside the window, oldest first. A Map keeps insertion order, which is
  // the order keys first hit, so the first entries are the oldest to drop.
  const hits = new Map<string, number[]>();

  const prune = (now: number) => {
    for (const [key, times] of hits) {
      if (times[times.length - 1] <= now - windowMs) hits.delete(key);
    }
    for (const key of hits.keys()) {
      if (hits.size < maxKeys) break;
      hits.delete(key);
    }
  };

  return {
    hit(key, now) {
      const recent = (hits.get(key) ?? []).filter((time) => time > now - windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)),
        };
      }
      if (!hits.has(key) && hits.size >= maxKeys) prune(now);
      recent.push(now);
      hits.set(key, recent);
      return { allowed: true };
    },
  };
}

/**
 * The client's IP. Vercel sets `x-forwarded-for` to it and drops any value the client sent, so it
 * can't be spoofed there; elsewhere (local runs) the first entry or the socket's address.
 */
export function clientIp(
  forwardedFor: string | string[] | undefined,
  socketAddress: string | undefined,
): string {
  const header = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return header?.split(",")[0]?.trim() || socketAddress || "unknown";
}
