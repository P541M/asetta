/**
 * One normalizer for every extracted assessment, whichever path read it (Gemini or the regex
 * fallback): a real calendar date or a review flag, a padded 24-hour time, a weight from 0 to 100,
 * and trimmed, length-capped names. Nothing here reads the clock.
 */

export interface ExtractedAssessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
  /** Set when no usable due date was found: `dueDate` is then the upload day, a placeholder. */
  needsReview?: true;
}

/** An assessment as an extractor found it: any field may be missing, mistyped or out of range. */
export interface RawExtractedAssessment {
  courseName?: unknown;
  assignmentName?: unknown;
  dueDate?: unknown;
  dueTime?: unknown;
  weight?: unknown;
}

/** How a document writes all-numeric dates: 10/15/2026 (MDY) or 15/10/2026 (DMY). */
export type DateOrder = "MDY" | "DMY";

export interface NormalizeOptions {
  /** Used when the assessment names no course. */
  fallbackCourseName: string;
  /** Used when the assessment has no name. */
  fallbackAssignmentName: string;
  /** The uploader's local today (YYYY-MM-DD): the placeholder date of a flagged assessment. */
  localDate: string;
  /** The document's numeric date order, from `detectDateOrder`. */
  dateOrder?: DateOrder;
}

export const UNKNOWN_COURSE = "Unknown Course";
export const DEFAULT_DUE_TIME = "23:59";
export const MAX_COURSE_NAME_LENGTH = 100;
export const MAX_ASSESSMENT_NAME_LENGTH = 200;

