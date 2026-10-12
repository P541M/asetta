/**
 * Pure date math for the reminder cron (lib/notifications.ts): which reminders a run sends, and
 * when to look at a user again. Reminders go out at 9:30 in each user's own time zone (D4).
 *
 * A reminder belongs to a target day, N calendar days before the due date. From 9:30 that day, in
 * the user's zone, every run sends it until it has gone out (lib/reminderCron.ts keeps the record),
 * so a late or missed run catches up. The only module that imports the time zone library.
 */

import { TZDateMini } from "@date-fns/tz";
import { isValidTimeZone } from "../utils/timeZone";
import { RETRY_DELAY_MS } from "./reminderCron";
import { DEFAULT_DUE_TIME, parseDueDate, parseDueTime } from "./upload/normalize";

/** For users without a stored zone: everyone who hasn't signed in since A8. */
export const DEFAULT_TIME_ZONE = "America/Toronto";
const REMINDER_HOURS = 9;
const REMINDER_MINUTES = 30;
/**
 * How many days back a run still sends a reminder that hasn't gone out. Covers a failed send, a
 * missed run, and the daily Vercel backstop on its own (it runs before 9:30 in zones east of UTC+3,
 * so it sends the day before's reminders).
 */
const CATCH_UP_DAYS = 2;

export interface ReminderAssessment {
  id: string;
  dueDate: unknown;
  dueTime?: unknown;
  status?: unknown;
  needsReview?: unknown;
}

export interface ReminderSettings {
  daysBefore: number;
  notifySubmitted: boolean;
}

export interface DueReminder {
  assessmentId: string;
  /** The local day the reminder belongs to (YYYY-MM-DD); its record ID ends with it (A38). */
  targetDay: string;
  /** Calendar days from the user's local today to the due date, as the UI counts them. */
  daysUntilDue: number;
  dueDate: string;
  /** Padded 24-hour HH:MM. */
  dueTime: string;
}

/** A stored zone when it is a real one, else Toronto. */
export function resolveTimeZone(value: unknown): string {
  return isValidTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}

/** A stored YYYY-MM-DD that is a real calendar day (the upload normalizer's check), else null. */
const storedDate = (value: unknown): string | null =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDueDate(value) : null;

// Calendar arithmetic on YYYY-MM-DD strings, done in UTC so no zone or DST gets involved.
const dayToUtc = (day: string): number => {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
};
const addDays = (day: string, days: number): string =>
  new Date(dayToUtc(day) + days * 86_400_000).toISOString().slice(0, 10);
const daysBetween = (from: string, to: string): number =>
  Math.round((dayToUtc(to) - dayToUtc(from)) / 86_400_000);

/** The calendar day it is in `timeZone` at `now`, as YYYY-MM-DD. */
function localDay(now: Date, timeZone: string): string {
  const local = new TZDateMini(now.getTime(), timeZone);
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const date = String(local.getDate()).padStart(2, "0");
  return `${local.getFullYear()}-${month}-${date}`;
}

/** The instant of a wall-clock time on `day` in `timeZone` (a time skipped by DST moves later). */
function zonedInstant(day: string, hours: number, minutes: number, timeZone: string): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(new TZDateMini(year, month - 1, date, hours, minutes, timeZone).getTime());
}

const reminderSlot = (day: string, timeZone: string): Date =>
  zonedInstant(day, REMINDER_HOURS, REMINDER_MINUTES, timeZone);

/** The reminders a run at `now` should send for one user (records not yet checked). */
export function dueReminders({
  assessments,
  settings,
  timeZone,
  now,
}: {
  assessments: ReminderAssessment[];
  settings: ReminderSettings;
  timeZone: string;
  now: Date;
}): DueReminder[] {
  const today = localDay(now, timeZone);
  const earliest = addDays(today, -CATCH_UP_DAYS);
  const todaysSlotPassed = now.getTime() >= reminderSlot(today, timeZone).getTime();

  const reminders: DueReminder[] = [];
  for (const assessment of assessments) {
    if (assessment.needsReview) continue; // the date is a placeholder (B8)
    if (assessment.status === "Missed") continue;
    if (assessment.status === "Submitted" && !settings.notifySubmitted) continue;

    const dueDate = storedDate(assessment.dueDate);
    if (!dueDate) continue;
    const dueTime = parseDueTime(assessment.dueTime) ?? DEFAULT_DUE_TIME;
    const [hours, minutes] = dueTime.split(":").map(Number);
    if (now.getTime() >= zonedInstant(dueDate, hours, minutes, timeZone).getTime()) continue;

    const targetDay = addDays(dueDate, -settings.daysBefore);
    if (targetDay > today || targetDay < earliest) continue;
    if (targetDay === today && !todaysSlotPassed) continue;

    reminders.push({
      assessmentId: assessment.id,
      targetDay,
      daysUntilDue: daysBetween(today, dueDate),
      dueDate,
      dueTime,
    });
  }
  return reminders;
}

/** The `notifications/{id}` record for one reminder. */
export function reminderRecordId(uid: string, reminder: DueReminder): string {
  return `${uid}_${reminder.assessmentId}_${reminder.targetDay}`;
}

/**
 * When the cron should look at this user again (their `nextReminderAt`): the next 9:30 in their
 * zone after `now`, or sooner while a failed send waits for its retry.
 */
export function nextReminderRun(timeZone: string, now: Date, retryPending = false): Date {
  const today = localDay(now, timeZone);
  const todaysSlot = reminderSlot(today, timeZone);
  const nextSlot =
    todaysSlot.getTime() > now.getTime() ? todaysSlot : reminderSlot(addDays(today, 1), timeZone);
  if (!retryPending) return nextSlot;
  return new Date(Math.min(nextSlot.getTime(), now.getTime() + RETRY_DELAY_MS));
}
