/** Whether `zone` is an IANA time zone this runtime knows ("America/Toronto", "UTC"). */
export function isValidTimeZone(zone: unknown): zone is string {
  if (typeof zone !== "string" || zone === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** The browser's IANA zone, saved on the user doc for reminders at 9:30 local (A8); null if unusable. */
export function browserTimeZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(zone) ? zone : null;
  } catch {
    return null;
  }
}
