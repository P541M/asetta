import { Assessment } from "../types/assessment";

export function generateICSFile(
  assessments: Assessment[],
  semesterName: string
): string {
  // ICS file header
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Asetta//${semesterName} Calendar//EN`,
    "CALSCALE:GREGORIAN",
  ];

  // Helper function to format date and time to ICS format (UTC)
  const formatICSDateTime = (dateStr: string, timeStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    const [hours, minutes] = timeStr.split(":");
    // Assuming local time, convert to UTC-like format without timezone (clients will interpret as local)
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  // Add each assessment as a VEVENT
  assessments.forEach((assessment) => {
    const startDateTime = formatICSDateTime(
      assessment.dueDate,
      assessment.dueTime
    );
    // For simplicity, set the event duration to 1 hour (arbitrary)
    const endDateTime = formatICSDateTime(
      assessment.dueDate,
      incrementHour(assessment.dueTime)
    );
    const uid = `${assessment.id}@kivo.app`; // Unique identifier
    const summary = `${assessment.courseName}: ${assessment.assignmentName}`;
    const description = `Weight: ${assessment.weight}%\nStatus: ${assessment.status}`;

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`, // Escape newlines
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT1H", // Reminder 1 hour before
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  // ICS file footer
  icsContent.push("END:VCALENDAR");

  // Join with CRLF (required by ICS spec)
  return icsContent.join("\r\n");
}

// Helper function to increment time by 1 hour
function incrementHour(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}
