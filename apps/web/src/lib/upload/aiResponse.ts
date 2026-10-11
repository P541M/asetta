import {
  ExtractedAssessment,
  UNKNOWN_COURSE,
  detectDateOrder,
  normalizeExtractedAssessment,
} from "./normalize";
import { extractCourseName } from "./textExtraction";

/**
 * The JSON array in Gemini's reply. The reply is asked to be bare JSON, but may still come wrapped
 * in a Markdown fence or in prose, and the prose may hold brackets of its own ("[1] item"), so
 * each "[" is tried in turn against the last "]".
 */
const tryParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const findJsonArray = (aiContent: string): unknown[] => {
  const text = aiContent.replace(/```(?:json)?/gi, "").trim();
  const whole = tryParse(text);
  if (Array.isArray(whole)) return whole;

  const end = text.lastIndexOf("]");
  for (let start = text.indexOf("["); start !== -1 && start < end;) {
    const parsed = tryParse(text.slice(start, end + 1));
    if (Array.isArray(parsed)) return parsed;
    start = text.indexOf("[", start + 1);
  }
  throw new Error(
    whole === undefined ? "Failed to parse AI response as JSON" : "AI response is not an array",
  );
};

/**
 * Turns Gemini's reply into assessments, each normalized like the regex fallback's. Throws when
 * the reply holds no JSON array, so the route falls back to the regex extraction.
 */
export function parseAiAssessments(
  aiContent: string,
  extractedText: string,
  localDate: string,
): ExtractedAssessment[] {
  const fallbackCourseName = extractCourseName(extractedText) ?? UNKNOWN_COURSE;
  const dateOrder = detectDateOrder(extractedText);
  const assessments: ExtractedAssessment[] = [];
  findJsonArray(aiContent).forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    assessments.push(
      normalizeExtractedAssessment(item, {
        fallbackCourseName,
        fallbackAssignmentName: `Assessment ${index + 1}`,
        localDate,
        dateOrder,
      }),
    );
  });
  return assessments;
}
