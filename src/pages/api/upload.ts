import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { getAdmin } from "../../lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface Assessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
}

async function extractAssessmentsAI(text: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    - Convert all dates to YYYY-MM-DD format
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
    // Handle rate limiting specifically
    const errorMessage = error instanceof Error ? error.message : "";
    const errorObj = error as { status?: number };
    const errorStatus = errorObj.status;
    if (
      errorStatus === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit")
    ) {
      throw new Error("RATE_LIMITED");
    }
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const parseForm = (
    req: NextApiRequest
  ): Promise<{ fields: Fields; files: Files }> => {
    return new Promise((resolve, reject) => {
      const form = new IncomingForm({
        multiples: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        filter: ({ mimetype }) => mimetype === "application/pdf",
      });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
  };

  try {
    const { fields, files } = await parseForm(req);
    const semesterIdField = fields.semesterId;
    const semesterId = Array.isArray(semesterIdField)
      ? semesterIdField[0]
      : semesterIdField;
    if (!semesterId) {
      return res
        .status(400)
        .json({ success: false, error: "Semester ID is required" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];
    const admin = await getAdmin();
    let userId;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch {
      return res
        .status(401)
        .json({ success: false, error: "Invalid authentication token" });
    }

    const adminDb = admin.firestore();
    // Verify the semester exists by checking if we can access it
    const semesterRef = adminDb.doc(`users/${userId}/semesters/${semesterId}`);
    const semesterDoc = await semesterRef.get();
    if (!semesterDoc.exists) {
      return res
        .status(400)
        .json({ success: false, error: "Semester not found" });
    }

    const uploadedFiles: formidable.File[] = [];
    Object.keys(files).forEach((key) => {
      const file = files[key];
      if (Array.isArray(file)) {
        uploadedFiles.push(...file);
      } else if (file) {
        uploadedFiles.push(file);
      }
    });
    if (uploadedFiles.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No valid files were uploaded" });
    }

    let totalAssessments = 0;
    let processedFiles = 0;
    let failedFiles = 0;
    const errors: string[] = [];
    const courseBreakdown: Array<{
      courseName: string;
      assessmentCount: number;
    }> = [];
    const processingStartTime = Date.now();

    for (const fileData of uploadedFiles) {
      try {
        const filePath = fileData.filepath;
        const fileName = fileData.originalFilename || "unknown.pdf";
        const pdfBuffer = fs.readFileSync(filePath);
        let extractedText: string;
        try {
          const data = await pdfParse(pdfBuffer);
          extractedText = data.text;
        } catch {
          failedFiles++;
          errors.push(`Failed to parse PDF: ${fileName}`);
          continue;
        }

        let assessments: Assessment[] = [];
        try {
          if (process.env.GEMINI_API_KEY) {
            const aiContent = await extractAssessmentsAI(extractedText);

            // Clean up the AI response to extract JSON
            let jsonString = aiContent.trim();

            // Remove markdown code blocks if present
            jsonString = jsonString
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "");

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

            assessments = parsedAssessments
              .map((assessment, index) => {
                // Validate required fields
                if (!assessment || typeof assessment !== "object") {
                  return null;
                }

                const courseName =
                  assessment.courseName ||
                  extractCourseName(extractedText) ||
                  "Unknown Course";
                const assignmentName =
                  assessment.assignmentName || `Assessment ${index + 1}`;
                const dueDate =
                  formatDate(assessment.dueDate) ||
                  new Date().toISOString().split("T")[0];
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
                  status: "Not started" as const,
                } as Assessment;
              })
              .filter(
                (assessment): assessment is Assessment => assessment !== null
              );
          } else {
            throw new Error("Gemini API not configured");
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "";
          if (errorMessage === "RATE_LIMITED") {
            failedFiles++;
            errors.push(
              `Rate limit exceeded: ${fileName}. Please wait a moment and try again.`
            );
            continue;
          }
          // Fall back to basic extraction
          assessments = extractAssessmentsBasic(extractedText);
        }

        if (assessments.length === 0) {
          assessments.push({
            courseName: extractCourseName(extractedText) || "Unknown Course",
            assignmentName: "Manual Review Required",
            dueDate: new Date().toISOString().split("T")[0],
            dueTime: "23:59",
            weight: 0,
            status: "Not started",
          });
        }

        const assessmentsRef = adminDb.collection(
          `users/${userId}/semesters/${semesterId}/assessments`
        );
        const batch = adminDb.batch();
        for (const assessment of assessments) {
          const newAssessmentRef = assessmentsRef.doc();
          batch.set(newAssessmentRef, {
            ...assessment,
            createdAt: new Date(),
            sourceFile: fileName,
          });
        }
        await batch.commit();

        totalAssessments += assessments.length;
        processedFiles++;

        // Track course breakdown for the success modal
        if (assessments.length > 0) {
          const courseNames = [
            ...new Set(assessments.map((a) => a.courseName)),
          ];
          courseNames.forEach((courseName) => {
            const courseAssessments = assessments.filter(
              (a) => a.courseName === courseName
            );
            const existingCourse = courseBreakdown.find(
              (c) => c.courseName === courseName
            );
            if (existingCourse) {
              existingCourse.assessmentCount += courseAssessments.length;
            } else {
              courseBreakdown.push({
                courseName,
                assessmentCount: courseAssessments.length,
              });
            }
          });
        }
      } catch {
        failedFiles++;
        errors.push(`Failed to process file: ${fileData.originalFilename}`);
      }
    }

    // Check if any files failed due to rate limiting
    const hasRateLimitErrors = errors.some((error) =>
      error.includes("Rate limit exceeded")
    );

    if (hasRateLimitErrors && processedFiles === 0) {
      // All files failed due to rate limiting
      return res.status(429).json({
        success: false,
        error: "RATE_LIMITED",
        message:
          "Our servers are currently busy processing requests. Please wait 1-2 minutes and try again.",
        retryAfter: 120, // seconds
      });
    }

    const processingTime = Math.round(
      (Date.now() - processingStartTime) / 1000
    );

    return res.status(200).json({
      success: true,
      message: `Processed ${processedFiles} file(s), extracted ${totalAssessments} assessments. ${
        failedFiles > 0 ? `Failed to process ${failedFiles} file(s).` : ""
      }`,
      data: {
        processedFiles,
        totalAssessments,
        failedFiles,
        courseBreakdown:
          courseBreakdown.length > 0 ? courseBreakdown : undefined,
        processingTime,
      },
      errors: errors.length > 0 ? errors : undefined,
      hasRateLimitErrors,
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Processing error occurred",
    });
  }
}

function extractAssessmentsBasic(extractedText: string): Assessment[] {
  const assessments: Assessment[] = [];
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
          section
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

function extractCourseName(text: string): string | null {
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

function formatDate(dateStr: string): string {
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
      const month =
        monthNames.findIndex((m) => m === monthNameMatch[1].toLowerCase()) + 1;
      if (month > 0) {
        const day = parseInt(monthNameMatch[2]);
        const year = parseInt(monthNameMatch[3]);
        return `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`;
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
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
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
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  return null;
}