// Years outside this range are misreads (page numbers, ISBNs), not due dates.
const MIN_YEAR = 2000;
const MAX_YEAR = 2099;

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** 1-12 for a month name or an abbreviation of at least three letters ("Sept", "Mar."). */
const monthNumber = (word: string): number | null => {
  const lower = word.toLowerCase();
  if (lower.length < 3) return null;
  const index = MONTHS.findIndex((month) => month.startsWith(lower));
  return index === -1 ? null : index + 1;
};

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number): number =>
  month === 2 ? (isLeapYear(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;

/** YYYY-MM-DD for a real calendar date in range, else null (February 30, month 15). */
const toIsoDate = (year: number, month: number, day: number): string | null => {
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const fullYear = (year: string): number => Number(year.length === 2 ? `20${year}` : year);

const ISO_DATE = /(?<!\d)(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/;
const MONTH_FIRST = /\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*|\s+)(\d{4})\b/g;
const DAY_FIRST = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/g;
// Both separators must match, so "1.2-26" isn't a date.
const NUMERIC_DATE = /\b(\d{1,2})([-/.])(\d{1,2})\2(\d{4}|\d{2})\b/g;

/**
 * The order a numeric date's first two parts must be in: certain when one part is over 12, the
 * same either way when both are equal, and otherwise unknown (null).
 */
const numericOrder = (first: number, second: number): DateOrder | "either" | null => {
  if (first > 12 && second > 12) return null;
  if (first > 12) return "DMY";
  if (second > 12) return "MDY";
  return first === second ? "either" : null;
};

/**
 * The first date in `raw` as YYYY-MM-DD, or null when there is none or it isn't a real date.
 * Accepts ISO dates, month names and abbreviations in either order ("Sept 30, 2026",
 * "15 Mar. 2026"), and numeric dates. A numeric date whose day and month could swap
 * ("03/04/2026") is read in `order`; without one it is ambiguous and gives null (D10).
 */
export function parseDueDate(raw: unknown, order?: DateOrder): string | null {
  if (typeof raw !== "string") return null;

  const iso = raw.match(ISO_DATE);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  for (const match of raw.matchAll(MONTH_FIRST)) {
    const month = monthNumber(match[1]);
    if (month) return toIsoDate(Number(match[3]), month, Number(match[2]));
  }
  for (const match of raw.matchAll(DAY_FIRST)) {
    const month = monthNumber(match[2]);
    if (month) return toIsoDate(Number(match[3]), month, Number(match[1]));
  }

  const numeric = raw.matchAll(NUMERIC_DATE).next().value;
  if (!numeric) return null;
  const first = Number(numeric[1]);
  const second = Number(numeric[3]);
  const year = fullYear(numeric[4]);
  const certain = numericOrder(first, second);
  const resolved = certain === "either" ? "MDY" : (certain ?? order);
  if (!resolved) return null;
  return resolved === "MDY" ? toIsoDate(year, first, second) : toIsoDate(year, second, first);
}

/**
 * The document's numeric date order, when its dates settle it: one that can only be DD/MM
 * ("15/03/2026") makes the document DMY, one that can only be MM/DD makes it MDY. Undefined when
 * no date settles it, or when the dates disagree.
 */
export function detectDateOrder(text: string): DateOrder | undefined {
  const seen = new Set<DateOrder>();
  for (const match of text.matchAll(NUMERIC_DATE)) {
    const first = Number(match[1]);
    const second = Number(match[3]);
    const order = numericOrder(first, second);
    if (order !== "MDY" && order !== "DMY") continue;
    // Only a real date counts: "30/02/2026" settles nothing.
    const [month, day] = order === "MDY" ? [first, second] : [second, first];
    if (toIsoDate(fullYear(match[4]), month, day)) seen.add(order);
  }
  return seen.size === 1 ? [...seen][0] : undefined;
}

const TIME = /^(\d{1,2})(?:[:.](\d{2}))?\s*(?:([ap])\.?\s*m\b\.?)?/i;

/**
 * A due time as padded 24-hour HH:MM, from "23:59", "9:05", "11:59 PM", "11:59pm", "11.59 p.m."
 * or "9 AM". Null for anything else, including a bare hour and out-of-range values.
 */
export function parseDueTime(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(TIME);
  if (!match) return null;
  const [, hourText, minuteText, meridiem] = match;
  if (minuteText === undefined && meridiem === undefined) return null;

  let hours = Number(hourText);
  const minutes = minuteText === undefined ? 0 : Number(minuteText);
  if (minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    const pm = meridiem.toLowerCase() === "p";
    hours = (hours % 12) + (pm ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** A weight as a number from 0 to 100 with at most two decimals; missing or unreadable is 0. */
export function parseWeight(raw: unknown): number {
  let weight = NaN;
  if (typeof raw === "number") weight = raw;
  else if (typeof raw === "string") weight = Number(raw.match(/-?\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(weight)) return 0;
  return Math.round(Math.min(100, Math.max(0, weight)) * 100) / 100;
}

/** Text with its whitespace collapsed and trimmed, cut to `maxLength` characters; "" if not text. */
export function cleanText(raw: unknown, maxLength: number): string {
  if (typeof raw !== "string") return "";
  const collapsed = raw.replace(/\s+/g, " ").trim();
  // Count code points, so the cut never splits an emoji or other surrogate pair.
  const characters = Array.from(collapsed);
  return characters.length <= maxLength
    ? collapsed
    : characters.slice(0, maxLength).join("").trimEnd();
}

/**
 * The single shape every extracted assessment is stored in. An assessment without a usable due
 * date is kept, dated `localDate` and flagged `needsReview`, so the student can fix it.
 */
export function normalizeExtractedAssessment(
  raw: RawExtractedAssessment,
  options: NormalizeOptions,
): ExtractedAssessment {
  const dueDate = parseDueDate(raw.dueDate, options.dateOrder);
  return {
    courseName:
      cleanText(raw.courseName, MAX_COURSE_NAME_LENGTH) ||
      cleanText(options.fallbackCourseName, MAX_COURSE_NAME_LENGTH) ||
      UNKNOWN_COURSE,
    assignmentName:
      cleanText(raw.assignmentName, MAX_ASSESSMENT_NAME_LENGTH) ||
      cleanText(options.fallbackAssignmentName, MAX_ASSESSMENT_NAME_LENGTH),
    dueDate: dueDate ?? options.localDate,
    dueTime: parseDueTime(raw.dueTime) ?? DEFAULT_DUE_TIME,
    weight: parseWeight(raw.weight),
    status: "Not started",
    ...(dueDate ? {} : { needsReview: true }),
  };
}

/**
 * The uploader's local today as sent by the upload form, or null when it isn't a real
 * YYYY-MM-DD date within a day of `now`'s UTC date (every time zone's today is).
 */
export function parseLocalDate(raw: unknown, now: Date): string | null {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = parseDueDate(raw);
  if (date !== raw) return null;
  const [year, month, day] = date.split("-").map(Number);
  const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = (Date.UTC(year, month - 1, day) - utcToday) / 86_400_000;
  return Math.abs(days) <= 1 ? date : null;
}
