import { Assessment } from "../types/assessment";

export function generateICSFile(
  assessments: Assessment[],
  semesterName: string,
  now: Date = new Date(),
): string {
  // DTSTAMP is when the file was made, the same for every event
  const stamp = formatUTCStamp(now);

  // ICS file header
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Asetta//${escapeText(semesterName)} Calendar//EN`,
    "CALSCALE:GREGORIAN",
  ];

  // Add each assessment as a VEVENT
  assessments.forEach((assessment) => {
    const startDateTime = formatFloatingDateTime(assessment.dueDate, assessment.dueTime);
    // One hour long; a late due time ends on the next day
    const endDateTime = formatFloatingDateTime(assessment.dueDate, assessment.dueTime, 1);
    // Calendars match re-imported events by UID: changing the domain duplicates them (D9)
    const uid = `${assessment.id}@asetta.app`;
    const summary = `${assessment.courseName}: ${assessment.assignmentName}`;
    const description = `Weight: ${assessment.weight}%\nStatus: ${assessment.status}`;

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT1H", // Reminder 1 hour before
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT",
    );
  });

  // ICS file footer
  icsContent.push("END:VCALENDAR");

  // Join with CRLF (required by ICS spec)
  return icsContent.map(foldLine).join("\r\n");
}

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

/**
 * A stored due date and time, plus `addHours`, as floating local time ("20261015T235900"),
 * which calendar apps read in the viewer's own zone. The math runs in UTC because floating
 * time has no zone: going through the local zone (parseLocalDateTime) would let a DST gap
 * move it.
 */
function formatFloatingDateTime(dateStr: string, timeStr: string, addHours = 0): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const moment = new Date(Date.UTC(year, month - 1, day, hours + addHours, minutes));
  return (
    `${pad(moment.getUTCFullYear(), 4)}${pad(moment.getUTCMonth() + 1)}${pad(moment.getUTCDate())}` +
    `T${pad(moment.getUTCHours())}${pad(moment.getUTCMinutes())}00`
  );
}

/** A moment as a UTC stamp ("20261011T160509Z"), the form DTSTAMP requires. */
const formatUTCStamp = (date: Date) =>
  date
    .toISOString()
    .replace(/\.\d{3}/, "")
    .replace(/[-:]/g, "");

/** Escapes a TEXT value (RFC 5545, 3.3.11): backslash, semicolon, comma and newlines. */
const escapeText = (value: string) =>
  value.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r\n|\r|\n/g, "\\n");

const encoder = new TextEncoder();
const MAX_LINE_OCTETS = 75;

/**
 * Folds a content line longer than 75 octets (RFC 5545, 3.1): each continuation line
 * starts with a space, and a multi-byte character is never split.
 */
function foldLine(line: string): string {
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) return line;

  const parts: string[] = [];
  let part = "";
  let partOctets = 0;
  // The first line holds 75 octets; continuations hold 74 after their leading space
  let limit = MAX_LINE_OCTETS;
  for (const char of line) {
    const octets = encoder.encode(char).length;
    if (partOctets + octets > limit) {
      parts.push(part);
      part = "";
      partOctets = 0;
      limit = MAX_LINE_OCTETS - 1;
    }
    part += char;
    partOctets += octets;
  }
  parts.push(part);
  return parts.join("\r\n ");
}
