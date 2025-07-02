/**
 * Date utility functions for handling dates and times
 */

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:MM) to a Date object
 */
const parseLocalDateTime = (
  dateStr: string,
  timeStr: string = "23:59"
): Date => {
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
export const formatLocalDateTime = (
  dateStr: string,
  timeStr: string = "23:59"
): string => {
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
 * Calculates the number of days between now and a given date
 */
export const getDaysUntil = (
  dateStr: string,
  timeStr: string = "23:59"
): number => {
  const dueDate = parseLocalDateTime(dateStr, timeStr);
  const now = new Date();
  return Math.floor(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Checks if a date is upcoming (within the next 7 days)
 */
export const isUpcoming = (
  dateStr: string,
  timeStr: string = "23:59"
): boolean => {
  const daysUntil = getDaysUntil(dateStr, timeStr);
  return daysUntil >= 0 && daysUntil <= 7;
};

