/**
 * Regex-based fallback extraction used when AI extraction is unavailable or fails. It finds the
 * raw text of each assessment; `normalizeExtractedAssessment` turns that into the stored shape.
 */
import {
  ExtractedAssessment,
  RawExtractedAssessment,
  UNKNOWN_COURSE,
  detectDateOrder,
  normalizeExtractedAssessment,
} from "./normalize";

// A date as a syllabus writes it: numeric, or with a month name or abbreviation either side of
// the day ("Sept. 30, 2026", "15 March 2026"). ISO comes first, and a numeric date never starts
// inside a longer number, so "2026-10-15" is never read as "26-10-15".
const DATE_TEXT =
  "\\d{4}[\\/-]\\d{1,2}[\\/-]\\d{1,2}|(?<!\\d)\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}|\\w+\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s*\\d{4}|\\d{1,2}\\s+[A-Za-z]+\\.?,?\\s+\\d{4}";

const HAS_DATE = new RegExp(DATE_TEXT, "i");

export function extractAssessmentsBasic(
  extractedText: string,
  localDate: string,
): ExtractedAssessment[] {
  const found: RawExtractedAssessment[] = [];
  const assignmentPattern = new RegExp(
    `([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\\s*(\\d*)\\s*[-:\\.]*\\s*([Dd]ue|[Dd]eadline|[Ss]ubmission)?\\s*[-:\\.]*\\s*(${DATE_TEXT})(\\s*at\\s*(\\d{1,2}:\\d{2}\\s*[APap][Mm])|\\s*(\\d{1,2}:\\d{2}))?`,
    "gi",
  );
  const sections = extractedText.split(/\n{2,}/);
  let match;
  while ((match = assignmentPattern.exec(extractedText)) !== null) {
    found.push({
      assignmentName: `${match[1]} ${match[2] || ""}`,
      dueDate: match[4],
      dueTime: match[6] || match[7],
      weight: extractWeight(extractedText, match[0]),
    });
  }

  if (found.length === 0) {
    for (const section of sections) {
      if (
        /assessment|assignment|quiz|exam|test|grading|evaluation|project|paper|due date|deadline/i.test(
          section,
        ) &&
        HAS_DATE.test(section)
      ) {
        found.push({
          assignmentName:
            extractAssignmentName(section) ||
            "Assignment from " + section.slice(0, 30).trim() + "...",
          dueDate: extractDate(section),
          dueTime: extractTimeFromSection(section),
          weight: extractWeight(section),
        });
      }
    }
  }

  const options = {
    fallbackCourseName: extractCourseName(extractedText) ?? UNKNOWN_COURSE,
    fallbackAssignmentName: "Assessment",
    localDate,
    dateOrder: detectDateOrder(extractedText),
  };
  return found.map((raw) => normalizeExtractedAssessment(raw, options));
}

// Term words that, in capitals and before a year ("FALL 2026"), look like a course code.
const TERM_WORDS = new Set(["FALL", "WINTER", "SPRING", "SUMMER", "AUTUMN"]);

/**
 * The first course code in the text ("CIS 3760", "CIS*3760", "MATH1010A"), as "CIS3760". Codes are
 * capitals at a word boundary, so "Winter 2027" never reads as "nter2027". Without a code, the
 * text after "Course:" or "Course title:".
 */
export function extractCourseName(text: string): string | null {
  for (const match of text.matchAll(/\b([A-Z]{2,4})[\s*-]?(\d{3,4}[A-Z]*)\b/g)) {
    if (TERM_WORDS.has(match[1]) && /^\d{4}$/.test(match[2])) continue;
    return `${match[1]}${match[2]}`;
  }
  const courseTitlePattern = /[Cc]ourse\s*(?:[Tt]itle)?:?\s*([A-Za-z0-9\s&]+)/;
  const titleMatch = text.match(courseTitlePattern);
  if (titleMatch) return titleMatch[1].trim();
  return null;
}

function extractDate(text: string): string | undefined {
  const datePatterns = [
    /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
    /(?<!\d)(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
    /(\w+\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})/,
    /(\d{1,2}\s+[A-Za-z]+\.?,?\s+\d{4})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return undefined;
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

const WEIGHT_PATTERN =
  /(\d{1,3}(?:\.\d+)?)\s?%|worth\s+(\d{1,3}(?:\.\d+)?)\s?%|weighted\s+(\d{1,3}(?:\.\d+)?)\s?%/i;

const findWeight = (text: string): string | undefined => {
  const match = text.match(WEIGHT_PATTERN);
  return match?.slice(1).find(Boolean);
};

function extractWeight(text: string, context?: string): string | undefined {
  if (context) {
    const contextIndex = text.indexOf(context);
    if (contextIndex !== -1) {
      const weight = findWeight(text.substring(contextIndex, contextIndex + 200));
      if (weight) return weight;
    }
  }
  return findWeight(text);
}

function extractTimeFromSection(section: string): string | undefined {
  return section.match(/\d{1,2}:\d{2}(?:\s*[ap]\.?\s*m\b\.?)?/i)?.[0];
}
