import type { ExtractionResult } from "../../types/upload";
import { GeminiLimitError, extractAssessmentsWithAI } from "./gemini";
import { ExtractedAssessment, UNKNOWN_COURSE, normalizeExtractedAssessment } from "./normalize";
import { extractAssessmentsBasic, extractCourseName } from "./textExtraction";

/**
 * A PDF's assessments from its text: Gemini's, or the regex fallback's when Gemini fails for any
 * reason but its limits (those are thrown). When neither finds one, a single placeholder flagged
 * for review, so the upload isn't silently empty.
 */
export async function assessmentsFromText(
  text: string,
  localDate: string,
): Promise<ExtractedAssessment[]> {
  let assessments: ExtractedAssessment[];
  try {
    assessments = await extractAssessmentsWithAI(text, localDate);
  } catch (error) {
    if (error instanceof GeminiLimitError) throw error;
    assessments = extractAssessmentsBasic(text, localDate);
  }
  if (assessments.length > 0) return assessments;
  return [
    normalizeExtractedAssessment(
      {},
      {
        fallbackCourseName: extractCourseName(text) ?? UNKNOWN_COURSE,
        fallbackAssignmentName: "Manual Review Required",
        localDate,
      },
    ),
  ];
}

/** Assessments per course, in the order the courses first appear, for the success modal. */
export function courseBreakdown(
  assessments: Pick<ExtractedAssessment, "courseName">[],
): NonNullable<ExtractionResult["courseBreakdown"]> {
  const counts = new Map<string, number>();
  for (const { courseName } of assessments) {
    counts.set(courseName, (counts.get(courseName) ?? 0) + 1);
  }
  return [...counts].map(([courseName, assessmentCount]) => ({ courseName, assessmentCount }));
}
