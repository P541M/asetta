/**
 * Regex-based fallback extraction used when AI extraction is unavailable or fails.
 * All patterns moved verbatim from the upload API route.
 */

export interface ExtractedAssessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
}

export function extractAssessmentsBasic(extractedText: string): ExtractedAssessment[] {
  const assessments: ExtractedAssessment[] = [];
  const assignmentPattern =
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)\s*[-:\.]*\s*([Dd]ue|[Dd]eadline|[Ss]ubmission)?\s*[-:\.]*\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s*\d{4})(\s*at\s*(\d{1,2}:\d{2}\s*[APap][Mm])|\s*(\d{1,2}:\d{2}))?/gi;
  const sections = extractedText.split(/\n{2,}/);
  let match;
  while ((match = assignmentPattern.exec(extractedText)) !== null) {
    const timeMatch = match[6] || match[7];
    const dueTime = extractTime(timeMatch) || "23:59";
    assessments.push({
      courseName: extractCourseName(extractedText) || "Unknown Course",
      assignmentName: `${match[1]} ${match[2] || ""}`.trim(),
      dueDate: formatDate(match[4]),
      dueTime,
      weight: extractWeight(extractedText, match[0]) || 0,
      status: "Not started",
    });
  }

  if (assessments.length === 0) {
    for (const section of sections) {
      if (
        /assessment|assignment|quiz|exam|test|grading|evaluation|project|paper|due date|deadline/i.test(
          section,
        ) &&
        /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s*\d{4}/i.test(section)
      ) {
        const date = extractDate(section);
        const time = extractTimeFromSection(section) || "23:59";
        assessments.push({
          courseName: extractCourseName(extractedText) || "Unknown Course",
          assignmentName:
            extractAssignmentName(section) ||
            "Assignment from " + section.slice(0, 30).trim() + "...",
          dueDate: date || new Date().toISOString().split("T")[0],
          dueTime: time,
          weight: extractWeight(section) || 0,
          status: "Not started",
        });
      }
    }
  }
  return assessments;
}

export function extractCourseName(text: string): string | null {
  const courseCodePattern = /([A-Z]{2,4})\s*(\d{3,4}[A-Z]*)/i;
  const match = text.match(courseCodePattern);
  if (match) return `${match[1]}${match[2]}`;
  const courseTitlePattern = /[Cc]ourse\s*(?:[Tt]itle)?:?\s*([A-Za-z0-9\s&]+)/;
  const titleMatch = text.match(courseTitlePattern);
  if (titleMatch) return titleMatch[1].trim();
  return null;
}

function extractDate(text: string): string | null {
  const datePatterns = [
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
    /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
    /(\w+\s+\d{1,2},?\s*\d{4})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return formatDate(match[1]);
  }
  return null;
}

function extractAssignmentName(text: string): string | null {
  const patterns = [
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)\s*:?\s*([^.]*)/,
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[3]) return `${match[1]} ${match[2] || ""}: ${match[3]}`.trim();
      return `${match[1]} ${match[2] || ""}`.trim();
    }
  }
  return null;
}

function extractWeight(text: string, context?: string): number | null {
  if (context) {
    const contextIndex = text.indexOf(context);
    if (contextIndex !== -1) {
      const searchArea = text.substring(contextIndex, contextIndex + 200);
      const weightPattern =
        /(\d{1,3})%|\((\d{1,3})%\)|\[(\d{1,3})%\]|worth\s+(\d{1,3})%|weighted\s+(\d{1,3})%/i;
      const match = searchArea.match(weightPattern);
      if (match) {
        for (let i = 1; i < match.length; i++) {
          if (match[i]) return parseInt(match[i]);
        }
      }
    }
  }
  const weightPattern =
    /(\d{1,3})%|\((\d{1,3})%\)|\[(\d{1,3})%\]|worth\s+(\d{1,3})%|weighted\s+(\d{1,3})%/i;
  const match = text.match(weightPattern);
  if (match) {
    for (let i = 1; i < match.length; i++) {
      if (match[i]) return parseInt(match[i]);
    }
  }
  return null;
}

export function formatDate(dateStr: string): string {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const monthNamePattern = /(\w+)\s+(\d{1,2}),?\s*(\d{4})/i;
    const monthNameMatch = dateStr.match(monthNamePattern);
    if (monthNameMatch) {
      const monthNames = [
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
      const month = monthNames.findIndex((m) => m === monthNameMatch[1].toLowerCase()) + 1;
      if (month > 0) {
        const day = parseInt(monthNameMatch[2]);
        const year = parseInt(monthNameMatch[3]);
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      }
    }
    const parts = dateStr.split(/[\/-]/);
    if (parts.length === 3) {
      let month, day, year;
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) {
        month = parts[0];
        day = parts[1];
        year = parts[2];
      } else {
        month = parts[0];
        day = parts[1];
        year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      }
      month = month.padStart(2, "0");
      day = day.padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateStr;
  }
}

function extractTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const timePattern = /(\d{1,2}:\d{2})\s*([APap][Mm])?/i;
  const match = timeStr.match(timePattern);
  if (match) {
    const timeParts = match[1].split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const period = match[2] ? match[2].toUpperCase() : "";
    if (period) {
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return null;
}

function extractTimeFromSection(section: string): string | null {
  const timePattern = /(\d{1,2}:\d{2})\s*([APap][Mm])?|at\s*(\d{1,2}:\d{2})/i;
  const match = section.match(timePattern);
  if (match) {
    const timeStr = match[1] || match[3];
    const period = match[2] ? match[2].toUpperCase() : "";
    const timeParts = timeStr.split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (period) {
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return null;
}
