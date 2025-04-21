/**
 * Date utility functions for consistent timezone handling
 */

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:MM) to a Date object
 * in the user's local timezone
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
 * Calculates the number of days between now and a given date
 */
export const getDaysUntil = (dateStr: string, timeStr: string = "23:59"): number => {
  const dueDate = parseLocalDateTime(dateStr, timeStr);
  const now = new Date();
  return Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Checks if a date is upcoming (within the next 7 days)
 */
export const isUpcoming = (dateStr: string, timeStr: string = "23:59"): boolean => {
  const daysUntil = getDaysUntil(dateStr, timeStr);
  return daysUntil >= 0 && daysUntil <= 7;
};

/**
 * Converts a local date and time to UTC for storage
 */
export const localToUTC = (dateStr: string, timeStr: string = "23:59"): { date: string, time: string } => {
  const localDate = parseLocalDateTime(dateStr, timeStr);
  const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
  
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getUTCDate()).padStart(2, "0");
  const hours = String(utcDate.getUTCHours()).padStart(2, "0");
  const minutes = String(utcDate.getUTCMinutes()).padStart(2, "0");
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

/**
 * Converts a UTC date and time to local for display
 */
export const utcToLocal = (utcDateStr: string, utcTimeStr: string = "23:59"): { date: string, time: string } => {
  // Create a UTC date object
  const [year, month, day] = utcDateStr.split("-").map(Number);
  const [hours, minutes] = utcTimeStr.split(":").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  
  // Convert to local
  const localDate = new Date(utcDate);
  
  const localYear = localDate.getFullYear();
  const localMonth = String(localDate.getMonth() + 1).padStart(2, "0");
  const localDay = String(localDate.getDate()).padStart(2, "0");
  const localHours = String(localDate.getHours()).padStart(2, "0");
  const localMinutes = String(localDate.getMinutes()).padStart(2, "0");
  
  return {
    date: `${localYear}-${localMonth}-${localDay}`,
    time: `${localHours}:${localMinutes}`
  };
}; 