import { useEffect, useState } from "react";

const TICK_MS = 60_000;

/**
 * The current time as state, so due-date labels stay true on a page left open:
 * nothing else re-renders them when a deadline passes or the day rolls over.
 * Timers pause while a laptop sleeps, so waking the tab refreshes immediately.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const interval = setInterval(tick, TICK_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return now;
}
