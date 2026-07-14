import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedAssessment, extractCourseName, formatDate } from "./textExtraction";

async function extractAssessmentsAI(text: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Get current year for date defaulting
  const currentYear = new Date().getFullYear();

  const prompt = `
    You are an AI assistant that extracts assessment information from course outlines.
    Extract assessment information from this course outline. Return ONLY a valid JSON array with this structure:
    {
      "courseName": "Course code and name",
      "assignmentName": "Assessment name and type",
      "dueDate": "YYYY-MM-DD format",
      "dueTime": "HH:MM format (24-hour), use '23:59' if not specified",
      "weight": "Numeric percentage weight",
      "status": "Not started"
    }

    Only include assessments that have clear due dates or deadline information. Extract as many assessments as you can find. If no time is specified, use '23:59' as the default.

    DATE YEAR DEFAULTING - VERY IMPORTANT:
    - If a date has no year specified (e.g., "March 15", "12/25", "Sept 30"), default to ${currentYear}
    - Only use a different year if explicitly stated in the document
    - Examples:
      * "March 15" → "${currentYear}-03-15" (using current year)
      * "Dec 25" → "${currentYear}-12-25" (using current year)
      * "March 15, 2025" → "2025-03-15" (year explicitly specified)
      * "Assignment due September 20" → "${currentYear}-09-20" (using current year)
    - For dates that seem to be in the past within the current year, consider if they should be the following year
    - Always convert to YYYY-MM-DD format using the defaulted or specified year

    WEIGHT EXTRACTION - Look for these patterns:
    - "25%" → weight: 25
    - "30% of final grade" → weight: 30
    - "50 points out of 200 total" → weight: 25
    - "1/4 of course grade" → weight: 25
    - If no weight found → weight: 0

    ASSESSMENT GROUPING - Handle grouped assessments correctly:
    - If you see "Quizzes: 20%" and extract 5 quizzes, each quiz = 20 ÷ 5 = 4%
    - If you see "Assignments: 40%" and extract 4 assignments, each = 40 ÷ 4 = 10%
    - Look for patterns like: "Category: X%" followed by multiple items
    - Keywords indicating groups: "all quizzes", "total quiz grade", "combined weight"
    - If individual weights are specified (e.g., "Quiz 1: 5%, Quiz 2: 5%"), use those instead

    WEIGHT DISTRIBUTION RULES:
    1. Check if multiple assessments share a category with one percentage
    2. If yes, divide the category percentage by the number of assessments in that category
    3. If individual percentages are specified, use those directly
    4. Ensure total course weight is reasonable (typically 90-110% accounting for rounding)
    5. Round distributed weights to whole numbers or one decimal place

    COMMON PHRASING PATTERNS TO RECOGNIZE:
    - "Quizzes (10 total): 20%" = Each quiz worth 2%
    - "Weekly assignments: 30%" = Divide 30% by number of weekly assignments
    - "Lab reports: 25% total" = All lab reports combined = 25%
    - "Midterm 1: 15%, Midterm 2: 15%" = Each specified individually
    - "Participation and attendance: 10%" = Single assessment worth 10%
    - "Final project components: 40%" = Divide among project parts

    VALIDATION REQUIREMENTS:
    - Verify total course weight is reasonable (typically 90-110%)
    - If total weight exceeds 120%, likely error in grouping logic
    - If individual assessment > 50%, verify it's actually one major assessment
    - Double-check math: group percentage ÷ number of items = individual weight

    REQUIREMENTS:
    - Only extract assessments with clear due dates
    - Include exams, assignments, quizzes, labs, projects
    - Convert all dates to YYYY-MM-DD format (defaulting to ${currentYear} if no year specified)
    - Return ONLY the JSON array, no explanations
    - No markdown formatting

    Course outline text:
    ${text}

    JSON array:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    // Handle rate limiting and quota exhaustion specifically
    const errorMessage = error instanceof Error ? error.message : "";
    const errorObj = error as { status?: number };
    const errorStatus = errorObj.status;

    if (errorStatus === 429 || errorMessage.includes("429")) {
      // Check for daily quota exhaustion vs temporary rate limiting
      if (
        errorMessage.includes("quota exceeded") ||
        errorMessage.includes("quota exhausted") ||
        errorMessage.includes("daily limit") ||
        errorMessage.includes("QUOTA_EXCEEDED")
      ) {
        throw new Error("DAILY_QUOTA_EXCEEDED");
      } else {
        // Temporary rate limiting
        throw new Error("RATE_LIMITED");
      }
    } else if (
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("QUOTA_EXCEEDED")
    ) {
      // Additional quota checks for non-429 errors
      if (
        errorMessage.includes("quota exceeded") ||
        errorMessage.includes("quota exhausted") ||
        errorMessage.includes("daily limit")
      ) {
        throw new Error("DAILY_QUOTA_EXCEEDED");
      } else {
        throw new Error("RATE_LIMITED");
      }
    }
    throw error;
  }
}

/**
 * Runs AI extraction over the PDF text and returns validated assessments.
 * Throws "DAILY_QUOTA_EXCEEDED" / "RATE_LIMITED" for quota problems (handled
 * specially by the route); any other throw makes the route fall back to the
 * regex-based extraction.
 */
export async function extractAssessmentsWithAI(
  extractedText: string,
): Promise<ExtractedAssessment[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API not configured");
  }

  const aiContent = await extractAssessmentsAI(extractedText);

  // Clean up the AI response to extract JSON
  let jsonString = aiContent.trim();

  // Remove markdown code blocks if present
  jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");

  // Try to extract JSON array from response
  const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonString = jsonMatch[0];
  }

  let parsedAssessments;
  try {
    parsedAssessments = JSON.parse(jsonString);
  } catch {
    throw new Error(`Failed to parse AI response as JSON`);
  }

  // Validate and clean the parsed assessments
  if (!Array.isArray(parsedAssessments)) {
    throw new Error("AI response is not an array");
  }

  return parsedAssessments
    .map((assessment, index) => {
      // Validate required fields
      if (!assessment || typeof assessment !== "object") {
        return null;
      }

      const courseName =
        assessment.courseName || extractCourseName(extractedText) || "Unknown Course";
      const assignmentName = assessment.assignmentName || `Assessment ${index + 1}`;
      const dueDate = formatDate(assessment.dueDate) || new Date().toISOString().split("T")[0];
      const dueTime = assessment.dueTime || "23:59";
      const weight =
        typeof assessment.weight === "number"
          ? assessment.weight
          : parseFloat(assessment.weight) || 0;

      // Basic validation
      if (!courseName || !assignmentName || !dueDate) {
        return null;
      }

      return {
        courseName,
        assignmentName,
        dueDate,
        dueTime,
        weight,
        status: "Not started",
      } as ExtractedAssessment;
    })
    .filter((assessment): assessment is ExtractedAssessment => assessment !== null);
}
