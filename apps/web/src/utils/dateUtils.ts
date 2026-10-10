/**
 * Date utility functions for handling dates and times
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:MM) to a Date in the
 * viewer's own timezone. Never `new Date("YYYY-MM-DD")`: date-only strings parse
 * as UTC midnight, which lands on the wrong local day for most of the world.
 */
export const parseLocalDateTime = (dateStr: string, timeStr: string = "23:59"): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

/**
 * Formats a date string (YYYY-MM-DD) according to the user's locale
 */
export const formatLocalDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Formats a date string (YYYY-MM-DD) and time string (HH:MM) according to the user's locale
 */
export const formatLocalDateTime = (dateStr: string, timeStr: string = "23:59"): string => {
  const date = parseLocalDateTime(dateStr, timeStr);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

/**
 * Today's date as YYYY-MM-DD in the viewer's timezone (not UTC, unlike toISOString)
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Calendar days from `now` to the due date in the viewer's timezone: due
 * tomorrow is 1 whatever the hour. Negative once the due moment has passed,
 * including earlier the same day.
 */
export const getDaysUntil = (
  dateStr: string,
  timeStr: string = "23:59",
  now: Date = new Date(),
): number => {
  const dueDate = parseLocalDateTime(dateStr, timeStr);
  // Round, not floor: days either side of a DST change are 23 or 25 hours long
  const days = Math.round((startOfDay(dueDate).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
  return dueDate.getTime() < now.getTime() ? Math.min(days, -1) : days;
};
